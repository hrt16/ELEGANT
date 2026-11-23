// LexAI v6 — EscalationPage.js (lawyer role only)
import { useState } from 'react';
import GlassCard from '../shared/GlassCard';
import Badge from '../shared/Badge';
import { COLORS, EMOTION_COLORS, ESCALATED_CASES } from '../../utils/constants';

function priorityColor(p) { return p==='Urgent'?COLORS.rose:p==='High'?COLORS.amber:COLORS.teal; }

export default function EscalationPage({ user }) {
  const [cases]    = useState(ESCALATED_CASES);
  const [accepted, setAccepted] = useState([]);

  const pending  = cases.filter(c=>!accepted.includes(c.id));
  const accepted_ = cases.filter(c=>accepted.includes(c.id));

  return (
    <div className="animate-fade-up">
      <div style={{marginBottom:24}}>
        <h1 style={{fontSize:22,fontWeight:700,margin:0}}>Client Escalation Queue</h1>
        <p style={{color:COLORS.slateLight,fontSize:13,marginTop:4}}>
          Cases escalated by AI for human lawyer intervention — {user.name}
        </p>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:24}}>
        {[
          {label:'Pending Cases',  value:pending.length,   color:COLORS.amber},
          {label:'Accepted Today', value:accepted.length,  color:COLORS.green},
          {label:'Avg Distress',   value:'High',           color:COLORS.rose},
        ].map(s=>(
          <GlassCard key={s.label} style={{textAlign:'center'}}>
            <div style={{fontSize:26,fontWeight:700,color:s.color}}>{s.value}</div>
            <div style={{fontSize:12,color:COLORS.slateLight,marginTop:4}}>{s.label}</div>
          </GlassCard>
        ))}
      </div>

      {/* Pending */}
      <h3 style={{fontSize:14,fontWeight:600,color:COLORS.slateLight,marginBottom:12,textTransform:'uppercase',letterSpacing:'0.06em'}}>
        Pending ({pending.length})
      </h3>
      <div style={{display:'flex',flexDirection:'column',gap:14,marginBottom:28}}>
        {pending.length===0 && (
          <GlassCard style={{textAlign:'center',padding:'32px',color:COLORS.slate}}>
            🎉 All escalated cases have been handled.
          </GlassCard>
        )}
        {pending.map(c=>(
          <GlassCard key={c.id} hover>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8,flexWrap:'wrap'}}>
                  <span style={{fontSize:15,fontWeight:600,color:COLORS.white}}>{c.name}</span>
                  <Badge label={c.priority} color={priorityColor(c.priority)} bg={`${priorityColor(c.priority)}22`}/>
                  <Badge label={c.emotion}  color={EMOTION_COLORS[c.emotion]||COLORS.slate} bg={`${EMOTION_COLORS[c.emotion]||COLORS.slate}22`}/>
                  <Badge label={c.category} color={COLORS.teal} bg="rgba(20,184,166,0.1)"/>
                </div>
                <p style={{margin:0,fontSize:13,color:COLORS.slateLight}}>{c.issue}</p>
              </div>
              <div style={{textAlign:'right',flexShrink:0,marginLeft:20}}>
                <div style={{fontSize:11,color:'#334155',marginBottom:10}}>{c.time}</div>
                <button onClick={()=>setAccepted(prev=>[...prev,c.id])} style={{
                  background:'linear-gradient(135deg,#4f8ef7,#6366f1)',border:'none',borderRadius:8,
                  padding:'9px 18px',color:'white',fontSize:13,fontWeight:600,cursor:'pointer',
                }}>Accept</button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Accepted */}
      {accepted_.length>0 && (
        <>
          <h3 style={{fontSize:14,fontWeight:600,color:COLORS.slateLight,marginBottom:12,textTransform:'uppercase',letterSpacing:'0.06em'}}>
            Accepted ({accepted_.length})
          </h3>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            {accepted_.map(c=>(
              <GlassCard key={c.id} style={{opacity:0.65}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <span style={{fontSize:14,fontWeight:600,color:COLORS.white}}>{c.name}</span>
                    <p style={{margin:'4px 0 0',fontSize:13,color:COLORS.slateLight}}>{c.issue}</p>
                  </div>
                  <Badge label="Accepted" color={COLORS.green} bg="rgba(34,197,94,0.15)"/>
                </div>
              </GlassCard>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
