import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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

// Render markdown content to React elements - Mobile optimized
function renderMarkdown(content) {
  if (!content) return null;

  const elements = [];
  let keyIndex = 0;

  // Split by double newlines to get paragraphs/blocks
  const blocks = content.split(/\n\n+/);

  const renderInline = (text) => {
    if (!text) return null;

    let result = text;
    // Convert single newlines to <br> tags
    result = result.replace(/\n/g, '<br/>');
    result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;height:auto;border-radius:4px;margin:12px 0;display:block;" />');
    result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#C4785A;text-decoration:underline;word-break:break-word;">$1</a>');
    result = result.replace(/\*\*\*(.*?)\*\*\*/g, '<b><i>$1</i></b>');
    result = result.replace(/\*\*(.*?)\*\*/g, '<b style="color:#F5F2EB">$1</b>');
    result = result.replace(/\*(.*?)\*/g, '<i>$1</i>');
    result = result.replace(/`(.*?)`/g, '<code style="background:rgba(255,255,255,0.08);padding:2px 5px;border-radius:3px;font-family:monospace;font-size:0.85em;color:#C4785A;word-break:break-word;">$1</code>');

    return <span dangerouslySetInnerHTML={{ __html: result }} />;
  };

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // Horizontal rule
    if (trimmed === '---' || trimmed === '***') {
      elements.push(
        <hr key={`hr-${keyIndex++}`} style={{
          border: 'none',
          borderTop: '1px solid rgba(255,255,255,0.12)',
          margin: 'clamp(24px, 6vw, 40px) 0',
        }} />
      );
      continue;
    }

    // Blockquote (can be multi-line)
    if (trimmed.startsWith('> ')) {
      const quoteContent = trimmed.split('\n').map(line =>
        line.startsWith('> ') ? line.slice(2) : line
      ).join('\n');
      elements.push(
        <blockquote key={`bq-${keyIndex++}`} style={{
          borderLeft: '2px solid #C4785A',
          paddingLeft: 'clamp(12px, 4vw, 20px)',
          margin: 'clamp(20px, 5vw, 28px) 0',
          fontStyle: 'italic',
          color: '#A0A0A0',
          lineHeight: '1.7',
        }}>
          {renderInline(quoteContent)}
        </blockquote>
      );
      continue;
    }

    // H3 Header
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${keyIndex++}`} style={{
          fontFamily: "'Source Serif 4', serif",
          fontSize: 'clamp(17px, 4.5vw, 20px)',
          fontWeight: '600',
          color: '#F5F2EB',
          marginTop: 'clamp(28px, 6vw, 36px)',
          marginBottom: 'clamp(12px, 3vw, 16px)',
          lineHeight: '1.4',
        }}>
          {trimmed.slice(4)}
        </h3>
      );
      continue;
    }

    // H2 Header
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${keyIndex++}`} style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: 'clamp(20px, 5.5vw, 26px)',
          fontStyle: 'italic',
          color: '#F5F2EB',
          marginTop: 'clamp(32px, 7vw, 44px)',
          marginBottom: 'clamp(14px, 4vw, 20px)',
          lineHeight: '1.3',
        }}>
          {trimmed.slice(3)}
        </h2>
      );
      continue;
    }

    // H1 Header
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${keyIndex++}`} style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: 'clamp(24px, 6vw, 32px)',
          fontStyle: 'italic',
          color: '#F5F2EB',
          marginTop: 'clamp(36px, 8vw, 48px)',
          marginBottom: 'clamp(16px, 4vw, 24px)',
          lineHeight: '1.2',
        }}>
          {trimmed.slice(2)}
        </h1>
      );
      continue;
    }

    // Unordered list
    const lines = trimmed.split('\n');
    if (lines[0].startsWith('- ') || lines[0].startsWith('* ')) {
      const listItems = lines
        .filter(line => line.startsWith('- ') || line.startsWith('* '))
        .map(line => line.slice(2));
      elements.push(
        <ul key={`ul-${keyIndex++}`} style={{
          marginBottom: 'clamp(16px, 4vw, 24px)',
          paddingLeft: 'clamp(20px, 5vw, 28px)',
          color: '#D0D0D0',
        }}>
          {listItems.map((item, i) => (
            <li key={i} style={{
              marginBottom: '10px',
              paddingLeft: '6px',
              color: '#D0D0D0',
              lineHeight: '1.7',
            }}>
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(lines[0])) {
      const listItems = lines
        .filter(line => /^\d+\.\s/.test(line))
        .map(line => line.replace(/^\d+\.\s/, ''));
      elements.push(
        <ol key={`ol-${keyIndex++}`} style={{
          marginBottom: 'clamp(16px, 4vw, 24px)',
          paddingLeft: 'clamp(20px, 5vw, 28px)',
          color: '#D0D0D0',
        }}>
          {listItems.map((item, i) => (
            <li key={i} style={{
              marginBottom: '10px',
              paddingLeft: '6px',
              color: '#D0D0D0',
              lineHeight: '1.7',
            }}>
              {renderInline(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Regular paragraph - single newlines become <br>
    elements.push(
      <p key={`p-${keyIndex++}`} style={{
        marginBottom: 'clamp(16px, 4vw, 24px)',
        color: '#D0D0D0',
        lineHeight: '1.75',
      }}>
        {renderInline(trimmed)}
      </p>
    );
  }

  return elements;
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { getPostBySlug, fetchPostContent, verifyPostPassword, isLoaded } = useBlog();
  const [passwordInput, setPasswordInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);

  const post = getPostBySlug(slug);

  // Fetch full content when post is found but content is missing
  useEffect(() => {
    if (post && !post.content && !contentLoading) {
      setContentLoading(true);
      fetchPostContent(slug).finally(() => setContentLoading(false));
    }
  }, [post, slug, contentLoading, fetchPostContent]);

  // Check if post needs password
  const needsPassword = post?.visibility === 'password' && !isUnlocked;

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (verifyPostPassword(post.id, passwordInput)) {
      setIsUnlocked(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

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

  if (!post) {
    return (
      <div style={{
        minHeight: '100dvh',
        background: theme.bg,
        padding: '0 16px',
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '60px 0',
          textAlign: 'center',
        }}>
          <Link
            to="/blog"
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '11px',
              letterSpacing: '1px',
              color: theme.textMuted,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '12px 0',
              marginBottom: '40px',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            ← BACK TO BLOG
          </Link>

          <h2 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: 'clamp(24px, 6vw, 32px)',
            fontStyle: 'italic',
            color: theme.text,
            marginBottom: '12px',
          }}>
            Post not found
          </h2>

          <p style={{
            color: theme.textMuted,
            fontSize: '15px',
            marginBottom: '24px',
          }}>
            This post may have been deleted or doesn't exist.
          </p>

          <Link
            to="/blog"
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '11px',
              letterSpacing: '1px',
              color: theme.accent,
              textDecoration: 'none',
              padding: '12px',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            View all posts →
          </Link>
        </div>
      </div>
    );
  }

  // Password protected post - show password form
  if (needsPassword) {
    return (
      <div style={{
        minHeight: '100dvh',
        background: theme.bg,
        padding: '0 16px',
      }}>
        <div style={{
          maxWidth: '360px',
          margin: '0 auto',
          padding: '60px 0',
          textAlign: 'center',
        }}>
          <Link
            to="/blog"
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '11px',
              letterSpacing: '1px',
              color: theme.textMuted,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '12px 0',
              marginBottom: '40px',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            ← BACK TO BLOG
          </Link>

          <div style={{
            width: '56px',
            height: '56px',
            margin: '0 auto 20px',
            background: 'rgba(155,89,182,0.1)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
          }}>
            🔒
          </div>

          <h2 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: 'clamp(22px, 5.5vw, 28px)',
            fontStyle: 'italic',
            color: theme.text,
            marginBottom: '10px',
            lineHeight: '1.3',
          }}>
            {post.title}
          </h2>

          <p style={{
            color: theme.textSecondary,
            fontSize: '15px',
            marginBottom: '28px',
            lineHeight: '1.6',
          }}>
            This post is password protected.
          </p>

          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setPasswordError(false);
              }}
              placeholder="Enter password..."
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.03)',
                border: passwordError ? '1px solid #ff6b6b' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '2px',
                color: theme.text,
                fontSize: '16px', // Prevents zoom on iOS
                fontFamily: "'Source Serif 4', serif",
                outline: 'none',
                marginBottom: '12px',
                boxSizing: 'border-box',
                WebkitAppearance: 'none',
              }}
            />

            {passwordError && (
              <p style={{
                color: '#ff6b6b',
                fontSize: '13px',
                marginBottom: '12px',
                fontFamily: "'Space Mono', monospace",
              }}>
                Incorrect password.
              </p>
            )}

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '14px 24px',
                background: '#9b59b6',
                border: 'none',
                borderRadius: '2px',
                color: '#fff',
                fontSize: '13px',
                fontFamily: "'Space Mono', monospace",
                letterSpacing: '1px',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              UNLOCK POST
            </button>
          </form>
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

      <div style={{
        maxWidth: '640px',
        margin: '0 auto',
        padding: '40px 16px 60px',
      }}>
        {/* Header */}
        <header style={{ marginBottom: 'clamp(32px, 7vw, 48px)' }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            alignItems: 'center',
            marginBottom: '16px',
          }}>
            <span style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '9px',
              letterSpacing: '1.5px',
              color: theme.accent,
              background: 'rgba(196,120,90,0.1)',
              padding: '5px 10px',
            }}>
              {post.category}
            </span>
            <span style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '10px',
              color: theme.textMuted,
            }}>
              {post.date} · {post.readTime}
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: 'clamp(26px, 7vw, 42px)', // Responsive
            fontStyle: 'italic',
            color: theme.text,
            lineHeight: '1.15',
            marginBottom: '20px',
            wordBreak: 'break-word',
          }}>
            {post.title}
          </h1>

          {post.excerpt && (
            <p style={{
              fontFamily: "'Source Serif 4', serif",
              fontSize: 'clamp(16px, 4.5vw, 19px)', // Responsive
              color: theme.textSecondary,
              lineHeight: '1.6',
              borderLeft: '2px solid #C4785A',
              paddingLeft: 'clamp(12px, 4vw, 20px)',
            }}>
              {post.excerpt}
            </p>
          )}
        </header>

        {/* Content */}
        <article style={{
          fontFamily: "'Source Serif 4', serif",
          fontSize: 'clamp(16px, 4.2vw, 18px)', // Responsive
          lineHeight: '1.75',
          color: '#D0D0D0',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
        }}>
          {contentLoading ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 0',
              color: theme.textMuted,
              fontFamily: "'Space Mono', monospace",
              fontSize: '12px',
            }}>
              Loading content...
            </div>
          ) : (
            renderMarkdown(post.content)
          )}
        </article>

        {/* Footer */}
        <footer style={{
          marginTop: 'clamp(40px, 10vw, 64px)',
          paddingTop: '24px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}>
          <Link
            to="/blog"
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '11px',
              letterSpacing: '1px',
              color: theme.textMuted,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '12px 0', // Touch target
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            ← BACK TO BLOG
          </Link>
        </footer>
      </div>
    </div>
  );
}
