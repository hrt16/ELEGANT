import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function LoginPage() {
  const {login,signup} = useAuth();
  const [tab,setTab]=useState('login');
  const [error,setError]=useState('');
  const [lEmail,setLEmail]=useState(''); const [lPass,setLPass]=useState('');
  const [sName,setSName]=useState(''); const [sEmail,setSEmail]=useState('');
  const [sPass,setSPass]=useState(''); const [sRole,setSRole]=useState('user');

  const handleLogin = () => { setError(''); const e=login(lEmail,lPass); if(e) setError(e); };
  const handleSignup= () => { setError(''); const e=signup(sName,sEmail,sPass,sRole); if(e) setError(e); };

  return (
    <div style={{minHeight:'100vh',background:'radial-gradient(ellipse at 20% 50%,rgba(79,142,247,0.08) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(139,92,246,0.06) 0%,transparent 50%),#080d1a',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Inter,sans-serif'}}>
      <div style={{width:440,animation:'fadeUp 0.5s ease both'}}>
        <div style={{textAlign:'center',marginBottom:40}}>
          <div style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:60,height:60,borderRadius:16,background:'linear-gradient(135deg,#4f8ef7,#6366f1)',marginBottom:16}}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M3 6l9-3 9 3v12l-9 3-9-3V6z"/><path d="M12 3v18M3 6l9 3 9-3"/></svg>
          </div>
          <h1 style={{fontSize:26,fontWeight:700,color:'#f8fafc',margin:0,letterSpacing:'-0.02em'}}>LexAI v6</h1>
          <p style={{color:'#94a3b8',marginTop:6,fontSize:14}}>Indian Legal AI · Gemini 2.0 Flash · NyayaRAG</p>
        </div>
        <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:20,padding:32}}>
          <div style={{display:'flex',gap:4,marginBottom:28,background:'rgba(255,255,255,0.04)',borderRadius:10,padding:4}}>
            {['login','signup'].map(t=>(
              <button key={t} onClick={()=>{setTab(t);setError('');}} style={{flex:1,padding:'8px 0',background:tab===t?'rgba(79,142,247,0.2)':'transparent',border:tab===t?'1px solid rgba(79,142,247,0.3)':'1px solid transparent',borderRadius:8,color:tab===t?'#4f8ef7':'#94a3b8',fontSize:14,fontWeight:tab===t?600:400,cursor:'pointer',fontFamily:'Inter,sans-serif',transition:'all 0.2s'}}>
                {t==='login'?'Sign In':'Create Account'}
              </button>
            ))}
          </div>
          {tab==='login'?(
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              <input className="auth-input" type="email" placeholder="Email address" value={lEmail} onChange={e=>setLEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()}/>
              <input className="auth-input" type="password" placeholder="Password" value={lPass} onChange={e=>setLPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()}/>
              {error&&<div style={{background:'rgba(244,63,94,0.1)',border:'1px solid rgba(244,63,94,0.3)',borderRadius:8,padding:'10px 14px',color:'#f87171',fontSize:13}}>{error}</div>}
              <button className="btn-primary" onClick={handleLogin}>Sign In</button>
              <p style={{textAlign:'center',color:'#475569',fontSize:12}}>Demo: user@demo.com · lawyer@demo.com · admin@demo.com<br/>Password: <strong style={{color:'#64748b'}}>demo123</strong></p>
            </div>
          ):(
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              <input className="auth-input" placeholder="Full name" value={sName} onChange={e=>setSName(e.target.value)}/>
              <input className="auth-input" type="email" placeholder="Email address" value={sEmail} onChange={e=>setSEmail(e.target.value)}/>
              <input className="auth-input" type="password" placeholder="Create password" value={sPass} onChange={e=>setSPass(e.target.value)}/>
              <select className="auth-input" value={sRole} onChange={e=>setSRole(e.target.value)} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,padding:'12px 16px',color:'#f8fafc',fontSize:14,width:'100%',outline:'none',fontFamily:'Inter,sans-serif'}}>
                <option value="user" style={{background:'#111827'}}>User — Seeking legal help</option>
                <option value="lawyer" style={{background:'#111827'}}>Lawyer — Legal professional</option>
              </select>
              {error&&<div style={{background:'rgba(244,63,94,0.1)',border:'1px solid rgba(244,63,94,0.3)',borderRadius:8,padding:'10px 14px',color:'#f87171',fontSize:13}}>{error}</div>}
              <button className="btn-primary" onClick={handleSignup}>Create Account</button>
            </div>
          )}
        </div>
        <p style={{textAlign:'center',color:'#1e293b',fontSize:12,marginTop:24}}>Not legal advice · For informational use only</p>
      </div>
    </div>
  );
}
