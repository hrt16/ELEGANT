import { useState } from 'react';
import GlassCard from '../shared/GlassCard';
import CircularProgress from '../shared/CircularProgress';
import { COLORS, LEGAL_CATEGORIES } from '../../utils/constants';
import { generatePrediction } from '../../utils/aiHelpers';

const XAI = [
  {title:'Evidence Weight', icon:'',color:COLORS.green,  desc:'Strong documentary evidence increases win probability by up to 18%.'},
  {title:'Precedent Match', icon:'',color:COLORS.accent, desc:'NyayaRAG retrieved relevant case precedents from Indian Supreme Court.'},
  {title:'Jurisdiction',    icon:'',color:COLORS.purple, desc:'High Court success rate for this category based on historical data.'},
];

export default function PredictionPage() {
  const [cat,setCat]=useState(LEGAL_CATEGORIES[0]);
  const [facts,setFacts]=useState('');
  const [result,setResult]=useState(null);
  const input={background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,padding:'11px 14px',color:COLORS.white,fontSize:13,outline:'none',fontFamily:'Inter,sans-serif',width:'100%',boxSizing:'border-box'};
  return (
    <div className="animate-fade-up">
      <div style={{marginBottom:24}}><h1 style={{fontSize:22,fontWeight:700,margin:0}}>Judgement Prediction Engine</h1><p style={{color:COLORS.slateLight,fontSize:13,marginTop:4}}>AI-powered outcome prediction with Explainable AI reasoning</p></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
        <GlassCard>
          <h3 style={{fontSize:15,fontWeight:600,margin:'0 0 16px',color:COLORS.white}}>Case Details</h3>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <select style={input} value={cat} onChange={e=>setCat(e.target.value)}>{LEGAL_CATEGORIES.map(c=><option key={c} value={c} style={{background:'#111827'}}>{c}</option>)}</select>
            <textarea style={{...input,resize:'none',lineHeight:1.6}} rows={5} placeholder="Describe case facts, evidence, applicable laws…" value={facts} onChange={e=>setFacts(e.target.value)}/>
            <button className="btn-primary" onClick={()=>facts.trim()&&setResult(generatePrediction(facts,cat))} disabled={!facts.trim()} style={{marginTop:4}}>🤖 Run AI Prediction</button>
          </div>
        </GlassCard>
        {result?(
          <GlassCard>
            <h3 style={{fontSize:15,fontWeight:600,margin:'0 0 20px',color:COLORS.white}}>Prediction Results</h3>
            <div style={{display:'flex',justifyContent:'space-around',marginBottom:20}}>
              <CircularProgress value={result.probability} size={90} color={COLORS.green} label="Win Prob"/>
              <CircularProgress value={result.lossProb}   size={90} color={COLORS.rose}  label="Loss Prob"/>
              <CircularProgress value={result.confidence} size={90} color={COLORS.accent} label="AI Confidence"/>
            </div>
            <div style={{borderTop:'1px solid rgba(255,255,255,0.06)',paddingTop:14,display:'flex',flexDirection:'column',gap:10}}>
              {[{l:'Legal Risk',v:result.risk,c:result.risk==='Low'?COLORS.green:result.risk==='Moderate'?COLORS.amber:COLORS.rose},{l:'Category',v:cat,c:COLORS.teal},{l:'Applicable Sections',v:'IPC § 420, 406',c:COLORS.purple}].map(r=>(
                <div key={r.l} style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:13,color:COLORS.slateLight}}>{r.l}</span>
                  <span style={{fontSize:13,color:r.c,fontWeight:500}}>{r.v}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        ):(
          <GlassCard style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:240}}>
            <div style={{textAlign:'center',color:COLORS.slate}}><div style={{fontSize:38,marginBottom:12}}>⚖️</div><p style={{margin:0,fontSize:14}}>Enter case details and run prediction</p></div>
          </GlassCard>
        )}
      </div>
      <GlassCard>
        <h3 style={{fontSize:15,fontWeight:600,margin:'0 0 16px',color:COLORS.white}}>🔍 Explainable AI</h3>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
          {XAI.map(f=>(
            <GlassCard key={f.title} style={{padding:14}}>
              <div style={{fontSize:22,marginBottom:8}}>{f.icon}</div>
              <div style={{fontSize:13,fontWeight:600,color:f.color,marginBottom:6}}>{f.title}</div>
              <div style={{fontSize:12,color:COLORS.slateLight,lineHeight:1.65}}>{f.desc}</div>
            </GlassCard>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
