import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const ExperiencesSection = () => {
  const [experiences, setExperiences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('current');
  const [isEditing, setIsEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    role: '',
    description: '',
    type: 'current',
    status_badge: '',
    color: '#C4785A',
    start_date: '',
    end_date: '',
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

  const badges = ['BUILDING', 'LEADING', 'ENABLING', 'CO-FOUNDING', 'ADVISING', 'CONSULTING'];
  const colors = ['#C4785A', '#4ECDC4', '#FFE66D', '#FF6B6B', '#9B59B6', '#3498DB'];

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setExperiences(data || []);
    } catch (error) {
      console.log('Experiences table may not exist yet:', error);
      setExperiences([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        organization: formData.organization,
        role: formData.role,
        description: formData.description,
        type: formData.type,
        status_badge: formData.status_badge,
        color: formData.color,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        is_visible: formData.is_visible,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('experiences')
          .update({
            ...payload,
            updated_at: new Date().toISOString(),
          })
          .eq('id', isEditing);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('experiences')
          .insert([{
            ...payload,
            display_order: experiences.length,
          }]);

        if (error) throw error;
      }

      fetchExperiences();
      resetForm();
    } catch (error) {
      console.error('Error saving experience:', error);
      alert('Error saving experience. Make sure the experiences table exists in Supabase.');
    }
  };

  const deleteExperience = async (id) => {
    if (!confirm('Are you sure you want to delete this experience?')) return;

    try {
      const { error } = await supabase
        .from('experiences')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchExperiences();
    } catch (error) {
      console.error('Error deleting experience:', error);
    }
  };

  const editExperience = (exp) => {
    setIsEditing(exp.id);
    setFormData({
      title: exp.title,
      organization: exp.organization,
      role: exp.role || '',
      description: exp.description,
      type: exp.type,
      status_badge: exp.status_badge || '',
      color: exp.color || '#C4785A',
      start_date: exp.start_date || '',
      end_date: exp.end_date || '',
      is_visible: exp.is_visible,
    });
    setActiveTab(exp.type);
    setShowForm(true);
  };

  const resetForm = () => {
    setIsEditing(null);
    setShowForm(false);
    setFormData({
      title: '',
      organization: '',
      role: '',
      description: '',
      type: activeTab,
      status_badge: '',
      color: '#C4785A',
      start_date: '',
      end_date: '',
      is_visible: true,
    });
  };

  const toggleVisibility = async (exp) => {
    try {
      const { error } = await supabase
        .from('experiences')
        .update({ is_visible: !exp.is_visible })
        .eq('id', exp.id);

      if (error) throw error;
      fetchExperiences();
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  const filteredExperiences = experiences.filter(e => e.type === activeTab);

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h1 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: '24px',
            fontStyle: 'italic',
            color: theme.text,
            margin: '0 0 4px 0',
          }}>
            Experiences
          </h1>
          <p style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '12px',
            color: theme.textMuted,
            margin: 0,
          }}>
            Manage your current roles, past experiences, and fellowships
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({ ...formData, type: activeTab });
            setShowForm(true);
          }}
          style={{
            background: theme.accent,
            color: theme.bg,
            border: 'none',
            borderRadius: '6px',
            padding: '10px 20px',
            fontFamily: "'Space Mono', monospace",
            fontSize: '12px',
            cursor: 'pointer',
            letterSpacing: '1px',
          }}
        >
          + ADD NEW
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
      }}>
        {['current', 'past', 'fellowship'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
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
            {tab === 'fellowship' ? 'Fellowships' : tab}
          </button>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px',
        }}>
          <div style={{
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
          }}>
            <div style={{
              padding: '24px',
              borderBottom: `1px solid ${theme.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h2 style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: '20px',
                fontStyle: 'italic',
                color: theme.text,
                margin: 0,
              }}>
                {isEditing ? 'Edit Experience' : 'Add New Experience'}
              </h2>
              <button
                onClick={resetForm}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.textMuted,
                  fontSize: '24px',
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '11px',
                    color: theme.textMuted,
                    marginBottom: '8px',
                    letterSpacing: '1px',
                  }}>
                    TITLE / PROJECT *
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
                    placeholder="e.g., EvolveX"
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '11px',
                    color: theme.textMuted,
                    marginBottom: '8px',
                    letterSpacing: '1px',
                  }}>
                    ORGANIZATION *
                  </label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
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
                    placeholder="Company or organization"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '11px',
                    color: theme.textMuted,
                    marginBottom: '8px',
                    letterSpacing: '1px',
                  }}>
                    ROLE
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
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
                    placeholder="Founder & CEO"
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '11px',
                    color: theme.textMuted,
                    marginBottom: '8px',
                    letterSpacing: '1px',
                  }}>
                    STATUS BADGE
                  </label>
                  <select
                    value={formData.status_badge}
                    onChange={(e) => setFormData({ ...formData, status_badge: e.target.value })}
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
                    <option value="">None</option>
                    {badges.map((badge) => (
                      <option key={badge} value={badge}>{badge}</option>
                    ))}
                  </select>
                </div>
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
                  DESCRIPTION *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
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
                  placeholder="Brief description of your role and achievements"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '11px',
                    color: theme.textMuted,
                    marginBottom: '8px',
                    letterSpacing: '1px',
                  }}>
                    TYPE
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
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
                    <option value="current">Current</option>
                    <option value="past">Past</option>
                    <option value="fellowship">Fellowship</option>
                  </select>
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '11px',
                    color: theme.textMuted,
                    marginBottom: '8px',
                    letterSpacing: '1px',
                  }}>
                    START DATE
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
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
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '11px',
                    color: theme.textMuted,
                    marginBottom: '8px',
                    letterSpacing: '1px',
                  }}>
                    END DATE
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
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
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '11px',
                  color: theme.textMuted,
                  marginBottom: '8px',
                  letterSpacing: '1px',
                }}>
                  ACCENT COLOR
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        background: color,
                        border: formData.color === color ? '2px solid white' : 'none',
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </div>
              </div>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: "'Space Mono', monospace",
                fontSize: '12px',
                color: theme.textMuted,
                marginBottom: '24px',
                cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={formData.is_visible}
                  onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                />
                Visible on public site
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
                  {isEditing ? 'UPDATE' : 'ADD'} EXPERIENCE
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    background: 'none',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '6px',
                    padding: '12px 24px',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '12px',
                    color: theme.textMuted,
                    cursor: 'pointer',
                  }}
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Experiences List */}
      <div style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        {isLoading ? (
          <div style={{
            padding: '48px',
            textAlign: 'center',
            fontFamily: "'Space Mono', monospace",
            fontSize: '13px',
            color: theme.textMuted,
          }}>
            Loading experiences...
          </div>
        ) : filteredExperiences.length === 0 ? (
          <div style={{
            padding: '48px',
            textAlign: 'center',
            fontFamily: "'Space Mono', monospace",
            fontSize: '13px',
            color: theme.textMuted,
          }}>
            No {activeTab} experiences yet. Click "Add New" to create one.
          </div>
        ) : (
          <div>
            {filteredExperiences.map((exp, index) => (
              <div
                key={exp.id}
                style={{
                  padding: '20px',
                  borderBottom: index < filteredExperiences.length - 1 ? `1px solid ${theme.border}` : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '16px',
                  opacity: exp.is_visible ? 1 : 0.5,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '4px',
                  }}>
                    <div style={{
                      width: '4px',
                      height: '24px',
                      background: exp.color || theme.accent,
                      borderRadius: '2px',
                    }} />
                    <h3 style={{
                      fontFamily: "'Instrument Serif', serif",
                      fontSize: '18px',
                      fontStyle: 'italic',
                      color: theme.text,
                      margin: 0,
                    }}>
                      {exp.title}
                    </h3>
                    {exp.status_badge && (
                      <span style={{
                        background: exp.color || theme.accent,
                        color: theme.bg,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '10px',
                        letterSpacing: '0.5px',
                      }}>
                        {exp.status_badge}
                      </span>
                    )}
                  </div>
                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '12px',
                    color: theme.textMuted,
                    marginBottom: '8px',
                    marginLeft: '16px',
                  }}>
                    {exp.organization} {exp.role && `• ${exp.role}`}
                  </div>
                  <p style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '13px',
                    color: theme.text,
                    margin: '0 0 0 16px',
                    lineHeight: '1.6',
                  }}>
                    {exp.description}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button
                    onClick={() => toggleVisibility(exp)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: theme.textMuted,
                      cursor: 'pointer',
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '11px',
                      padding: '4px',
                    }}
                  >
                    {exp.is_visible ? 'HIDE' : 'SHOW'}
                  </button>
                  <button
                    onClick={() => editExperience(exp)}
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
                    onClick={() => deleteExperience(exp.id)}
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
  );
};

export default ExperiencesSection;
