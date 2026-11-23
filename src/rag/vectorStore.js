// LexAI v6 — vectorStore.js
// Pure-JS in-memory vector store. No native deps. Fast for <1000 docs.
import { cosineSimilarity } from './embeddingService';

class InMemoryVectorStore {
  constructor() { this._docs = []; }
  add(id, embedding, metadata) {
    const idx = this._docs.findIndex(d=>d.id===id);
    const entry = {id, vec:embedding, meta:metadata};
    if (idx>=0) this._docs[idx]=entry; else this._docs.push(entry);
  }
  // topK results above minScore, sorted descending
  query(queryVec, topK=5, minScore=0.20) {
    if (!this._docs.length) return [];
    return this._docs
      .map(doc => ({id:doc.id, score:cosineSimilarity(queryVec,doc.vec), meta:doc.meta}))
      .filter(d => d.score>=minScore)
      .sort((a,b)=>b.score-a.score)
      .slice(0,topK);
  }
  size()  { return this._docs.length; }
  clear() { this._docs=[]; }
}

export const vectorStore        = new InMemoryVectorStore(); // statutes/acts
export const caseVectorStore    = new InMemoryVectorStore(); // NyayaRAG cases
