import { useState } from 'react';
import { useI18n } from '../contexts/I18nContext';
import { useAuth } from '../contexts/AuthContext';
import './AuthModal.css';

export default function AuthModal({ mode: initialMode, onClose }) {
  const { t } = useI18n();
  const { signIn, signUp, isConfigured } = useAuth();
  const [mode, setMode] = useState(initialMode || 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isLogin = mode === 'login';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isConfigured) {
      setError('后端未配置。请在 .env 中设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY');
      return;
    }

    if (!isLogin && password !== confirm) {
      setError('两次密码不一致');
      return;
    }

    setLoading(true);
    const result = isLogin
      ? await signIn(email, password)
      : await signUp(email, password, nickname || email.split('@')[0]);
    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setSuccess(true);
    setTimeout(onClose, 1200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="auth-title">
          {isLogin ? t('auth.loginTitle') : t('auth.registerTitle')}
        </h2>

        {success ? (
          <div className="auth-success">
            <span className="auth-success-icon">✓</span>
            <p>{isLogin ? 'Welcome back!' : '注册成功！请查看邮件完成验证。'}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <label className="auth-label">昵称</label>
                <input
                  className="auth-input"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="可选，默认使用邮箱前缀"
                />
              </>
            )}

            <label className="auth-label">{t('auth.email')}</label>
            <input
              className="auth-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />

            <label className="auth-label">{t('auth.password')}</label>
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />

            {!isLogin && (
              <>
                <label className="auth-label">{t('auth.confirmPassword')}</label>
                <input
                  className="auth-input"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={6}
                />
              </>
            )}

            {error && <p className="auth-error">{error}</p>}

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? '...' : t('auth.submit')}
            </button>

            <button
              className="auth-switch"
              type="button"
              onClick={() => { setMode(isLogin ? 'register' : 'login'); setError(''); }}
            >
              {isLogin ? t('auth.switchToRegister') : t('auth.switchToLogin')}
            </button>
          </form>
        )}

        <button className="auth-close" onClick={onClose}>{t('auth.cancel')}</button>
      </div>
    </div>
  );
}
