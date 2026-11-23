// LexAI v6 — empathyProfiles.js
export const EMPATHY_PROFILES = {
  neutral:  {mode:'Professional', toneLabel:'Clear',        uiColor:'#64748b', uiIcon:'⚖️', prefix:'Respond professionally as an Indian legal assistant.',                                            suffix:''},
  calm:     {mode:'Supportive',   toneLabel:'Warm',         uiColor:'#22c55e', uiIcon:'🌿', prefix:'Respond warmly as a supportive Indian legal assistant.',                                           suffix:''},
  distress: {mode:'High Empathy', toneLabel:'Compassionate',uiColor:'#f43f5e', uiIcon:'💙', prefix:'User is emotionally distressed. Open with ONE empathetic sentence then give calm practical steps. Do not act as therapist.', suffix:'Remind them qualified legal help is available.'},
  fear:     {mode:'Reassuring',   toneLabel:'Reassuring',   uiColor:'#8b5cf6', uiIcon:'🛡️', prefix:'User is frightened. Start with one reassuring sentence. Use step-by-step structure. Say "you have rights". Do not diagnose.',  suffix:'End with one clear action they can take today.'},
  sadness:  {mode:'Gentle',       toneLabel:'Gentle',       uiColor:'#3b82f6', uiIcon:'🌊', prefix:'User is sad or grieving. Open with one compassionate sentence. Use gentle language. Do not act as counsellor.',                  suffix:'Note that legal clarity can restore a sense of control.'},
  anger:    {mode:'De-escalating',toneLabel:'Neutral',      uiColor:'#ef4444', uiIcon:'🧯', prefix:'User is frustrated. Acknowledge briefly. Pivot quickly to practical legal options. Use neutral language. Do not mirror anger.',  suffix:'Frame legal options as tools that give them agency.'},
  anxiety:  {mode:'Structured',   toneLabel:'Clear',        uiColor:'#f59e0b', uiIcon:'📋', prefix:"User is anxious. Use numbered steps. Max 3 steps. Plain language only. Do not say 'don't worry'. Do not diagnose.",             suffix:'State single most important next step last.'},
  urgency:  {mode:'Urgent',       toneLabel:'Action-focused',uiColor:'#f97316',uiIcon:'🚨', prefix:'URGENT situation. Put most critical action FIRST. Mention Police 100 / Helpline 1091 / Legal Aid 15100 if relevant.',           suffix:''},
};

export function selectEmpathyProfile(emotion, distressClass, distressLevel) {
  if (distressClass === 'HIGH' || distressLevel >= 0.55) return EMPATHY_PROFILES.distress;
  return EMPATHY_PROFILES[emotion] || EMPATHY_PROFILES.neutral;
}

export function buildEmotionContext(ed) {
  const pct = Math.round((ed.confidence || 0) * 100);
  const dl  = Math.round((ed.distressLevel || 0) * 100);
  return `Emotion:${ed.dominant}(${pct}%) Distress:${dl}%(${ed.distressClass || 'LOW'})`;
}
