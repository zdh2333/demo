import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { I18nProvider } from './contexts/I18nContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import BBS from './pages/BBS';
import TopicDetail from './pages/TopicDetail';
import Settings from './pages/Settings';
import './App.css';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <I18nProvider>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <div className="app">
              <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
              <div className={`app-body ${sidebarOpen ? 'with-sidebar' : ''}`}>
                <main className="main-content">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/bbs" element={<BBS />} />
                    <Route path="/bbs/topic/:id" element={<TopicDetail />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </main>
                <Sidebar open={sidebarOpen} />
              </div>
            </div>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
