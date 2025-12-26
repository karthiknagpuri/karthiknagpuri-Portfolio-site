import React, { useState } from 'react';
import { useBlog } from '../../BlogContext';

const CATEGORIES = ['ECOSYSTEM', 'STARTUP', 'JOURNEY', 'TECH', 'PERSONAL', 'INSIGHTS'];

const BlogSection = () => {
  const { posts, createPost, updatePost, deletePost, togglePublish } = useBlog();
  const [view, setView] = useState('list');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'ECOSYSTEM',
    published: false,
    featured: false,
  });

  const theme = {
    bg: '#0a0a0a',
    surface: '#141414',
    border: 'rgba(255,255,255,0.1)',
    text: '#ffffff',
    textMuted: '#888888',
    accent: '#C4785A',
    teal: '#4ECDC4',
    danger: '#FF6B6B',
    yellow: '#FFE66D',
  };

  const handleEdit = (post) => {
    setFormData(post);
    setSelectedPost(post);
    setView('edit');
  };

  const handleCreate = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      category: 'ECOSYSTEM',
      published: false,
      featured: false,
    });
    setSelectedPost(null);
    setView('create');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (view === 'create') {
      createPost(formData);
    } else {
      updatePost(selectedPost.id, formData);
    }
    setView('list');
  };

  const handleDelete = (id) => {
    deletePost(id);
    setShowDeleteConfirm(null);
  };

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <div>
          <h1 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: '24px',
            fontStyle: 'italic',
            color: theme.text,
            margin: '0 0 4px 0',
          }}>
            {view === 'list' ? 'Blog Posts' : view === 'create' ? 'New Post' : 'Edit Post'}
          </h1>
          <p style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '12px',
            color: theme.textMuted,
            margin: 0,
          }}>
            {view === 'list' ? `${posts.length} post${posts.length !== 1 ? 's' : ''}` : 'Fill in the details below'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {view === 'list' ? (
            <button
              onClick={handleCreate}
              style={{
                background: theme.accent,
                border: 'none',
                borderRadius: '6px',
                padding: '10px 20px',
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                color: theme.bg,
                cursor: 'pointer',
                letterSpacing: '1px',
              }}
            >
              + NEW POST
            </button>
          ) : (
            <button
              onClick={() => setView('list')}
              style={{
                background: 'none',
                border: `1px solid ${theme.border}`,
                borderRadius: '6px',
                padding: '10px 20px',
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                color: theme.textMuted,
                cursor: 'pointer',
                letterSpacing: '1px',
              }}
            >
              ← BACK
            </button>
          )}
        </div>
      </div>

      {/* List View */}
      {view === 'list' && (
        <div style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          {posts.length === 0 ? (
            <div style={{
              padding: '48px',
              textAlign: 'center',
              fontFamily: "'Space Mono', monospace",
              fontSize: '13px',
              color: theme.textMuted,
            }}>
              No blog posts yet. Click "+ NEW POST" to create your first post.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${theme.border}` }}>
                  <th style={{
                    padding: '16px 20px',
                    textAlign: 'left',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '11px',
                    color: theme.textMuted,
                    letterSpacing: '1px',
                    fontWeight: '500',
                  }}>POST</th>
                  <th style={{
                    padding: '16px 20px',
                    textAlign: 'left',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '11px',
                    color: theme.textMuted,
                    letterSpacing: '1px',
                    fontWeight: '500',
                  }}>CATEGORY</th>
                  <th style={{
                    padding: '16px 20px',
                    textAlign: 'left',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '11px',
                    color: theme.textMuted,
                    letterSpacing: '1px',
                    fontWeight: '500',
                  }}>STATUS</th>
                  <th style={{
                    padding: '16px 20px',
                    textAlign: 'left',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '11px',
                    color: theme.textMuted,
                    letterSpacing: '1px',
                    fontWeight: '500',
                  }}>DATE</th>
                  <th style={{
                    padding: '16px 20px',
                    textAlign: 'right',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '11px',
                    color: theme.textMuted,
                    letterSpacing: '1px',
                    fontWeight: '500',
                  }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post, index) => (
                  <tr
                    key={post.id}
                    style={{
                      borderBottom: index < posts.length - 1 ? `1px solid ${theme.border}` : 'none',
                    }}
                  >
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{
                        fontFamily: "'Instrument Serif', serif",
                        fontSize: '15px',
                        color: theme.text,
                        marginBottom: '4px',
                      }}>
                        {post.title}
                      </div>
                      <div style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '11px',
                        color: theme.textMuted,
                      }}>
                        {post.excerpt?.substring(0, 50)}...
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        background: 'rgba(196,120,90,0.1)',
                        color: theme.accent,
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '10px',
                        borderRadius: '4px',
                      }}>
                        {post.category}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        background: post.published ? 'rgba(78,205,196,0.1)' : 'rgba(255,255,255,0.05)',
                        color: post.published ? theme.teal : theme.textMuted,
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '10px',
                        borderRadius: '4px',
                        marginRight: '6px',
                      }}>
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                      {post.featured && (
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          background: 'rgba(255,230,109,0.1)',
                          color: theme.yellow,
                          fontFamily: "'Space Mono', monospace",
                          fontSize: '10px',
                          borderRadius: '4px',
                        }}>
                          Featured
                        </span>
                      )}
                    </td>
                    <td style={{
                      padding: '16px 20px',
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '11px',
                      color: theme.textMuted,
                    }}>
                      {post.date}
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleEdit(post)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: theme.textMuted,
                          cursor: 'pointer',
                          fontFamily: "'Space Mono', monospace",
                          fontSize: '11px',
                          padding: '4px 8px',
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => togglePublish(post.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: theme.teal,
                          cursor: 'pointer',
                          fontFamily: "'Space Mono', monospace",
                          fontSize: '11px',
                          padding: '4px 8px',
                        }}
                      >
                        {post.published ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(post.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: theme.danger,
                          cursor: 'pointer',
                          fontFamily: "'Space Mono', monospace",
                          fontSize: '11px',
                          padding: '4px 8px',
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Create/Edit Form */}
      {(view === 'create' || view === 'edit') && (
        <div style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: '12px',
          padding: '24px',
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                color: theme.textMuted,
                letterSpacing: '1px',
              }}>
                TITLE
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter post title..."
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: theme.bg,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  color: theme.text,
                  fontSize: '15px',
                  fontFamily: "'Instrument Serif', serif",
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                color: theme.textMuted,
                letterSpacing: '1px',
              }}>
                EXCERPT
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief description of the post..."
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: theme.bg,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  color: theme.text,
                  fontSize: '14px',
                  fontFamily: "'Space Mono', monospace",
                  outline: 'none',
                  resize: 'vertical',
                  minHeight: '80px',
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                color: theme.textMuted,
                letterSpacing: '1px',
              }}>
                CONTENT (MARKDOWN SUPPORTED)
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your blog post content here..."
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: theme.bg,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  color: theme.text,
                  fontSize: '14px',
                  fontFamily: "'Space Mono', monospace",
                  outline: 'none',
                  resize: 'vertical',
                  minHeight: '300px',
                  lineHeight: '1.6',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '24px' }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '11px',
                  color: theme.textMuted,
                  letterSpacing: '1px',
                }}>
                  CATEGORY
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{
                    padding: '12px 16px',
                    background: theme.bg,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    color: theme.text,
                    fontSize: '13px',
                    fontFamily: "'Space Mono', monospace",
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '11px',
                  color: theme.textMuted,
                  letterSpacing: '1px',
                }}>
                  OPTIONS
                </label>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.published}
                      onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <span style={{ color: theme.textMuted, fontSize: '13px' }}>Published</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <span style={{ color: theme.textMuted, fontSize: '13px' }}>Featured</span>
                  </label>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                style={{
                  background: theme.accent,
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '12px',
                  color: theme.bg,
                  cursor: 'pointer',
                  letterSpacing: '1px',
                }}
              >
                {view === 'create' ? 'CREATE POST' : 'UPDATE POST'}
              </button>
              <button
                type="button"
                onClick={() => setView('list')}
                style={{
                  background: 'none',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '12px',
                  color: theme.textMuted,
                  cursor: 'pointer',
                  letterSpacing: '1px',
                }}
              >
                CANCEL
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
          onClick={() => setShowDeleteConfirm(null)}
        >
          <div
            style={{
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '400px',
              width: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: '18px',
              fontStyle: 'italic',
              color: theme.text,
              margin: '0 0 12px 0',
            }}>
              Delete Post?
            </h3>
            <p style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '13px',
              color: theme.textMuted,
              margin: '0 0 20px 0',
            }}>
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                style={{
                  background: theme.danger,
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '12px',
                  color: '#fff',
                  cursor: 'pointer',
                  letterSpacing: '1px',
                }}
              >
                DELETE
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                style={{
                  background: 'none',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '12px',
                  color: theme.textMuted,
                  cursor: 'pointer',
                  letterSpacing: '1px',
                }}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogSection;
