import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../contexts/ThemeContext';
import './Settings.css';

export default function Settings() {
  const { lang, setLang, t } = useI18n();
  const { theme, setTheme } = useTheme();

  return (
    <div className="settings">
      <h1 className="settings-title">{t('settings.title')}</h1>

      <div className="settings-card">
        <div className="setting-item">
          <div className="setting-info">
            <h3>{t('settings.language')}</h3>
            <p>{t('settings.languageDesc')}</p>
          </div>
          <select
            className="setting-select"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
          >
            <option value="zh">中文</option>
            <option value="ja">日本語</option>
            <option value="en">English</option>
          </select>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h3>{t('settings.theme')}</h3>
            <p>{t('settings.themeDesc')}</p>
          </div>
          <select
            className="setting-select"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          >
            <option value="light">{t('settings.light')}</option>
            <option value="dark">{t('settings.dark')}</option>
            <option value="auto">{t('settings.auto')}</option>
          </select>
        </div>
      </div>

      <div className="settings-card">
        <h2 className="card-title">{t('settings.about')}</h2>
        <div className="about-info">
          <p><strong>Redo</strong> — {t('settings.aboutText')}</p>
          <p>{t('settings.dataSource')}</p>
          <p>{t('settings.version')}</p>
        </div>
      </div>
    </div>
  );
}
