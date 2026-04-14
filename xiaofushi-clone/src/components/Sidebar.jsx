import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';
import { fetchTopics } from '../services/forumApi';

import './Sidebar.css';

export default function Sidebar({ open }) {
  const { t } = useI18n();
  const [hotTopics, setHotTopics] = useState([]);

  useEffect(() => {
    fetchTopics({ sortBy: 'views' }).then((data) => {
      setHotTopics(data.slice(0, 4));
    });
  }, []);

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-section">
        <h3 className="sidebar-title">{t('sidebar.hotTopics')}</h3>
        <ul className="sidebar-topics">
          {hotTopics.map((topic) => (
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
