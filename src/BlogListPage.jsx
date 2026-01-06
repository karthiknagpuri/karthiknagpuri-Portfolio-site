import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBlog } from './BlogContext';
import Navbar from './components/Navbar';

// Theme configuration - matching App.jsx
const theme = {
  bg: '#000000',
  bgSecondary: '#0A0A0A',
  text: '#F5F5F7',
  textSecondary: '#86868B',
  textMuted: '#6E6E73',
  accent: '#C4785A',
  accentHover: '#D68B6A',
  accentBg: 'rgba(196,120,90,0.12)',
  border: 'rgba(255,255,255,0.1)',
  cardBg: 'rgba(255,255,255,0.03)',
  cardBorder: 'rgba(255,255,255,0.1)',
};

export default function BlogListPage() {
  const { getPublishedPosts, isLoaded } = useBlog();
  const posts = getPublishedPosts();
  const [hoveredId, setHoveredId] = useState(null);

  if (!isLoaded) {
    return (
      <div style={{
        minHeight: '100dvh',
        background: theme.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '13px',
          color: theme.textMuted,
          letterSpacing: '2px',
        }}>
          LOADING...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: theme.bg,
    }}>
      <Navbar isBlogPage={true} />

      {/* Header */}
      <header style={{
        maxWidth: '720px',
        margin: '0 auto',
        padding: '40px 16px 20px',
        borderBottom: `1px solid ${theme.border}`,
      }}>
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '10px',
          letterSpacing: '2px',
          color: theme.accent,
          marginBottom: '12px',
        }}>
          BLOG
        </div>

        <h1 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: 'clamp(28px, 7vw, 48px)',
          fontWeight: '400',
          fontStyle: 'italic',
          color: theme.text,
          marginBottom: '12px',
          lineHeight: '1.15',
        }}>
          Thoughts & reflections
        </h1>

        <p style={{
          fontFamily: "'Source Serif 4', serif",
          fontSize: 'clamp(15px, 4vw, 18px)',
          color: theme.textSecondary,
          lineHeight: '1.6',
        }}>
          Essays on building, philosophy, and the journey of being Zero.
        </p>
      </header>

      {/* Blog Posts */}
      <main style={{
        maxWidth: '720px',
        margin: '0 auto',
        padding: '24px 0 60px',
      }}>
        {posts.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 16px',
          }}>
            <p style={{
              fontFamily: "'Source Serif 4', serif",
              fontSize: '16px',
              color: theme.textMuted,
            }}>
              No posts yet. Check back soon.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                style={{
                  textDecoration: 'none',
                  WebkitTapHighlightColor: 'transparent',
                }}
                onMouseEnter={() => setHoveredId(post.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <article
                  style={{
                    padding: 'clamp(16px, 4vw, 32px)',
                    background: hoveredId === post.id ? theme.accentBg : theme.cardBg,
                    border: `1px solid ${hoveredId === post.id ? theme.accent + '50' : theme.cardBorder}`,
                    borderRadius: '2px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    alignItems: 'center',
                    marginBottom: '12px',
                  }}>
                    <span style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '9px',
                      letterSpacing: '1px',
                      color: theme.accent,
                      padding: '4px 8px',
                      background: theme.accentBg,
                    }}>
                      {post.category}
                    </span>
                    <span style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '9px',
                      color: theme.textMuted,
                    }}>
                      {post.date} · {post.readTime}
                    </span>
                  </div>

                  <h2 style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontSize: 'clamp(18px, 5vw, 24px)',
                    fontWeight: '400',
                    fontStyle: 'italic',
                    marginBottom: '10px',
                    color: theme.text,
                    lineHeight: '1.3',
                  }}>
                    {post.title}
                  </h2>

                  <p style={{
                    fontFamily: "'Source Serif 4', serif",
                    fontSize: 'clamp(14px, 3.5vw, 15px)',
                    lineHeight: '1.65',
                    color: theme.textSecondary,
                    marginBottom: '12px',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {post.excerpt || (post.content ? post.content.replace(/[#*`]/g, '').slice(0, 160) + '...' : '')}
                  </p>

                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '10px',
                    color: theme.accent,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    Read more <span>→</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        maxWidth: '720px',
        margin: '0 auto',
        padding: '24px 0 32px',
        borderTop: `1px solid ${theme.border}`,
        textAlign: 'center',
      }}>
        <Link
          to="/"
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '11px',
            letterSpacing: '1px',
            color: theme.textMuted,
            textDecoration: 'none',
            padding: '12px 16px',
            display: 'inline-block',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          ← BACK TO HOME
        </Link>
      </footer>
    </div>
  );
}
