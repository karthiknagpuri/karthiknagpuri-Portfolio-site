import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const theme = {
    bg: '#0a0a0a',
    surface: '#141414',
    border: 'rgba(255,255,255,0.1)',
    text: '#ffffff',
    textMuted: '#888888',
    accent: '#C4785A',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signIn(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: theme.surface,
        borderRadius: '16px',
        padding: '40px',
        border: `1px solid ${theme.border}`,
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontFamily: "'Instrument Serif', serif",
            fontStyle: 'italic',
            fontSize: '32px',
            color: theme.text,
            margin: '0 0 8px 0',
          }}>
            Zero Admin
          </h1>
          <p style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '12px',
            color: theme.textMuted,
            margin: 0,
            letterSpacing: '1px',
          }}>
            SIGN IN TO CONTINUE
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontFamily: "'Space Mono', monospace",
              fontSize: '11px',
              color: theme.textMuted,
              marginBottom: '8px',
              letterSpacing: '1px',
            }}>
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                background: theme.bg,
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                padding: '14px 16px',
                color: theme.text,
                fontFamily: "'Space Mono', monospace",
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              placeholder="admin@example.com"
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontFamily: "'Space Mono', monospace",
              fontSize: '11px',
              color: theme.textMuted,
              marginBottom: '8px',
              letterSpacing: '1px',
            }}>
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                background: theme.bg,
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                padding: '14px 16px',
                color: theme.text,
                fontFamily: "'Space Mono', monospace",
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(255, 107, 107, 0.1)',
              border: '1px solid #FF6B6B',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '20px',
              color: '#FF6B6B',
              fontFamily: "'Space Mono', monospace",
              fontSize: '12px',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              background: theme.accent,
              color: theme.bg,
              border: 'none',
              borderRadius: '980px',
              padding: '14px 24px',
              fontFamily: "'Space Mono', monospace",
              fontSize: '13px',
              letterSpacing: '1px',
              cursor: isLoading ? 'wait' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              transition: 'all 0.2s ease',
            }}
          >
            {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '24px',
        }}>
          <a
            href="/"
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '12px',
              color: theme.textMuted,
              textDecoration: 'none',
            }}
          >
            ← Back to site
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
