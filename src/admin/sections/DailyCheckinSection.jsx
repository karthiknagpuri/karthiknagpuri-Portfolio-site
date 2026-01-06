import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const MOODS = [
  { value: 'great', emoji: '🔥', label: 'Great', color: '#4ECDC4' },
  { value: 'good', emoji: '😊', label: 'Good', color: '#A855F7' },
  { value: 'okay', emoji: '😐', label: 'Okay', color: '#FFE66D' },
  { value: 'low', emoji: '😔', label: 'Low', color: '#F97316' },
  { value: 'rough', emoji: '😫', label: 'Rough', color: '#FF6B6B' },
];

const DailyCheckinSection = () => {
  const [todayCheckin, setTodayCheckin] = useState(null);
  const [pastCheckins, setPastCheckins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [streak, setStreak] = useState(0);

  // Form state
  const [mood, setMood] = useState('');
  const [energyLevel, setEnergyLevel] = useState(3);
  const [accomplishments, setAccomplishments] = useState('');
  const [goals, setGoals] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [notes, setNotes] = useState('');

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
    loadCheckins();
  }, []);

  const loadCheckins = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Load today's checkin
      const { data: todayData } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('checkin_date', today)
        .single();

      if (todayData) {
        setTodayCheckin(todayData);
        setMood(todayData.mood || '');
        setEnergyLevel(todayData.energy_level || 3);
        setAccomplishments(todayData.accomplishments || '');
        setGoals(todayData.goals || '');
        setGratitude(todayData.gratitude || '');
        setNotes(todayData.notes || '');
      }

      // Load past checkins
      const { data: historyData } = await supabase
        .from('daily_checkins')
        .select('*')
        .order('checkin_date', { ascending: false })
        .limit(30);

      setPastCheckins(historyData || []);
      calculateStreak(historyData || []);
    } catch (error) {
      console.log('Error loading checkins:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStreak = (checkins) => {
    if (!checkins.length) {
      setStreak(0);
      return;
    }

    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < checkins.length; i++) {
      const checkinDate = new Date(checkins[i].checkin_date);
      checkinDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);

      if (checkinDate.getTime() === expectedDate.getTime()) {
        currentStreak++;
      } else {
        break;
      }
    }

    setStreak(currentStreak);
  };

  const saveCheckin = async () => {
    if (!mood) {
      alert('Please select your mood');
      return;
    }

    setIsSaving(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      const checkinData = {
        checkin_date: today,
        mood,
        energy_level: energyLevel,
        accomplishments: accomplishments.trim() || null,
        goals: goals.trim() || null,
        gratitude: gratitude.trim() || null,
        notes: notes.trim() || null,
        updated_at: new Date().toISOString(),
      };

      if (todayCheckin?.id) {
        // Update existing
        const { error } = await supabase
          .from('daily_checkins')
          .update(checkinData)
          .eq('id', todayCheckin.id);

        if (error) throw error;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('daily_checkins')
          .insert(checkinData)
          .select()
          .single();

        if (error) throw error;
        setTodayCheckin(data);
      }

      loadCheckins();
    } catch (error) {
      console.error('Error saving checkin:', error);
      alert('Failed to save check-in');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getMoodConfig = (moodValue) => {
    return MOODS.find(m => m.value === moodValue) || MOODS[2];
  };

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
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h1 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: '28px',
            fontStyle: 'italic',
            color: theme.text,
            margin: '0 0 8px 0',
          }}>
            Daily Check-in
          </h1>
          <p style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '13px',
            color: theme.textMuted,
            margin: 0,
          }}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Streak Badge */}
        <div style={{
          background: streak > 0 ? 'rgba(255,230,109,0.1)' : theme.surface,
          border: `1px solid ${streak > 0 ? 'rgba(255,230,109,0.3)' : theme.border}`,
          borderRadius: '12px',
          padding: '16px 24px',
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: '32px',
            fontStyle: 'italic',
            color: streak > 0 ? theme.warning : theme.textMuted,
          }}>
            {streak}
          </div>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '10px',
            color: theme.textMuted,
            letterSpacing: '1px',
          }}>
            DAY STREAK 🔥
          </div>
        </div>
      </div>

      {/* Check-in Form */}
      <div style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
      }}>
        {/* Status indicator */}
        {todayCheckin && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            background: `${theme.success}20`,
            borderRadius: '20px',
            marginBottom: '20px',
          }}>
            <span style={{ color: theme.success }}>✓</span>
            <span style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '11px',
              color: theme.success,
              letterSpacing: '1px',
            }}>
              CHECKED IN TODAY
            </span>
          </div>
        )}

        {/* Mood Selection */}
        <div style={{ marginBottom: '28px' }}>
          <label style={{
            display: 'block',
            fontFamily: "'Space Mono', monospace",
            fontSize: '11px',
            color: theme.textMuted,
            letterSpacing: '1px',
            marginBottom: '12px',
          }}>
            HOW ARE YOU FEELING?
          </label>
          <div style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
          }}>
            {MOODS.map((m) => (
              <button
                key={m.value}
                onClick={() => setMood(m.value)}
                style={{
                  padding: '16px 20px',
                  background: mood === m.value ? `${m.color}20` : 'transparent',
                  border: `2px solid ${mood === m.value ? m.color : theme.border}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  minWidth: '80px',
                }}
              >
                <span style={{ fontSize: '28px' }}>{m.emoji}</span>
                <span style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '11px',
                  color: mood === m.value ? m.color : theme.textMuted,
                  letterSpacing: '1px',
                }}>
                  {m.label.toUpperCase()}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Energy Level */}
        <div style={{ marginBottom: '28px' }}>
          <label style={{
            display: 'block',
            fontFamily: "'Space Mono', monospace",
            fontSize: '11px',
            color: theme.textMuted,
            letterSpacing: '1px',
            marginBottom: '12px',
          }}>
            ENERGY LEVEL
          </label>
          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
          }}>
            <span style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '11px',
              color: theme.textMuted,
            }}>
              Low
            </span>
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={() => setEnergyLevel(level)}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  border: `2px solid ${energyLevel >= level ? theme.accent : theme.border}`,
                  background: energyLevel >= level ? theme.accent : 'transparent',
                  color: energyLevel >= level ? '#fff' : theme.textMuted,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {level}
              </button>
            ))}
            <span style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '11px',
              color: theme.textMuted,
            }}>
              High
            </span>
          </div>
        </div>

        {/* Text Fields */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '28px',
        }}>
          {/* Accomplishments */}
          <div>
            <label style={{
              display: 'block',
              fontFamily: "'Space Mono', monospace",
              fontSize: '11px',
              color: theme.textMuted,
              letterSpacing: '1px',
              marginBottom: '8px',
            }}>
              WHAT DID YOU ACCOMPLISH? ✅
            </label>
            <textarea
              value={accomplishments}
              onChange={(e) => setAccomplishments(e.target.value)}
              placeholder="List your wins today..."
              style={{
                width: '100%',
                padding: '12px 16px',
                background: theme.bg,
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                color: theme.text,
                fontSize: '14px',
                fontFamily: "'Space Mono', monospace",
                outline: 'none',
                resize: 'vertical',
                minHeight: '100px',
                lineHeight: '1.6',
              }}
            />
          </div>

          {/* Goals */}
          <div>
            <label style={{
              display: 'block',
              fontFamily: "'Space Mono', monospace",
              fontSize: '11px',
              color: theme.textMuted,
              letterSpacing: '1px',
              marginBottom: '8px',
            }}>
              TOMORROW'S GOALS 🎯
            </label>
            <textarea
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="What do you want to achieve?"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: theme.bg,
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                color: theme.text,
                fontSize: '14px',
                fontFamily: "'Space Mono', monospace",
                outline: 'none',
                resize: 'vertical',
                minHeight: '100px',
                lineHeight: '1.6',
              }}
            />
          </div>
        </div>

        {/* Gratitude */}
        <div style={{ marginBottom: '28px' }}>
          <label style={{
            display: 'block',
            fontFamily: "'Space Mono', monospace",
            fontSize: '11px',
            color: theme.textMuted,
            letterSpacing: '1px',
            marginBottom: '8px',
          }}>
            GRATITUDE 🙏
          </label>
          <textarea
            value={gratitude}
            onChange={(e) => setGratitude(e.target.value)}
            placeholder="What are you grateful for today?"
            style={{
              width: '100%',
              padding: '12px 16px',
              background: theme.bg,
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              color: theme.text,
              fontSize: '14px',
              fontFamily: "'Space Mono', monospace",
              outline: 'none',
              resize: 'vertical',
              minHeight: '80px',
              lineHeight: '1.6',
            }}
          />
        </div>

        {/* Notes */}
        <div style={{ marginBottom: '28px' }}>
          <label style={{
            display: 'block',
            fontFamily: "'Space Mono', monospace",
            fontSize: '11px',
            color: theme.textMuted,
            letterSpacing: '1px',
            marginBottom: '8px',
          }}>
            NOTES & REFLECTIONS 📝
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any thoughts, learnings, or reflections..."
            style={{
              width: '100%',
              padding: '12px 16px',
              background: theme.bg,
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              color: theme.text,
              fontSize: '14px',
              fontFamily: "'Space Mono', monospace",
              outline: 'none',
              resize: 'vertical',
              minHeight: '80px',
              lineHeight: '1.6',
            }}
          />
        </div>

        {/* Save Button */}
        <button
          onClick={saveCheckin}
          disabled={isSaving || !mood}
          style={{
            padding: '14px 32px',
            background: mood ? theme.accent : theme.textMuted,
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontFamily: "'Space Mono', monospace",
            fontSize: '12px',
            letterSpacing: '1px',
            cursor: !mood || isSaving ? 'not-allowed' : 'pointer',
            opacity: !mood || isSaving ? 0.7 : 1,
          }}
        >
          {isSaving ? 'SAVING...' : todayCheckin ? 'UPDATE CHECK-IN' : 'SAVE CHECK-IN'}
        </button>
      </div>

      {/* History Toggle */}
      <button
        onClick={() => setShowHistory(!showHistory)}
        style={{
          width: '100%',
          padding: '16px',
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: '12px',
          color: theme.textMuted,
          fontFamily: "'Space Mono', monospace",
          fontSize: '12px',
          letterSpacing: '1px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: showHistory ? '16px' : '0',
        }}
      >
        {showHistory ? '▲ HIDE HISTORY' : '▼ VIEW PAST CHECK-INS'}
      </button>

      {/* History */}
      {showHistory && pastCheckins.length > 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          {pastCheckins.map((checkin) => {
            const moodConfig = getMoodConfig(checkin.mood);
            return (
              <div
                key={checkin.id}
                style={{
                  background: theme.surface,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '12px',
                  padding: '20px',
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}>
                    <span style={{ fontSize: '24px' }}>{moodConfig.emoji}</span>
                    <div>
                      <div style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '13px',
                        color: theme.text,
                        fontWeight: '500',
                      }}>
                        {formatDate(checkin.checkin_date)}
                      </div>
                      <div style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '11px',
                        color: moodConfig.color,
                      }}>
                        {moodConfig.label} • Energy: {checkin.energy_level}/5
                      </div>
                    </div>
                  </div>
                </div>

                {checkin.accomplishments && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '10px',
                      color: theme.success,
                      letterSpacing: '1px',
                      marginBottom: '4px',
                    }}>
                      ACCOMPLISHMENTS
                    </div>
                    <div style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '12px',
                      color: theme.textMuted,
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap',
                    }}>
                      {checkin.accomplishments}
                    </div>
                  </div>
                )}

                {checkin.gratitude && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '10px',
                      color: theme.purple,
                      letterSpacing: '1px',
                      marginBottom: '4px',
                    }}>
                      GRATITUDE
                    </div>
                    <div style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '12px',
                      color: theme.textMuted,
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap',
                    }}>
                      {checkin.gratitude}
                    </div>
                  </div>
                )}

                {checkin.notes && (
                  <div>
                    <div style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '10px',
                      color: theme.accent,
                      letterSpacing: '1px',
                      marginBottom: '4px',
                    }}>
                      NOTES
                    </div>
                    <div style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '12px',
                      color: theme.textMuted,
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap',
                    }}>
                      {checkin.notes}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showHistory && pastCheckins.length === 0 && (
        <div style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📅</div>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '13px',
            color: theme.textMuted,
          }}>
            No past check-ins yet. Start your streak today!
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyCheckinSection;
