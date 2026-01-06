import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

// Revenue stream categories
const REVENUE_CATEGORIES = {
  affiliate: { label: 'Affiliate', icon: '🔗', color: '#4ECDC4' },
  sponsorship: { label: 'Sponsorship', icon: '🤝', color: '#C4785A' },
  digital: { label: 'Digital Products', icon: '📦', color: '#9B59B6' },
  services: { label: 'Services', icon: '💼', color: '#3498DB' },
  ads: { label: 'Advertising', icon: '📢', color: '#E74C3C' },
  membership: { label: 'Membership', icon: '⭐', color: '#F1C40F' },
  donations: { label: 'Donations', icon: '❤️', color: '#E91E63' },
  other: { label: 'Other', icon: '💰', color: '#95A5A6' },
};

// Opportunity ideas database
const OPPORTUNITY_IDEAS = {
  affiliate: [
    { name: 'Amazon Associates', description: 'Promote products you use and love', potential: 'Medium', difficulty: 'Easy', url: 'affiliate-program.amazon.com' },
    { name: 'Impact', description: 'Premium affiliate network with top brands', potential: 'High', difficulty: 'Medium', url: 'impact.com' },
    { name: 'ShareASale', description: 'Wide range of merchants and niches', potential: 'Medium', difficulty: 'Easy', url: 'shareasale.com' },
    { name: 'PartnerStack', description: 'B2B SaaS affiliate programs', potential: 'High', difficulty: 'Medium', url: 'partnerstack.com' },
    { name: 'Notion Affiliates', description: 'Productivity tool referral program', potential: 'Medium', difficulty: 'Easy', url: 'notion.so/affiliates' },
  ],
  sponsorship: [
    { name: 'Newsletter Sponsorships', description: 'Sell ad space in your newsletter', potential: 'High', difficulty: 'Medium', url: '' },
    { name: 'Blog Sponsorships', description: 'Sponsored blog posts and reviews', potential: 'High', difficulty: 'Medium', url: '' },
    { name: 'Podcast Sponsors', description: 'Audio ad reads and integrations', potential: 'Very High', difficulty: 'Hard', url: '' },
    { name: 'Social Media Collabs', description: 'Paid social media partnerships', potential: 'High', difficulty: 'Medium', url: '' },
  ],
  digital: [
    { name: 'E-books', description: 'Compile your knowledge into guides', potential: 'Medium', difficulty: 'Medium', url: '' },
    { name: 'Online Courses', description: 'Teach what you know', potential: 'Very High', difficulty: 'Hard', url: '' },
    { name: 'Templates & Presets', description: 'Sell your workflows and designs', potential: 'Medium', difficulty: 'Easy', url: '' },
    { name: 'Notion Templates', description: 'Create and sell Notion templates', potential: 'Medium', difficulty: 'Easy', url: 'gumroad.com' },
    { name: 'Digital Downloads', description: 'Wallpapers, icons, graphics', potential: 'Low', difficulty: 'Easy', url: '' },
  ],
  services: [
    { name: 'Consulting', description: 'One-on-one advisory sessions', potential: 'Very High', difficulty: 'Easy', url: '' },
    { name: 'Freelance Services', description: 'Offer your skills on platforms', potential: 'High', difficulty: 'Medium', url: '' },
    { name: 'Speaking Engagements', description: 'Paid talks and presentations', potential: 'Very High', difficulty: 'Hard', url: '' },
    { name: 'Coaching', description: 'Ongoing mentorship programs', potential: 'High', difficulty: 'Medium', url: '' },
  ],
  membership: [
    { name: 'Patreon', description: 'Fan subscription platform', potential: 'High', difficulty: 'Medium', url: 'patreon.com' },
    { name: 'Buy Me a Coffee', description: 'Simple supporter payments', potential: 'Low', difficulty: 'Easy', url: 'buymeacoffee.com' },
    { name: 'Ko-fi', description: 'One-time and recurring support', potential: 'Low', difficulty: 'Easy', url: 'ko-fi.com' },
    { name: 'Substack', description: 'Paid newsletter subscriptions', potential: 'High', difficulty: 'Medium', url: 'substack.com' },
    { name: 'Memberful', description: 'Custom membership site', potential: 'High', difficulty: 'Hard', url: 'memberful.com' },
  ],
  ads: [
    { name: 'Google AdSense', description: 'Display ads on your site', potential: 'Low', difficulty: 'Easy', url: 'adsense.google.com' },
    { name: 'Carbon Ads', description: 'Developer-focused ad network', potential: 'Medium', difficulty: 'Medium', url: 'carbonads.net' },
    { name: 'Ethical Ads', description: 'Privacy-focused advertising', potential: 'Low', difficulty: 'Easy', url: 'ethicalads.io' },
  ],
};

const MonetizeSection = () => {
  const [activeTab, setActiveTab] = useState('streams');
  const [revenueStreams, setRevenueStreams] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddStream, setShowAddStream] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [aiInsights, setAiInsights] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const [streamForm, setStreamForm] = useState({
    name: '',
    category: 'affiliate',
    monthly_revenue: '',
    status: 'active',
    notes: '',
    url: '',
  });

  const [goalForm, setGoalForm] = useState({
    title: '',
    target_amount: '',
    current_amount: '',
    deadline: '',
    notes: '',
  });

  const theme = {
    bg: '#0a0a0a',
    surface: '#141414',
    surfaceHover: '#1a1a1a',
    border: 'rgba(255,255,255,0.1)',
    text: '#ffffff',
    textMuted: '#888888',
    accent: '#C4785A',
    success: '#4ECDC4',
    warning: '#FFB347',
    danger: '#FF6B6B',
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load revenue streams
      const { data: streams, error: streamsError } = await supabase
        .from('revenue_streams')
        .select('*')
        .order('monthly_revenue', { ascending: false });

      if (!streamsError && streams) {
        setRevenueStreams(streams);
      }

      // Load goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('revenue_goals')
        .select('*')
        .order('deadline', { ascending: true });

      if (!goalsError && goalsData) {
        setGoals(goalsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveStream = async () => {
    try {
      const data = {
        ...streamForm,
        monthly_revenue: parseFloat(streamForm.monthly_revenue) || 0,
      };

      if (editingId) {
        const { error } = await supabase
          .from('revenue_streams')
          .update(data)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('revenue_streams')
          .insert([data]);
        if (error) throw error;
      }

      await loadData();
      resetStreamForm();
    } catch (error) {
      console.error('Error saving stream:', error);
      alert('Error saving revenue stream');
    }
  };

  const deleteStream = async (id) => {
    if (!confirm('Delete this revenue stream?')) return;
    try {
      const { error } = await supabase.from('revenue_streams').delete().eq('id', id);
      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error('Error deleting stream:', error);
    }
  };

  const saveGoal = async () => {
    try {
      const data = {
        ...goalForm,
        target_amount: parseFloat(goalForm.target_amount) || 0,
        current_amount: parseFloat(goalForm.current_amount) || 0,
      };

      const { error } = await supabase
        .from('revenue_goals')
        .insert([data]);
      if (error) throw error;

      await loadData();
      resetGoalForm();
    } catch (error) {
      console.error('Error saving goal:', error);
      alert('Error saving goal');
    }
  };

  const deleteGoal = async (id) => {
    if (!confirm('Delete this goal?')) return;
    try {
      const { error } = await supabase.from('revenue_goals').delete().eq('id', id);
      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const resetStreamForm = () => {
    setStreamForm({
      name: '',
      category: 'affiliate',
      monthly_revenue: '',
      status: 'active',
      notes: '',
      url: '',
    });
    setEditingId(null);
    setShowAddStream(false);
  };

  const resetGoalForm = () => {
    setGoalForm({
      title: '',
      target_amount: '',
      current_amount: '',
      deadline: '',
      notes: '',
    });
    setShowAddGoal(false);
  };

  const editStream = (stream) => {
    setStreamForm({
      name: stream.name,
      category: stream.category,
      monthly_revenue: stream.monthly_revenue.toString(),
      status: stream.status,
      notes: stream.notes || '',
      url: stream.url || '',
    });
    setEditingId(stream.id);
    setShowAddStream(true);
  };

  const getAIInsights = async () => {
    setLoadingAI(true);
    try {
      const streamsSummary = revenueStreams.map(s => ({
        name: s.name,
        category: s.category,
        monthly_revenue: s.monthly_revenue,
        status: s.status,
      }));

      const totalRevenue = revenueStreams
        .filter(s => s.status === 'active')
        .reduce((sum, s) => sum + (parseFloat(s.monthly_revenue) || 0), 0);

      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a monetization strategist helping creators and entrepreneurs diversify and grow their income. Provide specific, actionable advice in JSON format.'
            },
            {
              role: 'user',
              content: `Analyze my revenue streams and suggest opportunities for growth. My current monthly revenue is $${totalRevenue.toFixed(2)}.

Current revenue streams:
${JSON.stringify(streamsSummary, null, 2)}

Respond in this exact JSON format:
{
  "analysis": "Brief overview of current monetization strategy",
  "strengths": ["strength 1", "strength 2"],
  "gaps": ["gap 1", "gap 2"],
  "opportunities": [
    {
      "title": "Opportunity name",
      "category": "affiliate|sponsorship|digital|services|membership|ads",
      "description": "What to do",
      "potential_monthly": number,
      "effort_level": "low|medium|high",
      "priority": "high|medium|low"
    }
  ],
  "quick_wins": ["Quick win 1", "Quick win 2"],
  "long_term_plays": ["Long term opportunity 1"]
}`
            }
          ],
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
        }),
      });

      const data = await response.json();
      if (data.choices?.[0]?.message?.content) {
        setAiInsights(JSON.parse(data.choices[0].message.content));
      }
    } catch (error) {
      console.error('Error getting AI insights:', error);
      alert('Error getting AI insights');
    } finally {
      setLoadingAI(false);
    }
  };

  // Calculate stats
  const totalMonthlyRevenue = revenueStreams
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + (parseFloat(s.monthly_revenue) || 0), 0);

  const totalYearlyRevenue = totalMonthlyRevenue * 12;

  const categoryBreakdown = Object.keys(REVENUE_CATEGORIES).map(cat => ({
    category: cat,
    ...REVENUE_CATEGORIES[cat],
    revenue: revenueStreams
      .filter(s => s.category === cat && s.status === 'active')
      .reduce((sum, s) => sum + (parseFloat(s.monthly_revenue) || 0), 0),
    count: revenueStreams.filter(s => s.category === cat && s.status === 'active').length,
  })).filter(c => c.count > 0);

  const getFilteredOpportunities = () => {
    if (selectedCategory === 'all') {
      return Object.entries(OPPORTUNITY_IDEAS).flatMap(([cat, items]) =>
        items.map(item => ({ ...item, category: cat }))
      );
    }
    return (OPPORTUNITY_IDEAS[selectedCategory] || []).map(item => ({
      ...item,
      category: selectedCategory,
    }));
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: '12px',
    color: theme.text,
    fontFamily: "'SF Pro Display', -apple-system, sans-serif",
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  };

  const labelStyle = {
    fontFamily: "'SF Pro Display', -apple-system, sans-serif",
    fontSize: '13px',
    fontWeight: '500',
    color: theme.textMuted,
    marginBottom: '8px',
    display: 'block',
    letterSpacing: '-0.01em',
  };

  const tabs = [
    { id: 'streams', label: 'Revenue Streams' },
    { id: 'opportunities', label: 'Opportunities' },
    { id: 'goals', label: 'Goals' },
  ];

  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        <div style={{
          background: theme.surface,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${theme.border}`,
        }}>
          <div style={{
            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            fontSize: '13px',
            color: theme.textMuted,
            marginBottom: '8px',
            letterSpacing: '-0.01em',
          }}>
            MONTHLY REVENUE
          </div>
          <div style={{
            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            fontSize: '36px',
            fontWeight: '600',
            color: theme.text,
            letterSpacing: '-0.02em',
          }}>
            ${totalMonthlyRevenue.toFixed(0)}
          </div>
        </div>

        <div style={{
          background: theme.surface,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${theme.border}`,
        }}>
          <div style={{
            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            fontSize: '13px',
            color: theme.textMuted,
            marginBottom: '8px',
            letterSpacing: '-0.01em',
          }}>
            YEARLY PROJECTION
          </div>
          <div style={{
            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            fontSize: '36px',
            fontWeight: '600',
            color: theme.text,
            letterSpacing: '-0.02em',
          }}>
            ${totalYearlyRevenue.toFixed(0)}
          </div>
        </div>

        <div style={{
          background: theme.surface,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${theme.border}`,
        }}>
          <div style={{
            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            fontSize: '13px',
            color: theme.textMuted,
            marginBottom: '8px',
            letterSpacing: '-0.01em',
          }}>
            ACTIVE STREAMS
          </div>
          <div style={{
            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            fontSize: '36px',
            fontWeight: '600',
            color: theme.text,
            letterSpacing: '-0.02em',
          }}>
            {revenueStreams.filter(s => s.status === 'active').length}
          </div>
        </div>

        <div
          style={{
            background: theme.surface,
            borderRadius: '16px',
            padding: '24px',
            border: `1px solid ${theme.border}`,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onClick={getAIInsights}
        >
          <div style={{
            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            fontSize: '13px',
            color: theme.textMuted,
            marginBottom: '8px',
            letterSpacing: '-0.01em',
          }}>
            AI INSIGHTS
          </div>
          <div style={{
            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            fontSize: '15px',
            color: theme.accent,
            letterSpacing: '-0.01em',
          }}>
            {loadingAI ? 'Analyzing...' : 'Get Suggestions →'}
          </div>
        </div>
      </div>

      {/* AI Insights Panel */}
      {aiInsights && (
        <div style={{
          background: theme.surface,
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px',
          border: `1px solid ${theme.accent}30`,
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}>
            <div style={{
              fontFamily: "'SF Pro Display', -apple-system, sans-serif",
              fontSize: '15px',
              fontWeight: '600',
              color: theme.accent,
              letterSpacing: '-0.01em',
            }}>
              AI Monetization Insights
            </div>
            <button
              onClick={() => setAiInsights(null)}
              style={{
                background: 'none',
                border: 'none',
                color: theme.textMuted,
                cursor: 'pointer',
                fontSize: '20px',
                padding: '4px',
              }}
            >
              ×
            </button>
          </div>

          <p style={{
            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            fontSize: '15px',
            color: theme.text,
            lineHeight: '1.6',
            marginBottom: '20px',
          }}>
            {aiInsights.analysis}
          </p>

          {aiInsights.quick_wins?.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                fontSize: '13px',
                fontWeight: '500',
                color: theme.success,
                marginBottom: '12px',
              }}>
                Quick Wins
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {aiInsights.quick_wins.map((win, idx) => (
                  <span key={idx} style={{
                    background: `${theme.success}15`,
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                    fontSize: '13px',
                    color: theme.success,
                  }}>
                    {win}
                  </span>
                ))}
              </div>
            </div>
          )}

          {aiInsights.opportunities?.length > 0 && (
            <div>
              <div style={{
                fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                fontSize: '13px',
                fontWeight: '500',
                color: theme.textMuted,
                marginBottom: '12px',
              }}>
                Top Opportunities
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {aiInsights.opportunities.slice(0, 3).map((opp, idx) => (
                  <div key={idx} style={{
                    background: theme.bg,
                    padding: '16px',
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <div>
                      <div style={{
                        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                        fontSize: '15px',
                        fontWeight: '500',
                        color: theme.text,
                        marginBottom: '4px',
                      }}>
                        {opp.title}
                      </div>
                      <div style={{
                        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                        fontSize: '13px',
                        color: theme.textMuted,
                      }}>
                        {opp.description}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                        fontSize: '17px',
                        fontWeight: '600',
                        color: theme.success,
                      }}>
                        +${opp.potential_monthly}/mo
                      </div>
                      <div style={{
                        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                        fontSize: '11px',
                        color: theme.textMuted,
                        textTransform: 'uppercase',
                      }}>
                        {opp.effort_level} effort
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        padding: '4px',
        background: theme.surface,
        borderRadius: '12px',
        width: 'fit-content',
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === tab.id ? theme.bg : 'transparent',
              color: activeTab === tab.id ? theme.text : theme.textMuted,
              fontFamily: "'SF Pro Display', -apple-system, sans-serif",
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Revenue Streams Tab */}
      {activeTab === 'streams' && (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
          }}>
            <div style={{
              fontFamily: "'SF Pro Display', -apple-system, sans-serif",
              fontSize: '20px',
              fontWeight: '600',
              color: theme.text,
              letterSpacing: '-0.02em',
            }}>
              Your Revenue Streams
            </div>
            <button
              onClick={() => setShowAddStream(true)}
              style={{
                padding: '12px 24px',
                background: theme.accent,
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              + Add Stream
            </button>
          </div>

          {/* Category Breakdown */}
          {categoryBreakdown.length > 0 && (
            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '24px',
              flexWrap: 'wrap',
            }}>
              {categoryBreakdown.map(cat => (
                <div key={cat.category} style={{
                  background: theme.surface,
                  padding: '16px 20px',
                  borderRadius: '12px',
                  border: `1px solid ${theme.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}>
                  <span style={{ fontSize: '20px' }}>{cat.icon}</span>
                  <div>
                    <div style={{
                      fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                      fontSize: '13px',
                      color: theme.textMuted,
                    }}>
                      {cat.label}
                    </div>
                    <div style={{
                      fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                      fontSize: '17px',
                      fontWeight: '600',
                      color: theme.text,
                    }}>
                      ${cat.revenue.toFixed(0)}/mo
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {loading ? (
            <div style={{
              fontFamily: "'SF Pro Display', -apple-system, sans-serif",
              color: theme.textMuted,
              padding: '40px',
              textAlign: 'center',
            }}>
              Loading...
            </div>
          ) : revenueStreams.length === 0 ? (
            <div style={{
              background: theme.surface,
              borderRadius: '16px',
              padding: '60px 40px',
              textAlign: 'center',
              border: `1px solid ${theme.border}`,
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: `${theme.accent}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '24px',
              }}>
                💰
              </div>
              <div style={{
                fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                fontSize: '17px',
                fontWeight: '500',
                color: theme.text,
                marginBottom: '8px',
              }}>
                Start tracking your revenue
              </div>
              <div style={{
                fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                fontSize: '14px',
                color: theme.textMuted,
              }}>
                Add your first revenue stream to get started
              </div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '16px',
            }}>
              {revenueStreams.map(stream => (
                <div
                  key={stream.id}
                  onClick={() => editStream(stream)}
                  style={{
                    background: theme.surface,
                    borderRadius: '16px',
                    padding: '20px',
                    border: `1px solid ${theme.border}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '16px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        fontSize: '24px',
                        width: '44px',
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: `${REVENUE_CATEGORIES[stream.category]?.color || theme.accent}15`,
                        borderRadius: '12px',
                      }}>
                        {REVENUE_CATEGORIES[stream.category]?.icon || '💰'}
                      </span>
                      <div>
                        <div style={{
                          fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                          fontSize: '16px',
                          fontWeight: '500',
                          color: theme.text,
                        }}>
                          {stream.name}
                        </div>
                        <div style={{
                          fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                          fontSize: '13px',
                          color: theme.textMuted,
                        }}>
                          {REVENUE_CATEGORIES[stream.category]?.label || stream.category}
                        </div>
                      </div>
                    </div>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                      fontSize: '11px',
                      fontWeight: '500',
                      background: stream.status === 'active' ? `${theme.success}15` : `${theme.warning}15`,
                      color: stream.status === 'active' ? theme.success : theme.warning,
                    }}>
                      {stream.status}
                    </span>
                  </div>

                  <div style={{
                    fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                    fontSize: '28px',
                    fontWeight: '600',
                    color: theme.text,
                    letterSpacing: '-0.02em',
                  }}>
                    ${parseFloat(stream.monthly_revenue).toFixed(0)}
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '400',
                      color: theme.textMuted,
                    }}>/mo</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Opportunities Tab */}
      {activeTab === 'opportunities' && (
        <div>
          <div style={{
            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            fontSize: '20px',
            fontWeight: '600',
            color: theme.text,
            marginBottom: '24px',
            letterSpacing: '-0.02em',
          }}>
            Monetization Opportunities
          </div>

          {/* Category Filter */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '24px',
            flexWrap: 'wrap',
          }}>
            <button
              onClick={() => setSelectedCategory('all')}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: 'none',
                background: selectedCategory === 'all' ? theme.accent : theme.surface,
                color: selectedCategory === 'all' ? '#fff' : theme.text,
                fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              All
            </button>
            {Object.entries(REVENUE_CATEGORIES).filter(([key]) => OPPORTUNITY_IDEAS[key]).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: 'none',
                  background: selectedCategory === key ? cat.color : theme.surface,
                  color: selectedCategory === key ? '#fff' : theme.text,
                  fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px',
          }}>
            {getFilteredOpportunities().map((opp, idx) => (
              <div
                key={idx}
                style={{
                  background: theme.surface,
                  borderRadius: '16px',
                  padding: '20px',
                  border: `1px solid ${theme.border}`,
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                }}>
                  <div style={{
                    fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                    fontSize: '16px',
                    fontWeight: '500',
                    color: theme.text,
                  }}>
                    {opp.name}
                  </div>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                    fontSize: '11px',
                    fontWeight: '500',
                    background: `${REVENUE_CATEGORIES[opp.category]?.color || theme.accent}15`,
                    color: REVENUE_CATEGORIES[opp.category]?.color || theme.accent,
                  }}>
                    {REVENUE_CATEGORIES[opp.category]?.label}
                  </span>
                </div>

                <div style={{
                  fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                  fontSize: '14px',
                  color: theme.textMuted,
                  marginBottom: '16px',
                  lineHeight: '1.5',
                }}>
                  {opp.description}
                </div>

                <div style={{
                  display: 'flex',
                  gap: '12px',
                  marginBottom: '16px',
                }}>
                  <div style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: theme.bg,
                    fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                    fontSize: '12px',
                  }}>
                    <span style={{ color: theme.textMuted }}>Potential:</span>{' '}
                    <span style={{ color: theme.success }}>{opp.potential}</span>
                  </div>
                  <div style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: theme.bg,
                    fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                    fontSize: '12px',
                  }}>
                    <span style={{ color: theme.textMuted }}>Difficulty:</span>{' '}
                    <span style={{ color: theme.text }}>{opp.difficulty}</span>
                  </div>
                </div>

                {opp.url && (
                  <a
                    href={`https://${opp.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                      fontSize: '13px',
                      color: theme.accent,
                      textDecoration: 'none',
                    }}
                  >
                    Learn more →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
          }}>
            <div style={{
              fontFamily: "'SF Pro Display', -apple-system, sans-serif",
              fontSize: '20px',
              fontWeight: '600',
              color: theme.text,
              letterSpacing: '-0.02em',
            }}>
              Revenue Goals
            </div>
            <button
              onClick={() => setShowAddGoal(true)}
              style={{
                padding: '12px 24px',
                background: theme.accent,
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              + Add Goal
            </button>
          </div>

          {goals.length === 0 ? (
            <div style={{
              background: theme.surface,
              borderRadius: '16px',
              padding: '60px 40px',
              textAlign: 'center',
              border: `1px solid ${theme.border}`,
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: `${theme.accent}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '24px',
              }}>
                🎯
              </div>
              <div style={{
                fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                fontSize: '17px',
                fontWeight: '500',
                color: theme.text,
                marginBottom: '8px',
              }}>
                Set your first revenue goal
              </div>
              <div style={{
                fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                fontSize: '14px',
                color: theme.textMuted,
              }}>
                Track your progress towards financial targets
              </div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '16px',
            }}>
              {goals.map(goal => {
                const progress = goal.target_amount > 0
                  ? Math.min((goal.current_amount / goal.target_amount) * 100, 100)
                  : 0;
                const daysLeft = goal.deadline
                  ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24))
                  : null;

                return (
                  <div
                    key={goal.id}
                    style={{
                      background: theme.surface,
                      borderRadius: '16px',
                      padding: '24px',
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '16px',
                    }}>
                      <div style={{
                        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                        fontSize: '17px',
                        fontWeight: '500',
                        color: theme.text,
                      }}>
                        {goal.title}
                      </div>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: theme.textMuted,
                          cursor: 'pointer',
                          fontSize: '16px',
                        }}
                      >
                        ×
                      </button>
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      marginBottom: '16px',
                    }}>
                      <div style={{
                        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                        fontSize: '28px',
                        fontWeight: '600',
                        color: theme.text,
                      }}>
                        ${goal.current_amount.toFixed(0)}
                        <span style={{
                          fontSize: '14px',
                          color: theme.textMuted,
                          fontWeight: '400',
                        }}>
                          {' '}/ ${goal.target_amount.toFixed(0)}
                        </span>
                      </div>
                      <div style={{
                        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                        fontSize: '15px',
                        fontWeight: '500',
                        color: progress >= 100 ? theme.success : theme.accent,
                      }}>
                        {progress.toFixed(0)}%
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{
                      height: '8px',
                      background: theme.bg,
                      borderRadius: '4px',
                      overflow: 'hidden',
                      marginBottom: '16px',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${progress}%`,
                        background: progress >= 100 ? theme.success : theme.accent,
                        borderRadius: '4px',
                        transition: 'width 0.3s ease',
                      }} />
                    </div>

                    {daysLeft !== null && (
                      <div style={{
                        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                        fontSize: '13px',
                        color: daysLeft < 0 ? theme.danger : daysLeft < 7 ? theme.warning : theme.textMuted,
                      }}>
                        {daysLeft < 0
                          ? `${Math.abs(daysLeft)} days overdue`
                          : daysLeft === 0
                          ? 'Due today'
                          : `${daysLeft} days left`}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Stream Modal */}
      {showAddStream && (
        <div
          onClick={(e) => e.target === e.currentTarget && resetStreamForm()}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div style={{
            background: theme.bg,
            borderRadius: '20px',
            width: '100%',
            maxWidth: '480px',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '24px',
              borderBottom: `1px solid ${theme.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{
                fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                fontSize: '18px',
                fontWeight: '600',
                color: theme.text,
              }}>
                {editingId ? 'Edit Revenue Stream' : 'Add Revenue Stream'}
              </div>
              <button
                onClick={resetStreamForm}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.textMuted,
                  cursor: 'pointer',
                  fontSize: '24px',
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Name</label>
                <input
                  type="text"
                  value={streamForm.name}
                  onChange={(e) => setStreamForm({ ...streamForm, name: e.target.value })}
                  style={inputStyle}
                  placeholder="e.g., Amazon Affiliate"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Category</label>
                  <select
                    value={streamForm.category}
                    onChange={(e) => setStreamForm({ ...streamForm, category: e.target.value })}
                    style={inputStyle}
                  >
                    {Object.entries(REVENUE_CATEGORIES).map(([key, cat]) => (
                      <option key={key} value={key}>{cat.icon} {cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select
                    value={streamForm.status}
                    onChange={(e) => setStreamForm({ ...streamForm, status: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="planned">Planned</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Monthly Revenue</label>
                <input
                  type="number"
                  step="0.01"
                  value={streamForm.monthly_revenue}
                  onChange={(e) => setStreamForm({ ...streamForm, monthly_revenue: e.target.value })}
                  style={inputStyle}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label style={labelStyle}>URL (optional)</label>
                <input
                  type="text"
                  value={streamForm.url}
                  onChange={(e) => setStreamForm({ ...streamForm, url: e.target.value })}
                  style={inputStyle}
                  placeholder="https://..."
                />
              </div>

              <div>
                <label style={labelStyle}>Notes (optional)</label>
                <textarea
                  value={streamForm.notes}
                  onChange={(e) => setStreamForm({ ...streamForm, notes: e.target.value })}
                  style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                  placeholder="Any notes..."
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                {editingId && (
                  <button
                    onClick={() => deleteStream(editingId)}
                    style={{
                      padding: '14px 24px',
                      background: `${theme.danger}15`,
                      border: `1px solid ${theme.danger}`,
                      borderRadius: '12px',
                      color: theme.danger,
                      fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={saveStream}
                  style={{
                    flex: 1,
                    padding: '14px 24px',
                    background: theme.accent,
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  {editingId ? 'Update' : 'Add'} Stream
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div
          onClick={(e) => e.target === e.currentTarget && resetGoalForm()}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div style={{
            background: theme.bg,
            borderRadius: '20px',
            width: '100%',
            maxWidth: '480px',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '24px',
              borderBottom: `1px solid ${theme.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{
                fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                fontSize: '18px',
                fontWeight: '600',
                color: theme.text,
              }}>
                Add Revenue Goal
              </div>
              <button
                onClick={resetGoalForm}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.textMuted,
                  cursor: 'pointer',
                  fontSize: '24px',
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Goal Title</label>
                <input
                  type="text"
                  value={goalForm.title}
                  onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                  style={inputStyle}
                  placeholder="e.g., $5K Monthly Revenue"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Target Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={goalForm.target_amount}
                    onChange={(e) => setGoalForm({ ...goalForm, target_amount: e.target.value })}
                    style={inputStyle}
                    placeholder="5000"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Current Progress</label>
                  <input
                    type="number"
                    step="0.01"
                    value={goalForm.current_amount}
                    onChange={(e) => setGoalForm({ ...goalForm, current_amount: e.target.value })}
                    style={inputStyle}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Target Date</label>
                <input
                  type="date"
                  value={goalForm.deadline}
                  onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Notes (optional)</label>
                <textarea
                  value={goalForm.notes}
                  onChange={(e) => setGoalForm({ ...goalForm, notes: e.target.value })}
                  style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                  placeholder="Strategy notes..."
                />
              </div>

              <button
                onClick={saveGoal}
                style={{
                  padding: '14px 24px',
                  background: theme.accent,
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  marginTop: '8px',
                }}
              >
                Add Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonetizeSection;
