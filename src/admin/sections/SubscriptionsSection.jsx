import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

// Popular subscriptions database with logos and default prices
const POPULAR_SUBSCRIPTIONS = {
  streaming: [
    { name: 'Netflix', price: 15.49, logo: 'https://logo.clearbit.com/netflix.com', url: 'netflix.com' },
    { name: 'Disney+', price: 13.99, logo: 'https://logo.clearbit.com/disneyplus.com', url: 'disneyplus.com' },
    { name: 'Max', price: 15.99, logo: 'https://logo.clearbit.com/max.com', url: 'max.com' },
    { name: 'Hulu', price: 17.99, logo: 'https://logo.clearbit.com/hulu.com', url: 'hulu.com' },
    { name: 'Apple TV+', price: 9.99, logo: 'https://logo.clearbit.com/apple.com', url: 'tv.apple.com' },
    { name: 'Paramount+', price: 11.99, logo: 'https://logo.clearbit.com/paramountplus.com', url: 'paramountplus.com' },
    { name: 'Peacock', price: 7.99, logo: 'https://logo.clearbit.com/peacocktv.com', url: 'peacocktv.com' },
    { name: 'Amazon Prime', price: 14.99, logo: 'https://logo.clearbit.com/amazon.com', url: 'amazon.com/prime' },
    { name: 'Crunchyroll', price: 7.99, logo: 'https://logo.clearbit.com/crunchyroll.com', url: 'crunchyroll.com' },
  ],
  music: [
    { name: 'Spotify', price: 11.99, logo: 'https://logo.clearbit.com/spotify.com', url: 'spotify.com' },
    { name: 'Apple Music', price: 10.99, logo: 'https://logo.clearbit.com/apple.com', url: 'music.apple.com' },
    { name: 'YouTube Music', price: 13.99, logo: 'https://logo.clearbit.com/youtube.com', url: 'music.youtube.com' },
    { name: 'Tidal', price: 10.99, logo: 'https://logo.clearbit.com/tidal.com', url: 'tidal.com' },
    { name: 'Amazon Music', price: 9.99, logo: 'https://logo.clearbit.com/amazon.com', url: 'music.amazon.com' },
    { name: 'SoundCloud Go', price: 9.99, logo: 'https://logo.clearbit.com/soundcloud.com', url: 'soundcloud.com' },
  ],
  gaming: [
    { name: 'Xbox Game Pass', price: 16.99, logo: 'https://logo.clearbit.com/xbox.com', url: 'xbox.com/gamepass' },
    { name: 'PlayStation Plus', price: 17.99, logo: 'https://logo.clearbit.com/playstation.com', url: 'playstation.com' },
    { name: 'Nintendo Online', price: 3.99, logo: 'https://logo.clearbit.com/nintendo.com', url: 'nintendo.com' },
    { name: 'EA Play', price: 9.99, logo: 'https://logo.clearbit.com/ea.com', url: 'ea.com/ea-play' },
    { name: 'GeForce NOW', price: 9.99, logo: 'https://logo.clearbit.com/nvidia.com', url: 'nvidia.com/geforce-now' },
  ],
  ai: [
    { name: 'ChatGPT Plus', price: 20.00, logo: 'https://logo.clearbit.com/openai.com', url: 'chat.openai.com' },
    { name: 'Claude Pro', price: 20.00, logo: 'https://logo.clearbit.com/anthropic.com', url: 'claude.ai' },
    { name: 'Midjourney', price: 10.00, logo: 'https://logo.clearbit.com/midjourney.com', url: 'midjourney.com' },
    { name: 'GitHub Copilot', price: 10.00, logo: 'https://logo.clearbit.com/github.com', url: 'github.com/copilot' },
    { name: 'Notion AI', price: 10.00, logo: 'https://logo.clearbit.com/notion.so', url: 'notion.so' },
    { name: 'Grammarly', price: 12.00, logo: 'https://logo.clearbit.com/grammarly.com', url: 'grammarly.com' },
  ],
  productivity: [
    { name: 'Microsoft 365', price: 9.99, logo: 'https://logo.clearbit.com/microsoft.com', url: 'microsoft.com/microsoft-365' },
    { name: 'Google One', price: 2.99, logo: 'https://logo.clearbit.com/google.com', url: 'one.google.com' },
    { name: 'Notion', price: 10.00, logo: 'https://logo.clearbit.com/notion.so', url: 'notion.so' },
    { name: 'Slack', price: 8.75, logo: 'https://logo.clearbit.com/slack.com', url: 'slack.com' },
    { name: 'Zoom', price: 15.99, logo: 'https://logo.clearbit.com/zoom.us', url: 'zoom.us' },
    { name: 'Dropbox', price: 11.99, logo: 'https://logo.clearbit.com/dropbox.com', url: 'dropbox.com' },
    { name: '1Password', price: 2.99, logo: 'https://logo.clearbit.com/1password.com', url: '1password.com' },
    { name: 'Todoist', price: 4.00, logo: 'https://logo.clearbit.com/todoist.com', url: 'todoist.com' },
  ],
  cloud: [
    { name: 'iCloud+', price: 2.99, logo: 'https://logo.clearbit.com/apple.com', url: 'apple.com/icloud' },
    { name: 'AWS', price: 0, logo: 'https://logo.clearbit.com/aws.amazon.com', url: 'aws.amazon.com' },
    { name: 'Vercel', price: 20.00, logo: 'https://logo.clearbit.com/vercel.com', url: 'vercel.com' },
    { name: 'Netlify', price: 19.00, logo: 'https://logo.clearbit.com/netlify.com', url: 'netlify.com' },
    { name: 'DigitalOcean', price: 5.00, logo: 'https://logo.clearbit.com/digitalocean.com', url: 'digitalocean.com' },
  ],
  security: [
    { name: 'NordVPN', price: 12.99, logo: 'https://logo.clearbit.com/nordvpn.com', url: 'nordvpn.com' },
    { name: 'ExpressVPN', price: 12.95, logo: 'https://logo.clearbit.com/expressvpn.com', url: 'expressvpn.com' },
    { name: 'Bitwarden', price: 3.33, logo: 'https://logo.clearbit.com/bitwarden.com', url: 'bitwarden.com' },
    { name: 'LastPass', price: 3.00, logo: 'https://logo.clearbit.com/lastpass.com', url: 'lastpass.com' },
  ],
  fitness: [
    { name: 'Apple Fitness+', price: 9.99, logo: 'https://logo.clearbit.com/apple.com', url: 'apple.com/apple-fitness-plus' },
    { name: 'Peloton', price: 12.99, logo: 'https://logo.clearbit.com/onepeloton.com', url: 'onepeloton.com' },
    { name: 'Strava', price: 11.99, logo: 'https://logo.clearbit.com/strava.com', url: 'strava.com' },
    { name: 'MyFitnessPal', price: 19.99, logo: 'https://logo.clearbit.com/myfitnesspal.com', url: 'myfitnesspal.com' },
    { name: 'Headspace', price: 12.99, logo: 'https://logo.clearbit.com/headspace.com', url: 'headspace.com' },
    { name: 'Calm', price: 14.99, logo: 'https://logo.clearbit.com/calm.com', url: 'calm.com' },
  ],
  news: [
    { name: 'Apple News+', price: 12.99, logo: 'https://logo.clearbit.com/apple.com', url: 'apple.com/apple-news' },
    { name: 'NY Times', price: 17.00, logo: 'https://logo.clearbit.com/nytimes.com', url: 'nytimes.com' },
    { name: 'WSJ', price: 12.99, logo: 'https://logo.clearbit.com/wsj.com', url: 'wsj.com' },
    { name: 'The Athletic', price: 9.99, logo: 'https://logo.clearbit.com/theathletic.com', url: 'theathletic.com' },
    { name: 'Medium', price: 5.00, logo: 'https://logo.clearbit.com/medium.com', url: 'medium.com' },
  ],
  learning: [
    { name: 'Coursera', price: 59.00, logo: 'https://logo.clearbit.com/coursera.org', url: 'coursera.org' },
    { name: 'Skillshare', price: 13.99, logo: 'https://logo.clearbit.com/skillshare.com', url: 'skillshare.com' },
    { name: 'MasterClass', price: 10.00, logo: 'https://logo.clearbit.com/masterclass.com', url: 'masterclass.com' },
    { name: 'LinkedIn Learning', price: 29.99, logo: 'https://logo.clearbit.com/linkedin.com', url: 'linkedin.com/learning' },
    { name: 'Duolingo', price: 6.99, logo: 'https://logo.clearbit.com/duolingo.com', url: 'duolingo.com' },
    { name: 'Audible', price: 14.95, logo: 'https://logo.clearbit.com/audible.com', url: 'audible.com' },
  ],
};

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'streaming', label: 'Streaming' },
  { id: 'music', label: 'Music' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'ai', label: 'AI' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'cloud', label: 'Cloud' },
  { id: 'security', label: 'Security' },
  { id: 'fitness', label: 'Fitness' },
  { id: 'news', label: 'News' },
  { id: 'learning', label: 'Learning' },
];

const SubscriptionsSection = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBrowse, setShowBrowse] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [browseCategory, setBrowseCategory] = useState('all');
  const [browseSearch, setBrowseSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showEmailParser, setShowEmailParser] = useState(false);
  const [emailContent, setEmailContent] = useState('');
  const [parsingEmail, setParsingEmail] = useState(false);
  const [parsedSubscriptions, setParsedSubscriptions] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category: 'streaming',
    cost: '',
    billing_cycle: 'monthly',
    next_billing_date: '',
    auto_renew: true,
    cancel_reminder: false,
    cancel_reminder_days: 7,
    status: 'active',
    url: '',
    email_account: '',
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
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('id, name, category, cost, billing_cycle, next_billing_date, auto_renew, cancel_reminder, cancel_reminder_days, status, url, email_account, notes')
        .order('next_billing_date', { ascending: true })
        .limit(100);

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSubscription = async () => {
    try {
      const subscriptionData = {
        ...formData,
        cost: parseFloat(formData.cost) || 0,
        cancel_reminder_days: parseInt(formData.cancel_reminder_days) || 7,
      };

      if (editingId) {
        const { error } = await supabase
          .from('subscriptions')
          .update(subscriptionData)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('subscriptions')
          .insert([subscriptionData]);
        if (error) throw error;
      }

      await loadSubscriptions();
      resetForm();
    } catch (error) {
      console.error('Error saving subscription:', error);
      alert('Error saving subscription');
    }
  };

  const deleteSubscription = async (id) => {
    if (!confirm('Delete this subscription?')) return;
    try {
      const { error } = await supabase.from('subscriptions').delete().eq('id', id);
      if (error) throw error;
      await loadSubscriptions();
    } catch (error) {
      console.error('Error deleting subscription:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'streaming',
      cost: '',
      billing_cycle: 'monthly',
      next_billing_date: '',
      auto_renew: true,
      cancel_reminder: false,
      cancel_reminder_days: 7,
      status: 'active',
      url: '',
      email_account: '',
      notes: '',
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const quickAddSubscription = (sub, category) => {
    const nextBilling = new Date();
    nextBilling.setMonth(nextBilling.getMonth() + 1);

    setFormData({
      name: sub.name,
      category: category,
      cost: sub.price.toString(),
      billing_cycle: 'monthly',
      next_billing_date: nextBilling.toISOString().split('T')[0],
      auto_renew: true,
      cancel_reminder: false,
      cancel_reminder_days: 7,
      status: 'active',
      url: sub.url,
      email_account: '',
      notes: '',
    });
    setShowBrowse(false);
    setShowAddForm(true);
  };

  const editSubscription = (sub) => {
    setFormData({
      name: sub.name,
      category: sub.category,
      cost: sub.cost.toString(),
      billing_cycle: sub.billing_cycle,
      next_billing_date: sub.next_billing_date || '',
      auto_renew: sub.auto_renew,
      cancel_reminder: sub.cancel_reminder,
      cancel_reminder_days: sub.cancel_reminder_days,
      status: sub.status,
      url: sub.url || '',
      email_account: sub.email_account || '',
      notes: sub.notes || '',
    });
    setEditingId(sub.id);
    setShowAddForm(true);
  };

  // Parse email content to extract subscription info
  const parseEmailContent = async () => {
    if (!emailContent.trim()) {
      alert('Please paste email content first');
      return;
    }

    setParsingEmail(true);
    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are an expert at parsing subscription-related emails. Extract subscription details from email content including receipts, welcome emails, renewal notices, and billing statements. Return JSON format.`
            },
            {
              role: 'user',
              content: `Parse this email and extract any subscription information. Look for:
- Service/company name
- Price/amount charged
- Billing cycle (monthly, yearly, etc.)
- Email address the subscription is linked to (look for "to:", recipient, account email)
- Next billing date if mentioned
- Category (streaming, music, gaming, ai, productivity, cloud, security, fitness, news, learning)

Email content:
${emailContent}

Return JSON in this exact format:
{
  "subscriptions": [
    {
      "name": "Service name",
      "cost": 9.99,
      "billing_cycle": "monthly",
      "email_account": "user@example.com",
      "next_billing_date": "2024-02-15",
      "category": "streaming",
      "url": "service.com",
      "confidence": 0.9
    }
  ],
  "raw_email_to": "detected recipient email if found"
}`
            }
          ],
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
        }),
      });

      const data = await response.json();
      if (data.choices?.[0]?.message?.content) {
        const parsed = JSON.parse(data.choices[0].message.content);
        setParsedSubscriptions(parsed.subscriptions || []);
      }
    } catch (error) {
      console.error('Error parsing email:', error);
      alert('Error parsing email content');
    } finally {
      setParsingEmail(false);
    }
  };

  const addParsedSubscription = (parsed) => {
    const nextBilling = parsed.next_billing_date
      ? parsed.next_billing_date
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    setFormData({
      name: parsed.name,
      category: parsed.category || 'other',
      cost: parsed.cost?.toString() || '',
      billing_cycle: parsed.billing_cycle || 'monthly',
      next_billing_date: nextBilling,
      auto_renew: true,
      cancel_reminder: false,
      cancel_reminder_days: 7,
      status: 'active',
      url: parsed.url || '',
      email_account: parsed.email_account || '',
      notes: '',
    });
    setShowEmailParser(false);
    setParsedSubscriptions([]);
    setEmailContent('');
    setShowAddForm(true);
  };

  const getAISuggestions = async () => {
    if (subscriptions.length === 0) {
      alert('Add some subscriptions first to get AI suggestions');
      return;
    }

    setLoadingAI(true);
    try {
      const totalMonthly = subscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, s) => {
          const cost = parseFloat(s.cost) || 0;
          if (s.billing_cycle === 'yearly') return sum + cost / 12;
          if (s.billing_cycle === 'quarterly') return sum + cost / 3;
          if (s.billing_cycle === 'weekly') return sum + cost * 4;
          return sum + cost;
        }, 0);

      const subscriptionSummary = subscriptions.map(s => ({
        name: s.name,
        category: s.category,
        cost: s.cost,
        billing_cycle: s.billing_cycle,
        status: s.status,
      }));

      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a personal finance advisor specializing in subscription optimization. Provide specific, actionable advice in JSON format.'
            },
            {
              role: 'user',
              content: `Analyze my subscriptions and provide optimization suggestions. My monthly subscription spend is $${totalMonthly.toFixed(2)}.

My subscriptions:
${JSON.stringify(subscriptionSummary, null, 2)}

Respond in this exact JSON format:
{
  "totalMonthly": number,
  "totalYearly": number,
  "suggestions": [
    {
      "type": "cancel" | "downgrade" | "bundle" | "alternative" | "keep",
      "subscription": "name",
      "reason": "explanation",
      "savings": number (monthly),
      "alternative": "optional alternative service"
    }
  ],
  "bundles": [
    {
      "name": "bundle name",
      "includes": ["service1", "service2"],
      "price": number,
      "savings": number
    }
  ],
  "summary": "brief overall assessment"
}`
            }
          ],
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
        }),
      });

      const data = await response.json();
      if (data.choices?.[0]?.message?.content) {
        setAiSuggestions(JSON.parse(data.choices[0].message.content));
      }
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      alert('Error getting AI suggestions');
    } finally {
      setLoadingAI(false);
    }
  };

  // Calculate stats
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
  const monthlyTotal = activeSubscriptions.reduce((sum, s) => {
    const cost = parseFloat(s.cost) || 0;
    if (s.billing_cycle === 'yearly') return sum + cost / 12;
    if (s.billing_cycle === 'quarterly') return sum + cost / 3;
    if (s.billing_cycle === 'weekly') return sum + cost * 4;
    return sum + cost;
  }, 0);
  const yearlyTotal = monthlyTotal * 12;

  // Get upcoming renewals
  const upcomingRenewals = subscriptions
    .filter(s => s.status === 'active' && s.next_billing_date)
    .filter(s => {
      const billingDate = new Date(s.next_billing_date);
      const today = new Date();
      const daysUntil = Math.ceil((billingDate - today) / (1000 * 60 * 60 * 24));
      return daysUntil <= 7 && daysUntil >= 0;
    });

  // Get filtered browse subscriptions
  const getFilteredBrowseSubscriptions = () => {
    let subs = [];
    if (browseCategory === 'all') {
      Object.entries(POPULAR_SUBSCRIPTIONS).forEach(([cat, items]) => {
        items.forEach(item => subs.push({ ...item, category: cat }));
      });
    } else {
      subs = (POPULAR_SUBSCRIPTIONS[browseCategory] || []).map(item => ({
        ...item,
        category: browseCategory,
      }));
    }

    if (browseSearch) {
      const search = browseSearch.toLowerCase();
      subs = subs.filter(s => s.name.toLowerCase().includes(search));
    }

    return subs;
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: '8px',
    color: theme.text,
    fontFamily: "'Space Mono', monospace",
    fontSize: '13px',
    outline: 'none',
  };

  const labelStyle = {
    fontFamily: "'Space Mono', monospace",
    fontSize: '11px',
    color: theme.textMuted,
    marginBottom: '6px',
    display: 'block',
  };

  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Header Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <div style={{
          background: theme.surface,
          borderRadius: '12px',
          padding: '20px',
          border: `1px solid ${theme.border}`,
        }}>
          <div style={{ ...labelStyle, marginBottom: '8px' }}>MONTHLY SPEND</div>
          <div style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: '32px',
            color: theme.text,
          }}>
            ${monthlyTotal.toFixed(2)}
          </div>
        </div>
        <div style={{
          background: theme.surface,
          borderRadius: '12px',
          padding: '20px',
          border: `1px solid ${theme.border}`,
        }}>
          <div style={{ ...labelStyle, marginBottom: '8px' }}>YEARLY TOTAL</div>
          <div style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: '32px',
            color: theme.text,
          }}>
            ${yearlyTotal.toFixed(2)}
          </div>
        </div>
        <div style={{
          background: theme.surface,
          borderRadius: '12px',
          padding: '20px',
          border: `1px solid ${theme.border}`,
        }}>
          <div style={{ ...labelStyle, marginBottom: '8px' }}>ACTIVE SUBSCRIPTIONS</div>
          <div style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: '32px',
            color: theme.text,
          }}>
            {activeSubscriptions.length}
          </div>
        </div>
        <div style={{
          background: theme.surface,
          borderRadius: '12px',
          padding: '20px',
          border: `1px solid ${theme.border}`,
          cursor: 'pointer',
        }}
        onClick={getAISuggestions}
        >
          <div style={{ ...labelStyle, marginBottom: '8px' }}>AI INSIGHTS</div>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '13px',
            color: theme.accent,
          }}>
            {loadingAI ? 'Analyzing...' : 'Get Suggestions →'}
          </div>
        </div>
      </div>

      {/* Upcoming Renewals Warning */}
      {upcomingRenewals.length > 0 && (
        <div style={{
          background: `${theme.warning}15`,
          border: `1px solid ${theme.warning}40`,
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
        }}>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '12px',
            color: theme.warning,
            marginBottom: '8px',
          }}>
            ⚠️ UPCOMING RENEWALS (NEXT 7 DAYS)
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {upcomingRenewals.map(sub => (
              <div key={sub.id} style={{
                background: theme.surface,
                padding: '8px 12px',
                borderRadius: '6px',
                fontFamily: "'Space Mono', monospace",
                fontSize: '12px',
                color: theme.text,
              }}>
                {sub.name} - ${sub.cost} on {new Date(sub.next_billing_date).toLocaleDateString()}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Suggestions Panel */}
      {aiSuggestions && (
        <div style={{
          background: theme.surface,
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          border: `1px solid ${theme.accent}40`,
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '12px',
              color: theme.accent,
            }}>
              AI OPTIMIZATION SUGGESTIONS
            </div>
            <button
              onClick={() => setAiSuggestions(null)}
              style={{
                background: 'none',
                border: 'none',
                color: theme.textMuted,
                cursor: 'pointer',
                fontSize: '18px',
              }}
            >
              ×
            </button>
          </div>

          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '13px',
            color: theme.text,
            marginBottom: '16px',
            lineHeight: '1.6',
          }}>
            {aiSuggestions.summary}
          </div>

          {aiSuggestions.suggestions?.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {aiSuggestions.suggestions.map((sug, idx) => (
                <div key={idx} style={{
                  background: theme.bg,
                  padding: '12px',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <span style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      marginRight: '8px',
                      background: sug.type === 'cancel' ? theme.danger + '30' :
                                 sug.type === 'bundle' ? theme.success + '30' :
                                 theme.accent + '30',
                      color: sug.type === 'cancel' ? theme.danger :
                             sug.type === 'bundle' ? theme.success :
                             theme.accent,
                    }}>
                      {sug.type.toUpperCase()}
                    </span>
                    <span style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '13px',
                      color: theme.text,
                    }}>
                      {sug.subscription}
                    </span>
                    <div style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '11px',
                      color: theme.textMuted,
                      marginTop: '4px',
                    }}>
                      {sug.reason}
                    </div>
                  </div>
                  {sug.savings > 0 && (
                    <div style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '13px',
                      color: theme.success,
                    }}>
                      Save ${sug.savings}/mo
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        flexWrap: 'wrap',
      }}>
        <button
          onClick={() => setShowBrowse(true)}
          style={{
            padding: '12px 24px',
            background: theme.accent,
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontFamily: "'Space Mono', monospace",
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          + Add Subscription
        </button>
        <button
          onClick={() => setShowAddForm(true)}
          style={{
            padding: '12px 24px',
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: '8px',
            color: theme.text,
            fontFamily: "'Space Mono', monospace",
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          Add Custom
        </button>
        <button
          onClick={() => setShowEmailParser(true)}
          style={{
            padding: '12px 24px',
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: '8px',
            color: theme.text,
            fontFamily: "'Space Mono', monospace",
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>📧</span> Parse Email
        </button>
      </div>

      {/* Subscriptions List */}
      {loading ? (
        <div style={{ color: theme.textMuted, fontFamily: "'Space Mono', monospace" }}>
          Loading...
        </div>
      ) : subscriptions.length === 0 ? (
        <div style={{
          background: theme.surface,
          borderRadius: '12px',
          padding: '60px 40px',
          textAlign: 'center',
          border: `1px solid ${theme.border}`,
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: `${theme.accent}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '24px',
          }}>
            +
          </div>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '16px',
            color: theme.text,
            marginBottom: '8px',
          }}>
            Add first subscription
          </div>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '13px',
            color: theme.textMuted,
          }}>
            Netflix, Spotify, Gym, etc.
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '16px',
        }}>
          {subscriptions.map(sub => (
            <div
              key={sub.id}
              style={{
                background: theme.surface,
                borderRadius: '12px',
                padding: '16px',
                border: `1px solid ${theme.border}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onClick={() => editSubscription(sub)}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={`https://logo.clearbit.com/${sub.url || sub.name.toLowerCase().replace(/\s/g, '') + '.com'}`}
                    alt=""
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: theme.bg,
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div>
                    <div style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '14px',
                      color: theme.text,
                    }}>
                      {sub.name}
                    </div>
                    <div style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '11px',
                      color: theme.textMuted,
                      textTransform: 'capitalize',
                    }}>
                      {sub.category}
                    </div>
                  </div>
                </div>
                <span style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '10px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  background: sub.status === 'active' ? theme.success + '20' :
                             sub.status === 'cancelled' ? theme.danger + '20' :
                             theme.warning + '20',
                  color: sub.status === 'active' ? theme.success :
                         sub.status === 'cancelled' ? theme.danger :
                         theme.warning,
                }}>
                  {sub.status}
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: '24px',
                  color: theme.text,
                }}>
                  ${parseFloat(sub.cost).toFixed(2)}
                  <span style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '11px',
                    color: theme.textMuted,
                  }}>
                    /{sub.billing_cycle === 'monthly' ? 'mo' :
                      sub.billing_cycle === 'yearly' ? 'yr' :
                      sub.billing_cycle === 'weekly' ? 'wk' : 'qtr'}
                  </span>
                </div>
                {sub.next_billing_date && (
                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '11px',
                    color: theme.textMuted,
                  }}>
                    Next: {new Date(sub.next_billing_date).toLocaleDateString()}
                  </div>
                )}
              </div>

              {sub.cancel_reminder && (
                <div style={{
                  marginTop: '8px',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '10px',
                  color: theme.warning,
                }}>
                  ⏰ Reminder set {sub.cancel_reminder_days} days before
                </div>
              )}

              {sub.email_account && (
                <div style={{
                  marginTop: '8px',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '10px',
                  color: theme.textMuted,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  <span>📧</span> {sub.email_account}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Browse Subscriptions Modal */}
      {showBrowse && (
        <div
          onClick={(e) => e.target === e.currentTarget && setShowBrowse(false)}
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
            borderRadius: '16px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{
              padding: '20px',
              borderBottom: `1px solid ${theme.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '16px',
                color: theme.text,
              }}>
                Browse Subscriptions
              </div>
              <button
                onClick={() => setShowBrowse(false)}
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

            <div style={{ padding: '16px 20px' }}>
              <input
                type="text"
                placeholder="Search subscriptions..."
                value={browseSearch}
                onChange={(e) => setBrowseSearch(e.target.value)}
                style={{
                  ...inputStyle,
                  marginBottom: '12px',
                }}
              />
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
              }}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setBrowseCategory(cat.id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      border: 'none',
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '11px',
                      cursor: 'pointer',
                      background: browseCategory === cat.id ? theme.accent : theme.surface,
                      color: browseCategory === cat.id ? '#fff' : theme.text,
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '0 20px 20px',
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
              }}>
                {getFilteredBrowseSubscriptions().map((sub, idx) => (
                  <div
                    key={idx}
                    onClick={() => quickAddSubscription(sub, sub.category)}
                    style={{
                      background: theme.surface,
                      borderRadius: '12px',
                      padding: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <img
                      src={sub.logo}
                      alt=""
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        background: theme.bg,
                      }}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect fill="%23333" width="40" height="40" rx="8"/></svg>';
                      }}
                    />
                    <div>
                      <div style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '13px',
                        color: theme.text,
                      }}>
                        {sub.name}
                      </div>
                      <div style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '11px',
                        color: theme.textMuted,
                      }}>
                        ${sub.price.toFixed(2)}/mo
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div
          onClick={(e) => e.target === e.currentTarget && resetForm()}
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
            borderRadius: '16px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto',
          }}>
            <div style={{
              padding: '20px',
              borderBottom: `1px solid ${theme.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '16px',
                color: theme.text,
              }}>
                {editingId ? 'Edit Subscription' : 'Add Subscription'}
              </div>
              <button
                onClick={resetForm}
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

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>NAME</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={inputStyle}
                  placeholder="e.g., Netflix"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>CATEGORY</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={inputStyle}
                  >
                    {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>STATUS</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="trial">Trial</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>COST</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    style={inputStyle}
                    placeholder="9.99"
                  />
                </div>
                <div>
                  <label style={labelStyle}>BILLING CYCLE</label>
                  <select
                    value={formData.billing_cycle}
                    onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>NEXT BILLING DATE</label>
                <input
                  type="date"
                  value={formData.next_billing_date}
                  onChange={(e) => setFormData({ ...formData, next_billing_date: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>URL (OPTIONAL)</label>
                <input
                  type="text"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  style={inputStyle}
                  placeholder="netflix.com"
                />
              </div>

              <div>
                <label style={labelStyle}>EMAIL ACCOUNT</label>
                <input
                  type="email"
                  value={formData.email_account}
                  onChange={(e) => setFormData({ ...formData, email_account: e.target.value })}
                  style={inputStyle}
                  placeholder="yourname@email.com"
                />
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                background: theme.surface,
                borderRadius: '8px',
              }}>
                <input
                  type="checkbox"
                  id="cancelReminder"
                  checked={formData.cancel_reminder}
                  onChange={(e) => setFormData({ ...formData, cancel_reminder: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                <label htmlFor="cancelReminder" style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '13px',
                  color: theme.text,
                  cursor: 'pointer',
                  flex: 1,
                }}>
                  Set cancel reminder
                </label>
                {formData.cancel_reminder && (
                  <input
                    type="number"
                    value={formData.cancel_reminder_days}
                    onChange={(e) => setFormData({ ...formData, cancel_reminder_days: e.target.value })}
                    style={{ ...inputStyle, width: '60px' }}
                    min="1"
                    max="30"
                  />
                )}
              </div>

              <div>
                <label style={labelStyle}>NOTES (OPTIONAL)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                  placeholder="Any notes about this subscription..."
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                {editingId && (
                  <button
                    onClick={() => deleteSubscription(editingId)}
                    style={{
                      padding: '12px 24px',
                      background: theme.danger + '20',
                      border: `1px solid ${theme.danger}`,
                      borderRadius: '8px',
                      color: theme.danger,
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={saveSubscription}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    background: theme.accent,
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  {editingId ? 'Update' : 'Add'} Subscription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Parser Modal */}
      {showEmailParser && (
        <div
          onClick={(e) => e.target === e.currentTarget && setShowEmailParser(false)}
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
            borderRadius: '16px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto',
          }}>
            <div style={{
              padding: '20px',
              borderBottom: `1px solid ${theme.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '16px',
                color: theme.text,
              }}>
                📧 Parse Email
              </div>
              <button
                onClick={() => {
                  setShowEmailParser(false);
                  setEmailContent('');
                  setParsedSubscriptions([]);
                }}
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

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '12px',
                color: theme.textMuted,
                lineHeight: '1.6',
              }}>
                Paste a subscription email (receipt, welcome email, renewal notice) and AI will extract the subscription details.
              </div>

              <div>
                <label style={labelStyle}>EMAIL CONTENT</label>
                <textarea
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  style={{ ...inputStyle, minHeight: '200px', resize: 'vertical' }}
                  placeholder="Paste your subscription email content here...

Example:
From: Netflix <info@account.netflix.com>
To: you@email.com
Subject: Your Netflix payment receipt

Your Netflix subscription payment of $15.49 was successful.
Next billing date: February 15, 2024"
                />
              </div>

              <button
                onClick={parseEmailContent}
                disabled={parsingEmail || !emailContent.trim()}
                style={{
                  padding: '12px 24px',
                  background: theme.accent,
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '13px',
                  cursor: emailContent.trim() ? 'pointer' : 'not-allowed',
                  opacity: emailContent.trim() ? 1 : 0.5,
                }}
              >
                {parsingEmail ? 'Parsing...' : 'Parse Email'}
              </button>

              {/* Parsed Results */}
              {parsedSubscriptions.length > 0 && (
                <div style={{
                  background: theme.surface,
                  borderRadius: '12px',
                  padding: '16px',
                  border: `1px solid ${theme.success}40`,
                }}>
                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '12px',
                    color: theme.success,
                    marginBottom: '12px',
                  }}>
                    ✓ Found {parsedSubscriptions.length} subscription(s)
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {parsedSubscriptions.map((parsed, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: theme.bg,
                          borderRadius: '8px',
                          padding: '12px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{
                            fontFamily: "'Space Mono', monospace",
                            fontSize: '14px',
                            color: theme.text,
                          }}>
                            {parsed.name}
                          </div>
                          <div style={{
                            fontFamily: "'Space Mono', monospace",
                            fontSize: '12px',
                            color: theme.textMuted,
                            marginTop: '4px',
                          }}>
                            ${parsed.cost?.toFixed(2) || '0.00'}/{parsed.billing_cycle || 'monthly'}
                            {parsed.email_account && (
                              <span style={{ marginLeft: '8px' }}>
                                • {parsed.email_account}
                              </span>
                            )}
                          </div>
                          {parsed.confidence && (
                            <div style={{
                              fontFamily: "'Space Mono', monospace",
                              fontSize: '10px',
                              color: theme.textMuted,
                              marginTop: '4px',
                            }}>
                              Confidence: {Math.round(parsed.confidence * 100)}%
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => addParsedSubscription(parsed)}
                          style={{
                            padding: '8px 16px',
                            background: theme.accent,
                            border: 'none',
                            borderRadius: '6px',
                            color: '#fff',
                            fontFamily: "'Space Mono', monospace",
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          Add
                        </button>
                      </div>
                    ))}
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

export default SubscriptionsSection;
