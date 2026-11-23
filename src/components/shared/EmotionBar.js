import { EMOTION_COLORS, COLORS } from '../../utils/constants';
export default function EmotionBar({emotion,score}) {
  const color = EMOTION_COLORS[emotion]||COLORS.accent;
  const pct   = Math.round(score*100);
  return (
    <div style={{marginBottom:10}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
        <span style={{fontSize:12,color:COLORS.slateLight,textTransform:'capitalize'}}>{emotion}</span>
        <span style={{fontSize:12,color,fontWeight:600}}>{pct}%</span>
      </div>
      <div style={{height:6,background:'rgba(255,255,255,0.06)',borderRadius:99}}>
        <div style={{height:'100%',width:`${pct}%`,background:`linear-gradient(90deg,${color}99,${color})`,borderRadius:99,transition:'width 0.9s ease'}}/>
      </div>
    </div>
  );
}
