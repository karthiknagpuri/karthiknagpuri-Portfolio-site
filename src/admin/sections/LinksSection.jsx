import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const LinksSection = () => {
  const [links, setLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    category: 'social',
    icon: '',
    is_visible: true,
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
  };

  const categories = [
    { value: 'social', label: 'Social Media' },
    { value: 'portfolio', label: 'Portfolio' },
    { value: 'contact', label: 'Contact' },
    { value: 'other', label: 'Other' },
  ];

  const iconOptions = [
    'TWITTER', 'LINKEDIN', 'GITHUB', 'INSTAGRAM',
    'YOUTUBE', 'EMAIL', 'WEBSITE', 'SUBSTACK',
    'MEDIUM', 'DRIBBBLE', 'BEHANCE', 'LINK'
  ];

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.log('Links table may not exist yet:', error);
      setLinks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        const { error } = await supabase
          .from('links')
          .update({
            title: formData.title,
            url: formData.url,
            category: formData.category,
            icon: formData.icon,
            is_visible: formData.is_visible,
            updated_at: new Date().toISOString(),
          })
          .eq('id', isEditing);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('links')
          .insert([{
            ...formData,
            display_order: links.length,
          }]);

        if (error) throw error;
      }

      fetchLinks();
      resetForm();
    } catch (error) {
      console.error('Error saving link:', error);
      alert('Error saving link. Make sure the links table exists in Supabase.');
    }
  };

  const deleteLink = async (id) => {
    if (!confirm('Are you sure you want to delete this link?')) return;

    try {
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchLinks();
    } catch (error) {
      console.error('Error deleting link:', error);
    }
  };

  const editLink = (link) => {
    setIsEditing(link.id);
    setFormData({
      title: link.title,
      url: link.url,
      category: link.category,
      icon: link.icon || '',
      is_visible: link.is_visible,
    });
  };

  const resetForm = () => {
    setIsEditing(null);
    setFormData({
      title: '',
      url: '',
      category: 'social',
      icon: '',
      is_visible: true,
    });
  };

  const toggleVisibility = async (link) => {
    try {
      const { error } = await supabase
        .from('links')
        .update({ is_visible: !link.is_visible })
        .eq('id', link.id);

      if (error) throw error;
      fetchLinks();
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: '24px',
          fontStyle: 'italic',
          color: theme.text,
          margin: '0 0 4px 0',
        }}>
          Links
        </h1>
        <p style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '12px',
          color: theme.textMuted,
          margin: 0,
        }}>
          Manage your social media and portfolio links
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Form */}
        <div style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: '12px',
          padding: '24px',
        }}>
          <h2 style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '12px',
            color: theme.textMuted,
            letterSpacing: '2px',
            margin: '0 0 20px 0',
          }}>
            {isEditing ? 'EDIT LINK' : 'ADD NEW LINK'}
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                color: theme.textMuted,
                marginBottom: '8px',
                letterSpacing: '1px',
              }}>
                TITLE
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                style={{
                  width: '100%',
                  background: theme.bg,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '6px',
                  padding: '12px',
                  color: theme.text,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
                placeholder="e.g., Twitter"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                color: theme.textMuted,
                marginBottom: '8px',
                letterSpacing: '1px',
              }}>
                URL
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                required
                style={{
                  width: '100%',
                  background: theme.bg,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '6px',
                  padding: '12px',
                  color: theme.text,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
                placeholder="https://..."
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                color: theme.textMuted,
                marginBottom: '8px',
                letterSpacing: '1px',
              }}>
                CATEGORY
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{
                  width: '100%',
                  background: theme.bg,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '6px',
                  padding: '12px',
                  color: theme.text,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                color: theme.textMuted,
                marginBottom: '8px',
                letterSpacing: '1px',
              }}>
                ICON
              </label>
              <select
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                style={{
                  width: '100%',
                  background: theme.bg,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '6px',
                  padding: '12px',
                  color: theme.text,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">Select icon...</option>
                {iconOptions.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
            </div>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: "'Space Mono', monospace",
              fontSize: '12px',
              color: theme.textMuted,
              marginBottom: '20px',
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={formData.is_visible}
                onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
              />
              Visible on site
            </label>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  background: theme.accent,
                  color: theme.bg,
                  border: 'none',
                  borderRadius: '6px',
                  padding: '12px',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '12px',
                  cursor: 'pointer',
                  letterSpacing: '1px',
                }}
              >
                {isEditing ? 'UPDATE' : 'ADD'} LINK
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    background: 'none',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '6px',
                    padding: '12px 20px',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '12px',
                    color: theme.textMuted,
                    cursor: 'pointer',
                  }}
                >
                  CANCEL
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List */}
        <div style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${theme.border}`,
          }}>
            <h2 style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '12px',
              color: theme.textMuted,
              letterSpacing: '2px',
              margin: 0,
            }}>
              ALL LINKS ({links.length})
            </h2>
          </div>

          {isLoading ? (
            <div style={{
              padding: '48px',
              textAlign: 'center',
              fontFamily: "'Space Mono', monospace",
              fontSize: '13px',
              color: theme.textMuted,
            }}>
              Loading...
            </div>
          ) : links.length === 0 ? (
            <div style={{
              padding: '48px',
              textAlign: 'center',
              fontFamily: "'Space Mono', monospace",
              fontSize: '13px',
              color: theme.textMuted,
            }}>
              No links yet. Add your first one!
            </div>
          ) : (
            <div>
              {links.map((link, index) => (
                <div
                  key={link.id}
                  style={{
                    padding: '16px 20px',
                    borderBottom: index < links.length - 1 ? `1px solid ${theme.border}` : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                    opacity: link.is_visible ? 1 : 0.5,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '4px',
                    }}>
                      {link.icon && (
                        <span style={{
                          fontFamily: "'Space Mono', monospace",
                          fontSize: '10px',
                          color: theme.accent,
                        }}>
                          {link.icon}
                        </span>
                      )}
                      <span style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '13px',
                        color: theme.text,
                      }}>
                        {link.title}
                      </span>
                      {!link.is_visible && (
                        <span style={{
                          background: theme.textMuted,
                          color: theme.bg,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontFamily: "'Space Mono', monospace",
                          fontSize: '9px',
                          letterSpacing: '0.5px',
                        }}>
                          HIDDEN
                        </span>
                      )}
                    </div>
                    <div style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '11px',
                      color: theme.textMuted,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {link.url}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => toggleVisibility(link)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: theme.teal,
                        cursor: 'pointer',
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '11px',
                        padding: '4px',
                      }}
                    >
                      {link.is_visible ? 'HIDE' : 'SHOW'}
                    </button>
                    <button
                      onClick={() => editLink(link)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: theme.accent,
                        cursor: 'pointer',
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '11px',
                        padding: '4px',
                      }}
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => deleteLink(link.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: theme.danger,
                        cursor: 'pointer',
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '11px',
                        padding: '4px',
                      }}
                    >
                      DELETE
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinksSection;
