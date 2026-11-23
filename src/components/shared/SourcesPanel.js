import GlassCard from './GlassCard';
import { COLORS } from '../../utils/constants';
const TYPE_ICONS = {ipc_section:'',constitution:'',statute:'',procedural:'',case_law:'',case:''};
const CONF_COLORS = {high:'#22c55e',medium:'#f59e0b',low:'#64748b'};
export default function SourcesPanel({sources,confidence}) {
  if (!sources||!sources.length) return null;
  const cc = CONF_COLORS[confidence]||COLORS.slate;
  return (
    <GlassCard style={{padding:14}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
        <span style={{fontSize:13,fontWeight:600,color:COLORS.white}}>Legal Sources</span>
        <span style={{fontSize:11,color:cc,background:`${cc}18`,padding:'2px 8px',borderRadius:10,fontWeight:600,textTransform:'uppercase'}}>{confidence}</span>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:6}}>
        {sources.map(src=>(
          <div key={src.id} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,padding:'8px 10px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <div style={{display:'flex',gap:6,alignItems:'center',flex:1}}>
                <span style={{fontSize:13}}>{TYPE_ICONS[src.type]||''}</span>
                <span style={{fontSize:12,color:COLORS.white,fontWeight:500,lineHeight:1.4}}>{src.title}</span>
              </div>
              <div style={{flexShrink:0,marginLeft:8,textAlign:'right'}}>
                <div style={{fontSize:11,color:CONF_COLORS[src.confidence]||COLORS.slate,fontWeight:600}}>{Math.round(src.score*100)}%</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{marginTop:8,fontSize:10,color:'#334155'}}>Retrieved locally · no Gemini tokens used</div>
    </GlassCard>
  );
}
