import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const MessagesSection = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);

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

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMessage = async (id) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMessages(messages.filter(m => m.id !== id));
      if (selectedMessage?.id === id) setSelectedMessage(null);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
        color: theme.textMuted,
        fontFamily: "'Space Mono', monospace",
      }}>
        Loading messages...
      </div>
    );
  }

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
            Contact Messages
          </h1>
          <p style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '12px',
            color: theme.textMuted,
            margin: 0,
          }}>
            {messages.length} message{messages.length !== 1 ? 's' : ''} received
          </p>
        </div>
        <button
          onClick={fetchMessages}
          style={{
            background: 'none',
            border: `1px solid ${theme.border}`,
            borderRadius: '6px',
            padding: '8px 16px',
            fontFamily: "'Space Mono', monospace",
            fontSize: '11px',
            color: theme.textMuted,
            cursor: 'pointer',
            letterSpacing: '1px',
          }}
        >
          REFRESH
        </button>
      </div>

      {/* Messages List */}
      <div style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        {messages.length === 0 ? (
          <div style={{
            padding: '48px',
            textAlign: 'center',
            fontFamily: "'Space Mono', monospace",
            fontSize: '13px',
            color: theme.textMuted,
          }}>
            No messages yet. When visitors send you messages, they'll appear here.
          </div>
        ) : (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
          }}>
            <thead>
              <tr style={{
                borderBottom: `1px solid ${theme.border}`,
              }}>
                <th style={{
                  padding: '16px 20px',
                  textAlign: 'left',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '11px',
                  color: theme.textMuted,
                  letterSpacing: '1px',
                  fontWeight: '500',
                }}>
                  NAME
                </th>
                <th style={{
                  padding: '16px 20px',
                  textAlign: 'left',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '11px',
                  color: theme.textMuted,
                  letterSpacing: '1px',
                  fontWeight: '500',
                }}>
                  EMAIL
                </th>
                <th style={{
                  padding: '16px 20px',
                  textAlign: 'left',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '11px',
                  color: theme.textMuted,
                  letterSpacing: '1px',
                  fontWeight: '500',
                }}>
                  MESSAGE
                </th>
                <th style={{
                  padding: '16px 20px',
                  textAlign: 'left',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '11px',
                  color: theme.textMuted,
                  letterSpacing: '1px',
                  fontWeight: '500',
                }}>
                  DATE
                </th>
                <th style={{
                  padding: '16px 20px',
                  textAlign: 'right',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '11px',
                  color: theme.textMuted,
                  letterSpacing: '1px',
                  fontWeight: '500',
                }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg, index) => (
                <tr
                  key={msg.id || index}
                  style={{
                    borderBottom: index < messages.length - 1 ? `1px solid ${theme.border}` : 'none',
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedMessage(msg)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = theme.bg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <td style={{
                    padding: '16px 20px',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '13px',
                    color: theme.text,
                  }}>
                    {msg.name}
                  </td>
                  <td style={{
                    padding: '16px 20px',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '13px',
                    color: theme.teal,
                  }}>
                    <a
                      href={`mailto:${msg.email}`}
                      style={{ color: theme.teal, textDecoration: 'none' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {msg.email}
                    </a>
                  </td>
                  <td style={{
                    padding: '16px 20px',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '12px',
                    color: theme.textMuted,
                    maxWidth: '300px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {msg.message}
                  </td>
                  <td style={{
                    padding: '16px 20px',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '11px',
                    color: theme.textMuted,
                    whiteSpace: 'nowrap',
                  }}>
                    {formatDate(msg.created_at)}
                  </td>
                  <td style={{
                    padding: '16px 20px',
                    textAlign: 'right',
                  }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMessage(msg.id);
                      }}
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
                      DELETE
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
          onClick={() => setSelectedMessage(null)}
        >
          <div
            style={{
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: '16px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              padding: '24px',
              borderBottom: `1px solid ${theme.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}>
              <div>
                <h2 style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: '20px',
                  fontStyle: 'italic',
                  color: theme.text,
                  margin: '0 0 8px 0',
                }}>
                  {selectedMessage.name}
                </h2>
                <a
                  href={`mailto:${selectedMessage.email}`}
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '13px',
                    color: theme.teal,
                    textDecoration: 'none',
                  }}
                >
                  {selectedMessage.email}
                </a>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.textMuted,
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '0',
                  lineHeight: '1',
                }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <p style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                color: theme.textMuted,
                marginBottom: '16px',
                letterSpacing: '1px',
              }}>
                {formatDate(selectedMessage.created_at)}
              </p>
              <p style={{
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                fontSize: '15px',
                color: theme.text,
                lineHeight: '1.7',
                whiteSpace: 'pre-wrap',
                margin: 0,
              }}>
                {selectedMessage.message}
              </p>
            </div>
            <div style={{
              padding: '16px 24px',
              borderTop: `1px solid ${theme.border}`,
              display: 'flex',
              gap: '12px',
            }}>
              <a
                href={`mailto:${selectedMessage.email}`}
                style={{
                  flex: 1,
                  background: theme.accent,
                  color: theme.bg,
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '12px',
                  textAlign: 'center',
                  textDecoration: 'none',
                  letterSpacing: '1px',
                }}
              >
                REPLY VIA EMAIL
              </a>
              <button
                onClick={() => deleteMessage(selectedMessage.id)}
                style={{
                  background: 'none',
                  border: `1px solid ${theme.danger}`,
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '12px',
                  color: theme.danger,
                  cursor: 'pointer',
                  letterSpacing: '1px',
                }}
              >
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesSection;
