import { useParams, Link } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';
import { forumTopics } from '../data/mockData';
import './TopicDetail.css';

const mockReplies = [
  { id: 1, author: 'helper_01', avatar: 'H', color: '#2196F3', time: '1天前', content: '感谢分享！我也在同一个入管局申请，目前还在等待中。请问您的申请材料准备了多久？' },
  { id: 2, author: 'visa_pro', avatar: 'V', color: '#4CAF50', time: '20小时前', content: '根据我的经验，名古屋最近审批速度有加快的趋势。建议大家关注最新数据。' },
  { id: 3, author: 'tokyo_user', avatar: 'T', color: '#FF9800', time: '12小时前', content: '有没有人知道补充材料后会不会影响审批时间？我上周刚提交了追加材料。' },
];

export default function TopicDetail() {
  const { id } = useParams();
  const { t } = useI18n();
  const topic = forumTopics.find((tp) => tp.id === Number(id));

  if (!topic) {
    return (
      <div className="topic-detail">
        <Link to="/bbs" className="topic-back">{t('topicDetail.back')}</Link>
        <p>Topic not found.</p>
      </div>
    );
  }

  return (
    <div className="topic-detail">
      <Link to="/bbs" className="topic-back">{t('topicDetail.back')}</Link>

      <article className="topic-article">
        <div className="topic-article-header">
          <div className="topic-detail-avatar" style={{ background: topic.avatarColor }}>
            {topic.avatar}
          </div>
          <div>
            <h1 className="topic-detail-title">{topic.title}</h1>
            <div className="topic-detail-meta">
              <span>{topic.author}</span>
              <span>{topic.lastReply}</span>
              <span>{topic.replies} {t('topicDetail.replyCount')}</span>
              <span>{topic.views} {t('topicDetail.views')}</span>
            </div>
          </div>
        </div>
        <div className="topic-body">
          <p>这是一篇关于「{topic.title}」的详细讨论帖。欢迎大家分享自己的经验和看法。</p>
          <p>申请永住是在日本长期居住的重要一步，希望大家互相帮助，分享有用的信息。</p>
        </div>
        <span className="topic-detail-category">{topic.category}</span>
      </article>

      <section className="replies-section">
        <h3 className="replies-title">{topic.replies} {t('topicDetail.replyCount')}</h3>
        {mockReplies.map((reply) => (
          <div key={reply.id} className="reply-item">
            <div className="reply-avatar" style={{ background: reply.color }}>{reply.avatar}</div>
            <div className="reply-body">
              <div className="reply-header">
                <span className="reply-author">{reply.author}</span>
                <span className="reply-time">{reply.time}</span>
              </div>
              <p className="reply-content">{reply.content}</p>
            </div>
          </div>
        ))}
      </section>

      <div className="reply-form">
        <textarea className="reply-textarea" placeholder={t('topicDetail.replyPlaceholder')} rows={3} />
        <button className="reply-submit">{t('topicDetail.replyBtn')}</button>
      </div>
    </div>
  );
}
