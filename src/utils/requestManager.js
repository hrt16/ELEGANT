// LexAI v6 — requestManager.js
// Singleton request lock — prevents duplicate Gemini calls from
// React StrictMode, rapid clicks, and concurrent components.
let _inFlight = false, _lastSentAt = 0, _callCount = 0;
const _cache = new Map();
const CACHE_MAX = 20, CACHE_TTL = 5*60*1000;

export const COOLDOWN_MS = 1500;

export function isLocked() { return _inFlight; }

export function acquire(label='unknown') {
  if (_inFlight) { console.warn(`[RM] BLOCKED in_flight (${label})`); return {ok:false,reason:'in_flight'}; }
  const gap = Date.now() - _lastSentAt;
  if (gap < COOLDOWN_MS) { console.warn(`[RM] BLOCKED cooldown ${COOLDOWN_MS-gap}ms (${label})`); return {ok:false,reason:'cooldown',remainingMs:COOLDOWN_MS-gap}; }
  _inFlight=true; _lastSentAt=Date.now(); _callCount++;
  console.log(`[RM] ACQUIRED #${_callCount} (${label})`);
  return {ok:true};
}

export function release(label='unknown') { _inFlight=false; console.log(`[RM] RELEASED (${label})`); }

export function buildCacheKey(text, emotion, category) { return `${text.slice(0,80)}|${emotion}|${category}`; }

export function getCached(key) {
  const e = _cache.get(key);
  if (!e) return null;
  if (Date.now()-e.ts > CACHE_TTL) { _cache.delete(key); return null; }
  console.log('[RM] CACHE HIT');
  return e.text;
}

export function setCached(key, text) {
  if (_cache.size >= CACHE_MAX) { _cache.delete(_cache.keys().next().value); }
  _cache.set(key, {text, ts:Date.now()});
}

export function reset() { _inFlight=false; _lastSentAt=0; _cache.clear(); console.log('[RM] RESET'); }
export function getStats() { return {inFlight:_inFlight, callCount:_callCount, cacheSize:_cache.size}; }
