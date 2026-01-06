import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const ApiSettingsSection = () => {
  const [openaiKey, setOpenaiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [preferredProvider, setPreferredProvider] = useState('openai');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  // API Status states
  const [openaiStatus, setOpenaiStatus] = useState({ status: 'unknown', message: 'Not tested' });
  const [anthropicStatus, setAnthropicStatus] = useState({ status: 'unknown', message: 'Not tested' });
  const [isTesting, setIsTesting] = useState({ openai: false, anthropic: false });

  // Usage and Budget states
  const [monthlyBudget, setMonthlyBudget] = useState(50.00);
  const [budgetAlertThreshold, setBudgetAlertThreshold] = useState(80);
  const [usageStats, setUsageStats] = useState({
    today: { tokens: 0, cost: 0, requests: 0 },
    thisMonth: { tokens: 0, cost: 0, requests: 0 },
    byOperation: {},
  });

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

  // Load settings and usage from Supabase
  useEffect(() => {
    loadSettings();
    loadUsageStats();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('api_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (data) {
        setOpenaiKey(data.openai_key || '');
        setAnthropicKey(data.anthropic_key || '');
        setPreferredProvider(data.preferred_provider || 'openai');
        setMonthlyBudget(data.monthly_budget || 50.00);
        setBudgetAlertThreshold(data.budget_alert_threshold || 80);
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsageStats = async () => {
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      // Get today's usage
      const { data: todayData } = await supabase
        .from('api_usage')
        .select('*')
        .gte('created_at', startOfDay);

      // Get this month's usage
      const { data: monthData } = await supabase
        .from('api_usage')
        .select('*')
        .gte('created_at', startOfMonth);

      // Calculate stats
      const today = (todayData || []).reduce((acc, item) => ({
        tokens: acc.tokens + (item.total_tokens || 0),
        cost: acc.cost + (parseFloat(item.estimated_cost) || 0),
        requests: acc.requests + 1,
      }), { tokens: 0, cost: 0, requests: 0 });

      const thisMonth = (monthData || []).reduce((acc, item) => ({
        tokens: acc.tokens + (item.total_tokens || 0),
        cost: acc.cost + (parseFloat(item.estimated_cost) || 0),
        requests: acc.requests + 1,
      }), { tokens: 0, cost: 0, requests: 0 });

      // Group by operation
      const byOperation = (monthData || []).reduce((acc, item) => {
        const op = item.operation || 'unknown';
        if (!acc[op]) {
          acc[op] = { tokens: 0, cost: 0, requests: 0 };
        }
        acc[op].tokens += item.total_tokens || 0;
        acc[op].cost += parseFloat(item.estimated_cost) || 0;
        acc[op].requests += 1;
        return acc;
      }, {});

      setUsageStats({ today, thisMonth, byOperation });
    } catch (error) {
      console.log('Error loading usage stats:', error);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const { error } = await supabase
        .from('api_settings')
        .upsert({
          id: 1,
          openai_key: openaiKey,
          anthropic_key: anthropicKey,
          preferred_provider: preferredProvider,
          monthly_budget: monthlyBudget,
          budget_alert_threshold: budgetAlertThreshold,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });

      // Auto-test after saving
      if (openaiKey) testOpenAI();
      if (anthropicKey) testAnthropic();
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage({ type: 'error', text: 'Failed to save settings. Check console.' });
    } finally {
      setIsSaving(false);
    }
  };

  const testOpenAI = async () => {
    if (!openaiKey) {
      setOpenaiStatus({ status: 'error', message: 'No API key provided' });
      return;
    }

    setIsTesting(prev => ({ ...prev, openai: true }));
    setOpenaiStatus({ status: 'testing', message: 'Testing connection...' });

    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
        },
      });

      if (response.ok) {
        setOpenaiStatus({ status: 'success', message: 'Connected successfully!' });
      } else if (response.status === 401) {
        setOpenaiStatus({ status: 'error', message: 'Invalid API key' });
      } else if (response.status === 429) {
        setOpenaiStatus({ status: 'warning', message: 'Rate limited - but key is valid' });
      } else {
        const errorData = await response.json().catch(() => ({}));
        setOpenaiStatus({ status: 'error', message: errorData.error?.message || `Error: ${response.status}` });
      }
    } catch (error) {
      setOpenaiStatus({ status: 'error', message: 'Network error - check connection' });
    } finally {
      setIsTesting(prev => ({ ...prev, openai: false }));
    }
  };

  const testAnthropic = async () => {
    if (!anthropicKey) {
      setAnthropicStatus({ status: 'error', message: 'No API key provided' });
      return;
    }

    setIsTesting(prev => ({ ...prev, anthropic: true }));
    setAnthropicStatus({ status: 'testing', message: 'Testing connection...' });

    try {
      // Anthropic doesn't have a simple /models endpoint, so we'll do a minimal completion
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'Hi' }],
        }),
      });

      if (response.ok) {
        setAnthropicStatus({ status: 'success', message: 'Connected successfully!' });
      } else if (response.status === 401) {
        setAnthropicStatus({ status: 'error', message: 'Invalid API key' });
      } else if (response.status === 429) {
        setAnthropicStatus({ status: 'warning', message: 'Rate limited - but key is valid' });
      } else {
        const errorData = await response.json().catch(() => ({}));
        setAnthropicStatus({ status: 'error', message: errorData.error?.message || `Error: ${response.status}` });
      }
    } catch (error) {
      setAnthropicStatus({ status: 'error', message: 'Network error - check connection' });
    } finally {
      setIsTesting(prev => ({ ...prev, anthropic: false }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return theme.success;
      case 'error': return theme.danger;
      case 'warning': return theme.warning;
      case 'testing': return theme.purple;
      default: return theme.textMuted;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '!';
      case 'testing': return '⟳';
      default: return '?';
    }
  };

  const maskKey = (key) => {
    if (!key) return '';
    if (key.length <= 8) return '••••••••';
    return key.substring(0, 4) + '••••••••••••' + key.substring(key.length - 4);
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
        Loading settings...
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
          API Settings
        </h1>
        <p style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '13px',
          color: theme.textMuted,
          margin: 0,
        }}>
          Configure and test your AI provider API keys
        </p>
      </div>

      {/* Status Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        {/* OpenAI Status Card */}
        <div style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: '12px',
          padding: '20px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}>
            <span style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '12px',
              color: theme.text,
              fontWeight: '500',
            }}>
              OpenAI
            </span>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: `${getStatusColor(openaiStatus.status)}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: getStatusColor(openaiStatus.status),
              fontSize: '12px',
              fontWeight: 'bold',
            }}>
              {getStatusIcon(openaiStatus.status)}
            </div>
          </div>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '11px',
            color: getStatusColor(openaiStatus.status),
          }}>
            {openaiStatus.message}
          </div>
        </div>

        {/* Anthropic Status Card */}
        <div style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: '12px',
          padding: '20px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}>
            <span style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '12px',
              color: theme.text,
              fontWeight: '500',
            }}>
              Anthropic
            </span>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: `${getStatusColor(anthropicStatus.status)}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: getStatusColor(anthropicStatus.status),
              fontSize: '12px',
              fontWeight: 'bold',
            }}>
              {getStatusIcon(anthropicStatus.status)}
            </div>
          </div>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '11px',
            color: getStatusColor(anthropicStatus.status),
          }}>
            {anthropicStatus.message}
          </div>
        </div>
      </div>

      {/* API Keys Configuration */}
      <div style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
      }}>
        <h2 style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '12px',
          color: theme.textMuted,
          letterSpacing: '2px',
          margin: '0 0 24px 0',
        }}>
          API KEYS
        </h2>

        {/* OpenAI Key */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontFamily: "'Space Mono', monospace",
            fontSize: '11px',
            color: theme.textMuted,
            letterSpacing: '1px',
            marginBottom: '8px',
          }}>
            OPENAI API KEY
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="sk-..."
              style={{
                flex: 1,
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
            <button
              onClick={testOpenAI}
              disabled={!openaiKey || isTesting.openai}
              style={{
                padding: '12px 20px',
                background: 'transparent',
                border: `1px solid ${theme.accent}`,
                borderRadius: '8px',
                color: theme.accent,
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                letterSpacing: '1px',
                cursor: !openaiKey || isTesting.openai ? 'not-allowed' : 'pointer',
                opacity: !openaiKey || isTesting.openai ? 0.5 : 1,
                whiteSpace: 'nowrap',
              }}
            >
              {isTesting.openai ? 'TESTING...' : 'TEST'}
            </button>
          </div>
          {openaiKey && (
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '10px',
              color: theme.textMuted,
              marginTop: '6px',
            }}>
              Current: {maskKey(openaiKey)}
            </div>
          )}
        </div>

        {/* Anthropic Key */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontFamily: "'Space Mono', monospace",
            fontSize: '11px',
            color: theme.textMuted,
            letterSpacing: '1px',
            marginBottom: '8px',
          }}>
            ANTHROPIC API KEY
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="password"
              value={anthropicKey}
              onChange={(e) => setAnthropicKey(e.target.value)}
              placeholder="sk-ant-..."
              style={{
                flex: 1,
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
            <button
              onClick={testAnthropic}
              disabled={!anthropicKey || isTesting.anthropic}
              style={{
                padding: '12px 20px',
                background: 'transparent',
                border: `1px solid ${theme.accent}`,
                borderRadius: '8px',
                color: theme.accent,
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                letterSpacing: '1px',
                cursor: !anthropicKey || isTesting.anthropic ? 'not-allowed' : 'pointer',
                opacity: !anthropicKey || isTesting.anthropic ? 0.5 : 1,
                whiteSpace: 'nowrap',
              }}
            >
              {isTesting.anthropic ? 'TESTING...' : 'TEST'}
            </button>
          </div>
          {anthropicKey && (
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '10px',
              color: theme.textMuted,
              marginTop: '6px',
            }}>
              Current: {maskKey(anthropicKey)}
            </div>
          )}
        </div>

        {/* Preferred Provider */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontFamily: "'Space Mono', monospace",
            fontSize: '11px',
            color: theme.textMuted,
            letterSpacing: '1px',
            marginBottom: '8px',
          }}>
            PREFERRED PROVIDER
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            {['openai', 'anthropic'].map((provider) => (
              <button
                key={provider}
                onClick={() => setPreferredProvider(provider)}
                style={{
                  padding: '12px 24px',
                  background: preferredProvider === provider ? theme.accent : 'transparent',
                  border: `1px solid ${preferredProvider === provider ? theme.accent : theme.border}`,
                  borderRadius: '8px',
                  color: preferredProvider === provider ? '#fff' : theme.textMuted,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '12px',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {provider}
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={saveSettings}
            disabled={isSaving}
            style={{
              padding: '14px 32px',
              background: theme.accent,
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontFamily: "'Space Mono', monospace",
              fontSize: '12px',
              letterSpacing: '1px',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            {isSaving ? 'SAVING...' : 'SAVE SETTINGS'}
          </button>

          {saveMessage && (
            <span style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '12px',
              color: saveMessage.type === 'success' ? theme.success : theme.danger,
            }}>
              {saveMessage.text}
            </span>
          )}
        </div>
      </div>

      {/* Usage & Budget Section */}
      <div style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
      }}>
        <h2 style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '12px',
          color: theme.textMuted,
          letterSpacing: '2px',
          margin: '0 0 24px 0',
        }}>
          USAGE & BUDGET
        </h2>

        {/* Budget Progress */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}>
            <span style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '11px',
              color: theme.textMuted,
            }}>
              Monthly Budget: ${monthlyBudget.toFixed(2)}
            </span>
            <span style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '11px',
              color: usageStats.thisMonth.cost >= monthlyBudget * (budgetAlertThreshold / 100)
                ? theme.warning
                : theme.success,
            }}>
              ${usageStats.thisMonth.cost.toFixed(4)} used ({((usageStats.thisMonth.cost / monthlyBudget) * 100).toFixed(1)}%)
            </span>
          </div>

          {/* Progress Bar */}
          <div style={{
            width: '100%',
            height: '8px',
            background: theme.bg,
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${Math.min((usageStats.thisMonth.cost / monthlyBudget) * 100, 100)}%`,
              height: '100%',
              background: usageStats.thisMonth.cost >= monthlyBudget
                ? theme.danger
                : usageStats.thisMonth.cost >= monthlyBudget * (budgetAlertThreshold / 100)
                  ? theme.warning
                  : theme.success,
              borderRadius: '4px',
              transition: 'width 0.3s ease',
            }} />
          </div>

          {/* Budget Alert */}
          {usageStats.thisMonth.cost >= monthlyBudget * (budgetAlertThreshold / 100) && (
            <div style={{
              marginTop: '12px',
              padding: '12px',
              background: `${theme.warning}15`,
              border: `1px solid ${theme.warning}30`,
              borderRadius: '8px',
              fontFamily: "'Space Mono', monospace",
              fontSize: '11px',
              color: theme.warning,
            }}>
              ⚠️ You've used {((usageStats.thisMonth.cost / monthlyBudget) * 100).toFixed(1)}% of your monthly budget
            </div>
          )}
        </div>

        {/* Usage Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}>
          {/* Today's Stats */}
          <div style={{
            background: theme.bg,
            borderRadius: '8px',
            padding: '16px',
          }}>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '10px',
              color: theme.textMuted,
              letterSpacing: '1px',
              marginBottom: '8px',
            }}>
              TODAY
            </div>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '18px',
              color: theme.text,
              marginBottom: '4px',
            }}>
              {usageStats.today.tokens.toLocaleString()}
            </div>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '10px',
              color: theme.textMuted,
            }}>
              tokens · ${usageStats.today.cost.toFixed(4)}
            </div>
          </div>

          {/* This Month Stats */}
          <div style={{
            background: theme.bg,
            borderRadius: '8px',
            padding: '16px',
          }}>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '10px',
              color: theme.textMuted,
              letterSpacing: '1px',
              marginBottom: '8px',
            }}>
              THIS MONTH
            </div>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '18px',
              color: theme.text,
              marginBottom: '4px',
            }}>
              {usageStats.thisMonth.tokens.toLocaleString()}
            </div>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '10px',
              color: theme.textMuted,
            }}>
              tokens · ${usageStats.thisMonth.cost.toFixed(4)}
            </div>
          </div>

          {/* Request Count */}
          <div style={{
            background: theme.bg,
            borderRadius: '8px',
            padding: '16px',
          }}>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '10px',
              color: theme.textMuted,
              letterSpacing: '1px',
              marginBottom: '8px',
            }}>
              API CALLS
            </div>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '18px',
              color: theme.text,
              marginBottom: '4px',
            }}>
              {usageStats.thisMonth.requests}
            </div>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '10px',
              color: theme.textMuted,
            }}>
              this month
            </div>
          </div>
        </div>

        {/* Usage by Operation */}
        {Object.keys(usageStats.byOperation).length > 0 && (
          <div>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '11px',
              color: theme.textMuted,
              letterSpacing: '1px',
              marginBottom: '12px',
            }}>
              BY OPERATION
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}>
              {Object.entries(usageStats.byOperation)
                .sort((a, b) => b[1].cost - a[1].cost)
                .map(([operation, stats]) => (
                  <div
                    key={operation}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      background: theme.bg,
                      borderRadius: '8px',
                    }}
                  >
                    <span style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '11px',
                      color: theme.text,
                      textTransform: 'capitalize',
                    }}>
                      {operation.replace(/_/g, ' ')}
                    </span>
                    <span style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '10px',
                      color: theme.textMuted,
                    }}>
                      {stats.requests} calls · {stats.tokens.toLocaleString()} tokens · ${stats.cost.toFixed(4)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Budget Settings */}
        <div style={{
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: `1px solid ${theme.border}`,
        }}>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '11px',
            color: theme.textMuted,
            letterSpacing: '1px',
            marginBottom: '16px',
          }}>
            BUDGET SETTINGS
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
          }}>
            <div>
              <label style={{
                display: 'block',
                fontFamily: "'Space Mono', monospace",
                fontSize: '10px',
                color: theme.textMuted,
                marginBottom: '8px',
              }}>
                Monthly Budget ($)
              </label>
              <input
                type="number"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(parseFloat(e.target.value) || 0)}
                min="0"
                step="10"
                style={{
                  width: '100%',
                  padding: '10px 12px',
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
            <div>
              <label style={{
                display: 'block',
                fontFamily: "'Space Mono', monospace",
                fontSize: '10px',
                color: theme.textMuted,
                marginBottom: '8px',
              }}>
                Alert Threshold (%)
              </label>
              <input
                type="number"
                value={budgetAlertThreshold}
                onChange={(e) => setBudgetAlertThreshold(parseInt(e.target.value) || 80)}
                min="50"
                max="100"
                style={{
                  width: '100%',
                  padding: '10px 12px',
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
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div style={{
        background: `${theme.purple}10`,
        border: `1px solid ${theme.purple}30`,
        borderRadius: '12px',
        padding: '20px',
      }}>
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '11px',
          color: theme.purple,
          letterSpacing: '1px',
          marginBottom: '12px',
        }}>
          SECURITY NOTE
        </div>
        <p style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '12px',
          color: theme.textMuted,
          lineHeight: '1.6',
          margin: 0,
        }}>
          API keys are stored securely in your Supabase database. For production use,
          consider using environment variables and a backend proxy to avoid exposing
          keys in client-side code. The keys stored here are used by the AI Content
          Studio features.
        </p>
      </div>
    </div>
  );
};

export default ApiSettingsSection;
