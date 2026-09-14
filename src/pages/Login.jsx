import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import SplashScreen from '../components/layout/SplashScreen';

export default function Login() {
  const { login, signup, loginWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [fadeSplash, setFadeSplash] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeSplash(true), 1000);
    const removeTimer = setTimeout(() => setShowSplash(false), 1450);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  useEffect(() => {
    if (currentUser) navigate('/', { replace: true });
  }, [currentUser, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          setLoading(false);
          return;
        }
        if (!displayName.trim()) {
          setError('Please enter your display name.');
          setLoading(false);
          return;
        }
        await signup(email, password, displayName.trim());
      } else {
        await login(email, password);
      }
    } catch (err) {
      const msg = err.code === 'auth/user-not-found' ? 'No account found with this email.'
        : err.code === 'auth/wrong-password' ? 'Incorrect password.'
        : err.code === 'auth/email-already-in-use' ? 'This email is already registered.'
        : err.code === 'auth/invalid-email' ? 'Invalid email address.'
        : err.code === 'auth/too-many-requests' ? 'Too many attempts. Please try again later.'
        : err.message || 'Authentication failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  }

  if (showSplash) {
    return <SplashScreen fadeOut={fadeSplash} />;
  }

  return (
    <div className="login-page" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0a0a0f 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', 'Segoe UI', sans-serif", padding: '20px'
    }}>
      <div className="auth-card" style={{
        background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px',
        padding: '40px', maxWidth: '420px', width: '100%', color: '#fff'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <img src="/media/orion_logo_ GRADIENT no bg.png" alt="ORION" style={{ height: '40px', marginBottom: '10px' }} />
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>
            {mode === 'login' ? 'Welcome back' : 'Join ORION'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginTop: '5px' }}>
            {mode === 'login' ? 'Sign in to your account' : 'Create your creator account'}
          </p>
        </div>

        {error && (
          <div className="auth-message error" style={{
            display: 'block', padding: '10px 15px', borderRadius: '10px',
            fontSize: '13px', fontWeight: 500, marginBottom: '10px',
            textAlign: 'center', background: 'rgba(239,68,68,0.2)',
            color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="input-group" style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '6px' }}>Display Name</label>
              <input
                type="text" value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your creator name"
                required
                style={inputStyle}
              />
            </div>
          )}

          <div className="input-group" style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '6px' }}>Email</label>
            <input
              type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={inputStyle}
            />
          </div>

          <div className="input-group" style={{ marginBottom: '15px', position: 'relative' }}>
            <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '6px' }}>Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={inputStyle}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
              position: 'absolute', right: '12px', top: '34px', background: 'none',
              border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '14px'
            }}>
              <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>

          {mode === 'signup' && (
            <div className="input-group" style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '6px' }}>Confirm Password</label>
              <input
                type="password" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={inputStyle}
              />
            </div>
          )}

          <button type="submit" disabled={loading} className="submit" style={{
            width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
            fontWeight: 600, fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1, transition: '0.3s', marginTop: '5px'
          }}>
            {loading && <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>}
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', margin: '20px 0', color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>or</div>

        <button type="button" onClick={handleGoogle} disabled={loading} style={{
          width: '100%', padding: '12px', borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)',
          color: '#fff', fontWeight: 500, fontSize: '14px', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center', gap: '10px', transition: '0.3s'
        }}>
          <i className="fa-brands fa-google"></i> Continue with Google
        </button>

        <p style={{ textAlign: 'center', marginTop: '25px', fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }} style={{
            background: 'none', border: 'none', color: '#8b5cf6', cursor: 'pointer', fontWeight: 600
          }}>
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '12px 15px', borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)',
  color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  transition: '0.2s'
};
