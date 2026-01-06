// OpenAI Integration for Content Studio
// API key is fetched from Supabase api_settings table or falls back to env variable
import { supabase } from '../supabaseClient';

// Cache for API key
let cachedApiKey = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fetch API key from Supabase with caching
const getApiKey = async () => {
  const now = Date.now();

  // Return cached key if still valid
  if (cachedApiKey && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedApiKey;
  }

  try {
    const { data, error } = await supabase
      .from('api_settings')
      .select('openai_key')
      .eq('id', 1)
      .single();

    if (data?.openai_key) {
      cachedApiKey = data.openai_key;
      lastFetchTime = now;
      return cachedApiKey;
    }
  } catch (error) {
    console.log('Error fetching API key from Supabase:', error);
  }

  // Fallback to environment variable
  const envKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  if (envKey) {
    cachedApiKey = envKey;
    lastFetchTime = now;
  }
  return envKey;
};

// Check if API key is available
const isAIEnabled = async () => {
  const key = await getApiKey();
  return Boolean(key);
};

// Pricing per 1M tokens (as of 2024)
const MODEL_PRICING = {
  'gpt-4o-mini': { input: 0.15, output: 0.60 },
  'gpt-4o': { input: 2.50, output: 10.00 },
  'gpt-4-turbo': { input: 10.00, output: 30.00 },
  'gpt-3.5-turbo': { input: 0.50, output: 1.50 },
};

// Track API usage
const trackUsage = async (model, operation, usage) => {
  try {
    const pricing = MODEL_PRICING[model] || MODEL_PRICING['gpt-4o-mini'];
    const promptCost = (usage.prompt_tokens / 1000000) * pricing.input;
    const completionCost = (usage.completion_tokens / 1000000) * pricing.output;
    const estimatedCost = promptCost + completionCost;

    await supabase.from('api_usage').insert({
      provider: 'openai',
      model,
      operation,
      prompt_tokens: usage.prompt_tokens || 0,
      completion_tokens: usage.completion_tokens || 0,
      total_tokens: usage.total_tokens || 0,
      estimated_cost: estimatedCost,
    });
  } catch (error) {
    console.log('Error tracking usage:', error);
  }
};

const PLATFORM_CONTEXTS = {
  blog: {
    role: 'startup ecosystem builder and content creator focused on the Indian startup scene',
    format: 'long-form blog post (800-1500 words)',
    audience: 'founders, investors, and startup enthusiasts',
  },
  twitter: {
    role: 'thought leader sharing insights about startups and entrepreneurship',
    format: 'tweet or thread (280 chars per tweet, max 5 tweets for thread)',
    audience: 'Twitter/X users interested in startups and tech',
  },
  instagram: {
    role: 'visual storyteller documenting the startup journey',
    format: 'Instagram caption (150-300 words) with hashtag suggestions',
    audience: 'young entrepreneurs and aspiring founders',
  },
  youtube: {
    role: 'educator and documenter of the startup ecosystem',
    format: 'video script outline with hook, main points, and call-to-action',
    audience: 'viewers interested in startup content and entrepreneurship',
  },
  linkedin: {
    role: 'professional sharing career insights and industry knowledge',
    format: 'LinkedIn post (200-500 words) with professional tone',
    audience: 'professionals, founders, and business leaders',
  },
};

export async function generateDailyPrompts() {
  const apiKey = await getApiKey();
  if (!apiKey) {
    console.log('AI features disabled: No API key configured');
    return null;
  }
  try {
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a content strategist helping a startup ecosystem builder create engaging content. Today is ${today}. Generate unique, timely content prompts that are specific and actionable.`,
          },
          {
            role: 'user',
            content: `Generate 5 unique content prompts for today (${today}), one for each platform:
1. Blog - for long-form thought leadership
2. Twitter/X - for quick insights and threads
3. Instagram - for visual storytelling
4. YouTube - for video content
5. LinkedIn - for professional networking

Make each prompt:
- Specific and actionable (not generic)
- Relevant to the Indian startup ecosystem
- Timely (reference current trends, seasons, or events if relevant)
- Engaging and inspiring

Return as JSON: {"blog": "prompt", "twitter": "prompt", "instagram": "prompt", "youtube": "prompt", "linkedin": "prompt"}`,
          },
        ],
        temperature: 0.9,
        max_tokens: 500,
      }),
    });

    const data = await response.json();

    if (data.choices && data.choices[0]) {
      // Track usage
      if (data.usage) {
        trackUsage('gpt-4o-mini', 'daily_prompts', data.usage);
      }

      const content = data.choices[0].message.content;
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }

    return null;
  } catch (error) {
    console.error('Error generating daily prompts:', error);
    return null;
  }
}

export async function generateContentInspiration(platform, topic = null) {
  const apiKey = await getApiKey();
  if (!apiKey) {
    console.log('AI features disabled: No API key configured');
    return null;
  }
  try {
    const context = PLATFORM_CONTEXTS[platform];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a ${context.role}. You create content for ${context.audience}. Your content format is: ${context.format}.`,
          },
          {
            role: 'user',
            content: topic
              ? `Generate a creative content idea and outline about: "${topic}"\n\nInclude:\n1. A catchy hook/opening\n2. 3-5 key points to cover\n3. A call-to-action\n4. Suggested hashtags or keywords`
              : `Generate a creative and unique content idea for ${platform} that I can create right now.\n\nInclude:\n1. Content idea/title\n2. A catchy hook/opening line\n3. 3-5 key points to cover\n4. A call-to-action\n5. Suggested hashtags or keywords\n\nMake it relevant to the Indian startup ecosystem and current trends.`,
          },
        ],
        temperature: 0.9,
        max_tokens: 600,
      }),
    });

    const data = await response.json();

    if (data.choices && data.choices[0]) {
      // Track usage
      if (data.usage) {
        trackUsage('gpt-4o-mini', 'content_inspiration', data.usage);
      }
      return data.choices[0].message.content;
    }

    return null;
  } catch (error) {
    console.error('Error generating inspiration:', error);
    return null;
  }
}

export async function improveContent(platform, content) {
  const apiKey = await getApiKey();
  if (!apiKey) {
    console.log('AI features disabled: No API key configured');
    return null;
  }
  try {
    const context = PLATFORM_CONTEXTS[platform];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a ${context.role}. Help improve content for ${context.audience}. Format: ${context.format}.`,
          },
          {
            role: 'user',
            content: `Improve this ${platform} content while keeping the original voice and message:\n\n"${content}"\n\nProvide:\n1. An improved version\n2. 2-3 specific suggestions for what was changed and why`,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    const data = await response.json();

    if (data.choices && data.choices[0]) {
      // Track usage
      if (data.usage) {
        trackUsage('gpt-4o-mini', 'improve_content', data.usage);
      }
      return data.choices[0].message.content;
    }

    return null;
  } catch (error) {
    console.error('Error improving content:', error);
    return null;
  }
}

export async function generateMotivationalMessage() {
  const apiKey = await getApiKey();
  if (!apiKey) {
    return null;
  }
  try {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: `Generate a short, inspiring message (max 15 words) for a content creator in the ${timeOfDay}. Focus on motivation to create content today. Be unique and avoid clichés.`,
          },
        ],
        temperature: 1.0,
        max_tokens: 50,
      }),
    });

    const data = await response.json();

    if (data.choices && data.choices[0]) {
      // Track usage
      if (data.usage) {
        trackUsage('gpt-4o-mini', 'motivational_message', data.usage);
      }
      return data.choices[0].message.content.replace(/"/g, '').trim();
    }

    return null;
  } catch (error) {
    console.error('Error generating motivational message:', error);
    return null;
  }
}

export async function generateContentPlan(idea) {
  const apiKey = await getApiKey();
  if (!apiKey) {
    console.log('AI features disabled: No API key configured');
    return null;
  }
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a content strategist helping a startup ecosystem builder maximize content reach across multiple platforms. You understand the Indian startup ecosystem, tech industry, and social media best practices. Your goal is to help turn experiences and ideas into engaging, platform-specific content.`,
          },
          {
            role: 'user',
            content: `I had this experience/idea: "${idea}"

Generate a comprehensive content plan for each platform. Return as JSON with this exact structure:

{
  "youtube": {
    "title": "Video title suggestion",
    "hook": "Opening hook (first 5 seconds)",
    "keyPoints": ["Point 1", "Point 2", "Point 3", "Point 4"],
    "cta": "Call to action",
    "thumbnailIdea": "Thumbnail concept"
  },
  "instagram": {
    "type": "carousel/reel/post",
    "caption": "Full caption with emojis",
    "visualIdeas": ["Photo/slide 1 idea", "Photo/slide 2 idea", "Photo/slide 3 idea"],
    "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"]
  },
  "twitter": {
    "singleTweet": "A punchy standalone tweet (under 280 chars)",
    "thread": ["Tweet 1 (hook)", "Tweet 2", "Tweet 3", "Tweet 4 (CTA)"]
  },
  "linkedin": {
    "hook": "Opening line that stops the scroll",
    "body": "Main content (professional tone, 200-300 words)",
    "cta": "Call to action",
    "keyTakeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"]
  },
  "blog": {
    "title": "Blog post title",
    "subtitle": "Subtitle or meta description",
    "outline": ["Section 1: ...", "Section 2: ...", "Section 3: ...", "Conclusion"],
    "keyMessage": "Core message in one sentence"
  }
}

Make each platform's content unique and optimized for that platform's audience and format. Be specific and actionable.`,
          },
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();

    if (data.choices && data.choices[0]) {
      // Track usage
      if (data.usage) {
        trackUsage('gpt-4o-mini', 'content_plan', data.usage);
      }
      const content = data.choices[0].message.content;
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }

    return null;
  } catch (error) {
    console.error('Error generating content plan:', error);
    return null;
  }
}
