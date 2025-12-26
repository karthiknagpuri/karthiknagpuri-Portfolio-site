import React, { useState, useEffect, useCallback } from 'react';

// Keyboard shortcuts hook
// eslint-disable-next-line react-refresh/only-export-components
export const useKeyboardShortcuts = ({ onToggleTheme, onFocusTerminal }) => {
  const [showHelp, setShowHelp] = useState(false);

  const handleKeyDown = useCallback((e) => {
    // Ignore if user is typing in an input or textarea
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      if (e.key === 'Escape') {
        e.target.blur();
      }
      return;
    }

    switch (e.key) {
      case '?':
        setShowHelp(prev => !prev);
        break;
      case '/':
        e.preventDefault();
        onFocusTerminal?.();
        break;
      case 't':
        onToggleTheme?.();
        break;
      case 'h':
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'b':
        document.getElementById('writing')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'c':
        document.getElementById('connect')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'Escape':
        setShowHelp(false);
        break;
      default:
        break;
    }
  }, [onToggleTheme, onFocusTerminal]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { showHelp, setShowHelp };
};

// Keyboard shortcuts help modal
export const KeyboardHelp = ({ show, onClose, theme }) => {
  if (!show) return null;

  const shortcuts = [
    { key: '?', description: 'show this help' },
    { key: '/', description: 'focus terminal' },
    { key: 't', description: 'toggle theme' },
    { key: 'h', description: 'go home (top)' },
    { key: 'b', description: 'go to blog' },
    { key: 'c', description: 'contact section' },
    { key: 'esc', description: 'close dialogs' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: '12px',
        padding: '24px 32px',
        zIndex: 1001,
        minWidth: '280px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <h3 style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '14px',
          letterSpacing: '2px',
          marginBottom: '20px',
          color: theme.text,
          textTransform: 'uppercase',
        }}>
          keyboard shortcuts
        </h3>

        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
        }}>
          {shortcuts.map(({ key, description }) => (
            <li key={key} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px',
              fontSize: '13px',
            }}>
              <kbd style={{
                background: theme.surfaceAlt || 'rgba(255,255,255,0.1)',
                border: `1px solid ${theme.border}`,
                borderRadius: '4px',
                padding: '4px 8px',
                fontFamily: "'SF Mono', monospace",
                fontSize: '12px',
                color: theme.accent,
                minWidth: '24px',
                textAlign: 'center',
              }}>
                {key}
              </kbd>
              <span style={{ color: theme.textSecondary }}>{description}</span>
            </li>
          ))}
        </ul>

        <p style={{
          marginTop: '20px',
          fontSize: '11px',
          color: theme.textMuted,
          textAlign: 'center',
        }}>
          Press <kbd style={{
            background: theme.surfaceAlt || 'rgba(255,255,255,0.1)',
            padding: '2px 6px',
            borderRadius: '3px',
            fontSize: '10px',
          }}>?</kbd> or <kbd style={{
            background: theme.surfaceAlt || 'rgba(255,255,255,0.1)',
            padding: '2px 6px',
            borderRadius: '3px',
            fontSize: '10px',
          }}>esc</kbd> to close
        </p>
      </div>
    </>
  );
};

export default KeyboardHelp;
