import { forumTopics } from '../data/mockData';
import './Sidebar.css';

export default function Sidebar({ open }) {
  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-section">
        <h3 className="sidebar-title">热门讨论</h3>
        <ul className="sidebar-topics">
          {forumTopics.slice(0, 4).map((topic) => (
            <li key={topic.id} className="sidebar-topic-item">
              <a href={`/bbs#topic-${topic.id}`}>{topic.title}</a>
            </li>
          ))}
        </ul>
        <a href="/bbs" className="sidebar-more">更多话题 →</a>
      </div>
    </aside>
  );
}
