import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const sections = [
  { id: 'now', label: 'NOW' },
  { id: 'past', label: 'JOURNEY' },
  { id: 'geography', label: 'MAP' },
  { id: 'blog', label: 'BLOG', isLink: true, path: '/blog' },
  { id: 'gallery', label: 'GALLERY' },
  { id: 'vibes', label: 'VIBES' },
  { id: 'connect', label: 'CONTACT' },
  { id: 'terminal', label: 'TERMINAL', isTab: true },
];

export default function Navbar({
  // Common props
  onReadingClick,
  onGameClick,
  onNavClick,
  activeSection = null,
  isBlogPage = false,
  // Home page specific props
  isHome = false,
  theme = null,
  mobileMenuOpen = false,
  setMobileMenuOpen = null,
  ThemeToggle = null, // BB8Toggle component
  isDarkMode = true,
  toggleTheme = null,
}) {
  const navigate = useNavigate();

  // Default theme if not provided
  const defaultTheme = {
    bg: '#000000',
    text: '#F5F5F7',
    textSecondary: '#86868B',
    textMuted: '#6E6E73',
    accent: '#C4785A',
    accentHover: '#D68B6A',
    border: 'rgba(255,255,255,0.1)',
    navBg: 'rgba(0,0,0,0.85)',
  };

  const t = theme || defaultTheme;

  const handleNavClick = (section) => {
    // If on blog page and clicking BLOG, do nothing
    if (isBlogPage && section.id === 'blog') return;

    // If custom handler provided, use it
    if (onNavClick) {
      onNavClick(section);
      return;
    }

    // Default behavior
    if (section.isLink) {
      navigate(section.path);
    } else if (section.isTab) {
      navigate('/', { state: { activeView: section.id } });
    } else {
      navigate('/', { state: { scrollTo: section.id } });
    }
  };

  const handleReadingClick = () => {
    if (onReadingClick) {
      onReadingClick();
    } else {
      navigate('/', { state: { openReadingLog: true } });
    }
  };

  const handleGameClick = () => {
    if (onGameClick) {
      onGameClick();
    } else {
      navigate('/', { state: { openSnakeGame: true } });
    }
  };

  const isActiveSection = (section) => {
    if (isBlogPage && section.id === 'blog') return true;
    return activeSection === section.id;
  };

  // Home page navbar (fixed, with hamburger and theme toggle)
  if (isHome) {
    return (
      <>
        <nav style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          padding: '0 max(24px, env(safe-area-inset-left))',
          height: '52px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 100,
          background: t.navBg || 'rgba(0,0,0,0.85)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          borderBottom: `0.5px solid ${t.border}`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          <div style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: '22px',
            fontStyle: 'italic',
            letterSpacing: '-0.5px',
            cursor: 'pointer',
            color: t.text,
            fontWeight: '400',
            transition: 'opacity 0.2s ease',
          }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Zero
          </div>

          <div className="nav-desktop" style={{
            gap: '32px',
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
            fontSize: '12px',
            fontWeight: '400',
            letterSpacing: '0.5px',
          }}>
            {sections.map((section) => (
              <span
                key={section.id}
                className="nav-item"
                onClick={() => handleNavClick(section)}
                style={{
                  color: isActiveSection(section) ? t.accent : t.textSecondary,
                  fontWeight: isActiveSection(section) ? '600' : '400',
                }}
              >
                {section.label}
              </span>
            ))}
          </div>

          {/* Desktop: Theme Toggle + CTA */}
          <div className="nav-desktop" style={{ gap: '16px', alignItems: 'center' }}>
            {/* Reading Log Icon */}
            <button
              onClick={handleReadingClick}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                color: t.textSecondary,
                transition: 'color 0.2s ease',
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                fontSize: '11px',
                fontWeight: '500',
                letterSpacing: '0.5px',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = t.accent}
              onMouseLeave={(e) => e.currentTarget.style.color = t.textSecondary}
              title="Reading Log"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              READING
            </button>
            {/* Snake Game Button */}
            <button
              onClick={handleGameClick}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                color: t.textSecondary,
                transition: 'color 0.2s ease',
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                fontSize: '11px',
                fontWeight: '500',
                letterSpacing: '0.5px',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = t.accent}
              onMouseLeave={(e) => e.currentTarget.style.color = t.textSecondary}
              title="Play Snake"
            >
              <span style={{ fontSize: '14px' }}>🐍</span>
              GAME
            </button>
            {ThemeToggle && (
              <div style={{ transform: 'scale(0.25)', transformOrigin: 'center', marginRight: '-60px' }}>
                <ThemeToggle
                  checked={!isDarkMode}
                  onChange={toggleTheme}
                />
              </div>
            )}
            <a
              href="https://x.com/KarthikNagpuri"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                fontSize: '12px',
                fontWeight: '500',
                color: '#fff',
                textDecoration: 'none',
                padding: '8px 16px',
                background: t.accent,
                borderRadius: '980px',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = t.accentHover;
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = t.accent;
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Say Hi
            </a>
          </div>

          {/* Mobile: Hamburger */}
          {setMobileMenuOpen && (
            <div
              className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
        </nav>

        {/* Mobile Menu Overlay */}
        {setMobileMenuOpen && (
          <div
            className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}
            style={{ background: t.bg }}
          >
            {sections.map((section) => (
              <div
                key={section.id}
                className="mobile-menu-item"
                style={{
                  color: isActiveSection(section) ? t.accent : t.textSecondary,
                  fontWeight: isActiveSection(section) ? '600' : '400',
                }}
                onClick={() => {
                  handleNavClick(section);
                  setMobileMenuOpen(false);
                }}
              >
                {section.label}
              </div>
            ))}
            <a
              href="https://x.com/KarthikNagpuri"
              target="_blank"
              rel="noopener noreferrer"
              className="mobile-menu-item"
              style={{ color: t.accent, marginTop: '16px' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              SAY HI →
            </a>
            {/* Mobile Reading Log */}
            <button
              onClick={() => {
                handleReadingClick();
                setMobileMenuOpen(false);
              }}
              className="mobile-menu-item"
              style={{
                background: 'none',
                border: 'none',
                color: t.textSecondary,
                marginTop: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              📚 Reading Log
            </button>
            {/* Mobile Snake Game */}
            <button
              onClick={() => {
                handleGameClick();
                setMobileMenuOpen(false);
              }}
              className="mobile-menu-item"
              style={{
                background: 'none',
                border: 'none',
                color: t.textSecondary,
                marginTop: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              🐍 Snake Game
            </button>
            {/* Mobile Theme Toggle */}
            {toggleTheme && (
              <button
                onClick={() => {
                  toggleTheme();
                  setMobileMenuOpen(false);
                }}
                className="mobile-menu-item"
                style={{
                  background: 'none',
                  border: 'none',
                  color: t.textSecondary,
                  marginTop: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
            )}
          </div>
        )}
      </>
    );
  }

  // Blog page navbar (sticky, simpler)
  return (
    <>
      <style>{`
        .nav-item {
          position: relative;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 8px 0;
          min-height: 44px;
          display: flex;
          align-items: center;
        }
        .nav-item::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 0;
          width: 0;
          height: 1px;
          background: ${t.accent};
          transition: width 0.3s ease;
        }
        @media (hover: hover) {
          .nav-item:hover::after {
            width: 100%;
          }
        }
        .nav-desktop {
          display: none;
        }
        @media (min-width: 768px) {
          .nav-desktop {
            display: flex;
          }
        }
      `}</style>

      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${t.border}`,
        padding: '0 24px',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '56px',
        }}>
          <Link
            to="/"
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '16px',
              fontWeight: '600',
              letterSpacing: '3px',
              color: t.text,
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            Zero
          </Link>

          <div className="nav-desktop" style={{
            gap: '32px',
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
            fontSize: '12px',
            fontWeight: '400',
            letterSpacing: '0.5px',
          }}>
            {sections.map((section) => (
              <span
                key={section.id}
                className="nav-item"
                onClick={() => handleNavClick(section)}
                style={{
                  color: isActiveSection(section) ? t.accent : t.textSecondary,
                  fontWeight: isActiveSection(section) ? '600' : '400',
                }}
              >
                {section.label}
              </span>
            ))}
          </div>

          <div className="nav-desktop" style={{ gap: '16px', alignItems: 'center' }}>
            {/* Reading Log Button */}
            <button
              onClick={handleReadingClick}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                color: t.textSecondary,
                transition: 'color 0.2s ease',
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                fontSize: '11px',
                fontWeight: '500',
                letterSpacing: '0.5px',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = t.accent}
              onMouseLeave={(e) => e.currentTarget.style.color = t.textSecondary}
              title="Reading Log"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              READING
            </button>
            {/* Snake Game Button */}
            <button
              onClick={handleGameClick}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                color: t.textSecondary,
                transition: 'color 0.2s ease',
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                fontSize: '11px',
                fontWeight: '500',
                letterSpacing: '0.5px',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = t.accent}
              onMouseLeave={(e) => e.currentTarget.style.color = t.textSecondary}
              title="Play Snake"
            >
              <span style={{ fontSize: '14px' }}>🐍</span>
              GAME
            </button>
            <a
              href="https://x.com/KarthikNagpuri"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                fontSize: '12px',
                fontWeight: '500',
                color: '#fff',
                textDecoration: 'none',
                padding: '8px 16px',
                background: t.accent,
                borderRadius: '980px',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = t.accentHover;
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = t.accent;
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Say Hi
            </a>
          </div>
        </div>
      </nav>
    </>
  );
}
