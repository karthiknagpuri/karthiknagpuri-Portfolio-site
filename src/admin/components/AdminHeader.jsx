import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminHeader = ({ onMenuClick, title, showMenuButton = false }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const theme = {
    bg: '#0a0a0a',
    surface: '#141414',
    border: 'rgba(255,255,255,0.1)',
    text: '#ffffff',
    textMuted: '#888888',
    accent: '#C4785A',
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header style={{
      height: '64px',
      background: theme.surface,
      borderBottom: `1px solid ${theme.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 30,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Mobile menu button - only shown on mobile */}
        {showMenuButton && (
          <button
            onClick={onMenuClick}
            style={{
              background: 'none',
              border: 'none',
              color: theme.text,
              fontSize: '20px',
              cursor: 'pointer',
              padding: '8px',
            }}
          >
            ☰
          </button>
        )}

        <h2 style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '14px',
          fontWeight: '500',
          color: theme.text,
          margin: 0,
          letterSpacing: '1px',
        }}>
          {title || 'Dashboard'}
        </h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '12px',
          color: theme.textMuted,
        }}>
          {user?.email}
        </span>
        <button
          onClick={handleSignOut}
          style={{
            background: 'none',
            border: `1px solid ${theme.border}`,
            borderRadius: '6px',
            padding: '8px 16px',
            fontFamily: "'Space Mono', monospace",
            fontSize: '11px',
            color: theme.textMuted,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            letterSpacing: '1px',
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = theme.accent;
            e.target.style.color = theme.accent;
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = theme.border;
            e.target.style.color = theme.textMuted;
          }}
        >
          LOGOUT
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
