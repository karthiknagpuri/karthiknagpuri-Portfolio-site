import React, { useState, useEffect } from 'react';
import {
  generateDailyPrompts,
  generateContentInspiration,
  improveContent,
  generateMotivationalMessage,
  generateContentPlan
} from '../../utils/openai';

const ContentStudioSection = () => {
  const [activeTab, setActiveTab] = useState('idea-to-content');
  const [idea, setIdea] = useState('');
  const [contentPlan, setContentPlan] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('blog');
  const [dailyPrompts, setDailyPrompts] = useState(null);
  const [inspiration, setInspiration] = useState(null);
  const [contentToImprove, setContentToImprove] = useState('');
  const [improvedContent, setImprovedContent] = useState(null);
  const [motivationalMessage, setMotivationalMessage] = useState(null);

  const theme = {
    bg: '#0a0a0a',
    surface: '#141414',
    border: 'rgba(255,255,255,0.1)',
    text: '#ffffff',
    textMuted: '#888888',
    accent: '#C4785A',
    teal: '#4ECDC4',
    danger: '#FF6B6B',
  };

  const platforms = [
    { id: 'youtube', label: 'YouTube', color: '#FF0000' },
    { id: 'instagram', label: 'Instagram', color: '#E1306C' },
    { id: 'twitter', label: 'Twitter/X', color: '#1DA1F2' },
    { id: 'linkedin', label: 'LinkedIn', color: '#0077B5' },
    { id: 'blog', label: 'Blog', color: theme.accent },
  ];

  const tabs = [
    { id: 'idea-to-content', label: 'Idea to Content' },
    { id: 'daily-prompts', label: 'Daily Prompts' },
    { id: 'inspiration', label: 'Get Inspiration' },
    { id: 'improve', label: 'Improve Content' },
  ];

  useEffect(() => {
    loadMotivationalMessage();
  }, []);

  const loadMotivationalMessage = async () => {
    const message = await generateMotivationalMessage();
    setMotivationalMessage(message);
  };

  const handleGenerateContentPlan = async () => {
    if (!idea.trim()) return;
    setIsGenerating(true);
    setContentPlan(null);

    try {
      const plan = await generateContentPlan(idea);
      setContentPlan(plan);
    } catch (error) {
      console.error('Error generating content plan:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateDailyPrompts = async () => {
    setIsGenerating(true);
    try {
      const prompts = await generateDailyPrompts();
      setDailyPrompts(prompts);
    } catch (error) {
      console.error('Error generating daily prompts:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGetInspiration = async () => {
    setIsGenerating(true);
    try {
      const result = await generateContentInspiration(selectedPlatform);
      setInspiration(result);
    } catch (error) {
      console.error('Error getting inspiration:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImproveContent = async () => {
    if (!contentToImprove.trim()) return;
    setIsGenerating(true);
    try {
      const result = await improveContent(selectedPlatform, contentToImprove);
      setImprovedContent(result);
    } catch (error) {
      console.error('Error improving content:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const renderIdeaToContent = () => (
    <div>
      <div style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
      }}>
        <h3 style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '12px',
          color: theme.textMuted,
          letterSpacing: '2px',
          margin: '0 0 16px 0',
        }}>
          SHARE YOUR IDEA OR EXPERIENCE
        </h3>
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="Describe your idea, experience, or story... (e.g., 'I just met an amazing founder who bootstrapped their startup to 1M ARR')"
          rows={5}
          style={{
            width: '100%',
            background: theme.bg,
            border: `1px solid ${theme.border}`,
            borderRadius: '8px',
            padding: '16px',
            color: theme.text,
            fontFamily: "'Space Mono', monospace",
            fontSize: '13px',
            resize: 'vertical',
            boxSizing: 'border-box',
            marginBottom: '16px',
          }}
        />
        <button
          onClick={handleGenerateContentPlan}
          disabled={isGenerating || !idea.trim()}
          style={{
            background: isGenerating ? theme.textMuted : theme.accent,
            color: theme.bg,
            border: 'none',
            borderRadius: '6px',
            padding: '12px 24px',
            fontFamily: "'Space Mono', monospace",
            fontSize: '12px',
            cursor: isGenerating ? 'wait' : 'pointer',
            letterSpacing: '1px',
          }}
        >
          {isGenerating ? 'GENERATING...' : 'GENERATE CONTENT PLAN'}
        </button>
      </div>

      {contentPlan && (
        <div style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${theme.border}`,
          }}>
            <h3 style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '12px',
              color: theme.textMuted,
              letterSpacing: '2px',
              margin: 0,
            }}>
              YOUR CONTENT PLAN
            </h3>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {platforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => setSelectedPlatform(platform.id)}
                style={{
                  flex: '1 1 auto',
                  minWidth: '120px',
                  padding: '12px 16px',
                  background: selectedPlatform === platform.id ? platform.color : 'transparent',
                  border: 'none',
                  borderBottom: `1px solid ${theme.border}`,
                  color: selectedPlatform === platform.id ? '#fff' : theme.textMuted,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '11px',
                  cursor: 'pointer',
                  letterSpacing: '1px',
                }}
              >
                {platform.label.toUpperCase()}
              </button>
            ))}
          </div>
          <div style={{ padding: '24px' }}>
            {contentPlan[selectedPlatform] && (
              <div>
                {Object.entries(contentPlan[selectedPlatform]).map(([key, value]) => (
                  <div key={key} style={{ marginBottom: '20px' }}>
                    <div style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '10px',
                      color: theme.accent,
                      letterSpacing: '1px',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                    }}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '13px',
                      color: theme.text,
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap',
                    }}>
                      {Array.isArray(value) ? (
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                          {value.map((item, i) => (
                            <li key={i} style={{ marginBottom: '4px' }}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        value
                      )}
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => copyToClipboard(JSON.stringify(contentPlan[selectedPlatform], null, 2))}
                  style={{
                    background: 'transparent',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '6px',
                    padding: '10px 16px',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '11px',
                    color: theme.textMuted,
                    cursor: 'pointer',
                    letterSpacing: '1px',
                  }}
                >
                  COPY TO CLIPBOARD
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderDailyPrompts = () => (
    <div>
      <div style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '13px',
          color: theme.textMuted,
          marginBottom: '16px',
        }}>
          Get AI-generated content prompts tailored for each platform
        </p>
        <button
          onClick={handleGenerateDailyPrompts}
          disabled={isGenerating}
          style={{
            background: isGenerating ? theme.textMuted : theme.accent,
            color: theme.bg,
            border: 'none',
            borderRadius: '6px',
            padding: '12px 24px',
            fontFamily: "'Space Mono', monospace",
            fontSize: '12px',
            cursor: isGenerating ? 'wait' : 'pointer',
            letterSpacing: '1px',
          }}
        >
          {isGenerating ? 'GENERATING...' : 'GENERATE DAILY PROMPTS'}
        </button>
      </div>

      {dailyPrompts && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {Object.entries(dailyPrompts).map(([platform, prompt]) => (
            <div
              key={platform}
              style={{
                background: theme.surface,
                border: `1px solid ${theme.border}`,
                borderRadius: '12px',
                padding: '20px',
              }}
            >
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                color: platforms.find(p => p.id === platform)?.color || theme.accent,
                letterSpacing: '2px',
                marginBottom: '12px',
                textTransform: 'uppercase',
              }}>
                {platform}
              </div>
              <p style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '13px',
                color: theme.text,
                lineHeight: '1.6',
                margin: 0,
              }}>
                {prompt}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderInspiration = () => (
    <div>
      <div style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
      }}>
        <h3 style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '12px',
          color: theme.textMuted,
          letterSpacing: '2px',
          margin: '0 0 16px 0',
        }}>
          SELECT PLATFORM
        </h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {platforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => setSelectedPlatform(platform.id)}
              style={{
                background: selectedPlatform === platform.id ? platform.color : 'transparent',
                border: `1px solid ${selectedPlatform === platform.id ? platform.color : theme.border}`,
                borderRadius: '6px',
                padding: '10px 16px',
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                color: selectedPlatform === platform.id ? '#fff' : theme.textMuted,
                cursor: 'pointer',
                letterSpacing: '1px',
              }}
            >
              {platform.label.toUpperCase()}
            </button>
          ))}
        </div>
        <button
          onClick={handleGetInspiration}
          disabled={isGenerating}
          style={{
            background: isGenerating ? theme.textMuted : theme.accent,
            color: theme.bg,
            border: 'none',
            borderRadius: '6px',
            padding: '12px 24px',
            fontFamily: "'Space Mono', monospace",
            fontSize: '12px',
            cursor: isGenerating ? 'wait' : 'pointer',
            letterSpacing: '1px',
          }}
        >
          {isGenerating ? 'GENERATING...' : 'GET INSPIRATION'}
        </button>
      </div>

      {inspiration && (
        <div style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: '12px',
          padding: '24px',
        }}>
          <pre style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '13px',
            color: theme.text,
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
            margin: 0,
          }}>
            {inspiration}
          </pre>
          <button
            onClick={() => copyToClipboard(inspiration)}
            style={{
              background: 'transparent',
              border: `1px solid ${theme.border}`,
              borderRadius: '6px',
              padding: '10px 16px',
              fontFamily: "'Space Mono', monospace",
              fontSize: '11px',
              color: theme.textMuted,
              cursor: 'pointer',
              letterSpacing: '1px',
              marginTop: '16px',
            }}
          >
            COPY TO CLIPBOARD
          </button>
        </div>
      )}
    </div>
  );

  const renderImprove = () => (
    <div>
      <div style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
      }}>
        <h3 style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '12px',
          color: theme.textMuted,
          letterSpacing: '2px',
          margin: '0 0 16px 0',
        }}>
          IMPROVE YOUR CONTENT
        </h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {platforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => setSelectedPlatform(platform.id)}
              style={{
                background: selectedPlatform === platform.id ? platform.color : 'transparent',
                border: `1px solid ${selectedPlatform === platform.id ? platform.color : theme.border}`,
                borderRadius: '6px',
                padding: '10px 16px',
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                color: selectedPlatform === platform.id ? '#fff' : theme.textMuted,
                cursor: 'pointer',
                letterSpacing: '1px',
              }}
            >
              {platform.label.toUpperCase()}
            </button>
          ))}
        </div>
        <textarea
          value={contentToImprove}
          onChange={(e) => setContentToImprove(e.target.value)}
          placeholder="Paste your content here to get AI suggestions for improvement..."
          rows={6}
          style={{
            width: '100%',
            background: theme.bg,
            border: `1px solid ${theme.border}`,
            borderRadius: '8px',
            padding: '16px',
            color: theme.text,
            fontFamily: "'Space Mono', monospace",
            fontSize: '13px',
            resize: 'vertical',
            boxSizing: 'border-box',
            marginBottom: '16px',
          }}
        />
        <button
          onClick={handleImproveContent}
          disabled={isGenerating || !contentToImprove.trim()}
          style={{
            background: isGenerating ? theme.textMuted : theme.accent,
            color: theme.bg,
            border: 'none',
            borderRadius: '6px',
            padding: '12px 24px',
            fontFamily: "'Space Mono', monospace",
            fontSize: '12px',
            cursor: isGenerating ? 'wait' : 'pointer',
            letterSpacing: '1px',
          }}
        >
          {isGenerating ? 'IMPROVING...' : 'IMPROVE CONTENT'}
        </button>
      </div>

      {improvedContent && (
        <div style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: '12px',
          padding: '24px',
        }}>
          <h3 style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '12px',
            color: theme.teal,
            letterSpacing: '2px',
            margin: '0 0 16px 0',
          }}>
            IMPROVED VERSION
          </h3>
          <pre style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '13px',
            color: theme.text,
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
            margin: 0,
          }}>
            {improvedContent}
          </pre>
          <button
            onClick={() => copyToClipboard(improvedContent)}
            style={{
              background: 'transparent',
              border: `1px solid ${theme.border}`,
              borderRadius: '6px',
              padding: '10px 16px',
              fontFamily: "'Space Mono', monospace",
              fontSize: '11px',
              color: theme.textMuted,
              cursor: 'pointer',
              letterSpacing: '1px',
              marginTop: '16px',
            }}
          >
            COPY TO CLIPBOARD
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: '24px',
          fontStyle: 'italic',
          color: theme.text,
          margin: '0 0 4px 0',
        }}>
          Content Studio
        </h1>
        <p style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '12px',
          color: theme.textMuted,
          margin: 0,
        }}>
          AI-powered content creation and optimization
        </p>
        {motivationalMessage && (
          <p style={{
            fontFamily: "'Instrument Serif', serif",
            fontStyle: 'italic',
            fontSize: '14px',
            color: theme.accent,
            margin: '12px 0 0 0',
          }}>
            "{motivationalMessage}"
          </p>
        )}
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        flexWrap: 'wrap',
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? theme.accent : 'transparent',
              border: `1px solid ${activeTab === tab.id ? theme.accent : theme.border}`,
              borderRadius: '6px',
              padding: '10px 20px',
              fontFamily: "'Space Mono', monospace",
              fontSize: '12px',
              color: activeTab === tab.id ? theme.bg : theme.textMuted,
              cursor: 'pointer',
              letterSpacing: '1px',
            }}
          >
            {tab.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'idea-to-content' && renderIdeaToContent()}
      {activeTab === 'daily-prompts' && renderDailyPrompts()}
      {activeTab === 'inspiration' && renderInspiration()}
      {activeTab === 'improve' && renderImprove()}
    </div>
  );
};

export default ContentStudioSection;
