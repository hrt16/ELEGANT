import { COLORS } from '../../utils/constants';

const ALL_NAV = [
  {id:'dashboard', icon:'',  label:'Dashboard',        roles:['user','lawyer','admin']},
  {id:'chat',      icon:'', label:'AI Legal Chat',     roles:['user','lawyer','admin']},
  {id:'cases',     icon:'', label:'Case Similarity',   roles:['user','lawyer','admin']},
  {id:'prediction',icon:'', label:'Prediction',        roles:['user','lawyer','admin']},
  {id:'emotion',   icon:'', label:'Emotion Analytics', roles:['user','lawyer','admin']},
  {id:'documents', icon:'', label:'Document Upload',   roles:['user','lawyer','admin']},
  {id:'escalation',icon:'', label:'Escalation Queue',  roles:['lawyer']},
  {id:'admin',     icon:'', label:'Admin Panel',       roles:['admin']},
];

export default function Sidebar({user,activePage,setPage,logout}) {
  const navItems = ALL_NAV.filter(i=>i.roles.includes(user.role));
  return (
    <aside style={{width:220,background:'rgba(255,255,255,0.02)',borderRight:'1px solid rgba(255,255,255,0.06)',display:'flex',flexDirection:'column',padding:'20px 14px',position:'sticky',top:0,height:'100vh',overflowY:'auto',flexShrink:0}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:32,paddingLeft:4}}>
        <div style={{width:32,height:32,borderRadius:9,background:'linear-gradient(135deg,#4f8ef7,#6366f1)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M3 6l9-3 9 3v12l-9 3-9-3V6z"/></svg>
        </div>
        <span style={{fontWeight:700,fontSize:18,letterSpacing:'-0.02em',color:COLORS.white}}>LexAI</span>
      </div>
      <nav style={{display:'flex',flexDirection:'column',gap:2,flex:1}}>
        {navItems.map(item=>(
          <div key={item.id} className={`nav-item ${activePage===item.id?'active':''}`} onClick={()=>setPage(item.id)}>
            <span style={{fontSize:16}}>{item.icon}</span><span>{item.label}</span>
          </div>
        ))}
      </nav>
      <div style={{borderTop:'1px solid rgba(255,255,255,0.06)',paddingTop:16,marginTop:16}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
          <div style={{width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,#4f8ef7,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:COLORS.white}}>{user.avatar}</div>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:COLORS.white}}>{user.name.split(' ')[0]}</div>
            <div style={{fontSize:11,color:COLORS.slateLight,textTransform:'capitalize'}}>{user.role}</div>
          </div>
        </div>
        <div className="nav-item" onClick={logout} style={{color:'#f87171'}}>
          <span>⬡</span><span>Sign Out</span>
        </div>
      </div>
    </aside>
  );
}
