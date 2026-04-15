import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { BookOpen, AlertCircle, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Register = () => {
  const [role, setRole] = useState('student'); // 'student' or 'teacher'
  const [name, setName] = useState('');
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
      let data;
      if (role === 'teacher') {
        data = await authService.registerTeacher({ name, email, password });
      } else {
        data = await authService.registerStudent({ name, email, password });
      }
      login(data);
      navigate(`/${data.role}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || t('auth.registerFailed'));
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
        <h1 className="auth-title">{t('auth.createAccount')}</h1>
        <p className="auth-subtitle">{t('auth.createAccountSubtitle')}</p>
      </div>

      <div className="role-tabs">
        <button
          className={`btn ${role === 'student' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setRole('student')}
          type="button"
        >
          {t('roles.student')}
        </button>
        <button
          className={`btn ${role === 'teacher' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setRole('teacher')}
          type="button"
        >
          {t('roles.teacher')}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label className="form-label" htmlFor="name">{t('auth.fullName')}</label>
          <input
            id="name"
            type="text"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('auth.placeholderName')}
            required
            disabled={isLoading}
          />
        </div>

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
            placeholder={t('auth.placeholderMinPassword')}
            required
            disabled={isLoading}
            minLength={6}
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
              {t('auth.creatingAccount')}
            </>
          ) : (
            t('auth.signUp')
          )}
        </button>
      </form>

      <div className="auth-footer">
        <p>
          {t('auth.alreadyHaveAccount')}{' '}
          <Link to="/login" className="auth-link">{t('auth.signIn')}</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
