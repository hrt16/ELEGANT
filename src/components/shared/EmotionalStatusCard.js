import GlassCard from './GlassCard';
import EmotionBar from './EmotionBar';
import EmotionBadge from './EmotionBadge';
import DistressIndicator from './DistressIndicator';
import { COLORS } from '../../utils/constants';
import { EMPATHY_PROFILES } from '../../utils/empathyProfiles';
export default function EmotionalStatusCard({emotionData,loading}){
  if(loading) return <GlassCard style={{padding:16}}>
    <div style={{fontSize:13,fontWeight:600,marginBottom:12,color:COLORS.white}}>Emotion Analysis</div>
    <div style={{display:'flex',alignItems:'center',gap:10,color:COLORS.slateLight,fontSize:13}}>
      <div style={{display:'flex',gap:4}}>{[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:'50%',background:COLORS.accent,animation:`pulse 1.2s ease ${i*0.2}s infinite`}}/>)}</div>
      Analysing emotion…
    </div>
  </GlassCard>;
  if(!emotionData) return <GlassCard style={{padding:16,textAlign:'center'}}>
    <div style={{fontSize:28,marginBottom:8}}></div>
    <p style={{fontSize:12,color:COLORS.slate,margin:0}}>Send a message to see live emotion analysis</p>
    <p style={{fontSize:11,color:'#334155',marginTop:6}}>Powered by DistilRoBERTa transformer</p>
  </GlassCard>;
  const profile=EMPATHY_PROFILES[emotionData.dominant]||EMPATHY_PROFILES.neutral;
  return <GlassCard style={{padding:16}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
      <span style={{fontSize:13,fontWeight:600,color:COLORS.white}}>Emotion Analysis</span>
      <EmotionBadge emotionData={emotionData} size="sm"/>
    </div>
    <div style={{marginBottom:14}}><DistressIndicator level={emotionData.distressLevel} distressClass={emotionData.distressClass}/></div>
    <div style={{background:`${profile.uiColor}15`,border:`1px solid ${profile.uiColor}30`,borderRadius:10,padding:'8px 12px',marginBottom:14,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <span style={{fontSize:11,color:COLORS.slateLight}}>Empathy Mode</span>
      <span style={{fontSize:12,color:profile.uiColor,fontWeight:600}}>{profile.uiIcon} {profile.mode}</span>
    </div>
    {Object.entries(emotionData.scores||{}).filter(([,v])=>v>0.03).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k,v])=><EmotionBar key={k} emotion={k} score={v}/>)}
    {emotionData.distressClass==='HIGH'&&<div style={{marginTop:12,background:'rgba(244,63,94,0.1)',border:'1px solid rgba(244,63,94,0.25)',borderRadius:10,padding:'10px 12px',fontSize:12,color:'#f87171'}}>High distress. Compassionate mode active. Consider consulting a lawyer.</div>}
    <div style={{marginTop:10,fontSize:10,color:'#334155',textAlign:'right'}}>{emotionData.source==='transformer'?'⚡ DistilRoBERTa · local inference':'⚡ Keyword fallback'}</div>
  </GlassCard>;
}
