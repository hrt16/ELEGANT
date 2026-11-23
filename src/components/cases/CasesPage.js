import { useState } from 'react';
import GlassCard from '../shared/GlassCard';
import Badge from '../shared/Badge';
import { COLORS, SAMPLE_CASES, LEGAL_CATEGORIES } from '../../utils/constants';

export default function CasesPage() {
  const [expanded,setExpanded]=useState(null);
  const [search,setSearch]=useState('');
  const [cat,setCat]=useState('All');
  const filtered = SAMPLE_CASES.filter(c=>{
    const ms=!search||c.title.toLowerCase().includes(search.toLowerCase())||c.category.toLowerCase().includes(search.toLowerCase());
    const mc=cat==='All'||c.category.includes(cat);
    return ms&&mc;
  });
  const simColor = s => s>=85?COLORS.green:s>=70?COLORS.amber:COLORS.slate;
  return (
    <div className="animate-fade-up">
      <div style={{marginBottom:24}}><h1 style={{fontSize:22,fontWeight:700,margin:0}}>Case Similarity Search</h1><p style={{color:COLORS.slateLight,fontSize:13,marginTop:4}}>Semantic search · Indian Supreme Court precedents · NyayaRAG dataset</p></div>
      <GlassCard style={{marginBottom:16,padding:'16px 20px'}}>
        <div style={{display:'flex',gap:12,marginBottom:14}}>
          <input style={{flex:1,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,padding:'11px 16px',color:COLORS.white,fontSize:14,outline:'none',fontFamily:'Inter,sans-serif'}} placeholder="Search cases…" value={search} onChange={e=>setSearch(e.target.value)}/>
          <button style={{background:'linear-gradient(135deg,#4f8ef7,#6366f1)',border:'none',borderRadius:10,padding:'11px 24px',color:'white',fontSize:14,fontWeight:600,cursor:'pointer'}}>Search</button>
        </div>
        <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
          {['All',...LEGAL_CATEGORIES.slice(0,6)].map(c=>(
            <span key={c} onClick={()=>setCat(c)} style={{padding:'5px 14px',background:cat===c?'rgba(79,142,247,0.2)':'rgba(255,255,255,0.04)',border:`1px solid ${cat===c?'rgba(79,142,247,0.35)':'rgba(255,255,255,0.08)'}`,borderRadius:20,fontSize:12,color:cat===c?COLORS.accent:COLORS.slateLight,cursor:'pointer',transition:'all 0.2s'}}>{c}</span>
          ))}
        </div>
      </GlassCard>
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        {filtered.map(c=>(
          <GlassCard key={c.id} hover onClick={()=>setExpanded(expanded===c.id?null:c.id)}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8,flexWrap:'wrap'}}>
                  <span style={{fontSize:14,fontWeight:600,color:COLORS.white}}>{c.title}</span>
                  <Badge label={`${c.similarity}% match`} color={simColor(c.similarity)} bg={`${simColor(c.similarity)}22`}/>
                </div>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  <Badge label={c.category} color={COLORS.teal} bg="rgba(20,184,166,0.1)"/>
                  <Badge label={c.year.toString()} color={COLORS.slateLight} bg="rgba(100,116,139,0.1)"/>
                  <Badge label={c.verdict} color={c.verdict.includes('favor')?COLORS.green:COLORS.amber} bg={`${c.verdict.includes('favor')?COLORS.green:COLORS.amber}18`}/>
                </div>
              </div>
              <div style={{textAlign:'right',flexShrink:0,marginLeft:16}}>
                <div style={{fontSize:30,fontWeight:800,color:simColor(c.similarity),lineHeight:1}}>{c.similarity}%</div>
                <div style={{fontSize:10,color:COLORS.slateLight}}>Similarity</div>
              </div>
            </div>
            <div style={{height:4,background:'rgba(255,255,255,0.06)',borderRadius:99}}>
              <div style={{height:'100%',width:`${c.similarity}%`,background:`linear-gradient(90deg,${simColor(c.similarity)}88,${simColor(c.similarity)})`,borderRadius:99}}/>
            </div>
            {expanded===c.id&&(
              <div style={{marginTop:16,paddingTop:16,borderTop:'1px solid rgba(255,255,255,0.06)'}}>
                <p style={{fontSize:13,color:COLORS.slateLight,lineHeight:1.7,margin:'0 0 8px'}}><strong style={{color:COLORS.white}}>Judgement:</strong> {c.outcome}</p>
                <p style={{fontSize:13,color:COLORS.slateLight,margin:'0 0 14px'}}><strong style={{color:COLORS.white}}>Sections:</strong> {c.sections.join(', ')}</p>
                <div style={{display:'flex',gap:10}}>
                  <button style={{background:'rgba(79,142,247,0.12)',border:'1px solid rgba(79,142,247,0.25)',borderRadius:8,padding:'8px 16px',color:COLORS.accent,fontSize:12,cursor:'pointer'}}>📖 Full Judgement</button>
                  <button style={{background:'rgba(20,184,166,0.1)',border:'1px solid rgba(20,184,166,0.2)',borderRadius:8,padding:'8px 16px',color:COLORS.teal,fontSize:12,cursor:'pointer'}}>💬 Discuss with AI</button>
                </div>
              </div>
            )}
          </GlassCard>
        ))}
        {!filtered.length&&<div style={{textAlign:'center',padding:'48px 0',color:COLORS.slate}}><div style={{fontSize:36,marginBottom:12}}>🔍</div><p>No cases match. Try different keywords.</p></div>}
      </div>
    </div>
  );
}
