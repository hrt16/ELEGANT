import { EMOTION_COLORS, COLORS } from '../../utils/constants';
const ICONS={fear:'😨',anger:'😠',sadness:'😢',anxiety:'😟',distress:'💔',neutral:'😐',urgency:'🚨',calm:'😌',joy:'😊',surprise:'😲',disgust:'😤'};
export default function EmotionBadge({emotionData,size='md'}){
  if(!emotionData) return null;
  const {dominant,confidence,distressClass,source}=emotionData;
  const color=EMOTION_COLORS[dominant]||COLORS.slate,icon=ICONS[dominant]||'',pct=Math.round((confidence||0)*100),sm=size==='sm';
  return <div style={{display:'inline-flex',alignItems:'center',gap:6,background:`${color}18`,border:`1px solid ${color}40`,borderRadius:20,padding:sm?'3px 10px':'5px 12px',transition:'all 0.3s ease'}}>
    <span style={{fontSize:sm?12:14}}>{icon}</span>
    <span style={{fontSize:sm?11:12,color,fontWeight:600,textTransform:'capitalize'}}>{dominant}</span>
    {!sm&&<span style={{fontSize:10,color:`${color}99`,fontWeight:500}}>{pct}%</span>}
    {!sm&&distressClass==='HIGH'&&<span style={{fontSize:10,background:COLORS.rose+'22',color:COLORS.rose,padding:'1px 6px',borderRadius:8,fontWeight:600}}>HIGH</span>}
    {!sm&&source==='fallback'&&<span style={{fontSize:9,color:COLORS.slate,fontStyle:'italic'}}>fallback</span>}
  </div>;
}
