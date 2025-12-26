import React from 'react';
import { useBlog } from './BlogContext';

// Simple markdown parser for basic formatting
function parseMarkdown(text) {
  if (!text) return '';

  // Split into lines and process
  const lines = text.split('\n');
  const result = [];
  let inList = false;
  let listItems = [];
  let listType = null;

  const processLine = (line, index) => {
    // Headers
    if (line.startsWith('### ')) {
      return <h3 key={index} style={styles.h3}>{line.slice(4)}</h3>;
    }
    if (line.startsWith('## ')) {
      return <h2 key={index} style={styles.h2}>{line.slice(3)}</h2>;
    }
    if (line.startsWith('# ')) {
      return <h1 key={index} style={styles.h1}>{line.slice(2)}</h1>;
    }

    // Process inline formatting
    const processInline = (text) => {
      // Bold and italic
      let processed = text
        .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>');
      return processed;
    };

    // Unordered list
    if (line.startsWith('- ')) {
      return { type: 'ul', content: processInline(line.slice(2)) };
    }

    // Ordered list
    const orderedMatch = line.match(/^(\d+)\.\s(.+)/);
    if (orderedMatch) {
      return { type: 'ol', content: processInline(orderedMatch[2]) };
    }

    // Empty line
    if (line.trim() === '') {
      return <br key={index} />;
    }

    // Regular paragraph
    return (
      <p
        key={index}
        style={styles.paragraph}
        dangerouslySetInnerHTML={{ __html: processInline(line) }}
      />
    );
  };

  lines.forEach((line, index) => {
    const processed = processLine(line, index);

    if (processed && typeof processed === 'object' && processed.type) {
      if (!inList || listType !== processed.type) {
        if (inList && listItems.length > 0) {
          const ListTag = listType === 'ol' ? 'ol' : 'ul';
          result.push(
            <ListTag key={`list-${index}`} style={styles.list}>
              {listItems.map((item, i) => (
                <li key={i} style={styles.listItem} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ListTag>
          );
          listItems = [];
        }
        inList = true;
        listType = processed.type;
      }
      listItems.push(processed.content);
    } else {
      if (inList && listItems.length > 0) {
        const ListTag = listType === 'ol' ? 'ol' : 'ul';
        result.push(
          <ListTag key={`list-${index}`} style={styles.list}>
            {listItems.map((item, i) => (
              <li key={i} style={styles.listItem} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ListTag>
        );
        listItems = [];
        inList = false;
        listType = null;
      }
      if (processed) {
        result.push(processed);
      }
    }
  });

  // Handle any remaining list items
  if (inList && listItems.length > 0) {
    const ListTag = listType === 'ol' ? 'ol' : 'ul';
    result.push(
      <ListTag key="list-final" style={styles.list}>
        {listItems.map((item, i) => (
          <li key={i} style={styles.listItem} dangerouslySetInnerHTML={{ __html: item }} />
        ))}
      </ListTag>
    );
  }

  return result;
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: '#0D0D0D',
    zIndex: 2000,
    overflow: 'auto',
  },
  container: {
    maxWidth: '720px',
    margin: '0 auto',
    padding: '24px',
    minHeight: '100vh',
  },
  header: {
    marginBottom: '48px',
    paddingTop: '24px',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#A0A0A0',
    cursor: 'pointer',
    fontFamily: "'Space Mono', monospace",
    fontSize: '12px',
    letterSpacing: '1px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 0',
    marginBottom: '32px',
    transition: 'color 0.3s ease',
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  category: {
    fontFamily: "'Space Mono', monospace",
    fontSize: '10px',
    letterSpacing: '2px',
    color: '#C4785A',
    background: 'rgba(196,120,90,0.1)',
    padding: '6px 12px',
  },
  date: {
    fontFamily: "'Space Mono', monospace",
    fontSize: '12px',
    color: '#666',
  },
  readTime: {
    fontFamily: "'Space Mono', monospace",
    fontSize: '12px',
    color: '#666',
  },
  title: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: 'clamp(32px, 6vw, 48px)',
    fontStyle: 'italic',
    color: '#F5F2EB',
    lineHeight: '1.2',
    marginBottom: '24px',
  },
  excerpt: {
    fontFamily: "'Source Serif 4', serif",
    fontSize: '20px',
    color: '#A0A0A0',
    lineHeight: '1.6',
    borderLeft: '2px solid #C4785A',
    paddingLeft: '20px',
    marginBottom: '48px',
  },
  content: {
    color: '#D0D0D0',
    fontFamily: "'Source Serif 4', serif",
    fontSize: '18px',
    lineHeight: '1.8',
  },
  h1: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: '36px',
    fontStyle: 'italic',
    color: '#F5F2EB',
    marginTop: '48px',
    marginBottom: '24px',
  },
  h2: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: '28px',
    fontStyle: 'italic',
    color: '#F5F2EB',
    marginTop: '40px',
    marginBottom: '20px',
  },
  h3: {
    fontFamily: "'Source Serif 4', serif",
    fontSize: '22px',
    fontWeight: '600',
    color: '#F5F2EB',
    marginTop: '32px',
    marginBottom: '16px',
  },
  paragraph: {
    marginBottom: '20px',
  },
  list: {
    marginBottom: '24px',
    paddingLeft: '24px',
  },
  listItem: {
    marginBottom: '8px',
    paddingLeft: '8px',
  },
  footer: {
    marginTop: '64px',
    paddingTop: '32px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  editBtn: {
    background: 'none',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#A0A0A0',
    padding: '10px 20px',
    cursor: 'pointer',
    fontFamily: "'Space Mono', monospace",
    fontSize: '11px',
    letterSpacing: '1px',
    transition: 'all 0.3s ease',
  },
  notFound: {
    textAlign: 'center',
    padding: '100px 20px',
  },
};

export default function BlogPost({ postId, onClose, onEdit, showEditButton = false }) {
  const { getPost } = useBlog();
  const post = getPost(postId);

  if (!post) {
    return (
      <div style={styles.overlay}>
        <div style={styles.container}>
          <button
            style={styles.backBtn}
            onClick={onClose}
            onMouseEnter={(e) => e.target.style.color = '#C4785A'}
            onMouseLeave={(e) => e.target.style.color = '#A0A0A0'}
          >
            ← BACK
          </button>
          <div style={styles.notFound}>
            <h2 style={{ ...styles.title, fontSize: '32px' }}>Post not found</h2>
            <p style={{ color: '#666' }}>This post may have been deleted or doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <button
            style={styles.backBtn}
            onClick={onClose}
            onMouseEnter={(e) => e.target.style.color = '#C4785A'}
            onMouseLeave={(e) => e.target.style.color = '#A0A0A0'}
          >
            ← BACK TO WRITING
          </button>

          <div style={styles.meta}>
            <span style={styles.category}>{post.category}</span>
            <span style={styles.date}>{post.date}</span>
            <span style={styles.readTime}>{post.readTime} read</span>
          </div>

          <h1 style={styles.title}>{post.title}</h1>

          <p style={styles.excerpt}>{post.excerpt}</p>
        </div>

        {/* Content */}
        <article style={styles.content}>
          {parseMarkdown(post.content)}
        </article>

        {/* Footer */}
        <div style={styles.footer}>
          <button
            style={styles.backBtn}
            onClick={onClose}
            onMouseEnter={(e) => e.target.style.color = '#C4785A'}
            onMouseLeave={(e) => e.target.style.color = '#A0A0A0'}
          >
            ← BACK TO WRITING
          </button>

          {showEditButton && onEdit && (
            <button
              style={styles.editBtn}
              onClick={() => onEdit(post.id)}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#C4785A';
                e.target.style.color = '#C4785A';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                e.target.style.color = '#A0A0A0';
              }}
            >
              EDIT POST
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
