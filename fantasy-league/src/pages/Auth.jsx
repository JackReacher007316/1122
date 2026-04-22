import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Auth = ({ setToken }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (data.token) {
        localStorage.setItem('fantasy_token', data.token);
        localStorage.setItem('fantasy_user', JSON.stringify(data.user));
        setToken(data.token);
        navigate('/');
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (error) {
      console.error(error);
      setError('Server error. Please try again.');
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-dark)', position: 'relative', overflow: 'hidden' }}>
      
      {/* 3D Floating bg elements */}
      <div style={{ position: 'absolute', top: '10%', left: '10%', width: '300px', height: '300px', background: 'var(--neon-green)', filter: 'blur(150px)', opacity: 0.3, animation: 'pulse 5s infinite' }}></div>
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '300px', height: '300px', background: 'var(--neon-blue)', filter: 'blur(150px)', opacity: 0.3, animation: 'pulse 5s infinite 2s' }}></div>

      <div className="card-3d glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '40px', position: 'relative', zIndex: 10, animation: 'fadeIn 0.5s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 className="heading-gradient" style={{ fontSize: '2.5rem', margin: '0 0 8px 0' }}>IIITN</h1>
          <p style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem' }}>Streaming Platform</p>
        </div>

        <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>{isLogin ? 'Manager Access' : 'Register New Manager'}</h2>

        {error && <div style={{ padding: '12px', background: 'rgba(255,40,0,0.1)', border: '1px solid var(--neon-red)', color: 'var(--neon-red)', borderRadius: '8px', marginBottom: '24px', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Username</label>
            <input 
              type="text" 
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              style={{ padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', outline: 'none' }} 
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', outline: 'none' }} 
            />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '16px', padding: '16px', fontSize: '1.1rem' }}>
            {isLogin ? 'Initialize Session' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {isLogin ? "Don't have an account?" : "Already a manager?"}{' '}
          <span 
            onClick={() => setIsLogin(!isLogin)} 
            style={{ color: 'var(--neon-blue)', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {isLogin ? 'Register Here' : 'Login Here'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Auth;
