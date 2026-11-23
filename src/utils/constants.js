// LexAI v6 — constants.js
export const GEMINI_MODEL        = 'gemini-2.0-flash';
export const ANTHROPIC_MODEL     = GEMINI_MODEL; // alias
export const MAX_TOKENS          = 4096;   // optimized for free tier
export const MAX_HISTORY         = 2;     // last 2 turns only
export const REQUEST_COOLDOWN_MS = 1500;  // ms between requests

export const COLORS = {
  navy:'#080d1a', navyLight:'#111827', navyMid:'#1a2236',
  accent:'#4f8ef7', accentDark:'#3b7de8', gold:'#f5c842',
  teal:'#14b8a6', rose:'#f43f5e', purple:'#8b5cf6',
  green:'#22c55e', amber:'#f59e0b', slate:'#64748b',
  slateLight:'#94a3b8', white:'#f8fafc',
  glass:'rgba(255,255,255,0.04)', glassBorder:'rgba(255,255,255,0.08)',
};

export const EMOTION_COLORS = {
  fear:'#8b5cf6', anger:'#ef4444', sadness:'#3b82f6',
  anxiety:'#f59e0b', distress:'#f43f5e', neutral:'#64748b',
  urgency:'#f97316', calm:'#22c55e', joy:'#22c55e',
  surprise:'#f59e0b', disgust:'#f43f5e',
};

export const LEGAL_CATEGORIES = [
  'Criminal Law','Civil Law','Family Law','Property Law','Labor Law',
  'Constitutional Law','Corporate Law','Cyber Law','Consumer Rights','Intellectual Property',
];

export const SAMPLE_CASES = [
  {id:1,title:'Vishaka v. State of Rajasthan (1997)',category:'Labor',outcome:'Vishaka Guidelines for workplace sexual harassment',similarity:94,precedent:'Supreme Court of India',year:1997,verdict:'In favor of petitioner',sections:['Article 14','Article 21']},
  {id:2,title:'Shreya Singhal v. Union of India (2015)',category:'Constitutional',outcome:'Section 66A IT Act struck down',similarity:87,precedent:'Supreme Court of India',year:2015,verdict:'In favor of petitioner',sections:['Article 19(1)(a)']},
  {id:3,title:'Arnesh Kumar v. State of Bihar (2014)',category:'Criminal',outcome:'Arrest guidelines for 498A cases',similarity:81,precedent:'Supreme Court of India',year:2014,verdict:'Mixed',sections:['IPC 498A','CrPC 41']},
  {id:4,title:'K.S. Puttaswamy v. Union of India (2017)',category:'Constitutional',outcome:'Right to privacy is fundamental right',similarity:76,precedent:'Supreme Court of India',year:2017,verdict:'In favor of petitioner',sections:['Article 21']},
  {id:5,title:'Maneka Gandhi v. Union of India (1978)',category:'Constitutional',outcome:'Article 21 requires fair procedure',similarity:71,precedent:'Supreme Court of India',year:1978,verdict:'In favor of petitioner',sections:['Article 21','Article 14']},
];

export const DEMO_USERS = {
  'user@demo.com':  {password:'demo123',role:'user',  name:'Arjun Sharma',    avatar:'AS',cases:12},
  'lawyer@demo.com':{password:'demo123',role:'lawyer',name:'Adv. Priya Verma',avatar:'PV',cases:47},
  'admin@demo.com': {password:'demo123',role:'admin', name:'System Admin',    avatar:'SA',cases:0},
};

export const ESCALATED_CASES = [
  {id:1,name:'Rohan Mehta', issue:'Domestic violence — urgent court order needed', emotion:'distress',time:'15 min ago',priority:'Urgent',  category:'Family Law'},
  {id:2,name:'Sunita Patel',issue:'Wrongful termination with evidence suppression', emotion:'anger',   time:'1h ago',    priority:'High',    category:'Labor Law'},
  {id:3,name:'Vinod Kumar', issue:'Property encroachment — civil suit needed',       emotion:'anxiety', time:'3h ago',    priority:'Moderate',category:'Property Law'},
];

export const QUICK_PROMPTS = [
  'My employer fired me without notice',
  'Landlord refuses to return my security deposit',
  'Neighbour is encroaching on my land',
  'I received a police legal notice',
  'How to file a consumer complaint?',
  'My cheque was bounced — what are my rights?',
];
