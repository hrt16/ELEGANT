// LexAI v6 — embeddingService.js
// all-MiniLM-L6-v2 local embedding service via @xenova/transformers
// NO API KEY required — 100% local ONNX inference
import { pipeline, env } from '@xenova/transformers';
env.cacheDir = './.cache/transformers';
env.allowLocalModels = false;

const EMBED_MODEL = 'Xenova/all-MiniLM-L6-v2';
const EMBED_DIM   = 384;
let _pipe = null, _loadPromise = null;

async function getPipeline() {
  if (_pipe) return _pipe;
  if (_loadPromise) return _loadPromise;
  console.log('[EmbeddingService] Loading all-MiniLM-L6-v2 (quantized)...');
  _loadPromise = pipeline('feature-extraction', EMBED_MODEL, { quantized: true })
    .then(p => { _pipe = p; _loadPromise = null; console.log('[EmbeddingService] ✅ Ready'); return p; })
    .catch(err => { _loadPromise = null; throw err; });
  return _loadPromise;
}

// Single text → Float32Array[384], L2-normalized
export async function embed(text) {
  const pipe = await getPipeline();
  const out  = await pipe(text.slice(0, 512), { pooling:'mean', normalize:true });
  return out.data;
}

// Multiple texts in batches of 16
export async function embedBatch(texts) {
  const pipe = await getPipeline();
  const results = [];
  const BATCH = 16;
  for (let i = 0; i < texts.length; i += BATCH) {
    const batch = texts.slice(i, i + BATCH);
    const out   = await pipe(batch, { pooling:'mean', normalize:true });
    for (let j = 0; j < batch.length; j++)
      results.push(out.data.slice(j * EMBED_DIM, (j+1) * EMBED_DIM));
  }
  return results;
}

// Normalized vectors: dot product = cosine similarity
export function cosineSimilarity(a, b) {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
}

export function preloadEmbeddingModel() { getPipeline().catch(() => {}); }
