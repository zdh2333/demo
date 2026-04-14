import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';
import { fetchTopic, fetchReplies, createReply } from '../services/forumApi';
import './TopicDetail.css';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  return `${days}天前`;
}

export default function TopicDetail() {
  const { id } = useParams();
  const { t } = useI18n();
  const { user } = useAuth();
  const [topic, setTopic] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [posting, setPosting] = useState(false);
  const [authMode, setAuthMode] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchTopic(id), fetchReplies(id)]).then(([t, r]) => {
      setTopic(t);
      setReplies(r);
      setLoading(false);
    });
  }, [id]);

  const handleReply = async () => {
    if (!replyText.trim() || !user) return;
    setPosting(true);
    const { error } = await createReply({
      topicId: Number(id),
      content: replyText.trim(),
      authorId: user.id,
    });
    setPosting(false);
    if (!error) {
      setReplyText('');
      const updated = await fetchReplies(id);
      setReplies(updated);
    }
  };

  if (loading) {
    return (
      <div className="topic-detail">
        <Link to="/bbs" className="topic-back">{t('topicDetail.back')}</Link>
        <p>加载中...</p>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="topic-detail">
        <Link to="/bbs" className="topic-back">{t('topicDetail.back')}</Link>
        <p>帖子不存在</p>
      </div>
    );
  }

  return (
    <div className="topic-detail">
      <Link to="/bbs" className="topic-back">{t('topicDetail.back')}</Link>

      <article className="topic-article">
        <div className="topic-article-header">
          <div className="topic-detail-avatar" style={{ background: topic.avatar_color || '#999' }}>
            {topic.avatar_letter || 'U'}
          </div>
          <div>
            <h1 className="topic-detail-title">{topic.title}</h1>
            <div className="topic-detail-meta">
              <span>{topic.author_name}</span>
              <span>{timeAgo(topic.created_at)}</span>
              <span>{topic.reply_count ?? replies.length} {t('topicDetail.replyCount')}</span>
              <span>{topic.views ?? 0} {t('topicDetail.views')}</span>
            </div>
          </div>
        </div>
        <div className="topic-body">
          {(topic.body || '').split('\n').map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <span className="topic-detail-category">{topic.category}</span>
      </article>

      <section className="replies-section">
        <h3 className="replies-title">{replies.length} {t('topicDetail.replyCount')}</h3>
        {replies.map((reply) => (
          <div key={reply.id} className="reply-item">
            <div className="reply-avatar" style={{ background: reply.avatar_color || '#999' }}>
              {reply.avatar_letter || 'U'}
            </div>
            <div className="reply-body">
              <div className="reply-header">
                <span className="reply-author">{reply.author_name}</span>
                <span className="reply-time">{timeAgo(reply.created_at)}</span>
              </div>
              <p className="reply-content">{reply.content}</p>
            </div>
          </div>
        ))}
      </section>

      <div className="reply-form">
        {user ? (
          <>
            <textarea
              className="reply-textarea"
              placeholder={t('topicDetail.replyPlaceholder')}
              rows={3}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <button
              className="reply-submit"
              onClick={handleReply}
              disabled={posting || !replyText.trim()}
            >
              {posting ? '...' : t('topicDetail.replyBtn')}
            </button>
          </>
        ) : (
          <button className="reply-login-btn" onClick={() => setAuthMode('login')}>
            {t('topicDetail.loginToReply')}
          </button>
        )}
      </div>

      {authMode && <AuthModal mode={authMode} onClose={() => setAuthMode(null)} />}
    </div>
  );
}
