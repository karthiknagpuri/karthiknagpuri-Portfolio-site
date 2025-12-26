import React, { useState, useEffect } from 'react';

const journeyData = [
  {
    id: 'start',
    title: 'HOW I STARTED',
    content: [
      'From a rural farming family in Telangana to building founder-first ecosystems across Bharat. My journey began with a simple belief: technology should democratize opportunity, not concentrate it.',
      'Growing up in a farming community taught me the value of building sustainable systems. Today, I apply those same principles to startup ecosystems - nurturing growth, creating connections, and ensuring every founder has the resources to thrive.',
    ],
  },
  {
    id: 'mission',
    title: 'MY MISSION',
    content: [
      "I'm on a mission to democratize AI and innovation across India. Through EvolveX, we're building bridges between tier-2/3 cities and global opportunities.",
      'Every event I organize, every founder I mentor, every ecosystem I connect - it\'s all part of a larger vision: making entrepreneurship accessible to everyone, regardless of their background or location.',
    ],
  },
  {
    id: 'future',
    title: 'WHERE I SEE MYSELF IN',
    isDaysCounter: true,
    targetDays: 1825, // 5 years
    content: [
      "Building India's most inclusive startup ecosystem that connects rural innovators with global markets. Leading a movement where every aspiring entrepreneur has access to mentorship, funding, and community.",
      'By then, EvolveX will have empowered 10,000+ founders, created 100+ sustainable startups, and proven that the next unicorn can come from anywhere in Bharat.',
    ],
  },
];

const ExpandableCard = ({ data, theme }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(data.targetDays);

  // Calculate days remaining for future card
  useEffect(() => {
    if (data.isDaysCounter) {
      // You can adjust the target date as needed
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + data.targetDays);

      const updateDays = () => {
        const now = new Date();
        const diff = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));
        setDaysRemaining(Math.max(0, diff));
      };

      updateDays();
      const interval = setInterval(updateDays, 86400000); // Update daily
      return () => clearInterval(interval);
    }
  }, [data.isDaysCounter, data.targetDays]);

  return (
    <div style={{
      background: theme.bgSecondary || theme.surface,
      border: `1px solid ${theme.border}`,
      borderRadius: '8px',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
    }}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: theme.text,
        }}
      >
        <h3 style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '13px',
          letterSpacing: '2px',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          {data.title}
          {data.isDaysCounter && (
            <span style={{ color: theme.accent }}>
              {daysRemaining.toLocaleString()} DAYS
            </span>
          )}
        </h3>
        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '11px',
          color: theme.textMuted,
          letterSpacing: '1px',
        }}>
          [{isExpanded ? 'COLLAPSE' : 'EXPAND'}]
        </span>
      </button>

      {/* Content */}
      <div style={{
        maxHeight: isExpanded ? '500px' : '0',
        overflow: 'hidden',
        transition: 'max-height 0.4s ease, padding 0.4s ease',
        padding: isExpanded ? '0 20px 20px' : '0 20px',
      }}>
        {data.content.map((paragraph, i) => (
          <p key={i} style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '13px',
            lineHeight: '1.8',
            color: theme.textSecondary,
            marginBottom: i < data.content.length - 1 ? '16px' : 0,
          }}>
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
};

export const JourneyCards = ({ theme }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      maxWidth: '700px',
      margin: '0 auto',
    }}>
      {journeyData.map((data) => (
        <ExpandableCard key={data.id} data={data} theme={theme} />
      ))}
    </div>
  );
};

export default JourneyCards;
