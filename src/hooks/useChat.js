// LexAI v6 — useChat.js
// Pipeline: Emotion → Statute RAG → Case RAG → Compact Prompt → Gemini
// All v5 bug fixes preserved: singleton lock, empty deps, messagesRef, msgId, AbortController, cache
import { useState, useCallback, useRef, useEffect } from 'react';
import { callGemini }   from '../utils/aiHelpers';
import { runRAGPipeline, buildExplainability } from '../rag/ragEngine';
import { acquire, release, reset, buildCacheKey, getCached, setCached } from '../utils/requestManager';

function ts() { return new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}); }
const WELCOME = name => ({ id:'welcome', role:'assistant', time:ts(),
  content:`Welcome${name?`, ${name.split(' ')[0]}`:''}! I'm LexAI v6 — Indian legal AI with Gemini 2.0 Flash + NyayaRAG case retrieval.\n\nDescribe your legal situation and I'll search Indian statutes and court cases locally before generating your answer.`,
});

export function useChat(userName) {
  const [messages,   setMessages]   = useState(()=>[WELCOME(userName)]);
  const [loading,    setLoading]    = useState(false);
  const [emotion,    setEmotion]    = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [sources,    setSources]    = useState(null);
  const [similarCases,setSimilarCases]=useState(null);
  const [error,      setError]      = useState(null);

  const messagesRef  = useRef([WELCOME(userName)]);
  const abortCtrlRef = useRef(null);

  const keepInSync = useCallback(updater => {
    setMessages(prev => {
      const next = typeof updater==='function'?updater(prev):updater;
      messagesRef.current = next;
      return next;
    });
  }, []);

  useEffect(() => () => { if(abortCtrlRef.current){abortCtrlRef.current.abort();release('unmount');} }, []);

  const sendMessage = useCallback(async text => {
    if (!text.trim()) return;
    const lock = acquire('sendMessage');
    if (!lock.ok) {
      if (lock.reason==='cooldown') { setError(`Wait ${Math.ceil(lock.remainingMs/1000)}s`); setTimeout(()=>setError(null),lock.remainingMs); }
      return;
    }
    const time  = ts();
    const msgId = `msg-${Date.now()}`;
    setError(null); setLoading(true);
    keepInSync(prev=>[...prev,{id:msgId,role:'user',content:text,time}]);

    const ctrl = new AbortController();
    abortCtrlRef.current = ctrl;

    try {
      // RAG pipeline (local — no Gemini tokens consumed here)
      const recentHistory = messagesRef.current
        .filter(m=>m.role==='user'||m.role==='assistant')
        .slice(-2).map(({role,content})=>({role,content}));

      const ragResult = await runRAGPipeline(text, recentHistory);
      if (ctrl.signal.aborted) return;

      const { emotionData, retrievedDocs, similarCases:cases, prediction, category, systemPrompt, messages:ragMessages, maxTokens } = ragResult;

      setEmotion(emotionData);
      setPrediction(prediction);
      setSources(retrievedDocs);
      setSimilarCases(cases);

      keepInSync(prev => prev.map(m => m.id===msgId ? {...m, emotion:emotionData.dominant, category} : m));

      // Cache check
      const cacheKey = buildCacheKey(text, emotionData.dominant, category);
      const cached   = getCached(cacheKey);
      let reply;

      if (cached) {
        reply = cached;
        console.log('[useChat] Cache hit');
      } else {
        // Local RAG fallback if Gemini is unavailable
        let geminiOk = true;
        try {
          reply = await callGemini(ragMessages, systemPrompt, maxTokens, ctrl.signal);
          if (ctrl.signal.aborted) return;
          setCached(cacheKey, reply);
        } catch(geminiErr) {
          if (geminiErr.message==='aborted') return;
          geminiOk = false;
          // Graceful fallback: construct answer from RAG results locally
          console.warn('[useChat] Gemini failed, using local RAG fallback:', geminiErr.message);
          const topLaw  = retrievedDocs[0];
          const topCase = cases[0];
          reply = [
            `AI service unavailable (${geminiErr.message.startsWith('rate_limit')?'rate limit — wait a moment':'error'}).`,
            ``,
            `Based on retrieved Indian law:`,
            topLaw  ? `• ${topLaw.title}: ${topLaw.text}` : '',
            topCase ? `• Case: ${topCase.title} — ${topCase.answer||topCase.text.slice(0,100)}` : '',
            ``,
            `Category: ${category} | Estimated win probability: ${prediction.probability}%`,
            ``,
            `— Local RAG answer only. Consult a qualified Indian lawyer for your specific situation.`,
          ].filter(Boolean).join('\n');
        }
      }

      const explain = buildExplainability(ragResult, reply);

      keepInSync(prev=>[...prev,{
        id:`reply-${Date.now()}`, role:'assistant', content:reply, time:ts(),
        category, emotion:emotionData.dominant, prediction, empathyMode:emotionData.distressClass,
        sources:explain.sources, similarCases:explain.similarCases, confidence:explain.confidence, explain,
      }]);

    } catch(err) {
      if (ctrl.signal.aborted) return;
      const msg = err.message||'';
      const reply = msg.startsWith('rate_limit:') ? `Rate limit. Wait ${msg.split(':')[1]||5}s then retry.`
                  : msg==='timeout'               ? 'Timed out. Try again shortly.'
                  : msg.includes('API key')        ? 'Gemini API key missing. Set GEMINI_API_KEY in .env and restart server.'
                  : msg.includes('port 3001')      ? 'Proxy not running. Use "npm run dev".'
                  :                                  ` ${msg}`;
      setError(reply);
      keepInSync(prev=>[...prev,{id:`err-${Date.now()}`,role:'assistant',content:reply,time,isError:true}]);
    } finally {
      if (!ctrl.signal.aborted) { setLoading(false); release('sendMessage'); abortCtrlRef.current=null; }
    }
  }, [keepInSync]);

  const clearChat = useCallback(() => {
    reset();
    const w = WELCOME(userName);
    messagesRef.current=[w]; setMessages([w]);
    setEmotion(null); setPrediction(null); setSources(null); setSimilarCases(null); setError(null); setLoading(false);
  }, [userName]);

  return { messages, loading, emotion, prediction, sources, similarCases, error, sendMessage, clearChat };
}
