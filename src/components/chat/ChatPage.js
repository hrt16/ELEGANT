import { useState, useRef, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import GlassCard from '../shared/GlassCard';
import Badge from '../shared/Badge';
import EmotionBadge from '../shared/EmotionBadge';
import EmotionalStatusCard from '../shared/EmotionalStatusCard';
import CircularProgress from '../shared/CircularProgress';
import SourcesPanel from '../shared/SourcesPanel';
import SimilarCasesPanel from '../shared/SimilarCasesPanel';
import { COLORS, QUICK_PROMPTS } from '../../utils/constants';

function Dots() {
  return <div style={{display:'flex',gap:6}}>{[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:'50%',background:COLORS.accent,animation:`pulse 1.2s ease ${i*0.2}s infinite`}}/>)}</div>;
}

function Bubble({msg,avatar}) {
  const isUser = msg.role==='user';
  return (
    <div style={{display:'flex',flexDirection:isUser?'row-reverse':'row',gap:10,alignItems:'flex-start'}}>
      <div style={{width:32,height:32,borderRadius:'50%',flexShrink:0,background:isUser?'linear-gradient(135deg,#4f8ef7,#8b5cf6)':'linear-gradient(135deg,#14b8a6,#3b82f6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#fff'}}>
        {isUser?avatar:'⚖'}
      </div>
      <div style={{maxWidth:'72%'}}>
        <div style={{background:isUser?'linear-gradient(135deg,rgba(79,142,247,0.2),rgba(99,102,241,0.15))':msg.isError?'rgba(244,63,94,0.08)':'rgba(255,255,255,0.04)',border:`1px solid ${isUser?'rgba(79,142,247,0.25)':msg.isError?'rgba(244,63,94,0.2)':'rgba(255,255,255,0.07)'}`,borderRadius:isUser?'16px 4px 16px 16px':'4px 16px 16px 16px',padding:'12px 16px',fontSize:14,lineHeight:1.65,color:COLORS.white,whiteSpace:'pre-wrap'}}>
          {msg.content}
        </div>
        <div style={{display:'flex',gap:8,marginTop:6,alignItems:'center',flexWrap:'wrap',flexDirection:isUser?'row-reverse':'row'}}>
          <span style={{fontSize:11,color:'#334155'}}>{msg.time}</span>
          {msg.emotion&&<EmotionBadge emotionData={{dominant:msg.emotion,confidence:0.85,distressClass:'LOW',source:'transformer'}} size="sm"/>}
          {msg.category&&<Badge label={msg.category} color={COLORS.teal} bg="rgba(20,184,166,0.1)"/>}
          {msg.confidence&&!isUser&&<span style={{fontSize:10,color:msg.confidence==='high'?COLORS.green:msg.confidence==='medium'?COLORS.amber:COLORS.slate,background:`${msg.confidence==='high'?COLORS.green:msg.confidence==='medium'?COLORS.amber:COLORS.slate}18`,padding:'2px 7px',borderRadius:8,fontWeight:600}}>{msg.confidence} retrieval</span>}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage({user,onEmotion}) {
  const {messages,loading,emotion,prediction,sources,similarCases,sendMessage,clearChat}=useChat(user.name);
  const [input,setInput]=useState('');
  const endRef=useRef(null);

  useEffect(()=>{ if(emotion&&onEmotion) onEmotion(emotion); },[emotion,onEmotion]);
  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:'smooth'}); },[messages,loading]);

  const handleSend=()=>{ const t=input.trim(); if(!t||loading)return; setInput(''); sendMessage(t); };

  const latestSources = sources||messages.slice().reverse().find(m=>m.sources)?.sources;
  const latestConf    = messages.slice().reverse().find(m=>m.confidence)?.confidence;
  const latestCases   = similarCases||messages.slice().reverse().find(m=>m.similarCases)?.similarCases;

  return (
    <div className="animate-fade-up" style={{display:'grid',gridTemplateColumns:'1fr 280px',gap:20,height:'calc(100vh - 56px)'}}>
      <div style={{display:'flex',flexDirection:'column',minHeight:0}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
          <div>
            <h1 style={{fontSize:22,fontWeight:700,margin:0}}>AI Legal Chat</h1>
            <p style={{color:COLORS.slateLight,fontSize:13,marginTop:4}}>Gemini 2.0 Flash · NyayaRAG case retrieval · DistilRoBERTa emotion</p>
          </div>
          <button onClick={clearChat} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,padding:'7px 14px',color:COLORS.slateLight,fontSize:12,cursor:'pointer'}}>Clear</button>
        </div>
        <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column',gap:16,paddingRight:4,marginBottom:14}}>
          {messages.map((msg,i)=><Bubble key={msg.id||i} msg={msg} avatar={user.avatar}/>)}
          {loading&&(
            <div style={{display:'flex',gap:10,alignItems:'flex-start'}}>
              <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#14b8a6,#3b82f6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12}}>⚖</div>
              <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'4px 16px 16px 16px',padding:'14px 18px'}}><Dots/></div>
            </div>
          )}
          <div ref={endRef}/>
        </div>
        <div style={{display:'flex',gap:10,alignItems:'flex-end'}}>
          <textarea className="chat-input" rows={2} placeholder="Describe your legal situation… (Enter to send)"
            value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();handleSend();}}}/>
          <button className="send-btn" onClick={handleSend} disabled={loading||!input.trim()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>
          </button>
        </div>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:14,overflowY:'auto'}}>
        <EmotionalStatusCard emotionData={emotion} loading={loading}/>
        <SourcesPanel sources={latestSources} confidence={latestConf}/>
        <SimilarCasesPanel similarCases={latestCases}/>
        {prediction&&(
          <GlassCard style={{padding:16}}>
            <div style={{fontSize:13,fontWeight:600,marginBottom:14,color:COLORS.white}}>Outcome Prediction</div>
            <div style={{display:'flex',justifyContent:'space-around',marginBottom:12}}>
              <CircularProgress value={prediction.probability} color={COLORS.green} label="Win"/>
              <CircularProgress value={prediction.confidence} color={COLORS.accent} label="Confidence"/>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderTop:'1px solid rgba(255,255,255,0.06)'}}>
              <span style={{fontSize:12,color:COLORS.slateLight}}>Risk Level</span>
              <Badge label={prediction.risk} color={prediction.risk==='Low'?COLORS.green:prediction.risk==='Moderate'?COLORS.amber:COLORS.rose} bg={`${prediction.risk==='Low'?COLORS.green:prediction.risk==='Moderate'?COLORS.amber:COLORS.rose}22`}/>
            </div>
          </GlassCard>
        )}
        <GlassCard style={{padding:16}}>
          <div style={{fontSize:13,fontWeight:600,marginBottom:12,color:COLORS.white}}>Quick Prompts</div>
          {QUICK_PROMPTS.map((q,i)=>(
            <div key={i} onClick={()=>setInput(q)} style={{padding:'8px 10px',borderRadius:8,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',marginBottom:6,cursor:'pointer',fontSize:12,color:COLORS.slateLight,transition:'all 0.2s'}}
              onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(79,142,247,0.35)'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'}>{q}</div>
          ))}
        </GlassCard>
      </div>
    </div>
  );
}
