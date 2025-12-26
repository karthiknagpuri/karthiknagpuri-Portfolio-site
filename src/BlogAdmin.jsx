import React, { useState, useEffect, useRef } from 'react';
import { useBlog } from './BlogContext';

const CATEGORIES = ['ECOSYSTEM', 'STARTUP', 'JOURNEY', 'TECH', 'PERSONAL', 'INSIGHTS'];

export default function BlogAdmin({ onClose, editPostId = null }) {
  const { posts, createPost, updatePost, deletePost, togglePublish, getPost } = useBlog();
  const [view, setView] = useState(editPostId ? 'edit' : 'list'); // 'list', 'create', 'edit'
  const [selectedPost, setSelectedPost] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const initializedRef = useRef(false);

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'ECOSYSTEM',
    published: false,
    featured: false,
  });

  // Initialize form with edit post data
  useEffect(() => {
    if (!editPostId || initializedRef.current) return;

    const post = getPost(editPostId);
    if (post) {
      initializedRef.current = true;
      setFormData(post);
      setSelectedPost(post);
      setView('edit');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editPostId]);

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

  const styles = {
    overlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.95)',
      zIndex: 2000,
      overflow: 'auto',
    },
    container: {
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '24px',
      minHeight: '100vh',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '32px',
      paddingBottom: '16px',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
    },
    title: {
      fontFamily: "'Instrument Serif', serif",
      fontSize: '32px',
      fontStyle: 'italic',
      color: '#F5F2EB',
    },
    closeBtn: {
      background: 'none',
      border: '1px solid rgba(255,255,255,0.2)',
      color: '#A0A0A0',
      padding: '10px 20px',
      cursor: 'pointer',
      fontFamily: "'Space Mono', monospace",
      fontSize: '12px',
      transition: 'all 0.3s ease',
    },
    createBtn: {
      background: '#C4785A',
      border: 'none',
      color: '#0D0D0D',
      padding: '12px 24px',
      cursor: 'pointer',
      fontFamily: "'Space Mono', monospace",
      fontSize: '12px',
      letterSpacing: '1px',
      marginRight: '12px',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      textAlign: 'left',
      padding: '12px 16px',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      fontFamily: "'Space Mono', monospace",
      fontSize: '10px',
      letterSpacing: '1px',
      color: '#666',
      textTransform: 'uppercase',
    },
    td: {
      padding: '16px',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      color: '#A0A0A0',
      fontSize: '14px',
    },
    postTitle: {
      color: '#F5F2EB',
      fontFamily: "'Source Serif 4', serif",
      fontSize: '16px',
      marginBottom: '4px',
    },
    badge: {
      display: 'inline-block',
      padding: '4px 8px',
      fontSize: '10px',
      fontFamily: "'Space Mono', monospace",
      borderRadius: '2px',
      marginRight: '8px',
    },
    actionBtn: {
      background: 'none',
      border: 'none',
      color: '#A0A0A0',
      cursor: 'pointer',
      padding: '8px 12px',
      fontSize: '12px',
      fontFamily: "'Space Mono', monospace",
      transition: 'color 0.3s ease',
    },
    form: {
      maxWidth: '800px',
    },
    formGroup: {
      marginBottom: '24px',
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontFamily: "'Space Mono', monospace",
      fontSize: '11px',
      letterSpacing: '1px',
      color: '#666',
      textTransform: 'uppercase',
    },
    input: {
      width: '100%',
      padding: '14px 16px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.1)',
      color: '#F5F2EB',
      fontSize: '16px',
      fontFamily: "'Source Serif 4', serif",
      outline: 'none',
      transition: 'border-color 0.3s ease',
    },
    textarea: {
      width: '100%',
      padding: '14px 16px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.1)',
      color: '#F5F2EB',
      fontSize: '15px',
      fontFamily: "'Source Serif 4', serif",
      outline: 'none',
      resize: 'vertical',
      lineHeight: '1.7',
    },
    select: {
      padding: '14px 16px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.1)',
      color: '#F5F2EB',
      fontSize: '14px',
      fontFamily: "'Space Mono', monospace",
      outline: 'none',
      cursor: 'pointer',
    },
    checkbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      cursor: 'pointer',
    },
    checkboxInput: {
      width: '20px',
      height: '20px',
      cursor: 'pointer',
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      marginTop: '32px',
    },
    submitBtn: {
      background: '#C4785A',
      border: 'none',
      color: '#0D0D0D',
      padding: '14px 32px',
      cursor: 'pointer',
      fontFamily: "'Space Mono', monospace",
      fontSize: '12px',
      letterSpacing: '1px',
    },
    cancelBtn: {
      background: 'none',
      border: '1px solid rgba(255,255,255,0.2)',
      color: '#A0A0A0',
      padding: '14px 32px',
      cursor: 'pointer',
      fontFamily: "'Space Mono', monospace",
      fontSize: '12px',
    },
    deleteModal: {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: '#1a1a1a',
      border: '1px solid rgba(255,255,255,0.1)',
      padding: '32px',
      zIndex: 3000,
      maxWidth: '400px',
      width: '90%',
    },
    modalOverlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.8)',
      zIndex: 2500,
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#666',
    },
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            {view === 'list' ? 'Blog Admin' : view === 'create' ? 'New Post' : 'Edit Post'}
          </h1>
          <div>
            {view === 'list' && (
              <button style={styles.createBtn} onClick={handleCreate}>
                + NEW POST
              </button>
            )}
            <button
              style={styles.closeBtn}
              onClick={() => view === 'list' ? onClose() : setView('list')}
              onMouseEnter={(e) => e.target.style.borderColor = '#C4785A'}
              onMouseLeave={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
            >
              {view === 'list' ? 'CLOSE' : 'BACK'}
            </button>
          </div>
        </div>

        {/* List View */}
        {view === 'list' && (
          <>
            {posts.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={{ fontSize: '18px', marginBottom: '16px' }}>No blog posts yet</p>
                <button style={styles.createBtn} onClick={handleCreate}>
                  Create your first post
                </button>
              </div>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Post</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map(post => (
                    <tr key={post.id}>
                      <td style={styles.td}>
                        <div style={styles.postTitle}>{post.title}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {post.excerpt.substring(0, 60)}...
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.badge,
                          background: 'rgba(196,120,90,0.1)',
                          color: '#C4785A',
                        }}>
                          {post.category}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.badge,
                          background: post.published ? 'rgba(78,205,196,0.1)' : 'rgba(255,255,255,0.05)',
                          color: post.published ? '#4ECDC4' : '#666',
                        }}>
                          {post.published ? 'Published' : 'Draft'}
                        </span>
                        {post.featured && (
                          <span style={{
                            ...styles.badge,
                            background: 'rgba(255,230,109,0.1)',
                            color: '#FFE66D',
                          }}>
                            Featured
                          </span>
                        )}
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px' }}>
                          {post.date}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <button
                          style={styles.actionBtn}
                          onClick={() => handleEdit(post)}
                          onMouseEnter={(e) => e.target.style.color = '#C4785A'}
                          onMouseLeave={(e) => e.target.style.color = '#A0A0A0'}
                        >
                          Edit
                        </button>
                        <button
                          style={styles.actionBtn}
                          onClick={() => togglePublish(post.id)}
                          onMouseEnter={(e) => e.target.style.color = '#4ECDC4'}
                          onMouseLeave={(e) => e.target.style.color = '#A0A0A0'}
                        >
                          {post.published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          style={styles.actionBtn}
                          onClick={() => setShowDeleteConfirm(post.id)}
                          onMouseEnter={(e) => e.target.style.color = '#ff6b6b'}
                          onMouseLeave={(e) => e.target.style.color = '#A0A0A0'}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        {/* Create/Edit Form */}
        {(view === 'create' || view === 'edit') && (
          <form style={styles.form} onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Title</label>
              <input
                type="text"
                style={styles.input}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter post title..."
                required
                onFocus={(e) => e.target.style.borderColor = '#C4785A'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Excerpt</label>
              <textarea
                style={{ ...styles.textarea, minHeight: '80px' }}
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief description of the post..."
                required
                onFocus={(e) => e.target.style.borderColor = '#C4785A'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Content (Markdown supported)</label>
              <textarea
                style={{ ...styles.textarea, minHeight: '400px' }}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your blog post content here...

Markdown is supported:
# Heading 1
## Heading 2
**bold** and *italic*
- bullet points
1. numbered lists"
                required
                onFocus={(e) => e.target.style.borderColor = '#C4785A'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Category</label>
                <select
                  style={styles.select}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Options</label>
                <div style={{ display: 'flex', gap: '24px' }}>
                  <label style={styles.checkbox}>
                    <input
                      type="checkbox"
                      style={styles.checkboxInput}
                      checked={formData.published}
                      onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    />
                    <span style={{ color: '#A0A0A0', fontSize: '14px' }}>Published</span>
                  </label>
                  <label style={styles.checkbox}>
                    <input
                      type="checkbox"
                      style={styles.checkboxInput}
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    />
                    <span style={{ color: '#A0A0A0', fontSize: '14px' }}>Featured</span>
                  </label>
                </div>
              </div>
            </div>

            <div style={styles.buttonGroup}>
              <button type="submit" style={styles.submitBtn}>
                {view === 'create' ? 'CREATE POST' : 'UPDATE POST'}
              </button>
              <button
                type="button"
                style={styles.cancelBtn}
                onClick={() => setView('list')}
              >
                CANCEL
              </button>
            </div>
          </form>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <>
            <div style={styles.modalOverlay} onClick={() => setShowDeleteConfirm(null)} />
            <div style={styles.deleteModal}>
              <h3 style={{ color: '#F5F2EB', marginBottom: '16px', fontFamily: "'Instrument Serif', serif" }}>
                Delete Post?
              </h3>
              <p style={{ color: '#A0A0A0', marginBottom: '24px', fontSize: '14px' }}>
                This action cannot be undone. The post will be permanently deleted.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  style={{ ...styles.submitBtn, background: '#ff6b6b' }}
                  onClick={() => handleDelete(showDeleteConfirm)}
                >
                  DELETE
                </button>
                <button
                  style={styles.cancelBtn}
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  CANCEL
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
