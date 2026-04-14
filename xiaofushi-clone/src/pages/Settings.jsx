import { useState } from 'react';
import './Settings.css';

export default function Settings() {
  const [language, setLanguage] = useState('zh');
  const [theme, setTheme] = useState('light');

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
            onChange={(e) => setLanguage(e.target.value)}
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
          <p><strong>XiaoFushi.com</strong> — 日本永住申请时间预估</p>
          <p>数据来源：日本政府统计局（e-Stat）</p>
          <p>版本：1.0.0</p>
        </div>
      </div>
    </div>
  );
}
