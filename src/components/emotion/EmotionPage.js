import GlassCard from '../shared/GlassCard';
import Badge from '../shared/Badge';
import EmotionBar from '../shared/EmotionBar';
import { COLORS, EMOTION_COLORS } from '../../utils/constants';

function PulsingDot({color}) {
  return <span style={{position:'relative',display:'inline-block',width:10,height:10}}>
    <span style={{position:'absolute',width:10,height:10,borderRadius:'50%',background:color,opacity:0.5,animation:'ping 1.5s ease-in-out infinite'}}/>
    <span style={{position:'absolute',width:10,height:10,borderRadius:'50%',background:color}}/>
  </span>;
}

const LOG=[
  {time:'Today 2:14 PM',   level:'High',     action:'Empathetic tone activated + Lawyer referral suggested'},
  {time:'Yesterday 4:30 PM',level:'Moderate',action:'Supportive language mode enabled'},
  {time:'May 9, 11:00 AM', level:'Low',      action:'Standard professional tone maintained'},
];
const INSIGHTS=[
  {title:'Stress Reduction',   icon:'',color:COLORS.teal,  desc:'Empathetic responses reduce user distress by 34% per session on average.'},
  {title:'Escalation Accuracy',icon:'',color:COLORS.accent,desc:'AI correctly identifies when human lawyer support is needed with 89% precision.'},
  {title:'Satisfaction Score', icon:'',color:'#f5c842',    desc:'Users report 4.2/5 satisfaction after AI-guided support during legal crises.'},
];
const lc = l => l==='High'?COLORS.rose:l==='Moderate'?COLORS.amber:COLORS.green;
const TOP=[{e:'anxiety',v:42},{e:'neutral',v:28},{e:'fear',v:18},{e:'distress',v:12}];

export default function EmotionPage({liveEmotion}) {
  return (
    <div className="animate-fade-up">
      <div style={{marginBottom:24}}><h1 style={{fontSize:22,fontWeight:700,margin:0}}>Emotion Analytics</h1><p style={{color:COLORS.slateLight,fontSize:13,marginTop:4}}>Real-time transformer-based sentiment analysis · DistilRoBERTa · Gemini 2.5 Flash</p></div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:20}}>
        {TOP.map(({e,v})=>{
          const color=EMOTION_COLORS[e]||COLORS.slate;
          return (
            <GlassCard key={e} style={{textAlign:'center',padding:'20px 12px'}}>
              <div style={{width:44,height:44,borderRadius:'50%',background:`${color}22`,border:`1px solid ${color}55`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 10px'}}>
                <PulsingDot color={color}/>
              </div>
              <div style={{fontSize:24,fontWeight:700,color}}>{v}%</div>
              <div style={{fontSize:12,color:COLORS.slateLight,textTransform:'capitalize',marginTop:4}}>{e}</div>
            </GlassCard>
          );
        })}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
        <GlassCard>
          <h3 style={{fontSize:15,fontWeight:600,margin:'0 0 16px',color:COLORS.white}}>Live Session Emotion</h3>
          {liveEmotion?Object.entries(liveEmotion.scores).filter(([,v])=>v>0.02).sort((a,b)=>b[1]-a[1]).map(([k,v])=><EmotionBar key={k} emotion={k} score={v}/>)
            :<div style={{color:COLORS.slate,fontSize:13,textAlign:'center',padding:'24px 0'}}>Open AI Chat and send a message to see live emotion analysis.</div>}
        </GlassCard>
        <GlassCard>
          <h3 style={{fontSize:15,fontWeight:600,margin:'0 0 16px',color:COLORS.white}}>Distress Intervention Log</h3>
          {LOG.map((log,i)=>(
            <div key={i} style={{padding:'12px 0',borderBottom:i<LOG.length-1?'1px solid rgba(255,255,255,0.05)':'none'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                <span style={{fontSize:12,color:COLORS.slateLight}}>{log.time}</span>
                <Badge label={log.level} color={lc(log.level)} bg={`${lc(log.level)}22`}/>
              </div>
              <p style={{margin:0,fontSize:12,color:COLORS.slate}}>{log.action}</p>
            </div>
          ))}
        </GlassCard>
      </div>
      <GlassCard>
        <h3 style={{fontSize:15,fontWeight:600,margin:'0 0 16px',color:COLORS.white}}>Emotional Intelligence Insights</h3>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
          {INSIGHTS.map(f=>(
            <GlassCard key={f.title} style={{padding:14,background:`${f.color}08`,borderColor:`${f.color}20`}}>
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
