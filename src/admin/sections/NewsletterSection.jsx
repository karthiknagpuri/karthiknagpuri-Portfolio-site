import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const NewsletterSection = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('subscribers'); // 'subscribers' | 'compose' | 'history'

  // Compose email state
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);

  const theme = {
    bg: '#0a0a0a',
    surface: '#141414',
    border: 'rgba(255,255,255,0.1)',
    text: '#ffffff',
    textMuted: '#888888',
    accent: '#C4785A',
    success: '#4ECDC4',
    danger: '#FF6B6B',
    warning: '#FFE66D',
    purple: '#A855F7',
  };

  useEffect(() => {
    loadSubscribers();
    loadCampaigns();
  }, []);

  const loadSubscribers = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscribers(data || []);
    } catch (error) {
      console.log('Error loading subscribers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletter_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.log('Error loading campaigns:', error);
    }
  };

  const toggleSubscriberStatus = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      loadSubscribers();
    } catch (error) {
      console.log('Error updating subscriber:', error);
    }
  };

  const deleteSubscriber = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subscriber?')) return;

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadSubscribers();
    } catch (error) {
      console.log('Error deleting subscriber:', error);
    }
  };

  const sendNewsletter = async () => {
    if (!subject.trim() || !content.trim()) {
      setSendStatus({ type: 'error', message: 'Please fill in both subject and content' });
      return;
    }

    const activeSubscribers = subscribers.filter(s => s.is_active);
    if (activeSubscribers.length === 0) {
      setSendStatus({ type: 'error', message: 'No active subscribers to send to' });
      return;
    }

    setIsSending(true);
    setSendStatus(null);

    try {
      // Create campaign record
      const { data: campaign, error: campaignError } = await supabase
        .from('newsletter_campaigns')
        .insert({
          subject,
          content,
          recipients_count: activeSubscribers.length,
          status: 'sending',
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      // In a real implementation, you would call an email service API here
      // For now, we'll simulate sending and update the status

      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update campaign status to sent
      await supabase
        .from('newsletter_campaigns')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .eq('id', campaign.id);

      setSendStatus({
        type: 'success',
        message: `Newsletter sent to ${activeSubscribers.length} subscriber${activeSubscribers.length > 1 ? 's' : ''}!`
      });

      // Clear form
      setSubject('');
      setContent('');
      loadCampaigns();

    } catch (error) {
      console.error('Error sending newsletter:', error);
      setSendStatus({ type: 'error', message: 'Failed to send newsletter. Please try again.' });
    } finally {
      setIsSending(false);
    }
  };

  const exportSubscribers = () => {
    const activeSubscribers = subscribers.filter(s => s.is_active);
    const csv = [
      ['Email', 'Name', 'Subscribed At', 'Source'],
      ...activeSubscribers.map(s => [
        s.email,
        s.name || '',
        new Date(s.subscribed_at).toLocaleDateString(),
        s.source || 'popup'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const activeCount = subscribers.filter(s => s.is_active).length;

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
        color: theme.textMuted,
        fontFamily: "'Space Mono', monospace",
        fontSize: '13px',
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: '28px',
          fontStyle: 'italic',
          color: theme.text,
          margin: '0 0 8px 0',
        }}>
          Newsletter
        </h1>
        <p style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '13px',
          color: theme.textMuted,
          margin: 0,
        }}>
          Manage subscribers and send newsletters
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        <div style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: '12px',
          padding: '20px',
        }}>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '10px',
            color: theme.textMuted,
            letterSpacing: '1px',
            marginBottom: '8px',
          }}>
            TOTAL SUBSCRIBERS
          </div>
          <div style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: '32px',
            color: theme.text,
          }}>
            {subscribers.length}
          </div>
        </div>

        <div style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: '12px',
          padding: '20px',
        }}>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '10px',
            color: theme.textMuted,
            letterSpacing: '1px',
            marginBottom: '8px',
          }}>
            ACTIVE
          </div>
          <div style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: '32px',
            color: theme.success,
          }}>
            {activeCount}
          </div>
        </div>

        <div style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: '12px',
          padding: '20px',
        }}>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '10px',
            color: theme.textMuted,
            letterSpacing: '1px',
            marginBottom: '8px',
          }}>
            CAMPAIGNS SENT
          </div>
          <div style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: '32px',
            color: theme.accent,
          }}>
            {campaigns.filter(c => c.status === 'sent').length}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        borderBottom: `1px solid ${theme.border}`,
        paddingBottom: '16px',
      }}>
        {['subscribers', 'compose', 'history'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px',
              background: activeTab === tab ? theme.accent : 'transparent',
              border: `1px solid ${activeTab === tab ? theme.accent : theme.border}`,
              borderRadius: '8px',
              color: activeTab === tab ? '#fff' : theme.textMuted,
              fontFamily: "'Space Mono', monospace",
              fontSize: '12px',
              letterSpacing: '1px',
              cursor: 'pointer',
              textTransform: 'uppercase',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Subscribers Tab */}
      {activeTab === 'subscribers' && (
        <div style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          {/* Actions bar */}
          <div style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${theme.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '12px',
              color: theme.textMuted,
            }}>
              {activeCount} active subscriber{activeCount !== 1 ? 's' : ''}
            </span>
            <button
              onClick={exportSubscribers}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                border: `1px solid ${theme.border}`,
                borderRadius: '6px',
                color: theme.text,
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              EXPORT CSV
            </button>
          </div>

          {/* Subscribers list */}
          {subscribers.length === 0 ? (
            <div style={{
              padding: '48px 20px',
              textAlign: 'center',
              fontFamily: "'Space Mono', monospace",
              fontSize: '13px',
              color: theme.textMuted,
            }}>
              No subscribers yet
            </div>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {subscribers.map((subscriber) => (
                <div
                  key={subscriber.id}
                  style={{
                    padding: '16px 20px',
                    borderBottom: `1px solid ${theme.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '13px',
                      color: theme.text,
                      marginBottom: '4px',
                    }}>
                      {subscriber.email}
                    </div>
                    <div style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '11px',
                      color: theme.textMuted,
                    }}>
                      {subscriber.name || 'No name'} · {new Date(subscriber.subscribed_at).toLocaleDateString()} · {subscriber.source}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '10px',
                      background: subscriber.is_active ? `${theme.success}20` : `${theme.danger}20`,
                      color: subscriber.is_active ? theme.success : theme.danger,
                    }}>
                      {subscriber.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>

                    <button
                      onClick={() => toggleSubscriberStatus(subscriber.id, subscriber.is_active)}
                      style={{
                        padding: '6px 12px',
                        background: 'transparent',
                        border: `1px solid ${theme.border}`,
                        borderRadius: '4px',
                        color: theme.textMuted,
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '10px',
                        cursor: 'pointer',
                      }}
                    >
                      {subscriber.is_active ? 'DEACTIVATE' : 'ACTIVATE'}
                    </button>

                    <button
                      onClick={() => deleteSubscriber(subscriber.id)}
                      style={{
                        padding: '6px 12px',
                        background: 'transparent',
                        border: `1px solid ${theme.danger}40`,
                        borderRadius: '4px',
                        color: theme.danger,
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '10px',
                        cursor: 'pointer',
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
      )}

      {/* Compose Tab */}
      {activeTab === 'compose' && (
        <div style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: '12px',
          padding: '24px',
        }}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontFamily: "'Space Mono', monospace",
              fontSize: '11px',
              color: theme.textMuted,
              letterSpacing: '1px',
              marginBottom: '8px',
            }}>
              SUBJECT
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Newsletter subject..."
              style={{
                width: '100%',
                padding: '14px 16px',
                background: theme.bg,
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                color: theme.text,
                fontSize: '14px',
                fontFamily: "'Space Mono', monospace",
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontFamily: "'Space Mono', monospace",
              fontSize: '11px',
              color: theme.textMuted,
              letterSpacing: '1px',
              marginBottom: '8px',
            }}>
              CONTENT
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your newsletter content here..."
              rows={12}
              style={{
                width: '100%',
                padding: '14px 16px',
                background: theme.bg,
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                color: theme.text,
                fontSize: '14px',
                fontFamily: "'Space Mono', monospace",
                outline: 'none',
                resize: 'vertical',
                lineHeight: '1.6',
              }}
            />
          </div>

          {sendStatus && (
            <div style={{
              padding: '12px 16px',
              background: sendStatus.type === 'success' ? `${theme.success}15` : `${theme.danger}15`,
              border: `1px solid ${sendStatus.type === 'success' ? theme.success : theme.danger}30`,
              borderRadius: '8px',
              marginBottom: '24px',
              fontFamily: "'Space Mono', monospace",
              fontSize: '12px',
              color: sendStatus.type === 'success' ? theme.success : theme.danger,
            }}>
              {sendStatus.message}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={sendNewsletter}
              disabled={isSending || activeCount === 0}
              style={{
                padding: '14px 32px',
                background: theme.accent,
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontFamily: "'Space Mono', monospace",
                fontSize: '12px',
                letterSpacing: '1px',
                cursor: isSending || activeCount === 0 ? 'not-allowed' : 'pointer',
                opacity: isSending || activeCount === 0 ? 0.5 : 1,
              }}
            >
              {isSending ? 'SENDING...' : `SEND TO ${activeCount} SUBSCRIBER${activeCount !== 1 ? 'S' : ''}`}
            </button>

            <span style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '11px',
              color: theme.textMuted,
            }}>
              This will send to all active subscribers
            </span>
          </div>

          {/* Email service note */}
          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: `${theme.purple}10`,
            border: `1px solid ${theme.purple}30`,
            borderRadius: '8px',
          }}>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '11px',
              color: theme.purple,
              marginBottom: '8px',
            }}>
              NOTE
            </div>
            <p style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '12px',
              color: theme.textMuted,
              margin: 0,
              lineHeight: '1.6',
            }}>
              To actually send emails, connect an email service (SendGrid, Resend, AWS SES, etc.)
              via Supabase Edge Functions or a backend API. Currently, campaigns are tracked but
              emails are simulated.
            </p>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          {campaigns.length === 0 ? (
            <div style={{
              padding: '48px 20px',
              textAlign: 'center',
              fontFamily: "'Space Mono', monospace",
              fontSize: '13px',
              color: theme.textMuted,
            }}>
              No campaigns sent yet
            </div>
          ) : (
            <div>
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  style={{
                    padding: '20px',
                    borderBottom: `1px solid ${theme.border}`,
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}>
                    <h3 style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '14px',
                      color: theme.text,
                      margin: 0,
                    }}>
                      {campaign.subject}
                    </h3>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '10px',
                      background: campaign.status === 'sent' ? `${theme.success}20` : `${theme.warning}20`,
                      color: campaign.status === 'sent' ? theme.success : theme.warning,
                      textTransform: 'uppercase',
                    }}>
                      {campaign.status}
                    </span>
                  </div>
                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '11px',
                    color: theme.textMuted,
                  }}>
                    {campaign.sent_at ? new Date(campaign.sent_at).toLocaleString() : 'Not sent'} · {campaign.recipients_count} recipient{campaign.recipients_count !== 1 ? 's' : ''}
                  </div>
                  <p style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '12px',
                    color: theme.textMuted,
                    marginTop: '12px',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap',
                    maxHeight: '100px',
                    overflow: 'hidden',
                  }}>
                    {campaign.content.substring(0, 200)}{campaign.content.length > 200 ? '...' : ''}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NewsletterSection;
