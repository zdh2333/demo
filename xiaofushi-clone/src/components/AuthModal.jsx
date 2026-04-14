import { useState } from 'react';
import { useI18n } from '../contexts/I18nContext';
import './AuthModal.css';

export default function AuthModal({ mode: initialMode, onClose }) {
  const { t } = useI18n();
  const [mode, setMode] = useState(initialMode || 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const isLogin = mode === 'login';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="auth-title">
          {isLogin ? t('auth.loginTitle') : t('auth.registerTitle')}
        </h2>

        {submitted ? (
          <div className="auth-success">
            <span className="auth-success-icon">✓</span>
            <p>{isLogin ? 'Welcome back!' : 'Registration successful!'}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
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

            <button className="auth-submit" type="submit">{t('auth.submit')}</button>

            <button
              className="auth-switch"
              type="button"
              onClick={() => setMode(isLogin ? 'register' : 'login')}
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
