import React, { useState, useEffect, useMemo } from 'react';

// Initialize count outside component to avoid setState in effect
const getInitialCount = () => {
  if (typeof window === 'undefined') return 1000;

  let storedCount = parseInt(localStorage.getItem('totalVisitors') || '1000');
  const lastVisit = localStorage.getItem('lastVisit');
  const today = new Date().toDateString();

  // Increment if new day
  if (lastVisit !== today) {
    storedCount++;
    localStorage.setItem('totalVisitors', storedCount.toString());
    localStorage.setItem('lastVisit', today);
  }

  return storedCount;
};

export const VisitorCounter = ({ theme }) => {
  const count = useMemo(() => getInitialCount(), []);
  const [displayCount, setDisplayCount] = useState(0);

  // Animate counter on mount
  useEffect(() => {
    const startValue = Math.max(0, count - 50);
    let current = startValue;
    const duration = 1500;
    const steps = 50;
    const stepTime = duration / steps;
    const incrementAmount = Math.ceil((count - startValue) / steps);

    const timer = setInterval(() => {
      current += incrementAmount;
      if (current >= count) {
        current = count;
        clearInterval(timer);
      }
      setDisplayCount(current);
    }, stepTime);

    return () => clearInterval(timer);
  }, [count]);

  return (
    <div style={{
      textAlign: 'center',
      padding: '16px 0',
      fontFamily: "'Space Mono', monospace",
      fontSize: '13px',
      color: theme.textMuted,
    }}>
      <span>You're visitor </span>
      <span style={{
        color: theme.accent,
        fontWeight: 'bold',
        fontSize: '15px',
      }}>
        #{displayCount.toLocaleString()}
      </span>
      <span> exploring this ecosystem</span>
    </div>
  );
};

export default VisitorCounter;
