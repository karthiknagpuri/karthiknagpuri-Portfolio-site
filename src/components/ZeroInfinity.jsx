import React, { useState } from 'react';

export const ZeroInfinity = ({ theme }) => {
  const [isTransformed, setIsTransformed] = useState(false);

  const handleTransform = () => {
    setIsTransformed(true);
    setTimeout(() => setIsTransformed(false), 3000);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '32px',
      padding: '40px 20px',
    }}>
      {/* SVG Animation Container */}
      <div style={{
        position: 'relative',
        width: '200px',
        height: '200px',
      }}>
        <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id="zeroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={theme.accent} stopOpacity="0.8" />
              <stop offset="100%" stopColor={theme.accent} stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Animated particles */}
          <circle cx="50" cy="50" r="2" fill={theme.accent} opacity="0.6">
            <animate attributeName="cy" values="50;40;50" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="150" cy="75" r="2" fill={theme.accent} opacity="0.6">
            <animate attributeName="cy" values="75;65;75" dur="4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;1;0.6" dur="4s" repeatCount="indefinite" />
          </circle>
          <circle cx="75" cy="150" r="2" fill={theme.accent} opacity="0.6">
            <animate attributeName="cy" values="150;140;150" dur="3.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;1;0.6" dur="3.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="125" cy="175" r="2" fill={theme.accent} opacity="0.6">
            <animate attributeName="cy" values="175;165;175" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2.5s" repeatCount="indefinite" />
          </circle>

          {/* Main symbol */}
          <text
            x="100"
            y="125"
            fontFamily="'Space Mono', monospace"
            fontSize={isTransformed ? '60' : '100'}
            fill="url(#zeroGradient)"
            textAnchor="middle"
            style={{
              transition: 'all 0.5s ease',
              opacity: 0.9,
            }}
          >
            {isTransformed ? '∞' : '0'}
          </text>

          {/* Rotating ring */}
          <circle
            cx="100"
            cy="100"
            r="85"
            fill="none"
            stroke={theme.accent}
            strokeWidth="0.5"
            strokeDasharray="10,10"
            opacity="0.3"
            style={{
              transformOrigin: '100px 100px',
              animation: 'rotate 30s linear infinite',
            }}
          />
        </svg>
      </div>

      {/* Text content */}
      <div style={{
        maxWidth: '500px',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: 'clamp(24px, 5vw, 32px)',
          fontStyle: 'italic',
          color: theme.text,
          marginBottom: '16px',
        }}>
          the paradox of being zero
        </h2>

        <p style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '13px',
          lineHeight: '1.8',
          color: theme.textSecondary,
          marginBottom: '12px',
        }}>
          Zero isn't emptiness—it's infinite possibility. In mathematics, zero is the origin point
          from which all numbers emerge. In entrepreneurship, it's the blank canvas where breakthrough
          ideas are born.
        </p>

        <p style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '13px',
          lineHeight: '1.8',
          color: theme.textSecondary,
          marginBottom: '24px',
        }}>
          Every startup begins at zero. Every ecosystem starts from nothing. Yet within that void
          lies unlimited potential—the space where innovation flourishes and impossible dreams
          transform into reality.
        </p>

        <button
          onClick={handleTransform}
          disabled={isTransformed}
          style={{
            background: 'transparent',
            border: `1px solid ${theme.accent}`,
            color: isTransformed ? theme.textMuted : theme.accent,
            padding: '12px 24px',
            fontFamily: "'Space Mono', monospace",
            fontSize: '12px',
            letterSpacing: '1px',
            cursor: isTransformed ? 'default' : 'pointer',
            transition: 'all 0.3s ease',
            borderRadius: '4px',
          }}
          onMouseEnter={(e) => {
            if (!isTransformed) {
              e.target.style.background = theme.accent;
              e.target.style.color = theme.bg;
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = isTransformed ? theme.textMuted : theme.accent;
          }}
        >
          {isTransformed ? 'transforming...' : 'transform zero → ∞'}
        </button>
      </div>

      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ZeroInfinity;
