import { COLORS } from '../../utils/constants';
export default function DistressIndicator({level=0,distressClass='LOW'}){
  const pct=Math.round(level*100);
  const color=distressClass==='HIGH'?COLORS.rose:distressClass==='MEDIUM'?COLORS.amber:COLORS.green;
  const label=distressClass==='HIGH'?'High':distressClass==='MEDIUM'?'Moderate':'Low';
  return <div style={{width:'100%'}}>
    <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
      <span style={{fontSize:12,color:COLORS.slateLight}}>Distress Level</span>
      <span style={{fontSize:12,color,fontWeight:600}}>{label}</span>
    </div>
    <div style={{height:8,background:'rgba(255,255,255,0.06)',borderRadius:99,overflow:'hidden'}}>
      <div style={{height:'100%',width:`${pct}%`,background:`linear-gradient(90deg,${color}88,${color})`,borderRadius:99,transition:'width 0.8s ease'}}/>
    </div>
    <div style={{fontSize:10,color:COLORS.slate,marginTop:4,textAlign:'right'}}>{pct}%</div>
  </div>;
}
