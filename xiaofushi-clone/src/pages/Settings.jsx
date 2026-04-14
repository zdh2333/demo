import { useState, useEffect } from 'react';
import './Settings.css';

function getInitialTheme() {
  const saved = localStorage.getItem('redo-theme');
  if (saved) return saved;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function Settings() {
  const [language, setLanguage] = useState(() => localStorage.getItem('redo-lang') || 'zh');
  const [theme, setTheme] = useState(getInitialTheme);
  const [langToast, setLangToast] = useState(false);

  useEffect(() => {
    const resolved = theme === 'auto'
      ? (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
    document.documentElement.setAttribute('data-theme', resolved);
    localStorage.setItem('redo-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== 'auto') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    function handler(e) {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  function handleLanguageChange(e) {
    const val = e.target.value;
    setLanguage(val);
    localStorage.setItem('redo-lang', val);
    if (val !== 'zh') {
      setLangToast(true);
      setTimeout(() => setLangToast(false), 3000);
    }
  }

  return (
    <div className="settings">
      <h1 className="settings-title">设置</h1>

      <div className="settings-card">
        <div className="setting-item">
          <div className="setting-info">
            <h3>语言 / Language</h3>
            <p>选择界面显示语言</p>
          </div>
          <select
            className="setting-select"
            value={language}
            onChange={handleLanguageChange}
          >
            <option value="zh">中文</option>
            <option value="ja">日本語</option>
            <option value="en">English</option>
          </select>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h3>主题 / Theme</h3>
            <p>选择界面主题风格</p>
          </div>
          <select
            className="setting-select"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          >
            <option value="light">浅色</option>
            <option value="dark">深色</option>
            <option value="auto">跟随系统</option>
          </select>
        </div>
      </div>

      <div className="settings-card">
        <h2 className="card-title">关于</h2>
        <div className="about-info">
          <p><strong>Redo</strong> — 日本永住申请时间预估</p>
          <p>数据来源：日本政府统计局（e-Stat）</p>
          <p>版本：1.0.0</p>
        </div>
      </div>

      {langToast && (
        <div className="settings-toast">
          多语言支持即将上线，当前仅支持中文界面
        </div>
      )}
    </div>
  );
}
