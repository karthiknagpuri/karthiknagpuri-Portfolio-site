import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const NewsletterPopup = ({ theme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check if user has already seen/dismissed the popup
    const hasSeenPopup = localStorage.getItem('newsletter_popup_seen');
    const hasSubscribed = localStorage.getItem('newsletter_subscribed');

    if (!hasSeenPopup && !hasSubscribed) {
      // Show popup after 5 seconds of page load
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('newsletter_popup_seen', 'true');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setStatus('error');
      setMessage('Please enter your email');
      return;
    }

    setStatus('loading');

    try {
      // Check if email already exists
      const { data: existing } = await supabase
        .from('newsletter_subscribers')
        .select('id, is_active')
        .eq('email', email.toLowerCase())
        .single();

      if (existing) {
        if (existing.is_active) {
          setStatus('error');
          setMessage('You are already subscribed!');
        } else {
          // Reactivate subscription
          await supabase
            .from('newsletter_subscribers')
            .update({ is_active: true, updated_at: new Date().toISOString() })
            .eq('id', existing.id);

          setStatus('success');
          setMessage('Welcome back! Your subscription has been reactivated.');
          localStorage.setItem('newsletter_subscribed', 'true');
        }
        return;
      }

      // Insert new subscriber
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email: email.toLowerCase(),
          name: name || null,
          source: 'popup',
        });

      if (error) throw error;

      setStatus('success');
      setMessage('Thanks for subscribing! You\'ll hear from me soon.');
      localStorage.setItem('newsletter_subscribed', 'true');

      // Close popup after 2 seconds on success
      setTimeout(() => {
        setIsOpen(false);
      }, 2000);

    } catch (error) {
      console.error('Newsletter signup error:', error);
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={handleClose}
    >
      <div
        style={{
          background: theme?.bgElevated || '#1A1A1A',
          border: `1px solid ${theme?.border || 'rgba(255,255,255,0.1)'}`,
          borderRadius: '16px',
          maxWidth: '420px',
          width: '100%',
          padding: '32px',
          position: 'relative',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          animation: 'popupSlideIn 0.3s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes popupSlideIn {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}</style>

        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: theme?.textMuted || '#888',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '4px',
            lineHeight: 1,
          }}
        >
          ×
        </button>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
              ✉️
            </div>
            <h3 style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: '24px',
              fontStyle: 'italic',
              color: theme?.text || '#fff',
              marginBottom: '12px',
            }}>
              You're in!
            </h3>
            <p style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '13px',
              color: theme?.textMuted || '#888',
            }}>
              {message}
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '10px',
                letterSpacing: '2px',
                color: theme?.accent || '#C4785A',
                marginBottom: '12px',
              }}>
                NEWSLETTER
              </div>
              <h3 style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: '28px',
                fontStyle: 'italic',
                color: theme?.text || '#fff',
                marginBottom: '12px',
              }}>
                Stay in the loop
              </h3>
              <p style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '12px',
                color: theme?.textMuted || '#888',
                lineHeight: '1.6',
              }}>
                Essays on building, startups, and the journey of being Zero. No spam, just insights.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name (optional)"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: theme?.bg || '#0a0a0a',
                    border: `1px solid ${theme?.border || 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '8px',
                    color: theme?.text || '#fff',
                    fontSize: '14px',
                    fontFamily: "'Space Mono', monospace",
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={(e) => e.target.style.borderColor = theme?.accent || '#C4785A'}
                  onBlur={(e) => e.target.style.borderColor = theme?.border || 'rgba(255,255,255,0.1)'}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email *"
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: theme?.bg || '#0a0a0a',
                    border: `1px solid ${theme?.border || 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '8px',
                    color: theme?.text || '#fff',
                    fontSize: '14px',
                    fontFamily: "'Space Mono', monospace",
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={(e) => e.target.style.borderColor = theme?.accent || '#C4785A'}
                  onBlur={(e) => e.target.style.borderColor = theme?.border || 'rgba(255,255,255,0.1)'}
                />
              </div>

              {status === 'error' && (
                <div style={{
                  padding: '12px',
                  background: 'rgba(255,107,107,0.1)',
                  border: '1px solid rgba(255,107,107,0.3)',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '12px',
                  color: '#FF6B6B',
                }}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  background: theme?.accent || '#C4785A',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '13px',
                  fontFamily: "'Space Mono', monospace",
                  letterSpacing: '1px',
                  cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                  opacity: status === 'loading' ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                {status === 'loading' ? 'SUBSCRIBING...' : 'SUBSCRIBE'}
              </button>
            </form>

            <p style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '10px',
              color: theme?.textMuted || '#888',
              textAlign: 'center',
              marginTop: '16px',
            }}>
              Unsubscribe anytime. No spam, ever.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default NewsletterPopup;
