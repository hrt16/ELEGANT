import GlassCard from '../shared/GlassCard';
import EmotionBar from '../shared/EmotionBar';
import { COLORS } from '../../utils/constants';

const STATS = [
  {label:'Total Cases',value:12,color:COLORS.accent,icon:''},
  {label:'Resolved',   value:8, color:COLORS.green, icon:''},
  {label:'Pending',    value:3, color:COLORS.amber, icon:''},
  {label:'Avg Confidence',value:'78%',color:COLORS.purple,icon:''},
];
const EMOTIONS = [{e:'anxiety',v:0.42},{e:'neutral',v:0.28},{e:'fear',v:0.18},{e:'distress',v:0.12}];
const ACTIVITY = [
  {text:'Property dispute analysed',     time:'2h ago', color:COLORS.accent},
  {text:'Contract reviewed — 2 risks',   time:'5h ago', color:COLORS.amber},
  {text:'Family law consultation',        time:'1d ago', color:COLORS.purple},
  {text:'NyayaRAG case match found',      time:'2d ago', color:COLORS.teal},
];
const ACTIONS = [
  {label:'Start AI Chat',      icon:'',page:'chat',      color:COLORS.accent},
  {label:'Similar Cases',      icon:'',page:'cases',     color:COLORS.teal},
  {label:'Predict Outcome',    icon:'',page:'prediction',color:COLORS.purple},
  {label:'Upload Document',    icon:'',page:'documents', color:COLORS.amber},
];

export default function DashboardPage({user,setPage}) {
  return (
    <div className="animate-fade-up">
      <div style={{marginBottom:28}}>
        <h1 style={{fontSize:24,fontWeight:700,margin:0,letterSpacing:'-0.02em'}}>Good morning, {user.name.split(' ')[0]} </h1>
        <p style={{color:COLORS.slateLight,marginTop:6,fontSize:14}}>LexAI v6 · Gemini 2.0 Flash · NyayaRAG + 28 Indian statutes</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:24}}>
        {STATS.map(c=>(
          <GlassCard key={c.label} style={{textAlign:'center'}}>
            <div style={{fontSize:26,marginBottom:8}}>{c.icon}</div>
            <div style={{fontSize:28,fontWeight:700,color:c.color}}>{c.value}</div>
            <div style={{fontSize:12,color:COLORS.slateLight,marginTop:4}}>{c.label}</div>
          </GlassCard>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:24}}>
        <GlassCard>
          <h3 style={{fontSize:15,fontWeight:600,margin:'0 0 16px',color:COLORS.white}}>Emotion Distribution</h3>
          {EMOTIONS.map(({e,v})=><EmotionBar key={e} emotion={e} score={v}/>)}
        </GlassCard>
        <GlassCard>
          <h3 style={{fontSize:15,fontWeight:600,margin:'0 0 16px',color:COLORS.white}}>Recent Activity</h3>
          {ACTIVITY.map((a,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:i<ACTIVITY.length-1?'1px solid rgba(255,255,255,0.05)':'none'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:a.color}}/>
                <span style={{fontSize:13,color:COLORS.slateLight}}>{a.text}</span>
              </div>
              <span style={{fontSize:11,color:'#334155',flexShrink:0}}>{a.time}</span>
            </div>
          ))}
        </GlassCard>
      </div>
      <GlassCard>
        <h3 style={{fontSize:15,fontWeight:600,margin:'0 0 16px',color:COLORS.white}}>Quick Actions</h3>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
          {ACTIONS.map(a=>(
            <GlassCard key={a.label} hover onClick={()=>setPage(a.page)} style={{textAlign:'center',padding:'16px 12px'}}>
              <div style={{fontSize:24,marginBottom:8}}>{a.icon}</div>
              <div style={{fontSize:12,color:a.color,fontWeight:500}}>{a.label}</div>
            </GlassCard>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
