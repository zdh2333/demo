import { Link } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';
import { forumTopics } from '../data/mockData';
import './Sidebar.css';

export default function Sidebar({ open }) {
  const { t } = useI18n();

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-section">
        <h3 className="sidebar-title">{t('sidebar.hotTopics')}</h3>
        <ul className="sidebar-topics">
          {forumTopics.slice(0, 4).map((topic) => (
            <li key={topic.id} className="sidebar-topic-item">
              <Link to={`/bbs/topic/${topic.id}`}>{topic.title}</Link>
            </li>
          ))}
        </ul>
        <Link to="/bbs" className="sidebar-more">{t('bbs.more')}</Link>
      </div>
    </aside>
  );
}
