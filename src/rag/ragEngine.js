// LexAI v6 — ragEngine.js
// Full hybrid pipeline:
//   Query → Statute Retrieval → Case Retrieval → Compact Prompt → Gemini
//
// Token budget per request:
//   System prompt : ~180 tokens (was 400+ in v4)
//   Output        :  180 tokens MAX
//   History       :    2 turns only
//   Law chunks    :  150 chars each × 2 = 300 chars
//   Case chunks   :  200 chars each × 2 (summary only) = 400 chars

import { analyzeEmotion }               from '../utils/emotionAnalyzer';
import { retrieve, retrieveCases }       from './legalRetriever';
import { selectEmpathyProfile,
         buildEmotionContext }            from '../utils/empathyProfiles';
import { detectLegalCategory,
         generatePrediction }             from '../utils/aiHelpers';

export const RAG_MAX_TOKENS = 4096;

// ── runRAGPipeline() ──────────────────────────────────────────────
// Returns everything needed to call Gemini + explainability data.
export async function runRAGPipeline(userQuery, chatHistory=[], cachedEmotion=null) {

  // STEP 1 — Local emotion detection (free, no API)
  const emotionData = cachedEmotion || await analyzeEmotion(userQuery).catch(()=>({
    dominant:'neutral',confidence:1,distressLevel:0,
    distressClass:'LOW',scores:{neutral:1},source:'default',
  }));

  // STEP 2 — Statute retrieval (top 2, 150 chars each)
  let statutes = [];
  try {
    statutes = await retrieve(userQuery, 3);
    if (!statutes.length) statutes = await retrieve(userQuery, 2, 0.10);
  } catch {}

  // STEP 3 — Similar case retrieval (top 5 from NyayaRAG)
  let similarCases = [];
  try {
    similarCases = await retrieveCases(userQuery, 5);
  } catch {}

  console.log(`[RAG] Statutes:${statutes.length} Cases:${similarCases.length}`);

  const hasReliableContext = statutes.some(d=>d.score>=0.30) || similarCases.some(d=>d.score>=0.25);

  // STEP 4 — Build compact law block
  const lawBlock = statutes.length
    ? statutes.map((d,i)=>`[L${i+1}] ${d.title}: ${d.text}`).join('\n')
    : 'No statute retrieved. Use general Indian law knowledge.';

  // STEP 5 — Build compact cases block (only top 2 for prompt, rest for UI)
  const casesBlock = similarCases.slice(0,2).length
    ? similarCases.slice(0,2).map((d,i)=>`[C${i+1}] ${d.title}: ${d.answer||d.text.slice(0,100)}`).join('\n')
    : '';

  // STEP 6 — Category, prediction, empathy
  const category   = detectLegalCategory(userQuery);
  const prediction = generatePrediction(userQuery, category);
  const profile    = selectEmpathyProfile(emotionData.dominant, emotionData.distressClass, emotionData.distressLevel);
  const emotionCtx = buildEmotionContext(emotionData);
  const needsEmpathy = emotionData.distressClass !== 'LOW';

  // STEP 7 — Compact system prompt (~180 tokens)
  // Structured format forces Gemini to give complete answers, not cut off.
  const systemPrompt = [
    `You are an Indian legal assistant. ${profile.prefix}`,
    `If imminent danger is detected:

1. Immediately output emergency helpline numbers (e.g., 112, 100) at the very top of the response in bold.
2. Provide 2-3 immediate, actionable physical safety steps (e.g., "Leave the premises," "Go to a public place").
3. Do not ask exploratory follow-up questions about the situation until you have provided safety resources. ${profile.prefix}`,
 
    `RELEVANT LAW (cite only these):`,
    lawBlock,
    casesBlock ? `SIMILAR CASES:\n${casesBlock}` : '',
    ``,
    `CONTEXT: ${emotionCtx} | ${category} | Win:${prediction.probability}%`,
    ``,
    `Answer using this EXACT structure:`,
    needsEmpathy ? `1. Empathy (1 sentence)` : '',
    `${needsEmpathy?'2.':'1.'} Issue: [state the legal issue]`,
    `${needsEmpathy?'3.':'2.'} Relevant Cases: [state similar legal case alread solved, only 1 line enough ]`,
    `${needsEmpathy?'4.':'3.'} Relevant Law: [cite [L1]/[C1] above only few lines enough]`,
    `${needsEmpathy?'5.':'4.'} Your Rights: [2-3 rights]`,
    `${needsEmpathy?'6.':'5.'} Next Step: [one concrete action]`,
    ``,
    `Keep more than 600 words. Do NOT produce incomplete sentences. No therapy/diagnosis.`,
    !hasReliableContext ? `NOTE: Low retrieval confidence — acknowledge uncertainty.` : '',
    profile.suffix,
    `End: "— AI guidance only. Consult a qualified Indian lawyer."`,
  ].filter(l=>l!==null&&l!==undefined&&l!=='').join('\n');

  // STEP 8 — Trim history to last 2 turns
  const trimmedHistory = chatHistory
    .filter(m=>m.role==='user'||m.role==='assistant')
    .slice(-2)
    .map(({role,content})=>({role, content:content.slice(0,8000)}));

  return {
    systemPrompt,
    messages:          [...trimmedHistory, {role:'user', content:userQuery}],
    maxTokens:         RAG_MAX_TOKENS,
    emotionData,
    retrievedDocs:     statutes,
    similarCases,
    category,
    prediction,
    hasReliableContext,
  };
}

// ── buildExplainability() ─────────────────────────────────────────
// Returns full output structure: { reply, sources, similarCases, confidence }
export function buildExplainability(ragResult, reply) {
  const { retrievedDocs, similarCases, hasReliableContext, emotionData, category, prediction } = ragResult;
  return {
    reply,
    sources: retrievedDocs.map(d=>({ id:d.id, title:d.title, category:d.category, type:d.type, score:d.score, confidence:d.confidence })),
    similarCases: similarCases.map(d=>({ id:d.id, title:d.title, category:d.category, score:d.score, confidence:d.confidence, answer:d.answer })),
    confidence: hasReliableContext ? (retrievedDocs[0]?.score>=0.50?'high':'medium') : 'low',
    emotion:    emotionData.dominant,
    distress:   emotionData.distressClass,
    category,
    prediction,
    wordsInReply:     reply.split(' ').length,
    retrievalMethod:  retrievedDocs[0]?.confidence==='low'?'keyword':'semantic',
    note: !hasReliableContext ? 'Low retrieval confidence — response uses general knowledge.' : null,
  };
}
