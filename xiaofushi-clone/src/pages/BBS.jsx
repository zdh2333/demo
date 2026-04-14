import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';
import { forumCategories } from '../data/mockData';
import { fetchTopics, fetchForumStats, createTopic } from '../services/forumApi';
import './BBS.css';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  return `${days}天前`;
}

export default function BBS() {
  const { t } = useI18n();
  const { user, profile } = useAuth();
  const tabs = t('bbs.tabs');
  const [activeTab, setActiveTab] = useState(0);
  const [authMode, setAuthMode] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [topics, setTopics] = useState([]);
  const [stats, setStats] = useState({ members: 0, topics: 0, replies: 0 });
  const [loading, setLoading] = useState(true);
  const [showNewTopic, setShowNewTopic] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newCategory, setNewCategory] = useState('问答交流');
  const [posting, setPosting] = useState(false);

  const loadTopics = useCallback(async () => {
    setLoading(true);
    let category = activeCategory;
    if (!category && activeTab === 2) category = '经验分享';
    if (!category && activeTab === 3) category = '问答交流';
    const data = await fetchTopics({ category });
    setTopics(data);
    setLoading(false);
  }, [activeCategory, activeTab]);

  useEffect(() => {
    loadTopics();
    fetchForumStats().then(setStats);
  }, [loadTopics]);

  const handleCategoryClick = (e, catName) => {
    e.preventDefault();
    setActiveCategory(activeCategory === catName ? null : catName);
    setActiveTab(0);
  };

  const handlePost = async () => {
    if (!newTitle.trim()) return;
    setPosting(true);
    const { error } = await createTopic({
      title: newTitle.trim(),
      body: newBody.trim(),
      category: newCategory,
      authorId: user.id,
    });
    setPosting(false);
    if (!error) {
      setShowNewTopic(false);
      setNewTitle('');
      setNewBody('');
      loadTopics();
    }
  };

  return (
    <div className="bbs">
      <div className="bbs-main">
        <div className="bbs-header-row">
          <h1 className="bbs-title">{t('bbs.title')}</h1>
          {user && (
            <button className="btn-new-topic" onClick={() => setShowNewTopic(!showNewTopic)}>
              + 发帖
            </button>
          )}
        </div>

        {showNewTopic && (
          <div className="new-topic-form">
            <input
              className="new-topic-title"
              placeholder="帖子标题"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <textarea
              className="new-topic-body"
              placeholder="帖子内容..."
              rows={4}
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
            />
            <div className="new-topic-footer">
              <select
                className="new-topic-category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              >
                {forumCategories.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
              <button className="btn-post" onClick={handlePost} disabled={posting || !newTitle.trim()}>
                {posting ? '发布中...' : '发布'}
              </button>
            </div>
          </div>
        )}

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
          {loading ? (
            <div className="topic-empty">加载中...</div>
          ) : topics.length === 0 ? (
            <div className="topic-empty">暂无帖子</div>
          ) : (
            topics.map((topic) => (
              <Link to={`/bbs/topic/${topic.id}`} key={topic.id} className="topic-item">
                <div
                  className="topic-avatar"
                  style={{ background: topic.avatar_color || '#999' }}
                >
                  {topic.avatar_letter || 'U'}
                </div>
                <div className="topic-content">
                  <h3 className="topic-title">{topic.title}</h3>
                  <div className="topic-meta">
                    <span className="topic-category">{topic.category}</span>
                    <span className="topic-author">{topic.author_name}</span>
                    <span className="topic-time">{timeAgo(topic.last_reply_at || topic.created_at)}</span>
                  </div>
                </div>
                <div className="topic-stats">
                  <div className="topic-stat">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    {topic.reply_count ?? 0}
                  </div>
                  <div className="topic-stat">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    {topic.views ?? 0}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      <div className="bbs-sidebar">
        {!user ? (
          <div className="bbs-widget">
            <div className="bbs-login-box">
              <p className="login-hint">{t('bbs.loginHint')}</p>
              <div className="login-buttons">
                <button className="btn-login" onClick={() => setAuthMode('login')}>{t('bbs.login')}</button>
                <button className="btn-register" onClick={() => setAuthMode('register')}>{t('bbs.register')}</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bbs-widget">
            <div className="bbs-user-box">
              <div className="bbs-user-avatar" style={{ background: profile?.avatar_color || '#00C853' }}>
                {profile?.avatar_letter || 'U'}
              </div>
              <span className="bbs-user-name">{profile?.nickname || user.email}</span>
            </div>
          </div>
        )}

        <div className="bbs-widget">
          <h3 className="widget-title">{t('bbs.communityStats')}</h3>
          <div className="community-stats">
            <div className="comm-stat">
              <span className="comm-stat-value">{stats.members}</span>
              <span className="comm-stat-label">{t('bbs.members')}</span>
            </div>
            <div className="comm-stat">
              <span className="comm-stat-value">{stats.topics}</span>
              <span className="comm-stat-label">{t('bbs.topics')}</span>
            </div>
            <div className="comm-stat">
              <span className="comm-stat-value">{stats.replies}</span>
              <span className="comm-stat-label">{t('bbs.replies')}</span>
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
