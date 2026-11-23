// LexAI v6 — server.js
// Gemini 2.0 Flash proxy. MAX 180 output tokens. Server-side rate protection.
'use strict';
const path    = require('path');
const https   = require('https');
const express = require('express');
const cors    = require('cors');

require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const API_KEY        = (process.env.GEMINI_API_KEY||'').trim();
const MODEL          = (process.env.GEMINI_MODEL||'gemini-2.5-flash').trim();
const PORT           = 3001;
const MAX_OUT_TOKENS = 4096;   // hard cap — prevents cut-off AND saves quota
const COOLDOWN_MS    = 900;   // min gap between outgoing requests

const GEMINI_HOST = 'generativelanguage.googleapis.com';
const GEMINI_PATH = `/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

// Response cache (server-side, TTL 5 min)
const _cache = new Map();
const CACHE_TTL = 5*60*1000;
const CACHE_MAX = 30;
function cacheGet(key) { const e=_cache.get(key); if(!e)return null; if(Date.now()-e.ts>CACHE_TTL){_cache.delete(key);return null;} return e.text; }
function cacheSet(key,text) { if(_cache.size>=CACHE_MAX){_cache.delete(_cache.keys().next().value);} _cache.set(key,{text,ts:Date.now()}); }
function cacheKey(msgs,sys) { return `${(msgs.slice(-1)[0]?.content||'').slice(0,80)}|${sys.slice(0,40)}`; }

console.log('\n🚀  LexAI v6 — Server');
console.log('   Model       :', MODEL);
console.log('   Max tokens  :', MAX_OUT_TOKENS);
console.log('   Key         :', API_KEY?`${API_KEY.slice(0,8)}... ✓`:'MISSING ✗');
if (!API_KEY) { console.error('❌  GEMINI_API_KEY missing in .env'); process.exit(1); }

const app = express();
app.use(cors({origin:['http://localhost:3000','http://127.0.0.1:3000'],methods:['GET','POST']}));
app.use(express.json({limit:'1mb'}));

let _inFlight=false, _lastSentAt=0, _totalCalls=0, _total429s=0, _cacheHits=0;

app.get('/health', (_,res) => res.json({status:'ok',model:MODEL,keySet:!!API_KEY,inFlight:_inFlight,maxTokens:MAX_OUT_TOKENS}));
app.get('/stats',  (_,res) => res.json({totalCalls:_totalCalls,total429s:_total429s,cacheHits:_cacheHits,inFlight:_inFlight,cacheSize:_cache.size}));

app.post('/api/chat', (req, res) => {
  const {messages=[],systemPrompt='',maxTokens=MAX_OUT_TOKENS} = req.body;

  // Server-side deduplication
  if (_inFlight) return res.status(503).json({error:'Server busy — previous request in progress.',retryable:true,retryAfterMs:2000});

  // Server-side cooldown
  const gap = Date.now()-_lastSentAt;
  if (gap<COOLDOWN_MS) return res.status(429).json({error:`Cooldown. Wait ${Math.ceil((COOLDOWN_MS-gap)/1000)}s.`,retryable:true,retryAfterMs:COOLDOWN_MS-gap});

  // Server-side cache
  const ck = cacheKey(messages, systemPrompt);
  const hit = cacheGet(ck);
  if (hit) { _cacheHits++; console.log(`[Server] Cache hit #${_cacheHits}`); return res.json({text:hit}); }

  _inFlight=true; _lastSentAt=Date.now(); _totalCalls++;
  const tokenCap =  MAX_OUT_TOKENS; // server always enforces cap

  console.log(`[${new Date().toISOString()}] #${_totalCalls} → Gemini | turns:${messages.length} | tokens:${tokenCap}`);

  const contents = messages
    .filter(m=>m.content&&m.content.trim())
    .map(m=>({role:m.role==='assistant'?'model':'user', parts:[{text:m.content.slice(0,8000)}]}));
  if (!contents.length||contents[0].role!=='user') contents.unshift({role:'user',parts:[{text:'Hello'}]});

  const body = JSON.stringify({
    system_instruction:{parts:[{text:systemPrompt||'You are a concise Indian legal assistant.'}]},
    contents,
    generationConfig:{maxOutputTokens:tokenCap, temperature:0.55, topP:0.8, stopSequences:[]},
    safetySettings:[
      {category:'HARM_CATEGORY_DANGEROUS_CONTENT',threshold:'BLOCK_ONLY_HIGH'},
      {category:'HARM_CATEGORY_HARASSMENT',       threshold:'BLOCK_ONLY_HIGH'},
    ],
  });

  const opts = {
    hostname:GEMINI_HOST, path:GEMINI_PATH, method:'POST',
    headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)},
    timeout:66000,
  };

  const done = (status, payload) => {
    if (res.headersSent) return;
    _inFlight=false;
    if (typeof payload==='string') res.status(status).json({error:payload});
    else res.status(status).json(payload);
  };

  const gReq = https.request(opts, gRes => {
    let raw='';
    gRes.on('data',c=>raw+=c);
    gRes.on('end', () => {
      console.log(`  ← ${gRes.statusCode} (${raw.length}B)`);
      if (gRes.statusCode===429) { _total429s++; console.warn(`  ⚠️ 429 total:${_total429s}`); return done(429,{error:'Gemini rate limit. Please wait 5s.',retryable:true,retryAfterMs:5000}); }
      let parsed; try { parsed=JSON.parse(raw); } catch { return done(502,'Invalid JSON from Gemini.'); }
      if (gRes.statusCode!==200) { const m=parsed?.error?.message||`Gemini error ${gRes.statusCode}`; console.error('  ❌',m); return done(gRes.statusCode,m); }
      const text  = parsed?.candidates?.[0]?.content?.parts?.[0]?.text||'';
      const reason= parsed?.candidates?.[0]?.finishReason||'';
      if (!text) {
        const fb = reason==='SAFETY'?'Safety filter triggered. Please rephrase your legal question.':'No response generated. Please rephrase.';
        console.warn('  ⚠️ Empty text, reason:',reason);
        return done(200,{text:fb});
      }
      console.log(`  ✅ ${text.length} chars | finishReason:${reason}`);
      cacheSet(ck, text);
      return done(200,{text});
    });
  });

  gReq.on('timeout',()=>{ gReq.destroy(); done(504,{error:'Timed out.',retryable:true}); });
  gReq.on('error',err=>{ if(!res.headersSent){_inFlight=false;} if(err.code==='ECONNRESET'&&res.headersSent)return; done(502,`Network error: ${err.message}`); });
  gReq.write(body); gReq.end();
});

app.listen(PORT, () => {
  console.log(`\n✅  Proxy   → http://localhost:${PORT}`);
  console.log(`   Health  → http://localhost:${PORT}/health`);
  console.log(`   Stats   → http://localhost:${PORT}/stats\n`);
});
