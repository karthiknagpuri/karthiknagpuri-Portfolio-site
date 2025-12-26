import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const ResourcesSection = () => {
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('link');
  const [isEditing, setIsEditing] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'link',
    url: '',
    category: 'tools',
    is_featured: false,
  });
  const [uploading, setUploading] = useState(false);

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

  const categories = ['tools', 'books', 'courses', 'templates', 'articles', 'other'];

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.log('Resources table may not exist yet:', error);
      setResources([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        const { error } = await supabase
          .from('resources')
          .update({
            title: formData.title,
            description: formData.description,
            type: formData.type,
            url: formData.url,
            category: formData.category,
            is_featured: formData.is_featured,
            updated_at: new Date().toISOString(),
          })
          .eq('id', isEditing);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('resources')
          .insert([{
            ...formData,
            display_order: resources.length,
          }]);

        if (error) throw error;
      }

      fetchResources();
      resetForm();
    } catch (error) {
      console.error('Error saving resource:', error);
      alert('Error saving resource. Make sure the resources table exists in Supabase.');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('resources')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('resources')
        .getPublicUrl(fileName);

      // Save to database
      const { error: dbError } = await supabase
        .from('resources')
        .insert([{
          title: formData.title || file.name,
          description: formData.description,
          type: 'file',
          url: publicUrl,
          file_path: data.path,
          file_name: file.name,
          file_size: file.size,
          category: formData.category,
          is_featured: formData.is_featured,
          display_order: resources.length,
        }]);

      if (dbError) throw dbError;

      fetchResources();
      resetForm();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Make sure the storage bucket exists.');
    } finally {
      setUploading(false);
    }
  };

  const deleteResource = async (resource) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      // Delete file from storage if it's a file
      if (resource.type === 'file' && resource.file_path) {
        await supabase.storage.from('resources').remove([resource.file_path]);
      }

      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', resource.id);

      if (error) throw error;
      fetchResources();
    } catch (error) {
      console.error('Error deleting resource:', error);
    }
  };

  const editResource = (resource) => {
    setIsEditing(resource.id);
    setFormData({
      title: resource.title,
      description: resource.description || '',
      type: resource.type,
      url: resource.url || '',
      category: resource.category,
      is_featured: resource.is_featured,
    });
    setActiveTab(resource.type);
  };

  const resetForm = () => {
    setIsEditing(null);
    setFormData({
      title: '',
      description: '',
      type: activeTab,
      url: '',
      category: 'tools',
      is_featured: false,
    });
  };

  const filteredResources = resources.filter(r => r.type === activeTab);

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
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
          Resources
        </h1>
        <p style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '12px',
          color: theme.textMuted,
          margin: 0,
        }}>
          Manage links and files you want to share
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
      }}>
        {['link', 'file'].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              resetForm();
            }}
            style={{
              background: activeTab === tab ? theme.accent : 'transparent',
              border: `1px solid ${activeTab === tab ? theme.accent : theme.border}`,
              borderRadius: '6px',
              padding: '10px 20px',
              fontFamily: "'Space Mono', monospace",
              fontSize: '12px',
              color: activeTab === tab ? theme.bg : theme.textMuted,
              cursor: 'pointer',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            {tab}s
          </button>
        ))}
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
            {isEditing ? 'EDIT RESOURCE' : `ADD NEW ${activeTab.toUpperCase()}`}
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
                placeholder="Resource title"
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
                DESCRIPTION
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                style={{
                  width: '100%',
                  background: theme.bg,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '6px',
                  padding: '12px',
                  color: theme.text,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '13px',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
                placeholder="Brief description"
              />
            </div>

            {activeTab === 'link' && (
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
                  required={activeTab === 'link'}
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
            )}

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
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
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
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
              />
              Featured resource
            </label>

            <div style={{ display: 'flex', gap: '12px' }}>
              {activeTab === 'link' ? (
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
              ) : (
                <label style={{
                  flex: 1,
                  background: theme.accent,
                  color: theme.bg,
                  border: 'none',
                  borderRadius: '6px',
                  padding: '12px',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '12px',
                  cursor: uploading ? 'wait' : 'pointer',
                  letterSpacing: '1px',
                  textAlign: 'center',
                  opacity: uploading ? 0.7 : 1,
                }}>
                  {uploading ? 'UPLOADING...' : 'UPLOAD FILE'}
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    disabled={uploading}
                  />
                </label>
              )}
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
              {activeTab.toUpperCase()}S ({filteredResources.length})
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
          ) : filteredResources.length === 0 ? (
            <div style={{
              padding: '48px',
              textAlign: 'center',
              fontFamily: "'Space Mono', monospace",
              fontSize: '13px',
              color: theme.textMuted,
            }}>
              No {activeTab}s yet. Add your first one!
            </div>
          ) : (
            <div>
              {filteredResources.map((resource, index) => (
                <div
                  key={resource.id}
                  style={{
                    padding: '16px 20px',
                    borderBottom: index < filteredResources.length - 1 ? `1px solid ${theme.border}` : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '4px',
                    }}>
                      <span style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '13px',
                        color: theme.text,
                      }}>
                        {resource.title}
                      </span>
                      {resource.is_featured && (
                        <span style={{
                          background: theme.teal,
                          color: theme.bg,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontFamily: "'Space Mono', monospace",
                          fontSize: '9px',
                          letterSpacing: '0.5px',
                        }}>
                          FEATURED
                        </span>
                      )}
                    </div>
                    <div style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '11px',
                      color: theme.textMuted,
                    }}>
                      {resource.category} {resource.file_size ? `• ${formatFileSize(resource.file_size)}` : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => editResource(resource)}
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
                      onClick={() => deleteResource(resource)}
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

export default ResourcesSection;
