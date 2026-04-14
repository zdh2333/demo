import { useState } from 'react';
import { forumTopics, forumStats, forumCategories } from '../data/mockData';
import './BBS.css';

const tabs = ['最新回复', '最新发帖', '经验分享', '问答交流'];

export default function BBS() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="bbs">
      <div className="bbs-main">
        <h1 className="bbs-title">社区</h1>

        <div className="bbs-tabs">
          {tabs.map((tab, i) => (
            <button
              key={i}
              className={`bbs-tab ${activeTab === i ? 'active' : ''}`}
              onClick={() => setActiveTab(i)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="topic-list">
          {forumTopics.map((topic) => (
            <div key={topic.id} className="topic-item">
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
            </div>
          ))}
        </div>
      </div>

      <div className="bbs-sidebar">
        <div className="bbs-widget">
          <div className="bbs-login-box">
            <p className="login-hint">登录后参与讨论</p>
            <div className="login-buttons">
              <button className="btn-login">登录</button>
              <button className="btn-register">注册</button>
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
              <a key={i} className="category-item" href="#">
                <span className="cat-dot" style={{ background: cat.color }}></span>
                <span className="cat-name">{cat.name}</span>
                <span className="cat-count">{cat.count}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
