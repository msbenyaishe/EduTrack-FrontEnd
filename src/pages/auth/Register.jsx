import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { BookOpen, AlertCircle, Loader } from 'lucide-react';

const Register = () => {
  const [role, setRole] = useState('student'); // 'student' or 'teacher'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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
      setError(err.response?.data?.message || 'Failed to create account. Please try again.');
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
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join EduTrack today.</p>
      </div>

      <div className="role-tabs flex gap-2" style={{ marginBottom: '1.5rem' }}>
        <button
          className={`btn ${role === 'student' ? 'btn-primary' : 'btn-secondary'} flex-1`}
          onClick={() => setRole('student')}
          type="button"
        >
          Student
        </button>
        <button
          className={`btn ${role === 'teacher' ? 'btn-primary' : 'btn-secondary'} flex-1`}
          onClick={() => setRole('teacher')}
          type="button"
        >
          Teacher
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
          <label className="form-label" htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 6 characters"
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
              Creating Account...
            </>
          ) : (
            'Sign Up'
          )}
        </button>
      </form>

      <div className="auth-footer">
        <p>
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
