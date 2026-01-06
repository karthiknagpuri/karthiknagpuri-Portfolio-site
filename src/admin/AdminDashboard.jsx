import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useBlog } from '../BlogContext';
import {
  generateDailyPrompts,
  generateContentInspiration,
  improveContent,
  generateMotivationalMessage,
  generateContentPlan,
} from '../utils/openai';

// Fallback prompts if AI fails
const FALLBACK_PROMPTS = {
  blog: "Share a lesson learned from your latest startup interaction",
  twitter: "Share one insight from today's work in a thread",
  instagram: "Behind-the-scenes of your daily routine",
  youtube: "Vlog: A day meeting founders",
  linkedin: "Share a professional milestone or learning",
};

const PLATFORM_CONFIG = {
  blog: { icon: '✍️', color: '#C4785A', name: 'Blog Post', link: '/admin/blog' },
  twitter: { icon: '𝕏', color: '#1DA1F2', name: 'Twitter/X', link: null },
  instagram: { icon: '📸', color: '#E4405F', name: 'Instagram', link: null },
  youtube: { icon: '▶️', color: '#FF0000', name: 'YouTube', link: null },
  linkedin: { icon: '💼', color: '#0A66C2', name: 'LinkedIn', link: null },
};

const AdminDashboard = () => {
  const { posts } = useBlog();
  const [stats, setStats] = useState({
    messages: 0,
    resources: 0,
    experiences: 0,
  });
  const [recentMessages, setRecentMessages] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [showDraftModal, setShowDraftModal] = useState(null);
  const [draftContent, setDraftContent] = useState('');
  const [draftTitle, setDraftTitle] = useState('');
  const [todaysPrompts, setTodaysPrompts] = useState(FALLBACK_PROMPTS);
  const [contentStreak, setContentStreak] = useState(0);
  const [motivationalMessage, setMotivationalMessage] = useState("What will you create today?");
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiInspiration, setAiInspiration] = useState(null);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(true);
  const [showImproveResult, setShowImproveResult] = useState(null);

  // Idea to Content Planner states
  const [ideaInput, setIdeaInput] = useState('');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [contentPlan, setContentPlan] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [expandedPlatform, setExpandedPlatform] = useState(null);

  // Daily Check-in state
  const [todayCheckin, setTodayCheckin] = useState(null);
  const [checkinStreak, setCheckinStreak] = useState(0);

  const theme = {
    bg: '#0a0a0a',
    surface: '#141414',
    border: 'rgba(255,255,255,0.1)',
    text: '#ffffff',
    textMuted: '#888888',
    accent: '#C4785A',
    teal: '#4ECDC4',
    yellow: '#FFE66D',
    danger: '#FF6B6B',
    purple: '#A855F7',
  };

  // Define all fetch functions before useEffect
  const loadAIPrompts = async () => {
    setIsLoadingPrompts(true);

    // Check if we have cached prompts for today
    const cachedPrompts = localStorage.getItem('aiDailyPrompts');
    const cachedDate = localStorage.getItem('aiPromptsDate');
    const today = new Date().toDateString();

    if (cachedPrompts && cachedDate === today) {
      setTodaysPrompts(JSON.parse(cachedPrompts));
      setIsLoadingPrompts(false);
      return;
    }

    // Generate new AI prompts
    const aiPrompts = await generateDailyPrompts();

    if (aiPrompts) {
      setTodaysPrompts(aiPrompts);
      localStorage.setItem('aiDailyPrompts', JSON.stringify(aiPrompts));
      localStorage.setItem('aiPromptsDate', today);
    } else {
      setTodaysPrompts(FALLBACK_PROMPTS);
    }

    setIsLoadingPrompts(false);
  };

  const loadMotivationalMessage = async () => {
    const cachedMsg = localStorage.getItem('aiMotivation');
    const cachedDate = localStorage.getItem('aiMotivationDate');
    const today = new Date().toDateString();

    if (cachedMsg && cachedDate === today) {
      setMotivationalMessage(cachedMsg);
      return;
    }

    const message = await generateMotivationalMessage();
    if (message) {
      setMotivationalMessage(message);
      localStorage.setItem('aiMotivation', message);
      localStorage.setItem('aiMotivationDate', today);
    }
  };

  const fetchStats = async () => {
    try {
      const { count: messagesCount } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true });

      const { count: resourcesCount } = await supabase
        .from('resources')
        .select('*', { count: 'exact', head: true });

      const { count: experiencesCount } = await supabase
        .from('experiences')
        .select('*', { count: 'exact', head: true });

      setStats({
        messages: messagesCount || 0,
        resources: resourcesCount || 0,
        experiences: experiencesCount || 0,
      });
    } catch (error) {
      console.log('Stats fetch error:', error);
    }
  };

  const fetchRecentMessages = async () => {
    try {
      const { data } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      setRecentMessages(data || []);
    } catch (error) {
      console.log('Messages fetch error:', error);
    }
  };

  const fetchDrafts = async () => {
    try {
      const { data } = await supabase
        .from('content_drafts')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(5);

      setDrafts(data || []);
    } catch (error) {
      console.log('Drafts fetch error:', error);
    }
  };

  const loadContentStreak = () => {
    const savedStreak = localStorage.getItem('contentStreak');
    const savedDate = localStorage.getItem('lastContentDate');

    if (savedStreak && savedDate) {
      const lastDate = new Date(savedDate);
      const today = new Date();
      const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays <= 1) {
        setContentStreak(parseInt(savedStreak));
      } else {
        setContentStreak(0);
        localStorage.setItem('contentStreak', '0');
      }
    }
  };

  const loadTodayCheckin = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('checkin_date', today)
        .single();

      setTodayCheckin(data);

      // Calculate streak
      const { data: allCheckins } = await supabase
        .from('daily_checkins')
        .select('checkin_date')
        .order('checkin_date', { ascending: false })
        .limit(30);

      if (allCheckins?.length) {
        let streak = 0;
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);

        for (let i = 0; i < allCheckins.length; i++) {
          const checkinDate = new Date(allCheckins[i].checkin_date);
          checkinDate.setHours(0, 0, 0, 0);
          const expectedDate = new Date(todayDate);
          expectedDate.setDate(expectedDate.getDate() - i);
          if (checkinDate.getTime() === expectedDate.getTime()) {
            streak++;
          } else {
            break;
          }
        }
        setCheckinStreak(streak);
      }
    } catch (error) {
      console.log('Error loading checkin:', error);
    }
  };

  const updateContentStreak = () => {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('lastContentDate');

    if (savedDate !== today) {
      const newStreak = contentStreak + 1;
      setContentStreak(newStreak);
      localStorage.setItem('contentStreak', newStreak.toString());
      localStorage.setItem('lastContentDate', today);
    }
  };

  // Initialize data on mount
  useEffect(() => {
    // These functions fetch async data and update state - this is the correct pattern
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats();
    fetchRecentMessages();
    fetchDrafts();
    loadAIPrompts();
    loadContentStreak();
    loadMotivationalMessage();
    loadTodayCheckin();
  }, []);

  const handleAIInspire = async () => {
    setIsLoadingAI(true);
    setAiInspiration(null);

    const inspiration = await generateContentInspiration(showDraftModal);

    if (inspiration) {
      setAiInspiration(inspiration);
    } else {
      setAiInspiration("Couldn't generate inspiration. Try again!");
    }

    setIsLoadingAI(false);
  };

  const handleAIImprove = async () => {
    if (!draftContent.trim()) return;

    setIsLoadingAI(true);
    setShowImproveResult(null);

    const improved = await improveContent(showDraftModal, draftContent);

    if (improved) {
      setShowImproveResult(improved);
    }

    setIsLoadingAI(false);
  };

  const refreshPrompts = async () => {
    localStorage.removeItem('aiDailyPrompts');
    localStorage.removeItem('aiPromptsDate');
    loadAIPrompts();
  };

  const handleGenerateContentPlan = async () => {
    if (!ideaInput.trim()) return;

    setIsGeneratingPlan(true);
    setContentPlan(null);

    const plan = await generateContentPlan(ideaInput);

    if (plan) {
      setContentPlan(plan);
      setShowPlanModal(true);
      setExpandedPlatform('youtube');
    }

    setIsGeneratingPlan(false);
  };

  const closePlanModal = () => {
    setShowPlanModal(false);
    setExpandedPlatform(null);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const saveDraft = async () => {
    if (!draftContent.trim()) return;

    try {
      const { error } = await supabase
        .from('content_drafts')
        .insert({
          platform: showDraftModal,
          title: draftTitle || `${PLATFORM_CONFIG[showDraftModal].name} Draft`,
          content: draftContent,
          prompt: todaysPrompts[showDraftModal],
        });

      if (!error) {
        updateContentStreak();
        fetchDrafts();
        closeDraftModal();
      }
    } catch (error) {
      console.log('Save draft error:', error);
      const localDrafts = JSON.parse(localStorage.getItem('contentDrafts') || '[]');
      localDrafts.unshift({
        id: crypto.randomUUID(),
        platform: showDraftModal,
        title: draftTitle || `${PLATFORM_CONFIG[showDraftModal].name} Draft`,
        content: draftContent,
        created_at: new Date().toISOString(),
      });
      localStorage.setItem('contentDrafts', JSON.stringify(localDrafts.slice(0, 20)));
      updateContentStreak();
      closeDraftModal();
    }
  };

  const closeDraftModal = () => {
    setShowDraftModal(null);
    setDraftContent('');
    setDraftTitle('');
    setAiInspiration(null);
    setShowImproveResult(null);
  };

  const deleteDraft = async (id) => {
    try {
      await supabase.from('content_drafts').delete().eq('id', id);
      fetchDrafts();
    } catch (error) {
      console.log('Delete error:', error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const MOOD_EMOJI = {
    great: '🔥',
    good: '😊',
    okay: '😐',
    low: '😔',
    rough: '😫',
  };

  return (
    <div>
      {/* Welcome Section with Streak */}
      <div style={{
        marginBottom: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
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
            {getGreeting()}
          </h1>
          <p style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '13px',
            color: theme.textMuted,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span style={{ color: theme.purple }}>✨</span>
            {motivationalMessage}
          </p>
        </div>

        {/* Content Streak */}
        <div style={{
          background: contentStreak > 0 ? 'rgba(255,230,109,0.1)' : theme.surface,
          border: `1px solid ${contentStreak > 0 ? 'rgba(255,230,109,0.3)' : theme.border}`,
          borderRadius: '12px',
          padding: '16px 24px',
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: '32px',
            fontStyle: 'italic',
            color: contentStreak > 0 ? theme.yellow : theme.textMuted,
          }}>
            {contentStreak}
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

      {/* Daily Check-in Widget */}
      <Link
        to="/admin/checkin"
        style={{
          display: 'block',
          textDecoration: 'none',
          marginBottom: '32px',
        }}
      >
        <div
          style={{
            background: todayCheckin ? `${theme.teal}10` : theme.surface,
            border: `1px solid ${todayCheckin ? `${theme.teal}40` : theme.border}`,
            borderRadius: '12px',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = theme.teal;
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = todayCheckin ? `${theme.teal}40` : theme.border;
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: todayCheckin ? `${theme.teal}20` : theme.bg,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
            }}>
              {todayCheckin ? MOOD_EMOJI[todayCheckin.mood] || '✓' : '📋'}
            </div>
            <div>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '13px',
                color: theme.text,
                fontWeight: '500',
                marginBottom: '4px',
              }}>
                {todayCheckin ? 'You checked in today!' : 'Daily Check-in'}
              </div>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                color: todayCheckin ? theme.teal : theme.textMuted,
              }}>
                {todayCheckin
                  ? `Feeling ${todayCheckin.mood} • Energy ${todayCheckin.energy_level}/5`
                  : "How are you feeling today? Let's track it."}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {checkinStreak > 0 && (
              <div style={{
                background: 'rgba(255,230,109,0.15)',
                padding: '6px 12px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <span style={{ fontSize: '14px' }}>🔥</span>
                <span style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '11px',
                  color: theme.yellow,
                  fontWeight: '500',
                }}>
                  {checkinStreak} day streak
                </span>
              </div>
            )}
            <span style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '18px',
              color: theme.teal,
            }}>
              →
            </span>
          </div>
        </div>
      </Link>

      {/* Content Studio */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}>
          <h2 style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '12px',
            color: theme.textMuted,
            letterSpacing: '2px',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span style={{ color: theme.purple }}>🤖</span>
            AI CONTENT STUDIO
          </h2>
          <button
            onClick={refreshPrompts}
            disabled={isLoadingPrompts}
            style={{
              background: 'none',
              border: `1px solid ${theme.border}`,
              borderRadius: '6px',
              padding: '6px 12px',
              fontFamily: "'Space Mono', monospace",
              fontSize: '10px',
              color: theme.purple,
              cursor: isLoadingPrompts ? 'not-allowed' : 'pointer',
              letterSpacing: '1px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {isLoadingPrompts ? '⏳ LOADING...' : '✨ REFRESH AI PROMPTS'}
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}>
          {Object.entries(PLATFORM_CONFIG).map(([platform, config]) => (
            <div
              key={platform}
              style={{
                background: theme.surface,
                border: `1px solid ${theme.border}`,
                borderRadius: '12px',
                padding: '20px',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
              }}
              onClick={() => {
                if (config.link) {
                  window.location.href = config.link;
                } else {
                  setShowDraftModal(platform);
                  setDraftContent('');
                  setDraftTitle('');
                  setAiInspiration(null);
                }
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = config.color;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = theme.border;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px',
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: `${config.color}15`,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}>
                  {config.icon}
                </div>
                <div>
                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '13px',
                    color: theme.text,
                    fontWeight: '500',
                  }}>
                    {config.name}
                  </div>
                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '10px',
                    color: config.color,
                    letterSpacing: '1px',
                  }}>
                    {config.link ? 'GO TO EDITOR' : 'DRAFT NOW'}
                  </div>
                </div>
              </div>

              <div style={{
                background: theme.bg,
                borderRadius: '8px',
                padding: '12px',
                position: 'relative',
              }}>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '10px',
                  color: theme.purple,
                  marginBottom: '6px',
                  letterSpacing: '1px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  🤖 AI PROMPT
                </div>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '12px',
                  color: theme.textMuted,
                  lineHeight: '1.5',
                }}>
                  {isLoadingPrompts ? (
                    <span style={{ color: theme.purple }}>Generating with AI...</span>
                  ) : (
                    todaysPrompts[platform]
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Idea to Content Planner */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '12px',
          color: theme.textMuted,
          letterSpacing: '2px',
          margin: '0 0 16px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ color: theme.purple }}>💡</span>
          IDEA TO CONTENT PLANNER
        </h2>

        <div style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: '12px',
          padding: '24px',
        }}>
          <p style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '12px',
            color: theme.textMuted,
            marginBottom: '16px',
            lineHeight: '1.6',
          }}>
            Describe an experience, event, or idea and AI will suggest content strategies for each platform.
          </p>

          <textarea
            value={ideaInput}
            onChange={(e) => setIdeaInput(e.target.value)}
            placeholder="E.g., I attended Kerala Huddle Global by KSUM where I learned how ecosystems are deeply backing deeptech, hardware and innovation from rural India, with government being the backbone in supporting ecosystems..."
            style={{
              width: '100%',
              padding: '16px',
              background: theme.bg,
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              color: theme.text,
              fontSize: '13px',
              fontFamily: "'Space Mono', monospace",
              outline: 'none',
              resize: 'vertical',
              minHeight: '100px',
              lineHeight: '1.6',
              marginBottom: '16px',
            }}
          />

          <button
            onClick={handleGenerateContentPlan}
            disabled={!ideaInput.trim() || isGeneratingPlan}
            style={{
              background: ideaInput.trim() ? `linear-gradient(135deg, ${theme.purple}, #EC4899)` : theme.textMuted,
              border: 'none',
              borderRadius: '8px',
              padding: '14px 28px',
              fontFamily: "'Space Mono', monospace",
              fontSize: '12px',
              color: '#fff',
              cursor: !ideaInput.trim() || isGeneratingPlan ? 'not-allowed' : 'pointer',
              letterSpacing: '1px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: !ideaInput.trim() || isGeneratingPlan ? 0.6 : 1,
            }}
          >
            {isGeneratingPlan ? (
              <>⏳ AI IS PLANNING CONTENT...</>
            ) : (
              <>🚀 GENERATE CONTENT PLAN</>
            )}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px',
        marginBottom: '32px',
      }}>
        <Link
          to="/admin/blog"
          style={{
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: '12px',
            padding: '20px',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = theme.accent}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = theme.border}
        >
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '10px',
            color: theme.textMuted,
            letterSpacing: '1px',
            marginBottom: '4px',
          }}>
            BLOG POSTS
          </div>
          <div style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: '28px',
            color: theme.accent,
            fontStyle: 'italic',
          }}>
            {posts?.length || 0}
          </div>
        </Link>

        <Link
          to="/admin/resources"
          style={{
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: '12px',
            padding: '20px',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = theme.teal}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = theme.border}
        >
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '10px',
            color: theme.textMuted,
            letterSpacing: '1px',
            marginBottom: '4px',
          }}>
            RESOURCES
          </div>
          <div style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: '28px',
            color: theme.teal,
            fontStyle: 'italic',
          }}>
            {stats.resources}
          </div>
        </Link>

        <Link
          to="/admin/experiences"
          style={{
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: '12px',
            padding: '20px',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = theme.text}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = theme.border}
        >
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '10px',
            color: theme.textMuted,
            letterSpacing: '1px',
            marginBottom: '4px',
          }}>
            EXPERIENCES
          </div>
          <div style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: '28px',
            color: theme.text,
            fontStyle: 'italic',
          }}>
            {stats.experiences}
          </div>
        </Link>

        <Link
          to="/admin/messages"
          style={{
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: '12px',
            padding: '20px',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = theme.yellow}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = theme.border}
        >
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '10px',
            color: theme.textMuted,
            letterSpacing: '1px',
            marginBottom: '4px',
          }}>
            MESSAGES
          </div>
          <div style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: '28px',
            color: theme.yellow,
            fontStyle: 'italic',
          }}>
            {stats.messages}
          </div>
        </Link>
      </div>

      {/* Two Column Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
      }}>
        {/* Recent Drafts */}
        <div>
          <h2 style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '12px',
            color: theme.textMuted,
            letterSpacing: '2px',
            margin: '0 0 16px 0',
          }}>
            RECENT DRAFTS
          </h2>
          <div style={{
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: '12px',
            overflow: 'hidden',
          }}>
            {drafts.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>📝</div>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '13px',
                  color: theme.textMuted,
                  marginBottom: '8px',
                }}>
                  No drafts yet
                </div>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '11px',
                  color: theme.textMuted,
                }}>
                  Click any platform above to start drafting
                </div>
              </div>
            ) : (
              drafts.map((draft, index) => (
                <div
                  key={draft.id}
                  style={{
                    padding: '16px 20px',
                    borderBottom: index < drafts.length - 1 ? `1px solid ${theme.border}` : 'none',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{PLATFORM_CONFIG[draft.platform]?.icon || '📄'}</span>
                      <span style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '12px',
                        color: theme.text,
                      }}>
                        {draft.title}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteDraft(draft.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: theme.danger,
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontFamily: "'Space Mono', monospace",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '11px',
                    color: theme.textMuted,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {draft.content?.substring(0, 60)}...
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Messages */}
        <div>
          <h2 style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '12px',
            color: theme.textMuted,
            letterSpacing: '2px',
            margin: '0 0 16px 0',
          }}>
            RECENT MESSAGES
          </h2>
          <div style={{
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: '12px',
            overflow: 'hidden',
          }}>
            {recentMessages.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>💬</div>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '13px',
                  color: theme.textMuted,
                }}>
                  No messages yet
                </div>
              </div>
            ) : (
              <>
                {recentMessages.map((msg, index) => (
                  <div
                    key={msg.id || index}
                    style={{
                      padding: '16px 20px',
                      borderBottom: index < recentMessages.length - 1 ? `1px solid ${theme.border}` : 'none',
                    }}
                  >
                    <div style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '12px',
                      color: theme.text,
                      marginBottom: '4px',
                    }}>
                      {msg.name}
                    </div>
                    <div style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '11px',
                      color: theme.textMuted,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {msg.message}
                    </div>
                  </div>
                ))}
                <Link
                  to="/admin/messages"
                  style={{
                    display: 'block',
                    padding: '12px 20px',
                    textAlign: 'center',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '11px',
                    color: theme.accent,
                    textDecoration: 'none',
                    borderTop: `1px solid ${theme.border}`,
                  }}
                >
                  View all →
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* AI-Powered Draft Modal */}
      {showDraftModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
          onClick={closeDraftModal}
        >
          <div
            style={{
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: '16px',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '24px',
              borderBottom: `1px solid ${theme.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: `${PLATFORM_CONFIG[showDraftModal].color}15`,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}>
                  {PLATFORM_CONFIG[showDraftModal].icon}
                </div>
                <div>
                  <h2 style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontSize: '20px',
                    fontStyle: 'italic',
                    color: theme.text,
                    margin: 0,
                  }}>
                    {PLATFORM_CONFIG[showDraftModal].name} Draft
                  </h2>
                  <p style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '11px',
                    color: theme.purple,
                    margin: '4px 0 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    🤖 AI-powered writing assistant
                  </p>
                </div>
              </div>
              <button
                onClick={closeDraftModal}
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

            <div style={{ padding: '24px' }}>
              {/* AI Prompt */}
              <div style={{
                background: `${theme.purple}10`,
                border: `1px solid ${theme.purple}30`,
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px',
              }}>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '10px',
                  color: theme.purple,
                  marginBottom: '8px',
                  letterSpacing: '1px',
                }}>
                  🤖 TODAY'S AI PROMPT
                </div>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '13px',
                  color: theme.text,
                  lineHeight: '1.6',
                }}>
                  {todaysPrompts[showDraftModal]}
                </div>
              </div>

              {/* AI Inspire Button */}
              <button
                onClick={handleAIInspire}
                disabled={isLoadingAI}
                style={{
                  width: '100%',
                  background: `linear-gradient(135deg, ${theme.purple}, #EC4899)`,
                  border: 'none',
                  borderRadius: '8px',
                  padding: '14px',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '12px',
                  color: '#fff',
                  cursor: isLoadingAI ? 'not-allowed' : 'pointer',
                  letterSpacing: '1px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: isLoadingAI ? 0.7 : 1,
                }}
              >
                {isLoadingAI ? (
                  <>⏳ AI IS THINKING...</>
                ) : (
                  <>✨ AI INSPIRE ME</>
                )}
              </button>

              {/* AI Inspiration Result */}
              {aiInspiration && (
                <div style={{
                  background: theme.bg,
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '20px',
                  border: `1px solid ${theme.purple}30`,
                }}>
                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '10px',
                    color: theme.purple,
                    marginBottom: '12px',
                    letterSpacing: '1px',
                  }}>
                    ✨ AI GENERATED INSPIRATION
                  </div>
                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '12px',
                    color: theme.text,
                    lineHeight: '1.7',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {aiInspiration}
                  </div>
                </div>
              )}

              {/* Title Input */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '11px',
                  color: theme.textMuted,
                  letterSpacing: '1px',
                }}>
                  TITLE (OPTIONAL)
                </label>
                <input
                  type="text"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  placeholder="Give your draft a title..."
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
                  }}
                />
              </div>

              {/* Content Textarea */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '11px',
                  color: theme.textMuted,
                  letterSpacing: '1px',
                }}>
                  CONTENT
                </label>
                <textarea
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                  placeholder="Start writing your content..."
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: theme.bg,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    color: theme.text,
                    fontSize: '14px',
                    fontFamily: "'Space Mono', monospace",
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: '200px',
                    lineHeight: '1.6',
                  }}
                />
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '8px',
                }}>
                  <button
                    onClick={handleAIImprove}
                    disabled={!draftContent.trim() || isLoadingAI}
                    style={{
                      background: 'none',
                      border: `1px solid ${theme.purple}`,
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '10px',
                      color: theme.purple,
                      cursor: !draftContent.trim() || isLoadingAI ? 'not-allowed' : 'pointer',
                      opacity: !draftContent.trim() || isLoadingAI ? 0.5 : 1,
                    }}
                  >
                    🪄 AI IMPROVE
                  </button>
                  <span style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '11px',
                    color: theme.textMuted,
                  }}>
                    {draftContent.length} chars
                    {showDraftModal === 'twitter' && ` / 280`}
                  </span>
                </div>
              </div>

              {/* AI Improve Result */}
              {showImproveResult && (
                <div style={{
                  background: theme.bg,
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '20px',
                  border: `1px solid ${theme.teal}30`,
                }}>
                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '10px',
                    color: theme.teal,
                    marginBottom: '12px',
                    letterSpacing: '1px',
                  }}>
                    🪄 AI IMPROVED VERSION
                  </div>
                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '12px',
                    color: theme.text,
                    lineHeight: '1.7',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {showImproveResult}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={saveDraft}
                  disabled={!draftContent.trim()}
                  style={{
                    flex: 1,
                    background: draftContent.trim() ? PLATFORM_CONFIG[showDraftModal].color : theme.textMuted,
                    border: 'none',
                    borderRadius: '8px',
                    padding: '14px',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '12px',
                    color: '#fff',
                    cursor: draftContent.trim() ? 'pointer' : 'not-allowed',
                    letterSpacing: '1px',
                    opacity: draftContent.trim() ? 1 : 0.5,
                  }}
                >
                  💾 SAVE DRAFT
                </button>
                <button
                  onClick={closeDraftModal}
                  style={{
                    background: 'none',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    padding: '14px 24px',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '12px',
                    color: theme.textMuted,
                    cursor: 'pointer',
                    letterSpacing: '1px',
                  }}
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Plan Modal */}
      {showPlanModal && contentPlan && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
          onClick={closePlanModal}
        >
          <div
            style={{
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: '16px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '24px',
              borderBottom: `1px solid ${theme.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'sticky',
              top: 0,
              background: theme.surface,
              zIndex: 10,
            }}>
              <div>
                <h2 style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: '24px',
                  fontStyle: 'italic',
                  color: theme.text,
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}>
                  <span style={{ color: theme.purple }}>🚀</span>
                  Your Content Plan
                </h2>
                <p style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '11px',
                  color: theme.textMuted,
                  margin: '8px 0 0 0',
                  maxWidth: '500px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  Based on: "{ideaInput.substring(0, 80)}..."
                </p>
              </div>
              <button
                onClick={closePlanModal}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.textMuted,
                  fontSize: '28px',
                  cursor: 'pointer',
                  padding: '8px',
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {/* Platform Tabs */}
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '24px',
                flexWrap: 'wrap',
              }}>
                {[
                  { key: 'youtube', icon: '▶️', color: '#FF0000', name: 'YouTube' },
                  { key: 'instagram', icon: '📸', color: '#E4405F', name: 'Instagram' },
                  { key: 'twitter', icon: '𝕏', color: '#1DA1F2', name: 'Twitter/X' },
                  { key: 'linkedin', icon: '💼', color: '#0A66C2', name: 'LinkedIn' },
                  { key: 'blog', icon: '✍️', color: '#C4785A', name: 'Blog' },
                ].map((platform) => (
                  <button
                    key={platform.key}
                    onClick={() => setExpandedPlatform(platform.key)}
                    style={{
                      background: expandedPlatform === platform.key ? `${platform.color}20` : 'transparent',
                      border: `1px solid ${expandedPlatform === platform.key ? platform.color : theme.border}`,
                      borderRadius: '8px',
                      padding: '10px 16px',
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '12px',
                      color: expandedPlatform === platform.key ? platform.color : theme.textMuted,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {platform.icon} {platform.name}
                  </button>
                ))}
              </div>

              {/* YouTube Content */}
              {expandedPlatform === 'youtube' && contentPlan.youtube && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  <div style={{
                    background: '#FF000010',
                    border: '1px solid #FF000030',
                    borderRadius: '12px',
                    padding: '20px',
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '16px',
                    }}>
                      <h3 style={{
                        fontFamily: "'Instrument Serif', serif",
                        fontSize: '20px',
                        fontStyle: 'italic',
                        color: theme.text,
                        margin: 0,
                      }}>
                        {contentPlan.youtube.title}
                      </h3>
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(contentPlan.youtube, null, 2))}
                        style={{
                          background: 'none',
                          border: `1px solid ${theme.border}`,
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontFamily: "'Space Mono', monospace",
                          fontSize: '10px',
                          color: theme.textMuted,
                          cursor: 'pointer',
                        }}
                      >
                        📋 Copy All
                      </button>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <div style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '10px',
                        color: '#FF0000',
                        marginBottom: '6px',
                        letterSpacing: '1px',
                      }}>
                        🎬 HOOK (First 5 seconds)
                      </div>
                      <div style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '13px',
                        color: theme.text,
                        background: theme.bg,
                        padding: '12px',
                        borderRadius: '8px',
                      }}>
                        "{contentPlan.youtube.hook}"
                      </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <div style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '10px',
                        color: '#FF0000',
                        marginBottom: '6px',
                        letterSpacing: '1px',
                      }}>
                        📝 KEY POINTS TO COVER
                      </div>
                      <div style={{
                        background: theme.bg,
                        padding: '12px',
                        borderRadius: '8px',
                      }}>
                        {contentPlan.youtube.keyPoints?.map((point, idx) => (
                          <div key={idx} style={{
                            fontFamily: "'Space Mono', monospace",
                            fontSize: '12px',
                            color: theme.text,
                            padding: '8px 0',
                            borderBottom: idx < contentPlan.youtube.keyPoints.length - 1 ? `1px solid ${theme.border}` : 'none',
                          }}>
                            {idx + 1}. {point}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <div style={{
                          fontFamily: "'Space Mono', monospace",
                          fontSize: '10px',
                          color: '#FF0000',
                          marginBottom: '6px',
                          letterSpacing: '1px',
                        }}>
                          🖼️ THUMBNAIL IDEA
                        </div>
                        <div style={{
                          fontFamily: "'Space Mono', monospace",
                          fontSize: '12px',
                          color: theme.textMuted,
                          background: theme.bg,
                          padding: '12px',
                          borderRadius: '8px',
                        }}>
                          {contentPlan.youtube.thumbnailIdea}
                        </div>
                      </div>
                      <div>
                        <div style={{
                          fontFamily: "'Space Mono', monospace",
                          fontSize: '10px',
                          color: '#FF0000',
                          marginBottom: '6px',
                          letterSpacing: '1px',
                        }}>
                          📢 CALL TO ACTION
                        </div>
                        <div style={{
                          fontFamily: "'Space Mono', monospace",
                          fontSize: '12px',
                          color: theme.textMuted,
                          background: theme.bg,
                          padding: '12px',
                          borderRadius: '8px',
                        }}>
                          {contentPlan.youtube.cta}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Instagram Content */}
              {expandedPlatform === 'instagram' && contentPlan.instagram && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  <div style={{
                    background: '#E4405F10',
                    border: '1px solid #E4405F30',
                    borderRadius: '12px',
                    padding: '20px',
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '16px',
                    }}>
                      <div style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '11px',
                        color: '#E4405F',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                      }}>
                        {contentPlan.instagram.type}
                      </div>
                      <button
                        onClick={() => copyToClipboard(contentPlan.instagram.caption)}
                        style={{
                          background: 'none',
                          border: `1px solid ${theme.border}`,
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontFamily: "'Space Mono', monospace",
                          fontSize: '10px',
                          color: theme.textMuted,
                          cursor: 'pointer',
                        }}
                      >
                        📋 Copy Caption
                      </button>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <div style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '10px',
                        color: '#E4405F',
                        marginBottom: '6px',
                        letterSpacing: '1px',
                      }}>
                        📝 CAPTION
                      </div>
                      <div style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '13px',
                        color: theme.text,
                        background: theme.bg,
                        padding: '16px',
                        borderRadius: '8px',
                        lineHeight: '1.7',
                        whiteSpace: 'pre-wrap',
                      }}>
                        {contentPlan.instagram.caption}
                      </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <div style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '10px',
                        color: '#E4405F',
                        marginBottom: '6px',
                        letterSpacing: '1px',
                      }}>
                        📸 VISUAL IDEAS
                      </div>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '12px',
                      }}>
                        {contentPlan.instagram.visualIdeas?.map((idea, idx) => (
                          <div key={idx} style={{
                            fontFamily: "'Space Mono', monospace",
                            fontSize: '12px',
                            color: theme.text,
                            background: theme.bg,
                            padding: '12px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '8px',
                          }}>
                            <span style={{ color: '#E4405F' }}>{idx + 1}.</span>
                            {idea}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '10px',
                        color: '#E4405F',
                        marginBottom: '6px',
                        letterSpacing: '1px',
                      }}>
                        #️⃣ HASHTAGS
                      </div>
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px',
                      }}>
                        {contentPlan.instagram.hashtags?.map((tag, idx) => (
                          <span
                            key={idx}
                            onClick={() => copyToClipboard(`#${tag}`)}
                            style={{
                              fontFamily: "'Space Mono', monospace",
                              fontSize: '11px',
                              color: '#E4405F',
                              background: theme.bg,
                              padding: '6px 12px',
                              borderRadius: '20px',
                              cursor: 'pointer',
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Twitter Content */}
              {expandedPlatform === 'twitter' && contentPlan.twitter && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  <div style={{
                    background: '#1DA1F210',
                    border: '1px solid #1DA1F230',
                    borderRadius: '12px',
                    padding: '20px',
                  }}>
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px',
                      }}>
                        <div style={{
                          fontFamily: "'Space Mono', monospace",
                          fontSize: '10px',
                          color: '#1DA1F2',
                          letterSpacing: '1px',
                        }}>
                          💬 SINGLE TWEET
                        </div>
                        <button
                          onClick={() => copyToClipboard(contentPlan.twitter.singleTweet)}
                          style={{
                            background: 'none',
                            border: `1px solid ${theme.border}`,
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontFamily: "'Space Mono', monospace",
                            fontSize: '10px',
                            color: theme.textMuted,
                            cursor: 'pointer',
                          }}
                        >
                          📋 Copy
                        </button>
                      </div>
                      <div style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '14px',
                        color: theme.text,
                        background: theme.bg,
                        padding: '16px',
                        borderRadius: '8px',
                        lineHeight: '1.6',
                      }}>
                        {contentPlan.twitter.singleTweet}
                      </div>
                      <div style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '10px',
                        color: theme.textMuted,
                        marginTop: '6px',
                        textAlign: 'right',
                      }}>
                        {contentPlan.twitter.singleTweet?.length || 0} / 280 chars
                      </div>
                    </div>

                    <div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px',
                      }}>
                        <div style={{
                          fontFamily: "'Space Mono', monospace",
                          fontSize: '10px',
                          color: '#1DA1F2',
                          letterSpacing: '1px',
                        }}>
                          🧵 THREAD
                        </div>
                        <button
                          onClick={() => copyToClipboard(contentPlan.twitter.thread?.join('\n\n---\n\n'))}
                          style={{
                            background: 'none',
                            border: `1px solid ${theme.border}`,
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontFamily: "'Space Mono', monospace",
                            fontSize: '10px',
                            color: theme.textMuted,
                            cursor: 'pointer',
                          }}
                        >
                          📋 Copy Thread
                        </button>
                      </div>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}>
                        {contentPlan.twitter.thread?.map((tweet, idx) => (
                          <div
                            key={idx}
                            style={{
                              fontFamily: "'Space Mono', monospace",
                              fontSize: '13px',
                              color: theme.text,
                              background: theme.bg,
                              padding: '16px',
                              borderRadius: '8px',
                              borderLeft: `3px solid #1DA1F2`,
                              position: 'relative',
                            }}
                          >
                            <div style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              fontFamily: "'Space Mono', monospace",
                              fontSize: '10px',
                              color: theme.textMuted,
                            }}>
                              {idx + 1}/{contentPlan.twitter.thread?.length}
                            </div>
                            {tweet}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* LinkedIn Content */}
              {expandedPlatform === 'linkedin' && contentPlan.linkedin && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  <div style={{
                    background: '#0A66C210',
                    border: '1px solid #0A66C230',
                    borderRadius: '12px',
                    padding: '20px',
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      marginBottom: '16px',
                    }}>
                      <button
                        onClick={() => copyToClipboard(`${contentPlan.linkedin.hook}\n\n${contentPlan.linkedin.body}\n\n${contentPlan.linkedin.cta}`)}
                        style={{
                          background: 'none',
                          border: `1px solid ${theme.border}`,
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontFamily: "'Space Mono', monospace",
                          fontSize: '10px',
                          color: theme.textMuted,
                          cursor: 'pointer',
                        }}
                      >
                        📋 Copy Full Post
                      </button>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <div style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '10px',
                        color: '#0A66C2',
                        marginBottom: '6px',
                        letterSpacing: '1px',
                      }}>
                        🎯 HOOK (Stop the scroll)
                      </div>
                      <div style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '14px',
                        color: theme.text,
                        background: theme.bg,
                        padding: '16px',
                        borderRadius: '8px',
                        fontWeight: '500',
                      }}>
                        {contentPlan.linkedin.hook}
                      </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <div style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '10px',
                        color: '#0A66C2',
                        marginBottom: '6px',
                        letterSpacing: '1px',
                      }}>
                        📝 BODY
                      </div>
                      <div style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '13px',
                        color: theme.text,
                        background: theme.bg,
                        padding: '16px',
                        borderRadius: '8px',
                        lineHeight: '1.8',
                        whiteSpace: 'pre-wrap',
                      }}>
                        {contentPlan.linkedin.body}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <div style={{
                          fontFamily: "'Space Mono', monospace",
                          fontSize: '10px',
                          color: '#0A66C2',
                          marginBottom: '6px',
                          letterSpacing: '1px',
                        }}>
                          📢 CALL TO ACTION
                        </div>
                        <div style={{
                          fontFamily: "'Space Mono', monospace",
                          fontSize: '12px',
                          color: theme.textMuted,
                          background: theme.bg,
                          padding: '12px',
                          borderRadius: '8px',
                        }}>
                          {contentPlan.linkedin.cta}
                        </div>
                      </div>
                      <div>
                        <div style={{
                          fontFamily: "'Space Mono', monospace",
                          fontSize: '10px',
                          color: '#0A66C2',
                          marginBottom: '6px',
                          letterSpacing: '1px',
                        }}>
                          💡 KEY TAKEAWAYS
                        </div>
                        <div style={{
                          background: theme.bg,
                          padding: '12px',
                          borderRadius: '8px',
                        }}>
                          {contentPlan.linkedin.keyTakeaways?.map((takeaway, idx) => (
                            <div key={idx} style={{
                              fontFamily: "'Space Mono', monospace",
                              fontSize: '11px',
                              color: theme.text,
                              padding: '4px 0',
                            }}>
                              • {takeaway}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Blog Content */}
              {expandedPlatform === 'blog' && contentPlan.blog && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  <div style={{
                    background: '#C4785A10',
                    border: '1px solid #C4785A30',
                    borderRadius: '12px',
                    padding: '20px',
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '16px',
                    }}>
                      <div>
                        <h3 style={{
                          fontFamily: "'Instrument Serif', serif",
                          fontSize: '22px',
                          fontStyle: 'italic',
                          color: theme.text,
                          margin: '0 0 8px 0',
                        }}>
                          {contentPlan.blog.title}
                        </h3>
                        <p style={{
                          fontFamily: "'Space Mono', monospace",
                          fontSize: '12px',
                          color: theme.textMuted,
                          margin: 0,
                        }}>
                          {contentPlan.blog.subtitle}
                        </p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(contentPlan.blog, null, 2))}
                        style={{
                          background: 'none',
                          border: `1px solid ${theme.border}`,
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontFamily: "'Space Mono', monospace",
                          fontSize: '10px',
                          color: theme.textMuted,
                          cursor: 'pointer',
                        }}
                      >
                        📋 Copy All
                      </button>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <div style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '10px',
                        color: '#C4785A',
                        marginBottom: '8px',
                        letterSpacing: '1px',
                      }}>
                        📑 OUTLINE
                      </div>
                      <div style={{
                        background: theme.bg,
                        padding: '16px',
                        borderRadius: '8px',
                      }}>
                        {contentPlan.blog.outline?.map((section, idx) => (
                          <div key={idx} style={{
                            fontFamily: "'Space Mono', monospace",
                            fontSize: '13px',
                            color: theme.text,
                            padding: '10px 0',
                            borderBottom: idx < contentPlan.blog.outline.length - 1 ? `1px solid ${theme.border}` : 'none',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px',
                          }}>
                            <span style={{
                              color: '#C4785A',
                              fontWeight: '500',
                              minWidth: '20px',
                            }}>
                              {idx + 1}.
                            </span>
                            {section}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '10px',
                        color: '#C4785A',
                        marginBottom: '6px',
                        letterSpacing: '1px',
                      }}>
                        🎯 KEY MESSAGE
                      </div>
                      <div style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '14px',
                        color: theme.text,
                        background: theme.bg,
                        padding: '16px',
                        borderRadius: '8px',
                        fontStyle: 'italic',
                        borderLeft: '3px solid #C4785A',
                      }}>
                        {contentPlan.blog.keyMessage}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
