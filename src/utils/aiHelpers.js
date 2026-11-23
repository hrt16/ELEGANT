// LexAI v6 — aiHelpers.js
import { GEMINI_MODEL, MAX_TOKENS } from './constants';
import { analyzeEmotion as analyzeEmotionTransformer } from './emotionAnalyzer';
import { selectEmpathyProfile, buildEmotionContext }   from './empathyProfiles';

// ── callGemini ─────────────────────────────────────────────────────
export async function callGemini(messages, systemPrompt, maxTokens=MAX_TOKENS, signal=null) {
  const fetchOpts = {
    method:'POST', headers:{'Content-Type':'application/json'},
    body:JSON.stringify({messages, systemPrompt, maxTokens, model:GEMINI_MODEL}),
  };
  if (signal) fetchOpts.signal = signal;
  let response;
  try { response = await fetch('/api/chat', fetchOpts); }
  catch(err) {
    if (err.name==='AbortError') throw new Error('aborted');
    throw new Error('Cannot reach proxy server (port 3001). Run "npm run dev".');
  }
  let data;
  try { data = await response.json(); } catch { throw new Error(`Proxy non-JSON (HTTP ${response.status}).`); }
  if (!response.ok) {
    const msg = data?.error || `HTTP ${response.status}`;
    if (response.status===429) { const w=Math.round((data?.retryAfterMs||5000)/1000); throw new Error(`rate_limit:${w}`); }
    if (response.status===403||(response.status===400&&String(msg).includes('API_KEY'))) throw new Error('Invalid Gemini API key. Check GEMINI_API_KEY in .env and restart.');
    if (response.status===504) throw new Error('timeout');
    throw new Error(String(msg));
  }
  if (!data?.text) throw new Error('Empty Gemini response. Try rephrasing.');
  return data.text;
}
export const callClaude = callGemini;

// ── analyzeEmotion ─────────────────────────────────────────────────
export async function analyzeEmotion(text) {
  try { return await analyzeEmotionTransformer(text); }
  catch { return {dominant:'neutral',confidence:1,distressLevel:0,distressClass:'LOW',scores:{neutral:1},modelReady:false,source:'default'}; }
}

// ── detectLegalCategory ────────────────────────────────────────────
export function detectLegalCategory(text) {
  const t = text.toLowerCase();
  if (/murder|theft|assault|rape|fraud|criminal|fir|arrest|ipc/.test(t))             return 'Criminal Law';
  if (/divorce|custody|marriage|alimony|dowry|domestic|matrimon/.test(t))             return 'Family Law';
  if (/property|land|title|possession|tenant|rent|evict|encroach/.test(t))            return 'Property Law';
  if (/employment|salary|termination|workplace|labor|labour|retrench/.test(t))        return 'Labor Law';
  if (/constitutional|fundamental right|article \d|amendment|government/.test(t))     return 'Constitutional Law';
  if (/company|contract|corporate|shareholder|business|agreement/.test(t))            return 'Corporate Law';
  if (/internet|cyber|hacking|online|data|digital/.test(t))                           return 'Cyber Law';
  if (/consumer|product|defect|cheating|mislead|refund/.test(t))                      return 'Consumer Rights';
  if (/patent|copyright|trademark|intellectual|invention/.test(t))                    return 'Intellectual Property';
  return 'Civil Law';
}

// ── generatePrediction ─────────────────────────────────────────────
export function generatePrediction(text, category) {
  const t = text.toLowerCase();
  let base = Math.random()*25+52;
  if (/evidence|proof|witness|document|receipt/.test(t)) base+=9;
  if (/urgent|emergency|immediate/.test(t))              base-=5;
  if (category==='Constitutional Law')                   base+=6;
  if (category==='Criminal Law')                         base-=6;
  if (/no evidence|no proof|verbal/.test(t))             base-=10;
  base = Math.min(93,Math.max(32,Math.round(base)));
  return { probability:base, lossProb:100-base, confidence:Math.round(Math.random()*14+70), risk:base<50?'High':base<68?'Moderate':'Low' };
}

// ── buildGeminiPrompt (non-RAG fallback) ───────────────────────────
export function buildGeminiPrompt(emotionData, category, prediction) {
  const profile = selectEmpathyProfile(emotionData.dominant, emotionData.distressClass, emotionData.distressLevel);
  const ctx     = buildEmotionContext(emotionData);
  const n       = emotionData.distressClass!=='LOW';
  const s       = n ? 2 : 1;
  return [
    `You are an Indian legal assistant. ${profile.prefix}`,
    `[Context] ${ctx} | ${category} | Win:${prediction.probability}%`,
    `Answer: ${n?'1.Empathy → ':''}${s}.Issue → ${s+1}.Relevant Law → ${s+2}.Rights → ${s+3}.Next Step`,
    `Keep under 120 words. Complete sentences only. No therapy/diagnosis.`,
    profile.suffix||'',
    `End: "— AI guidance only. Consult a qualified Indian lawyer."`,
  ].filter(Boolean).join('\n');
}
export const buildLegalSystemPrompt = buildGeminiPrompt;
