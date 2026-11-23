// LexAI v6 — SimilarCasesPanel.js
// Displays top-5 similar NyayaRAG cases retrieved for user query
import GlassCard from './GlassCard';
import { COLORS } from '../../utils/constants';

const CONF_COLORS = {high:'#22c55e',medium:'#f59e0b',low:'#64748b'};

export default function SimilarCasesPanel({similarCases}) {
  if (!similarCases||!similarCases.length) return null;
  return (
    <GlassCard style={{padding:14}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
        <span style={{fontSize:13,fontWeight:600,color:COLORS.white}}>Similar Cases</span>
        <span style={{fontSize:10,color:COLORS.slate}}>NyayaRAG · top {similarCases.length}</span>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {similarCases.map((c,i)=>{
          const cc = CONF_COLORS[c.confidence]||COLORS.slate;
          return (
            <div key={c.id} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:8,padding:'8px 10px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:6}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,fontWeight:600,color:COLORS.accent,marginBottom:3}}>#{i+1} · {c.category}</div>
                  <div style={{fontSize:12,color:COLORS.white,lineHeight:1.4,marginBottom:4}}>{c.title}</div>
                  {c.answer&&<div style={{fontSize:11,color:COLORS.slateLight,lineHeight:1.5,fontStyle:'italic'}}>"{c.answer.slice(0,100)}{c.answer.length>100?'…':''}"</div>}
                </div>
                <div style={{flexShrink:0,textAlign:'right'}}>
                  <div style={{fontSize:12,fontWeight:700,color:cc}}>{Math.round(c.score*100)}%</div>
                  <div style={{fontSize:9,color:COLORS.slate}}>match</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{marginTop:8,fontSize:10,color:'#334155'}}>Semantic similarity · local inference</div>
    </GlassCard>
  );
}
