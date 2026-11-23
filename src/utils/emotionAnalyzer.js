// LexAI v6 — emotionAnalyzer.js
// DistilRoBERTa emotion detection via @xenova/transformers
// Model: Xenova/j-hartmann-emotion-english-distilroberta-base
// Outputs 7 emotion classes, runs 100% locally, no API key needed.
import { pipeline, env } from '@xenova/transformers';
env.cacheDir = './.cache/transformers';
env.allowLocalModels = false;

const MODEL_ID = 'Xenova/j-hartmann-emotion-english-distilroberta-base';
let _classifier = null, _loadPromise = null, _modelReady = false, _loadError = null;

async function getClassifier() {
  if (_classifier) return _classifier;
  if (_loadPromise) return _loadPromise;
  console.log('[EmotionAnalyzer] Loading DistilRoBERTa...');
  _loadPromise = pipeline('text-classification', MODEL_ID, { topk: null })
    .then(clf => { _classifier = clf; _modelReady = true; _loadPromise = null; console.log('[EmotionAnalyzer] ✅ Ready'); return clf; })
    .catch(err => { _loadError = err; _loadPromise = null; throw err; });
  return _loadPromise;
}

const MODEL_TO_INTERNAL = { anger:'anger', disgust:'distress', fear:'fear', joy:'calm', neutral:'neutral', sadness:'sadness', surprise:'anxiety' };

function computeDistressLevel(scores) {
  const W = { distress:0.30, fear:0.25, anger:0.20, sadness:0.15, anxiety:0.10, neutral:0, calm:0 };
  return Math.min(1, parseFloat(Object.entries(W).reduce((s,[k,w]) => s + (scores[k]||0)*w, 0).toFixed(3)));
}

function classifyDistress(level) { return level>=0.55?'HIGH':level>=0.28?'MEDIUM':'LOW'; }

export async function analyzeEmotion(text) {
  if (!text || !text.trim()) return buildNeutral('empty');
  try {
    const clf = await getClassifier();
    const raw = await clf(text.slice(0, 512));
    const results = Array.isArray(raw[0]) ? raw[0] : raw;
    const scores = {}; let dominant = 'neutral', topScore = 0;
    for (const {label, score} of results) {
      const k = MODEL_TO_INTERNAL[label.toLowerCase()] || label.toLowerCase();
      scores[k] = parseFloat(score.toFixed(4));
      if (score > topScore) { topScore = score; dominant = k; }
    }
    const distressLevel = computeDistressLevel(scores);
    return { dominant, confidence:parseFloat(topScore.toFixed(4)), distressLevel, distressClass:classifyDistress(distressLevel), scores, modelReady:true, source:'transformer' };
  } catch (err) {
    console.warn('[EmotionAnalyzer] Fallback:', err.message);
    return fallbackKeyword(text);
  }
}

function fallbackKeyword(text) {
  const lower = text.toLowerCase();
  const raw = { fear:0, anger:0, sadness:0, anxiety:0, distress:0, neutral:0.25, urgency:0, calm:0 };
  if (/scared|afraid|fear|threat|danger/.test(lower))    raw.fear     += 0.45;
  if (/angry|furious|hate|frustrated|rage/.test(lower))  raw.anger    += 0.45;
  if (/sad|depress|crying|grief|hopeless/.test(lower))   raw.sadness  += 0.40;
  if (/anxious|worried|stress|panic|nervous/.test(lower))raw.anxiety  += 0.45;
  if (/urgent|emergency|immediate|desperate/.test(lower))raw.urgency  += 0.55;
  if (/distress|pain|suffering|helpless/.test(lower))    raw.distress += 0.40;
  if (/calm|fine|okay|happy|great/.test(lower))          raw.calm     += 0.30;
  const total = Object.values(raw).reduce((a,b)=>a+b,0)||1;
  const scores = {}; for (const k in raw) scores[k] = parseFloat((raw[k]/total).toFixed(4));
  const dominant = Object.entries(scores).sort((a,b)=>b[1]-a[1])[0][0];
  const distressLevel = computeDistressLevel(scores);
  return { dominant, confidence:scores[dominant], distressLevel, distressClass:classifyDistress(distressLevel), scores, modelReady:false, source:'fallback' };
}

function buildNeutral(reason) { return { dominant:'neutral', confidence:1, distressLevel:0, distressClass:'LOW', scores:{neutral:1}, modelReady:_modelReady, source:'default', reason }; }
export function getModelStatus() { return { ready:_modelReady, error:_loadError?_loadError.message:null }; }
export function preloadModel() { getClassifier().catch(()=>{}); }
