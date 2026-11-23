// LexAI v6 — legalRetriever.js
// Indexes mergedLegalDB.json (statutes + NyayaRAG cases) into two
// separate vector stores: one for statutes/acts, one for case law.
// retrieve()      → top 2 statutes (compressed to 150 chars)
// retrieveCases() → top 5 similar cases

import legalDataRaw         from './legalDataset.json';
import { embed, embedBatch } from './embeddingService';
import { vectorStore, caseVectorStore } from './vectorStore';

// Try to load merged DB; fall back to base dataset
let mergedData;
try {
  mergedData = require('./mergedLegalDB.json');
  if (!Array.isArray(mergedData)) mergedData = Object.values(mergedData);
} catch {
  mergedData = Array.isArray(legalDataRaw) ? legalDataRaw : Object.values(legalDataRaw);
}

// Separate into statutes/acts vs case law
const STATUTES = mergedData.filter(d => d.type !== 'case');
const CASES    = mergedData.filter(d => d.type === 'case');

let _statutesIndexed = false, _casesIndexed = false;
let _statutePromise = null, _casePromise = null;

async function buildStatuteIndex() {
  if (_statutesIndexed) return;
  console.log(`[LegalRetriever] Indexing ${STATUTES.length} statutes...`);
  const t     = Date.now();
  const texts = STATUTES.map(d => `${d.title}. ${d.text}`);
  const vecs  = await embedBatch(texts);
  STATUTES.forEach((doc,i) => vectorStore.add(doc.id, vecs[i], doc));
  _statutesIndexed = true;
  console.log(`[LegalRetriever] ✅ Statutes indexed (${Date.now()-t}ms)`);
}

async function buildCaseIndex() {
  if (_casesIndexed || CASES.length===0) { _casesIndexed=true; return; }
  console.log(`[LegalRetriever] Indexing ${CASES.length} cases...`);
  const t     = Date.now();
 const texts = CASES.map(d => `
${d.title}
${d.category}
${(d.keywords || []).join(" ")}
`);
  const vecs  = await embedBatch(texts);
  CASES.forEach((doc,i) => caseVectorStore.add(doc.id, vecs[i], doc));
  _casesIndexed = true;
  console.log(`[LegalRetriever] ✅ Cases indexed (${Date.now()-t}ms)`);
}

async function ensureStatutes() {
  if (_statutesIndexed) return;
  if (_statutePromise) return _statutePromise;
  _statutePromise = buildStatuteIndex().finally(()=>{ _statutePromise=null; });
  return _statutePromise;
}

async function ensureCases() {
  if (_casesIndexed) return;
  if (_casePromise) return _casePromise;
  _casePromise = buildCaseIndex().finally(()=>{ _casePromise=null; });
  return _casePromise;
}

// ── retrieve() — top 2 statutes, text compressed to 150 chars ─────
export async function retrieve(query, topK=2, minScore=0.22) {
  try {
    await ensureStatutes();
    const qVec   = await embed(query);
    const results = vectorStore.query(qVec, topK, minScore);
    return results.map(r => ({
      id:         r.id,
      title:      r.meta.title,
      text:       r.meta.text.slice(0, 150), // COMPRESSED — saves tokens
      category:   r.meta.category,
      type:       r.meta.type,
      score:      parseFloat(r.score.toFixed(4)),
      confidence: r.score>=0.50?'high':r.score>=0.35?'medium':'low',
    }));
  } catch (err) {
    console.warn('[LegalRetriever] statute retrieve error:', err.message);
    return keywordFallback(query, STATUTES, topK);
  }
}

// ── retrieveCases() — top 5 similar cases (NyayaRAG) ─────────────
export async function retrieveCases(query, topK=5, minScore=0.18) {
  try {
    await ensureCases();
    if (caseVectorStore.size()===0) return keywordFallback(query, CASES, topK);
    const qVec   = await embed(query);
    const results = caseVectorStore.query(qVec, topK, minScore);
    return results.map(r => ({
      id:         r.id,
      title:      r.meta.title,
      text:       r.meta.text.slice(0, 200),
      category:   r.meta.category,
      source:     r.meta.source || 'LexAI',
      answer:     (r.meta.answer || '').slice(0, 150),
      score:      parseFloat(r.score.toFixed(4)),
      confidence: r.score>=0.45?'high':r.score>=0.30?'medium':'low',
    }));
  } catch (err) {
    console.warn('[LegalRetriever] case retrieve error:', err.message);
    return keywordFallback(query, CASES, topK);
  }
}

// ── Keyword fallback ──────────────────────────────────────────────
function keywordFallback(query, docs, topK) {
  const lower = query.toLowerCase().split(/\s+/);
  return docs
    .map(doc => {
      const kws  = (doc.keywords||[]).map(k=>k.toLowerCase());
      const text = ((doc.text||'')+(doc.title||'')).toLowerCase();
      let score  = 0;
      for (const w of lower) {
        if (kws.some(k=>k.includes(w)||w.includes(k))) score+=2;
        if (text.includes(w)) score+=0.5;
      }
      return {...doc, score: parseFloat((score/(doc.keywords?.length||1)).toFixed(4))};
    })
    .filter(d=>d.score>0)
    .sort((a,b)=>b.score-a.score)
    .slice(0,topK)
    .map(d=>({id:d.id,title:d.title,text:(d.text||'').slice(0,150),category:d.category,type:d.type,score:d.score,confidence:'low',source:d.source||'LexAI'}));
}

export function preloadIndex() { ensureStatutes().catch(()=>{}); ensureCases().catch(()=>{}); }
export function getIndexStats() { return { statuteCount:vectorStore.size(), caseCount:caseVectorStore.size(), statutesIndexed:_statutesIndexed, casesIndexed:_casesIndexed }; }
