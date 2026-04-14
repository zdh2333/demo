import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';
import AuthModal from '../components/AuthModal';
import { forumTopics, forumStats, forumCategories } from '../data/mockData';
import './BBS.css';

export default function BBS() {
  const { t } = useI18n();
  const tabs = t('bbs.tabs');
  const [activeTab, setActiveTab] = useState(0);
  const [authMode, setAuthMode] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

  const filteredTopics = forumTopics.filter((topic) => {
    if (activeCategory && topic.category !== activeCategory) return false;
    if (activeTab === 2) return topic.category === '经验分享';
    if (activeTab === 3) return topic.category === '问答交流';
    return true;
  });

  const handleCategoryClick = (e, catName) => {
    e.preventDefault();
    setActiveCategory(activeCategory === catName ? null : catName);
    setActiveTab(0);
  };

  return (
    <div className="bbs">
      <div className="bbs-main">
        <h1 className="bbs-title">{t('bbs.title')}</h1>

        <div className="bbs-tabs">
          {Array.isArray(tabs) && tabs.map((tab, i) => (
            <button
              key={i}
              className={`bbs-tab ${activeTab === i ? 'active' : ''}`}
              onClick={() => { setActiveTab(i); setActiveCategory(null); }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="topic-list">
          {filteredTopics.length === 0 ? (
            <div className="topic-empty">暂无帖子</div>
          ) : (
            filteredTopics.map((topic) => (
              <Link to={`/bbs/topic/${topic.id}`} key={topic.id} className="topic-item">
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
              </Link>
            ))
          )}
        </div>
      </div>

      <div className="bbs-sidebar">
        <div className="bbs-widget">
          <div className="bbs-login-box">
            <p className="login-hint">{t('bbs.loginHint')}</p>
            <div className="login-buttons">
              <button className="btn-login" onClick={() => setAuthMode('login')}>{t('bbs.login')}</button>
              <button className="btn-register" onClick={() => setAuthMode('register')}>{t('bbs.register')}</button>
            </div>
          </div>
        </div>

        <div className="bbs-widget">
          <h3 className="widget-title">{t('bbs.communityStats')}</h3>
          <div className="community-stats">
            <div className="comm-stat">
              <span className="comm-stat-value">{forumStats.members}</span>
              <span className="comm-stat-label">{t('bbs.members')}</span>
            </div>
            <div className="comm-stat">
              <span className="comm-stat-value">{forumStats.topics}</span>
              <span className="comm-stat-label">{t('bbs.topics')}</span>
            </div>
            <div className="comm-stat">
              <span className="comm-stat-value">{forumStats.replies}</span>
              <span className="comm-stat-label">{t('bbs.replies')}</span>
            </div>
            <div className="comm-stat">
              <span className="comm-stat-value">{forumStats.boards}</span>
              <span className="comm-stat-label">{t('bbs.boards')}</span>
            </div>
          </div>
        </div>

        <div className="bbs-widget">
          <h3 className="widget-title">{t('bbs.categories')}</h3>
          <div className="category-list">
            {forumCategories.map((cat, i) => (
              <a
                key={i}
                className={`category-item ${activeCategory === cat.name ? 'active' : ''}`}
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

      {authMode && <AuthModal mode={authMode} onClose={() => setAuthMode(null)} />}
    </div>
  );
}
