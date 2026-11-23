// LexAI v6 — App.js
// Preloads all 3 local models on startup:
//   1. DistilRoBERTa (emotion detection)
//   2. all-MiniLM-L6-v2 (legal embeddings)
//   3. RAG index (statutes + NyayaRAG cases)
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { preloadModel }          from './utils/emotionAnalyzer';
import { preloadEmbeddingModel } from './rag/embeddingService';
import { preloadIndex }          from './rag/legalRetriever';

import LoginPage      from './components/auth/LoginPage';
import DashboardPage  from './components/dashboard/DashboardPage';
import ChatPage       from './components/chat/ChatPage';
import CasesPage      from './components/cases/CasesPage';
import PredictionPage from './components/prediction/PredictionPage';
import EmotionPage    from './components/emotion/EmotionPage';
import DocumentsPage  from './components/documents/DocumentsPage';
import AdminPage      from './components/admin/AdminPage';
import EscalationPage from './components/admin/EscalationPage';
import Sidebar        from './components/shared/Sidebar';

function AppShell() {
  const { user, logout } = useAuth();
  const [page, setPage]  = useState('dashboard');
  const [liveEmotion, setLiveEmotion] = useState(null);

  // Warm up all local models — all singleton-guarded, safe with StrictMode
  useEffect(() => {
    preloadModel();          // DistilRoBERTa ~80MB
    preloadEmbeddingModel(); // all-MiniLM-L6-v2 ~23MB quantized
    preloadIndex();          // build vector index from legalDataset + mergedLegalDB
  }, []);

  if (!user) return <LoginPage />;

  function renderPage() {
    switch (page) {
      case 'dashboard':  return <DashboardPage  user={user} setPage={setPage} />;
      case 'chat':       return <ChatPage        user={user} onEmotion={setLiveEmotion} />;
      case 'cases':      return <CasesPage />;
      case 'prediction': return <PredictionPage />;
      case 'emotion':    return <EmotionPage     liveEmotion={liveEmotion} />;
      case 'documents':  return <DocumentsPage />;
      case 'admin':      return user.role==='admin'  ? <AdminPage />               : null;
      case 'escalation': return user.role==='lawyer' ? <EscalationPage user={user}/> : null;
      default:           return <DashboardPage  user={user} setPage={setPage} />;
    }
  }

  return (
    <div style={{display:'flex',minHeight:'100vh'}}>
      <Sidebar user={user} activePage={page} setPage={setPage} logout={logout} />
      <main style={{flex:1,overflowY:'auto',padding:'28px 32px'}}>
        {renderPage()}
      </main>
    </div>
  );
}

export default function App() {
  return <AuthProvider><AppShell /></AuthProvider>;
}
