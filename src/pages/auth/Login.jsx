import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { BookOpen, AlertCircle, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await authService.login({ email, password });
      login(data);
      // Let ProtectedRoute or AuthLayout handle redirect implicitly
      // But we can manually push them:
      navigate(`/${data.role}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || t('auth.invalidCredentials'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <div className="auth-logo">
          <BookOpen size={24} />
        </div>
        <h1 className="auth-title">{t('auth.welcomeBack')}</h1>
        <p className="auth-subtitle">{t('auth.signInSubtitle')}</p>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label className="form-label" htmlFor="email">{t('auth.email')}</label>
          <input
            id="email"
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('auth.placeholderEmail')}
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">{t('auth.password')}</label>
          <input
            id="password"
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.placeholderPassword')}
            required
            disabled={isLoading}
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary auth-submit-btn"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader size={18} className="spin" />
              {t('auth.signingIn')}
            </>
          ) : (
            t('auth.signIn')
          )}
        </button>
      </form>

      <div className="auth-footer">
        <p>
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="auth-link">{t('auth.createOneHere')}</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
