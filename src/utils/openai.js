// OpenAI Integration for Content Studio
// IMPORTANT: API key should be set via environment variable VITE_OPENAI_API_KEY
// For production, use a backend/edge function to avoid exposing the key
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

// Check if API key is available
const isAIEnabled = () => Boolean(OPENAI_API_KEY);

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
  if (!isAIEnabled()) {
    console.log('AI features disabled: Set VITE_OPENAI_API_KEY environment variable');
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
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
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
  if (!isAIEnabled()) {
    console.log('AI features disabled: Set VITE_OPENAI_API_KEY environment variable');
    return null;
  }
  try {
    const context = PLATFORM_CONTEXTS[platform];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
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
      return data.choices[0].message.content;
    }

    return null;
  } catch (error) {
    console.error('Error generating inspiration:', error);
    return null;
  }
}

export async function improveContent(platform, content) {
  if (!isAIEnabled()) {
    console.log('AI features disabled: Set VITE_OPENAI_API_KEY environment variable');
    return null;
  }
  try {
    const context = PLATFORM_CONTEXTS[platform];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
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
      return data.choices[0].message.content;
    }

    return null;
  } catch (error) {
    console.error('Error improving content:', error);
    return null;
  }
}

export async function generateMotivationalMessage() {
  if (!isAIEnabled()) {
    return null;
  }
  try {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
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
      return data.choices[0].message.content.replace(/"/g, '').trim();
    }

    return null;
  } catch (error) {
    console.error('Error generating motivational message:', error);
    return null;
  }
}

export async function generateContentPlan(idea) {
  if (!isAIEnabled()) {
    console.log('AI features disabled: Set VITE_OPENAI_API_KEY environment variable');
    return null;
  }
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
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
