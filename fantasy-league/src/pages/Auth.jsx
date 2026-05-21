import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon3D from '../components/Icon3D';

const Auth = ({ setToken }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
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
    } catch (err) {
      console.error(err);
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      background: '#020206', 
      position: 'relative', 
      overflow: 'hidden' 
    }}>
      {/* Perspective grid floor */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(93,42,143,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(93,42,143,0.04) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        transform: 'perspective(500px) rotateX(60deg) translateY(30%)',
        transformOrigin: 'center top',
        opacity: 0.5
      }} />

      {/* Animated gradient orbs */}
      <div style={{
        position: 'absolute', top: '5%', left: '5%', width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(93,42,143,0.2) 0%, transparent 60%)',
        borderRadius: '50%', filter: 'blur(60px)',
        animation: 'morphBg 8s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute', bottom: '5%', right: '5%', width: '350px', height: '350px',
        background: 'radial-gradient(circle, rgba(243,198,35,0.15) 0%, transparent 60%)',
        borderRadius: '50%', filter: 'blur(60px)',
        animation: 'morphBg 10s ease-in-out infinite reverse'
      }} />
      <div style={{
        position: 'absolute', top: '40%', right: '30%', width: '250px', height: '250px',
        background: 'radial-gradient(circle, rgba(0,192,249,0.12) 0%, transparent 60%)',
        borderRadius: '50%', filter: 'blur(60px)',
        animation: 'morphBg 12s ease-in-out infinite 3s'
      }} />

      {/* Floating particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          width: `${2 + Math.random() * 3}px`,
          height: `${2 + Math.random() * 3}px`,
          background: i % 2 === 0 ? '#f3c623' : '#5d2a8f',
          borderRadius: '50%',
          boxShadow: `0 0 10px ${i % 2 === 0 ? '#f3c623' : '#5d2a8f'}`,
          opacity: 0.3 + Math.random() * 0.4,
          animation: `float ${3 + Math.random() * 4}s ease-in-out infinite ${Math.random() * 5}s`
        }} />
      ))}

      {/* Scanlines overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'repeating-linear-gradient(transparent 0px, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)',
        pointerEvents: 'none', zIndex: 5
      }} />

      {/* Auth Card */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          width: '100%', maxWidth: '420px',
          position: 'relative', zIndex: 10,
          transition: 'transform 0.3s ease',
          transformStyle: 'preserve-3d',
          animation: 'slideInUp 0.8s ease both'
        }}
      >
        {/* Card glow */}
        <div style={{
          position: 'absolute', inset: '-2px', borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(93,42,143,0.4), transparent 40%, rgba(243,198,35,0.4))',
          zIndex: -1, filter: 'blur(1px)', opacity: 0.7
        }} />
        
        <div className="glass-panel" style={{ 
          padding: '44px 36px', 
          borderRadius: '22px',
          background: 'linear-gradient(135deg, rgba(15,12,25,0.92) 0%, rgba(25,20,40,0.85) 100%)',
        }}>
          {/* Logo section */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div style={{ 
              display: 'inline-flex', 
              padding: '16px', 
              borderRadius: '50%', 
              border: '1px solid rgba(243,198,35,0.2)',
              marginBottom: '20px',
              position: 'relative',
              animation: 'float 4s ease-in-out infinite'
            }}>
              <Icon3D color="#f3c623" shape="f1" size={54} active />
              <div style={{
                position: 'absolute', inset: '-3px', borderRadius: '50%',
                border: '1px solid rgba(93,42,143,0.15)',
                animation: 'spin 15s linear infinite'
              }} />
            </div>
            <h1 className="heading-gradient" style={{ fontSize: '2.8rem', margin: '0 0 6px 0', filter: 'drop-shadow(0 0 20px rgba(93,42,143,0.4))' }}>MONACO GP</h1>
            <p style={{ 
              color: '#f3c623', 
              textTransform: 'uppercase', 
              letterSpacing: '4px', 
              fontSize: '0.7rem',
              fontFamily: 'var(--font-heading)'
            }}>Real Madrid Edition</p>
          </div>

          {/* Toggle Login/Register */}
          <div style={{ 
            display: 'flex', 
            gap: '0', 
            marginBottom: '28px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '12px',
            padding: '4px',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <button onClick={() => setIsLogin(true)} style={{
              flex: 1, padding: '10px', border: 'none', borderRadius: '10px', cursor: 'pointer',
              fontFamily: 'var(--font-heading)', fontSize: '0.75rem', letterSpacing: '1px',
              background: isLogin ? 'linear-gradient(135deg, rgba(93,42,143,0.3), rgba(243,198,35,0.2))' : 'transparent',
              color: isLogin ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.3s ease',
              boxShadow: isLogin ? '0 0 20px rgba(93,42,143,0.2)' : 'none'
            }}>LOGIN</button>
            <button onClick={() => setIsLogin(false)} style={{
              flex: 1, padding: '10px', border: 'none', borderRadius: '10px', cursor: 'pointer',
              fontFamily: 'var(--font-heading)', fontSize: '0.75rem', letterSpacing: '1px',
              background: !isLogin ? 'linear-gradient(135deg, rgba(0,192,249,0.3), rgba(243,198,35,0.2))' : 'transparent',
              color: !isLogin ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.3s ease',
              boxShadow: !isLogin ? '0 0 20px rgba(0,192,249,0.2)' : 'none'
            }}>REGISTER</button>
          </div>

          {error && (
            <div style={{ 
              padding: '12px 16px', 
              background: 'rgba(229,9,20,0.1)', 
              border: '1px solid rgba(229,9,20,0.3)', 
              color: '#ff4444', 
              borderRadius: '12px', 
              marginBottom: '20px', 
              textAlign: 'center', 
              fontSize: '0.85rem',
              animation: 'slideInUp 0.3s ease',
              backdropFilter: 'blur(10px)'
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ position: 'relative' }}>
              <label style={{ 
                fontSize: '0.7rem', 
                color: focusedField === 'user' ? '#5d2a8f' : 'var(--text-muted)', 
                fontFamily: 'var(--font-heading)', 
                letterSpacing: '2px',
                display: 'block', marginBottom: '8px',
                transition: 'color 0.3s'
              }}>USERNAME</label>
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                onFocus={() => setFocusedField('user')}
                onBlur={() => setFocusedField(null)}
                required
                placeholder="Enter your codename"
                style={{ 
                  width: '100%', padding: '14px 16px', 
                  background: 'rgba(0,0,0,0.4)', 
                  border: focusedField === 'user' ? '1px solid rgba(93,42,143,0.5)' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px', color: '#fff', outline: 'none',
                  fontSize: '0.95rem', fontFamily: 'var(--font-body)',
                  transition: 'all 0.3s ease',
                  boxShadow: focusedField === 'user' ? '0 0 20px rgba(93,42,143,0.15)' : 'none'
                }} 
              />
            </div>
            
            <div style={{ position: 'relative' }}>
              <label style={{ 
                fontSize: '0.7rem', 
                color: focusedField === 'pass' ? '#f3c623' : 'var(--text-muted)',
                fontFamily: 'var(--font-heading)', 
                letterSpacing: '2px',
                display: 'block', marginBottom: '8px',
                transition: 'color 0.3s'
              }}>PASSWORD</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocusedField('pass')}
                onBlur={() => setFocusedField(null)}
                required
                placeholder="••••••••"
                style={{ 
                  width: '100%', padding: '14px 16px', 
                  background: 'rgba(0,0,0,0.4)', 
                  border: focusedField === 'pass' ? '1px solid rgba(243,198,35,0.5)' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px', color: '#fff', outline: 'none',
                  fontSize: '0.95rem', fontFamily: 'var(--font-body)',
                  transition: 'all 0.3s ease',
                  boxShadow: focusedField === 'pass' ? '0 0 20px rgba(243,198,35,0.15)' : 'none'
                }} 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary" 
              style={{ 
                marginTop: '8px', padding: '16px', fontSize: '0.9rem', 
                borderRadius: '12px', letterSpacing: '2px',
                position: 'relative', overflow: 'hidden',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <span style={{ width: '16px', height: '16px', border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }}></span>
                  Connecting...
                </span>
              ) : (
                isLogin ? '⚡ Initialize Session' : '🚀 Create Account'
              )}
            </button>
          </form>

          <div style={{ marginTop: '28px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {isLogin ? "Don't have an account?" : "Already a manager?"}{' '}
            <span 
              onClick={() => { setIsLogin(!isLogin); setError(''); }} 
              style={{ 
                color: '#00c0f9', cursor: 'pointer', fontWeight: 'bold',
                textShadow: '0 0 10px rgba(0,192,249,0.3)',
                transition: 'all 0.3s'
              }}
              onMouseEnter={e => e.target.style.textShadow = '0 0 20px rgba(0,192,249,0.6)'}
              onMouseLeave={e => e.target.style.textShadow = '0 0 10px rgba(0,192,249,0.3)'}
            >
              {isLogin ? 'Register Here' : 'Login Here'}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes morphBg {
          0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        input::placeholder { color: rgba(255,255,255,0.15); }
      `}</style>
    </div>
  );
};

export default Auth;
