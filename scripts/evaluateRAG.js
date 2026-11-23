// scripts/evaluateRAG.js
// RAG Evaluation Script — Precision@5, Recall@5, MRR, NDCG
// Run: node scripts/evaluateRAG.js
//
// Evaluates the retrieval quality of the legal RAG system using
// a gold-standard test set of query→relevant_doc_id pairs.
//
// METRICS EXPLAINED:
//   Precision@K: of the top-K retrieved docs, how many are relevant?
//   Recall@K:    of all relevant docs, how many appear in top-K?
//   MRR:         Mean Reciprocal Rank — how high does the first relevant doc rank?
//   NDCG@K:      Normalized Discounted Cumulative Gain — rewards ranking relevant docs higher

'use strict';

// ── Test dataset: [query, [relevant_doc_ids]] ─────────────────────
const TEST_CASES = [
  { query: 'My employer fired me without notice or reason',          relevant: ['labor-industrial-disputes','nyaya-5'] },
  { query: 'Landlord refuses to return security deposit after leaving',relevant: ['rent-control','nyaya-8'] },
  { query: 'Police arrested me without warrant under 498A',          relevant: ['crpc-41','ipc-498a','nyaya-1'] },
  { query: 'Wife filing for divorce and alimony in India',           relevant: ['hindu-marriage-act','crpc-125','nyaya-3'] },
  { query: 'Someone cheated me of money through fraud',              relevant: ['ipc-420','consumer-protection'] },
  { query: 'My cheque was bounced by the bank',                      relevant: ['cheque-bounce'] },
  { query: 'Neighbour is encroaching on my land and property',       relevant: ['ipc-441','property-transfer-act','nyaya-4'] },
  { query: 'How to file an FIR at police station',                   relevant: ['fir-complaint'] },
  { query: 'Sexual harassment at my workplace by manager',           relevant: ['vishaka-guidelines','ipc-354'] },
  { query: 'Right to privacy and personal data protection in India', relevant: ['article-21','nyaya-15','it-act-66a'] },
  { query: 'Fundamental rights violated by government action',       relevant: ['article-14','article-32','nyaya-2'] },
  { query: 'Triple talaq and Muslim divorce law',                    relevant: ['nyaya-7','dowry-prohibition'] },
  { query: 'I need free legal help as I cannot afford lawyer',       relevant: ['legal-aid'] },
  { query: 'Child abuse and POCSO case procedure',                   relevant: ['nyaya-12'] },
  { query: 'Bail application for non-bailable offence',              relevant: ['bail-provisions','crpc-41'] },
  { query: 'Consumer complaint for defective product refund',        relevant: ['consumer-protection'] },
  { query: 'Property sale deed registration requirements',           relevant: ['property-transfer-act','nyaya-10'] },
  { query: 'Transgender rights and legal recognition in India',      relevant: ['nyaya-11','article-21'] },
];

// ── Keyword-based retrieval simulation (no model needed for eval) ──
// In production, this uses all-MiniLM-L6-v2 embeddings.
// For offline evaluation, we simulate with keyword overlap scoring.
function loadDocs() {
  const fs   = require('fs');
  const path = require('path');
  const fp   = path.resolve(__dirname, '../src/rag/mergedLegalDB.json');
  if (!fs.existsSync(fp)) {
    console.warn('⚠️  mergedLegalDB.json not found — run: node scripts/loadNyayaRAG.js first');
    // Use minimal fallback
    return [
      {id:'nyaya-1', keywords:['arrest','498a','dowry','police']},
      {id:'labor-industrial-disputes', keywords:['termination','employment','notice','labour']},
    ];
  }
  return JSON.parse(fs.readFileSync(fp,'utf8'));
}

function keywordRetrieve(query, docs, topK=5) {
  const lower = query.toLowerCase().split(/\s+/);
  return docs
    .map(doc => {
      const kws   = (doc.keywords || []).map(k => k.toLowerCase());
      const text  = ((doc.text || '') + ' ' + (doc.title || '')).toLowerCase();
      let score = 0;
      for (const word of lower) {
        if (kws.some(k => k.includes(word) || word.includes(k))) score += 2;
        if (text.includes(word)) score += 0.5;
      }
      return { id: doc.id, score };
    })
    .filter(d => d.score > 0)
    .sort((a,b) => b.score - a.score)
    .slice(0, topK)
    .map(d => d.id);
}

// ── Metric implementations ────────────────────────────────────────
function precisionAtK(retrieved, relevant, k) {
  const topK = retrieved.slice(0, k);
  const hits = topK.filter(id => relevant.includes(id)).length;
  return hits / k;
}

function recallAtK(retrieved, relevant, k) {
  if (!relevant.length) return 0;
  const topK = retrieved.slice(0, k);
  const hits = topK.filter(id => relevant.includes(id)).length;
  return hits / relevant.length;
}

function reciprocalRank(retrieved, relevant) {
  for (let i = 0; i < retrieved.length; i++) {
    if (relevant.includes(retrieved[i])) return 1 / (i + 1);
  }
  return 0;
}

function dcg(retrieved, relevant, k) {
  let score = 0;
  for (let i = 0; i < Math.min(retrieved.length, k); i++) {
    if (relevant.includes(retrieved[i])) {
      score += 1 / Math.log2(i + 2); // log2(rank+1)
    }
  }
  return score;
}

function ndcgAtK(retrieved, relevant, k) {
  const idealOrder = relevant.slice(0, k);
  const idealDCG   = dcg(idealOrder, relevant, k);
  if (idealDCG === 0) return 0;
  return dcg(retrieved, relevant, k) / idealDCG;
}

// ── Main evaluation ───────────────────────────────────────────────
function evaluate() {
  console.log('\n📊  LexAI v6 — RAG Evaluation');
  console.log('══════════════════════════════════════════════');

  const docs = loadDocs();
  console.log(`  Dataset: ${docs.length} documents`);
  console.log(`  Test cases: ${TEST_CASES.length} queries\n`);

  const K = 5;
  const results = [];

  for (const tc of TEST_CASES) {
    const retrieved = keywordRetrieve(tc.query, docs, K);
    results.push({
      query:    tc.query.slice(0, 55),
      p5:       precisionAtK(retrieved, tc.relevant, K),
      r5:       recallAtK(retrieved, tc.relevant, K),
      rr:       reciprocalRank(retrieved, tc.relevant),
      ndcg5:    ndcgAtK(retrieved, tc.relevant, K),
      retrieved: retrieved.slice(0, 3).join(', '),
      relevant:  tc.relevant.join(', '),
    });
  }

  // Print per-query results
  console.log('  Per-query results:');
  console.log('  ' + '─'.repeat(80));
  for (const r of results) {
    const ok = r.rr > 0 ? '✅' : '❌';
    console.log(`  ${ok} "${r.query}"`);
    console.log(`     P@5:${r.p5.toFixed(2)}  R@5:${r.r5.toFixed(2)}  RR:${r.rr.toFixed(2)}  NDCG@5:${r.ndcg5.toFixed(2)}`);
    console.log(`     Retrieved: ${r.retrieved}`);
  }

  // Aggregate metrics
  const n = results.length;
  const avgP5    = results.reduce((s,r) => s + r.p5, 0)    / n;
  const avgR5    = results.reduce((s,r) => s + r.r5, 0)    / n;
  const MRR      = results.reduce((s,r) => s + r.rr, 0)    / n;
  const avgNDCG5 = results.reduce((s,r) => s + r.ndcg5, 0) / n;
  const hitRate  = results.filter(r => r.rr > 0).length / n;

  console.log('\n  ' + '═'.repeat(50));
  console.log('  📈  AGGREGATE METRICS (keyword retrieval)');
  console.log('  ' + '─'.repeat(50));
  console.log(`  Precision@5 : ${(avgP5*100).toFixed(1)}%`);
  console.log(`  Recall@5    : ${(avgR5*100).toFixed(1)}%`);
  console.log(`  MRR         : ${MRR.toFixed(3)}`);
  console.log(`  NDCG@5      : ${(avgNDCG5*100).toFixed(1)}%`);
  console.log(`  Hit Rate    : ${(hitRate*100).toFixed(1)}% (at least 1 relevant in top ${K})`);
  console.log('  ' + '═'.repeat(50));
  console.log('\n  NOTE: Semantic embedding retrieval (all-MiniLM-L6-v2)');
  console.log('  will show significantly higher scores than keyword baseline.');
  console.log('  Run the full React app to use transformer-based retrieval.\n');

  // Write JSON report
  const reportPath = require('path').resolve(__dirname, '../src/rag/evalReport.json');
  require('fs').writeFileSync(reportPath, JSON.stringify({
    generatedAt:  new Date().toISOString(),
    datasetSize:  docs.length,
    testCases:    n,
    k:            K,
    metrics:      { precisionAtK: avgP5, recallAtK: avgR5, MRR, ndcgAtK: avgNDCG5, hitRate },
    perQuery:     results,
  }, null, 2));
  console.log(`  📄 Report written: ${reportPath}\n`);
}

evaluate();
