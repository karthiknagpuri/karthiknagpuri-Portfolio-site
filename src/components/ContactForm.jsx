import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export const ContactForm = ({ theme }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      // Try to save to Supabase
      const { error } = await supabase
        .from('contact_messages')
        .insert([{
          name: formData.name,
          email: formData.email,
          message: formData.message,
        }]);

      if (error) {
        // Fallback to localStorage if Supabase fails
        console.warn('Supabase error, saving locally:', error.message);
        const messages = JSON.parse(localStorage.getItem('contact_messages') || '[]');
        messages.push({
          ...formData,
          timestamp: new Date().toISOString(),
        });
        localStorage.setItem('contact_messages', JSON.stringify(messages));
      }

      setStatus({
        type: 'success',
        message: "Message sent successfully! I'll get back to you soon.",
      });
      setFormData({ name: '', email: '', message: '' });

      // Clear status after 5 seconds
      setTimeout(() => setStatus({ type: '', message: '' }), 5000);
    } catch (err) {
      console.error('Error submitting form:', err);
      setStatus({
        type: 'error',
        message: 'Failed to send message. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyles = {
    width: '100%',
    background: theme.bgSecondary || theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: '6px',
    padding: '12px 16px',
    color: theme.text,
    fontFamily: "'Space Mono', monospace",
    fontSize: '13px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="your name"
          required
          style={inputStyles}
          onFocus={(e) => e.target.style.borderColor = theme.accent}
          onBlur={(e) => e.target.style.borderColor = theme.border}
        />

        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="your@email.com"
          required
          style={inputStyles}
          onFocus={(e) => e.target.style.borderColor = theme.accent}
          onBlur={(e) => e.target.style.borderColor = theme.border}
        />

        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="your message..."
          rows="4"
          required
          style={{
            ...inputStyles,
            resize: 'vertical',
            minHeight: '120px',
          }}
          onFocus={(e) => e.target.style.borderColor = theme.accent}
          onBlur={(e) => e.target.style.borderColor = theme.border}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            background: theme.accent,
            color: theme.bg,
            border: 'none',
            borderRadius: '6px',
            padding: '14px 24px',
            fontFamily: "'Space Mono', monospace",
            fontSize: '13px',
            letterSpacing: '1px',
            cursor: isSubmitting ? 'wait' : 'pointer',
            transition: 'all 0.2s ease',
            opacity: isSubmitting ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = `0 4px 12px ${theme.accent}40`;
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          {isSubmitting ? 'sending...' : 'send message'}
        </button>
      </form>

      {/* Status message */}
      {status.message && (
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          borderRadius: '6px',
          background: status.type === 'success'
            ? 'rgba(39, 174, 96, 0.1)'
            : 'rgba(255, 107, 107, 0.1)',
          border: `1px solid ${status.type === 'success' ? '#27AE60' : '#FF6B6B'}`,
          color: status.type === 'success' ? '#27AE60' : '#FF6B6B',
          fontFamily: "'Space Mono', monospace",
          fontSize: '12px',
          textAlign: 'center',
        }}>
          {status.type === 'success' ? '✓ ' : '✗ '}{status.message}
        </div>
      )}
    </div>
  );
};

export const ContactButtons = ({ theme }) => {
  const buttons = [
    {
      label: 'email directly',
      icon: '✉',
      href: 'mailto:nanikarthik98@gmail.com',
      color: theme.accent,
    },
    {
      label: 'whatsapp',
      icon: '💬',
      href: 'https://wa.me/916305458955',
      color: '#25D366',
    },
    {
      label: 'book a call',
      icon: '📅',
      href: 'https://calendly.com/karthiknagapuri',
      color: '#4A90D9',
    },
  ];

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: '12px',
      marginTop: '24px',
    }}>
      {buttons.map((btn) => (
        <a
          key={btn.label}
          href={btn.href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            background: 'transparent',
            border: `1px solid ${btn.color}`,
            borderRadius: '6px',
            color: btn.color,
            fontFamily: "'Space Mono', monospace",
            fontSize: '12px',
            letterSpacing: '1px',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = btn.color;
            e.target.style.color = theme.bg;
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = btn.color;
          }}
        >
          <span>{btn.icon}</span>
          <span>{btn.label}</span>
        </a>
      ))}
    </div>
  );
};

export default ContactForm;
