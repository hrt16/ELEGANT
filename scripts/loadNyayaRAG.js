// scripts/loadNyayaRAG.js — NyayaRAG Dataset Loader
// Run: node scripts/loadNyayaRAG.js
// Downloads from HuggingFace API and merges with existing statutes.
// Falls back to bundled 15-case dataset if network unavailable.
'use strict';
const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');

const OUT_DIR  = path.resolve(__dirname, '../src/rag');
const OUT_FILE = path.join(OUT_DIR, 'mergedLegalDB.json');
const HF_URL   = 'https://datasets-server.huggingface.co/rows?dataset=L-NLProc%2FTathyaNyaya-and-FactLegalLlama-NyayaFacts-Datasets&config=default&split=train&offset=0&length=100';
function extractKeywords(text) {
  const legal = [

  // Criminal Law
  'murder','homicide','culpable homicide','manslaughter','theft','robbery','dacoity',
  'burglary','assault','battery','kidnapping','abduction','rape','molestation',
  'harassment','stalking','cyberbullying','fraud','forgery','cheating',
  'criminal breach of trust','misappropriation','extortion','bribery','corruption',
  'terrorism','sedition','riot','rioting','illegal detention','custody','bail',
  'anticipatory bail','arrest','remand','fir','charge sheet','investigation',
  'evidence','witness','cross examination','criminal conspiracy',

  // IPC / CrPC / Constitution
  'ipc','crpc','constitution','constitutional','fundamental rights',
  'article 14','article 19','article 21','article 32','writ','mandamus',
  'certiorari','habeas corpus','quo warranto','prohibition',
  'section','act','statute','ordinance','tribunal','supreme court',
  'high court','district court','magistrate','sessions court','judgment',
  'decree','injunction','stay order','appeal','revision','review',

  // Family Law
  'divorce','mutual divorce','alimony','maintenance','custody',
  'child custody','domestic violence','dowry','dowry harassment',
  '498a','marriage','matrimonial','adoption','guardianship',
  'inheritance','succession','muslim law','hindu marriage act',

  // Property Law
  'property','land dispute','encroachment','tenant','landlord',
  'lease','rent','eviction','sale deed','registry','mutation',
  'adverse possession','partition','ownership','title dispute',
  'mortgage','easement','trespass','possession',

  // Corporate / Commercial
  'contract','agreement','breach of contract','arbitration',
  'company law','corporate','shareholder','insolvency',
  'bankruptcy','ibc','liquidation','debt recovery',
  'financial creditor','operational creditor','nclt','nclat',

  // Labor Law
  'employment','termination','wrongful termination',
  'retrenchment','salary','minimum wage','workplace harassment',
  'sexual harassment','posh','industrial disputes','labour court',
  'gratuity','provident fund','pension',

  // Consumer Law
  'consumer','consumer protection','refund','deficiency of service',
  'defective product','medical negligence','unfair trade practice',
  'ecommerce fraud',

  // Cyber Law
  'cyber crime','hacking','identity theft','data breach',
  'phishing','online fraud','digital arrest','cyber stalking',
  'it act','privacy','data protection','electronic evidence',

  // Intellectual Property
  'trademark','copyright','patent','design infringement',
  'passing off','intellectual property',

  // Human Rights / Constitutional
  'privacy','freedom of speech','equality','discrimination',
  'human rights','reservation','lgbtq','transgender rights',

  // Financial / Banking
  'cheque bounce','ni act','money laundering','tax evasion',
  'gst','income tax','loan default','recovery',

  // Misc
  'damages','compensation','negligence','liability',
  'public interest litigation','pil','legal aid','lok adalat'

];
  const lower = text.toLowerCase();
  return legal.filter(kw => lower.includes(kw)).slice(0, 10);
}

function detectCategory(text) {
  const t = text.toLowerCase();
  if (/murder|theft|assault|rape|fraud|criminal|ipc|crpc|bail|arrest/.test(t)) return 'Criminal Law';
  if (/divorce|custody|marriage|alimony|dowry|domestic|matrimon/.test(t))       return 'Family Law';
  if (/property|land|rent|evict|encroach|possession/.test(t))                   return 'Property Law';
  if (/employment|labour|termination|workplace|retrench/.test(t))               return 'Labor Law';
  if (/constitutional|article|fundamental|writ|mandamus/.test(t))               return 'Constitutional Law';
  if (/company|contract|corporate|shareholder|business/.test(t))                return 'Corporate Law';
  if (/consumer|defect|refund|mislead/.test(t))                                 return 'Consumer Rights';
  return 'Civil Law';
}


function convertRow(row, i) {

  const caseName =
    row["Case Name"] || `NyayaRAG Case ${i + 1}`;

  // FULL TEXT
  const fullText = `
    ${row.text || ""}
    ${row.Reasoning || ""}
  `
    .replace(/\s+/g, " ")
    .toLowerCase();

  // EXTRACT KEYWORDS FROM FULL TEXT
  const keywords = extractKeywords(
    `${caseName} ${fullText}`
  );

  return {

    id: `nyaya-${i + 1}`,

    category: detectCategory(fullText),

    type: "case",

    // KEEP TITLE
    title: caseName.slice(0, 200),

    // REMOVE HUGE TEXT MEMORY
    text: "",

    // SAVE ONLY KEYWORDS
    keywords: [...new Set(keywords)],

    source: "NyayaRAG",

    // OPTIONAL SMALL SUMMARY
    answer: ""
  };
}



function fetchJSON(url, hops=5) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { headers:{'User-Agent':'LexAI/1.0','Accept':'application/json'}, timeout:30000 }, res => {
      if ([301,302,307].includes(res.statusCode) && res.headers.location && hops>0)
        return fetchJSON(res.headers.location, hops-1).then(resolve).catch(reject);
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      let raw = '';
      res.on('data', c => raw+=c);
      res.on('end', () => { try { resolve(JSON.parse(raw)); } catch(e) { reject(e); } });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function loadExisting(file) {
  const p = path.join(OUT_DIR, file);
  if (!fs.existsSync(p)) return [];
  try { const d = JSON.parse(fs.readFileSync(p,'utf8')); return Array.isArray(d) ? d : []; } catch { return []; }
}

const FALLBACK_CASES = [
  {id:'nyaya-1',category:'Criminal Law',type:'case',title:'Arnesh Kumar v. State of Bihar (2014) — Arrest Guidelines 498A',text:'Supreme Court issued mandatory guidelines for arrest under Section 498A IPC. Police must not arrest automatically. Magistrate must apply mind before granting remand. Non-compliance is punishable as contempt of court.',keywords:['arrest','498a','dowry','guidelines','crpc 41','police'],source:'NyayaRAG',answer:'Arrest under 498A must follow Arnesh Kumar guidelines — not automatic.'},
  {id:'nyaya-2',category:'Constitutional Law',type:'case',title:'Kesavananda Bharati v. State of Kerala (1973) — Basic Structure Doctrine',text:'Supreme Court held Parliament cannot amend the basic structure of the Constitution. Fundamental rights and separation of powers are part of basic structure and cannot be destroyed.',keywords:['basic structure','constitution','amendment','fundamental rights','parliament'],source:'NyayaRAG',answer:'Parliament cannot destroy the basic structure of the Constitution.'},
  {id:'nyaya-3',category:'Family Law',type:'case',title:'Shah Bano Begum v. Mohammad Ahmed Khan (1985) — Muslim Maintenance',text:'Supreme Court held a Muslim woman is entitled to maintenance under Section 125 CrPC even after divorce. Secular law applies over personal law in matters of maintenance.',keywords:['maintenance','muslim','divorce','section 125','crpc','alimony'],source:'NyayaRAG',answer:'Muslim women entitled to maintenance under Section 125 CrPC post-divorce.'},
  {id:'nyaya-4',category:'Property Law',type:'case',title:'Bachhaj Nahar v. Nilima Mandal (2008) — Adverse Possession',text:'Adverse possession requires continuous, open, hostile and exclusive possession for 12 years. Mere possession without hostile animus against true owner is not sufficient.',keywords:['adverse possession','property','hostile','12 years','possession'],source:'NyayaRAG',answer:'Adverse possession requires 12 years continuous hostile possession.'},
  {id:'nyaya-5',category:'Labor Law',type:'case',title:'D.K. Yadav v. J.M.A. Industries (1993) — Natural Justice in Termination',text:'Termination of employment without hearing violates principles of natural justice. Employer must give opportunity to explain before termination. Reinstatement ordered where natural justice not followed.',keywords:['termination','natural justice','employment','reinstatement','hearing'],source:'NyayaRAG',answer:'Termination without hearing violates natural justice — reinstatement ordered.'},
  {id:'nyaya-6',category:'Constitutional Law',type:'case',title:'Maneka Gandhi v. Union of India (1978) — Personal Liberty Article 21',text:'Article 21 expanded to include procedural due process. Law depriving personal liberty must be just, fair and reasonable. Passport impoundment without hearing violates Article 21.',keywords:['article 21','personal liberty','due process','passport','fundamental rights'],source:'NyayaRAG',answer:'Article 21 requires procedure to be just, fair and reasonable.'},
  {id:'nyaya-7',category:'Family Law',type:'case',title:'Shayara Bano v. Union of India (2017) — Triple Talaq Unconstitutional',text:'Supreme Court struck down instant Triple Talaq as unconstitutional 3-2 majority. Held manifestly arbitrary and violative of Article 14. Led to Muslim Women Protection of Rights on Marriage Act 2019.',keywords:['triple talaq','talaq','muslim','unconstitutional','article 14','divorce'],source:'NyayaRAG',answer:'Instant Triple Talaq struck down as unconstitutional — violates Article 14.'},
  {id:'nyaya-8',category:'Consumer Rights',type:'case',title:'Lucknow Development Authority v. M.K. Gupta (1994) — Housing Deficiency',text:'Housing boards and development authorities are service providers under Consumer Protection Act. Failure to deliver possession constitutes deficiency in service. Consumer forums have jurisdiction over government housing schemes.',keywords:['consumer','housing','deficiency','development authority','compensation'],source:'NyayaRAG',answer:'Housing boards liable for deficiency in service under Consumer Protection Act.'},
  {id:'nyaya-9',category:'Criminal Law',type:'case',title:'Mohd. Ajmal Kasab v. State of Maharashtra (2012) — 26/11 Terror Case',text:'Supreme Court upheld death sentence for the 26/11 attacker. Fair trial was conducted. Rights of accused under Article 22 were protected. CCTV and witness testimony examined.',keywords:['death sentence','terrorism','fair trial','article 22','evidence'],source:'NyayaRAG',answer:'Death sentence upheld; fair trial rights under Article 22 were protected.'},
  {id:'nyaya-10',category:'Property Law',type:'case',title:'Suraj Lamp & Industries v. State of Haryana (2012) — GPA Property Transfer',text:'Sale of immovable property through Power of Attorney (GPA/SA/WILL) is not valid transfer. Registration mandatory under Transfer of Property Act. GPA does not confer title.',keywords:['property','power of attorney','registration','transfer','title'],source:'NyayaRAG',answer:'GPA/SA/WILL transactions do not confer title — registration mandatory.'},
  {id:'nyaya-11',category:'Constitutional Law',type:'case',title:'NALSA v. Union of India (2014) — Transgender Rights',text:'Supreme Court recognized transgender persons as third gender with fundamental rights under Articles 14, 15, 19, 21. Directed government to treat them as OBC for reservations.',keywords:['transgender','third gender','fundamental rights','article 14','article 21'],source:'NyayaRAG',answer:'Transgender persons recognized as third gender with full fundamental rights.'},
  {id:'nyaya-12',category:'Criminal Law',type:'case',title:'Alakh Alok Srivastava v. Union of India (2018) — POCSO Fast Track Courts',text:'Supreme Court directed states to set up fast track courts for POCSO cases. Cases must be decided within one year. Victim compensation under POCSO is mandatory.',keywords:['pocso','child','sexual abuse','fast track court','victim compensation'],source:'NyayaRAG',answer:'POCSO cases must be tried in fast track courts within one year.'},
  {id:'nyaya-13',category:'Labor Law',type:'case',title:'Excel Wear v. Union of India (1979) — Right to Close Business',text:'Factory owner has the right to close down the business but must comply with Section 25-O Industrial Disputes Act. Right to business protected under Article 19(1)(g).',keywords:['factory closure','industrial disputes','article 19','business rights','workmen'],source:'NyayaRAG',answer:'Employer has right to close business subject to Industrial Disputes Act compliance.'},
  {id:'nyaya-14',category:'Constitutional Law',type:'case',title:'Navtej Singh Johar v. Union of India (2018) — Section 377 Decriminalised',text:'Supreme Court struck down Section 377 IPC to the extent it criminalised consensual same-sex relations between adults. Fundamental rights of LGBTQ+ persons upheld under Articles 14, 15, 19, 21.',keywords:['section 377','lgbtq','decriminalised','fundamental rights','article 21'],source:'NyayaRAG',answer:'Section 377 struck down for consensual same-sex acts — fundamental rights upheld.'},
  {id:'nyaya-15',category:'Constitutional Law',type:'case',title:'K.S. Puttaswamy v. Union of India (2017) — Right to Privacy',text:'Nine-judge bench unanimously declared Right to Privacy as a fundamental right under Article 21. Privacy includes personal autonomy, informational self-determination, and dignity.',keywords:['privacy','fundamental right','article 21','data','puttaswamy','aadhaar'],source:'NyayaRAG',answer:'Right to Privacy is a fundamental right under Article 21 — unanimously held.'},
];

async function main() {
  console.log('\n🔄  LexAI v6 — NyayaRAG Loader');
  console.log('================================');
  const statutes = loadExisting('legalDataset.json');
  console.log(`  Existing statutes: ${statutes.length}`);

  let nyayaDocs = [];
  try {
    console.log('  Fetching from HuggingFace...');
    const data = await fetchJSON(HF_URL);
    const rows = data.rows || data.data || [];
   nyayaDocs = rows
  .slice(0, 30)
  .map((item, i) => convertRow(item.row || item, i))
  .filter(Boolean);
    console.log(`  ✅ Fetched+converted: ${nyayaDocs.length} HuggingFace rows`);
  } catch(err) {
    console.warn(`  ⚠️  HF fetch failed: ${err.message}`);
    console.log('  → Using bundled fallback cases...');
    nyayaDocs = FALLBACK_CASES;
  }

  const merged = [...statutes];
  const seen = new Set(merged.map(d => d.id));
  for (const d of nyayaDocs) { if (!seen.has(d.id)) { merged.push(d); seen.add(d.id); } }

  fs.mkdirSync(OUT_DIR, { recursive:true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(merged, null, 2));
  console.log(`\n  📚 Total: ${merged.length} docs (${statutes.length} statutes + ${nyayaDocs.length} cases)`);
  console.log(`  ✅ Written: ${OUT_FILE}\n`);
}

main().catch(err => {
  console.error('❌', err.message);
  const fb = [...FALLBACK_CASES];
  fs.mkdirSync(OUT_DIR, {recursive:true});
  fs.writeFileSync(OUT_FILE, JSON.stringify(fb, null, 2));
  console.log(`✅ Fallback: ${fb.length} docs written`);
  process.exit(0);
});
