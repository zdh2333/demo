import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { forumTopics, forumStats, forumCategories } from '../data/mockData';
import './BBS.css';

const tabs = ['最新回复', '最新发帖', '经验分享', '问答交流'];

function sortTopics(topics, tabIndex) {
  const sorted = [...topics];
  switch (tabIndex) {
    case 1: return sorted.reverse();
    case 2: return sorted.filter(t => t.category === '经验分享');
    case 3: return sorted.filter(t => t.category === '问答交流');
    default: return sorted;
  }
}

export default function BBS() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedTopic, setExpandedTopic] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash;
    if (hash && hash.startsWith('#topic-')) {
      const id = parseInt(hash.replace('#topic-', ''), 10);
      setExpandedTopic(id);
      setTimeout(() => {
        const el = document.getElementById(`topic-${id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [location.hash]);

  let filtered = sortTopics(forumTopics, activeTab);
  if (selectedCategory) {
    filtered = filtered.filter(t => t.category === selectedCategory);
  }

  function handleCategoryClick(e, catName) {
    e.preventDefault();
    setSelectedCategory(prev => prev === catName ? null : catName);
    setActiveTab(0);
  }

  function openAuth(mode) {
    setAuthMode(mode);
    setShowAuthModal(true);
  }

  return (
    <div className="bbs">
      <div className="bbs-main">
        <h1 className="bbs-title">社区</h1>

        <div className="bbs-tabs">
          {tabs.map((tab, i) => (
            <button
              key={i}
              className={`bbs-tab ${activeTab === i ? 'active' : ''}`}
              onClick={() => { setActiveTab(i); setSelectedCategory(null); }}
            >
              {tab}
            </button>
          ))}
        </div>

        {selectedCategory && (
          <div className="active-filter">
            <span>筛选: {selectedCategory}</span>
            <button onClick={() => setSelectedCategory(null)}>✕ 清除</button>
          </div>
        )}

        <div className="topic-list">
          {filtered.length === 0 && (
            <div className="empty-state">暂无符合条件的帖子</div>
          )}
          {filtered.map((topic) => (
            <div
              key={topic.id}
              id={`topic-${topic.id}`}
              className={`topic-item ${expandedTopic === topic.id ? 'expanded' : ''}`}
              onClick={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
            >
              <div
                className="topic-avatar"
                style={{ background: topic.avatarColor }}
              >
                {topic.avatar}
              </div>
              <div className="topic-content">
                <h3 className="topic-title">{topic.title}</h3>
                <div className="topic-meta">
                  <span className="topic-category">{topic.category}</span>
                  <span className="topic-author">{topic.author}</span>
                  <span className="topic-time">{topic.lastReply}</span>
                </div>
                {expandedTopic === topic.id && (
                  <div className="topic-detail">
                    <p className="topic-detail-text">
                      这是「{topic.title}」的讨论帖。作者 {topic.author} 发起了这个话题，
                      目前已有 {topic.replies} 条回复，{topic.views} 次浏览。
                    </p>
                    <div className="topic-actions">
                      <button className="topic-action-btn" onClick={(e) => { e.stopPropagation(); openAuth('login'); }}>
                        💬 参与讨论
                      </button>
                      <button className="topic-action-btn secondary" onClick={(e) => { e.stopPropagation(); openAuth('login'); }}>
                        ⭐ 收藏
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="topic-stats">
                <div className="topic-stat">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  {topic.replies}
                </div>
                <div className="topic-stat">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  {topic.views}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bbs-sidebar">
        <div className="bbs-widget">
          <div className="bbs-login-box">
            <p className="login-hint">登录后参与讨论</p>
            <div className="login-buttons">
              <button className="btn-login" onClick={() => openAuth('login')}>登录</button>
              <button className="btn-register" onClick={() => openAuth('register')}>注册</button>
            </div>
          </div>
        </div>

        <div className="bbs-widget">
          <h3 className="widget-title">社区统计</h3>
          <div className="community-stats">
            <div className="comm-stat">
              <span className="comm-stat-value">{forumStats.members}</span>
              <span className="comm-stat-label">成员</span>
            </div>
            <div className="comm-stat">
              <span className="comm-stat-value">{forumStats.topics}</span>
              <span className="comm-stat-label">主题</span>
            </div>
            <div className="comm-stat">
              <span className="comm-stat-value">{forumStats.replies}</span>
              <span className="comm-stat-label">回复</span>
            </div>
            <div className="comm-stat">
              <span className="comm-stat-value">{forumStats.boards}</span>
              <span className="comm-stat-label">版块</span>
            </div>
          </div>
        </div>

        <div className="bbs-widget">
          <h3 className="widget-title">版块分类</h3>
          <div className="category-list">
            {forumCategories.map((cat, i) => (
              <a
                key={i}
                className={`category-item ${selectedCategory === cat.name ? 'active' : ''}`}
                href="#"
                onClick={(e) => handleCategoryClick(e, cat.name)}
              >
                <span className="cat-dot" style={{ background: cat.color }}></span>
                <span className="cat-name">{cat.name}</span>
                <span className="cat-count">{cat.count}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {showAuthModal && (
        <div className="auth-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <button className="auth-close" onClick={() => setShowAuthModal(false)}>✕</button>
            <h2 className="auth-title">{authMode === 'login' ? '登录' : '注册'}</h2>
            <form className="auth-form" onSubmit={(e) => { e.preventDefault(); alert(authMode === 'login' ? '登录功能即将上线，敬请期待！' : '注册功能即将上线，敬请期待！'); setShowAuthModal(false); }}>
              {authMode === 'register' && (
                <input type="text" className="auth-input" placeholder="用户名" required />
              )}
              <input type="email" className="auth-input" placeholder="邮箱" required />
              <input type="password" className="auth-input" placeholder="密码" required />
              <button type="submit" className="auth-submit">
                {authMode === 'login' ? '登录' : '注册'}
              </button>
            </form>
            <p className="auth-switch">
              {authMode === 'login' ? '没有账号？' : '已有账号？'}
              <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
                {authMode === 'login' ? '立即注册' : '去登录'}
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
