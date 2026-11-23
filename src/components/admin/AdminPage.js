// LexAI v6 — AdminPage.js (admin role only)
import GlassCard from '../shared/GlassCard';
import Badge from '../shared/Badge';
import { COLORS, DEMO_USERS } from '../../utils/constants';

const STATS = [
  {label:'Total Users',   value:'1,247', color:COLORS.accent},
  {label:'Active Today',  value:'89',    color:COLORS.green},
  {label:'AI Queries',    value:'3,892', color:COLORS.purple},
  {label:'Flagged Chats', value:'12',    color:COLORS.rose},
];

const HEALTH = [
  {label:'AI Response Time', value:'1.2s avg', color:COLORS.green,  bar:88},
  {label:'Model Accuracy',   value:'91.4%',    color:COLORS.accent, bar:91},
  {label:'API Uptime',       value:'99.9%',    color:COLORS.teal,   bar:99},
  {label:'Database Load',    value:'23%',      color:COLORS.amber,  bar:23},
  {label:'RAG Index',        value:'Ready',    color:COLORS.green,  bar:100},
];

function roleColor(role) {
  return role==='admin'?COLORS.rose:role==='lawyer'?COLORS.gold:COLORS.teal;
}

export default function AdminPage() {
  return (
    <div className="animate-fade-up">
      <div style={{marginBottom:24}}>
        <h1 style={{fontSize:22,fontWeight:700,margin:0}}>Admin Control Panel</h1>
        <p style={{color:COLORS.slateLight,fontSize:13,marginTop:4}}>System monitoring, user management &amp; AI oversight — LexAI v6</p>
      </div>

      {/* Stat cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:24}}>
        {STATS.map(c=>(
          <GlassCard key={c.label} style={{textAlign:'center'}}>
            <div style={{fontSize:26,fontWeight:700,color:c.color}}>{c.value}</div>
            <div style={{fontSize:12,color:COLORS.slateLight,marginTop:4}}>{c.label}</div>
          </GlassCard>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
        {/* Users */}
        <GlassCard>
          <h3 style={{fontSize:15,fontWeight:600,margin:'0 0 16px',color:COLORS.white}}>Registered Users</h3>
          {Object.entries(DEMO_USERS).map(([email,u])=>(
            <div key={email} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:30,height:30,borderRadius:'50%',background:'linear-gradient(135deg,#4f8ef7,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#fff'}}>{u.avatar}</div>
                <div>
                  <div style={{fontSize:13,color:COLORS.white}}>{u.name}</div>
                  <div style={{fontSize:11,color:COLORS.slateLight}}>{email}</div>
                </div>
              </div>
              <Badge label={u.role} color={roleColor(u.role)} bg={`${roleColor(u.role)}22`}/>
            </div>
          ))}
        </GlassCard>

        {/* System health */}
        <GlassCard>
          <h3 style={{fontSize:15,fontWeight:600,margin:'0 0 16px',color:COLORS.white}}>System Health</h3>
          {HEALTH.map(s=>(
            <div key={s.label} style={{marginBottom:14}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                <span style={{fontSize:12,color:COLORS.slateLight}}>{s.label}</span>
                <span style={{fontSize:12,color:s.color,fontWeight:600}}>{s.value}</span>
              </div>
              <div style={{height:5,background:'rgba(255,255,255,0.06)',borderRadius:99}}>
                <div style={{height:'100%',width:`${s.bar}%`,background:s.color,borderRadius:99,transition:'width 1s ease'}}/>
              </div>
            </div>
          ))}
        </GlassCard>
      </div>

      {/* AI Logs */}
      <GlassCard>
        <h3 style={{fontSize:15,fontWeight:600,margin:'0 0 16px',color:COLORS.white}}>Recent AI Interaction Logs</h3>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
            <thead>
              <tr style={{color:COLORS.slateLight}}>
                {['Time','User','Category','Emotion','Prediction','RAG Docs','Status'].map(h=>(
                  <th key={h} style={{textAlign:'left',padding:'0 12px 10px 0',fontWeight:500,fontSize:12}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                {time:'14:23',user:'Arjun S.',  cat:'Property Law',  emotion:'anxiety', pred:'71%', rag:'2+5', status:'Resolved'},
                {time:'13:45',user:'Demo User', cat:'Family Law',    emotion:'distress',pred:'54%', rag:'2+3', status:'Escalated'},
                {time:'11:30',user:'New User',  cat:'Criminal Law',  emotion:'fear',    pred:'38%', rag:'2+5', status:'Pending'},
                {time:'10:15',user:'Priya V.',  cat:'Labor Law',     emotion:'anger',   pred:'65%', rag:'1+4', status:'Resolved'},
              ].map((row,i)=>(
                <tr key={i} style={{borderTop:'1px solid rgba(255,255,255,0.05)'}}>
                  <td style={{padding:'10px 12px 10px 0',color:COLORS.slate}}>{row.time}</td>
                  <td style={{padding:'10px 12px 10px 0',color:COLORS.white}}>{row.user}</td>
                  <td style={{padding:'10px 12px 10px 0',color:COLORS.teal}}>{row.cat}</td>
                  <td style={{padding:'10px 12px 10px 0',color:COLORS.amber,textTransform:'capitalize'}}>{row.emotion}</td>
                  <td style={{padding:'10px 12px 10px 0',color:COLORS.green}}>{row.pred}</td>
                  <td style={{padding:'10px 12px 10px 0',color:COLORS.purple}}>{row.rag}</td>
                  <td style={{padding:'10px 0'}}>
                    <Badge
                      label={row.status}
                      color={row.status==='Resolved'?COLORS.green:row.status==='Escalated'?COLORS.rose:COLORS.amber}
                      bg={`${row.status==='Resolved'?COLORS.green:row.status==='Escalated'?COLORS.rose:COLORS.amber}22`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
