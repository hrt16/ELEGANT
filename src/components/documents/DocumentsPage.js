import { useState, useRef } from 'react';
import GlassCard from '../shared/GlassCard';
import Badge from '../shared/Badge';
import { COLORS } from '../../utils/constants';
import { callGemini } from '../../utils/aiHelpers';

const SYS = `You are a legal document analyst specialising in Indian law. Analyse the uploaded document and respond with these exact sections:
## Document Type
## Key Clauses (4-5 bullet points)
## Risky Clauses (2-3 items with reasoning)
## Plain-Language Summary (3-4 sentences)
## Legal Risk Score
State Low/Medium/High with 2 sentences of reasoning. Keep under 280 words.`;

const FEATURES=[
  {title:'Clause Extraction',     icon:'',desc:'Identify key obligations, rights, and terms in legal text.'},
  {title:'Risk Detection',        icon:'',desc:'Flag potentially unfavourable or ambiguous clauses automatically.'},
  {title:'Plain-Language Summary',icon:'',desc:'Translate complex legalese into clear, simple English.'},
  {title:'FIR Drafting',          icon:'',desc:'Auto-generate First Information Reports with relevant IPC sections.'},
  {title:'Contract Analysis',     icon:'',desc:'Review agreements for hidden liabilities and one-sided terms.'},
  {title:'Legal Risk Score',      icon:'',desc:'Low / Medium / High rating with detailed reasoning.'},
];

export default function DocumentsPage() {
  const [file,setFile]=useState(null);
  const [analysis,setAnalysis]=useState('');
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const ref=useRef(null);

  async function handleUpload(e) {
    const f=e.target.files?.[0]; if(!f) return;
    setFile(f); setAnalysis(''); setError(''); setLoading(true);
    try {
      const result = await callGemini([{role:'user',content:`Analyse this legal document:\nFilename: ${f.name}\nSize: ${(f.size/1024).toFixed(1)} KB\n(Demo: simulate a realistic analysis based on the filename.)`}],SYS,280);
      setAnalysis(result);
    } catch(err) { setError(err.message||'Analysis failed.'); }
    setLoading(false);
  }

  function renderAnalysis(text) {
    return text.split('\n').map((line,i)=>{
      if(line.startsWith('## ')) return <h4 key={i} style={{fontSize:13,fontWeight:700,color:COLORS.accent,margin:'16px 0 6px'}}>{line.replace('## ','')}</h4>;
      if(line.startsWith('- ')||line.startsWith('• ')) return <div key={i} style={{display:'flex',gap:8,marginBottom:4}}><span style={{color:COLORS.teal,flexShrink:0}}>▸</span><span style={{fontSize:13,color:COLORS.slateLight,lineHeight:1.65}}>{line.replace(/^[-•]\s/,'')}</span></div>;
      if(!line.trim()) return <div key={i} style={{height:4}}/>;
      return <p key={i} style={{fontSize:13,color:COLORS.slateLight,lineHeight:1.65,margin:'2px 0'}}>{line}</p>;
    });
  }

  return (
    <div className="animate-fade-up">
      <div style={{marginBottom:24}}><h1 style={{fontSize:22,fontWeight:700,margin:0}}>Legal Document Analyser</h1><p style={{color:COLORS.slateLight,fontSize:13,marginTop:4}}>Upload contracts, FIRs, notices — AI extracts clauses, detects risks, simplifies language</p></div>
      <input ref={ref} type="file" accept=".pdf,.docx,.txt" onChange={handleUpload} style={{display:'none'}}/>
      <GlassCard hover onClick={()=>!loading&&ref.current?.click()} style={{marginBottom:20,border:'1px dashed rgba(79,142,247,0.35)',cursor:loading?'wait':'pointer'}}>
        <div style={{textAlign:'center',padding:'28px 0'}}>
          <div style={{fontSize:40,marginBottom:12}}>{loading?'':''}</div>
          <div style={{fontSize:16,fontWeight:600,color:COLORS.white,marginBottom:6}}>{loading?'Analysing…':'Drop your legal document here'}</div>
          <div style={{fontSize:13,color:COLORS.slateLight,marginBottom:16}}>Supports PDF, DOCX, TXT — Max 10 MB</div>
          {!loading&&<button className="btn-primary" style={{width:'auto',padding:'11px 28px'}}>Choose File</button>}
        </div>
      </GlassCard>
      {file&&<GlassCard style={{marginBottom:16,padding:'14px 20px'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:42,height:42,borderRadius:10,background:'rgba(79,142,247,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}></div>
          <div><div style={{fontSize:14,fontWeight:600,color:COLORS.white}}>{file.name}</div><div style={{fontSize:12,color:COLORS.slateLight}}>{(file.size/1024).toFixed(1)} KB</div></div>
          <div style={{marginLeft:'auto'}}><Badge label={loading?'Analysing…':error?'Error':'Ready'} color={loading?COLORS.amber:error?COLORS.rose:COLORS.green} bg={`${loading?COLORS.amber:error?COLORS.rose:COLORS.green}22`}/></div>
        </div>
      </GlassCard>}
      {error&&<div style={{background:'rgba(244,63,94,0.1)',border:'1px solid rgba(244,63,94,0.3)',borderRadius:12,padding:'14px 18px',color:'#f87171',fontSize:13,marginBottom:16}}> {error}</div>}
      {analysis&&!loading&&(
        <GlassCard style={{marginBottom:20}}>
          <h3 style={{fontSize:15,fontWeight:600,margin:'0 0 16px',color:COLORS.white}}>AI Document Analysis</h3>
          <div>{renderAnalysis(analysis)}</div>
          <div style={{display:'flex',gap:10,marginTop:20,flexWrap:'wrap'}}>
            <button style={{background:'rgba(79,142,247,0.12)',border:'1px solid rgba(79,142,247,0.25)',borderRadius:8,padding:'9px 18px',color:COLORS.accent,fontSize:13,cursor:'pointer'}}>Download Report</button>
            <button style={{background:'rgba(244,63,94,0.1)',border:'1px solid rgba(244,63,94,0.2)',borderRadius:8,padding:'9px 18px',color:COLORS.rose,fontSize:13,cursor:'pointer'}}>Flag for Review</button>
          </div>
        </GlassCard>
      )}
      {!file&&<div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
        {FEATURES.map(f=>(
          <GlassCard key={f.title} style={{padding:16}}>
            <div style={{fontSize:26,marginBottom:8}}>{f.icon}</div>
            <div style={{fontSize:14,fontWeight:600,color:COLORS.white,marginBottom:6}}>{f.title}</div>
            <div style={{fontSize:12,color:COLORS.slateLight,lineHeight:1.65}}>{f.desc}</div>
          </GlassCard>
        ))}
      </div>}
    </div>
  );
}
