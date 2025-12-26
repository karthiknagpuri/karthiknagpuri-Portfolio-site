import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const BlogContext = createContext();

// Fallback sample posts for when Supabase is not available
const fallbackPosts = [
  {
    id: '1',
    title: 'Why Middle India Will Birth the Next Unicorn',
    excerpt: 'The narrative of Indian startups is being rewritten. Not in Bangalore or Mumbai, but in places like Deoria, Raipur, and Ranchi.',
    content: `The narrative of Indian startups is being rewritten. Not in Bangalore or Mumbai, but in places like Deoria, Raipur, and Ranchi.

For years, we've been told that innovation happens in metros. That you need to be in the "right" ecosystem to build something meaningful. But what if that's changing?

## The Untold Story

Having traveled across 20+ cities in Middle India through Jagriti Yatra and EvolveX, I've seen something remarkable. Founders in tier-2 and tier-3 cities aren't just surviving - they're thriving with a different playbook.

### Lower Burn, Higher Grit

These founders understand frugality at a molecular level. A startup in Raipur operates on 1/10th the burn rate of a Bangalore startup, yet serves the same market size. They're not playing the VC game - they're building real, profitable businesses.

### Understanding the Real India

When you're building from Lucknow, you inherently understand what 900 million Indians need. You're not building for a hypothetical "Bharat" - you ARE Bharat.

## The Pattern I See

Every month, I meet founders who would be considered "uninvestable" by traditional metrics. Yet they're building businesses that:
- Serve millions of users
- Are profitable from year one
- Solve problems the metros don't even know exist

The next unicorn won't come from a WeWork in Mumbai. It'll come from a small office in a city you've never heard of, built by someone who refused to play by the old rules.

*This is why I do what I do. This is why EvolveX exists.*`,
    date: '2024-12-15',
    readTime: '5 min',
    category: 'ECOSYSTEM',
    published: true,
    featured: true,
  },
  {
    id: '2',
    title: 'Building in Public: The EvolveX Journey',
    excerpt: 'From zero to 100+ startups. Lessons learned from building a founder-first community across Bharat.',
    content: `From zero to 100+ startups. Lessons learned from building a founder-first community across Bharat.

When I started EvolveX in 2019, I had no playbook. No funding. No connections. Just a belief that founders outside metros deserved better support.

## Year One: The Hustle

The first year was brutal. I cold-emailed 500+ founders, got 20 responses, and 5 showed up to our first event. Those 5 became our core community.

### What Worked:
- **Authenticity over polish** - Our events were raw but real
- **Value before ask** - We gave before we asked anything in return
- **Consistency** - We showed up every single week

### What Failed:
- Trying to copy Bangalore ecosystem models
- Charging too early
- Over-promising and under-delivering

## The Turning Point

Month 18. We had 50 founders in our community. Then Draper Startup House reached out. Then Headstart. Then government bodies.

The lesson? Build something valuable, and the ecosystem comes to you.

## Where We Are Now

- 100+ startups supported
- 10.5K+ community members
- Partnerships with major ecosystem players
- A 5-year vision to empower 10,000 founders

## What I've Learned

1. **Community > Network** - Networks are transactional. Communities are transformational.
2. **Patience compounds** - Year 1 and Year 5 look nothing alike.
3. **Your background is your superpower** - Being from rural Telangana isn't a disadvantage. It's why I understand the founders I serve.

The journey continues. And I'm documenting every step.`,
    date: '2024-11-20',
    readTime: '8 min',
    category: 'STARTUP',
    published: true,
    featured: false,
  },
  {
    id: '3',
    title: 'The Train That Changed Everything',
    excerpt: '8,000 kilometers. 15 days. 500+ founders. What Jagriti Yatra taught me about India\'s entrepreneurial spirit.',
    content: `8,000 kilometers. 15 days. 500+ founders. What Jagriti Yatra taught me about India's entrepreneurial spirit.

Picture this: A train carrying 500 aspiring entrepreneurs, stopping at 12 destinations across India, meeting role models who've built enterprises from nothing.

That's Jagriti Yatra. And it changed everything for me.

## Day 1: The Beginning

I boarded at Hyderabad with a backpack and a notebook. I had no idea that 15 days later, I'd have a completely different worldview.

## The Places That Shaped Me

### Deoria, UP
Population: 100,000. Entrepreneurs I met: 15+.
A town I'd never heard of, producing founders solving real problems for rural India.

### Ranchi
The energy of young founders building fintech for the unbanked. No VC funding. Just grit and customer obsession.

### Madurai
Manufacturing entrepreneurs competing globally. From a "tier-3 city."

## The Conversations at 3 AM

The best part of Yatra isn't the official sessions. It's the conversations that happen in train compartments at 3 AM.

Founders sharing failures. Mentors being vulnerable. Strangers becoming lifelong collaborators.

## What I Brought Back

1. **Humility** - My problems are small compared to what some founders overcome
2. **Network** - 500 connections who actually get it
3. **Purpose** - A clear mission to serve Middle India founders
4. **Hope** - India's best days are ahead

## Now I'm on the Other Side

Today, I manage Selections & Alumni for Jagriti Yatra. I help choose who gets this transformative experience. It's a responsibility I don't take lightly.

Every application I read, I think: "Could this be the next founder who changes everything?"

*The train keeps moving. And so do we.*`,
    date: '2023-12-10',
    readTime: '6 min',
    category: 'JOURNEY',
    published: true,
    featured: false,
  },
];

// Transform Supabase row to app format
const transformPost = (row) => ({
  id: row.id,
  title: row.title,
  excerpt: row.excerpt,
  content: row.content,
  category: row.category,
  published: row.published,
  featured: row.featured,
  readTime: row.read_time,
  date: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
});

export function BlogProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [useSupabase, setUseSupabase] = useState(true);
  const [error, setError] = useState(null);

  // Load posts from Supabase or localStorage
  useEffect(() => {
    const loadPosts = async () => {
      try {
        // Try Supabase first
        const { data, error: supabaseError } = await supabase
          .from('blog_posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (supabaseError) {
          console.warn('Supabase error, falling back to localStorage:', supabaseError.message);
          setUseSupabase(false);
          loadFromLocalStorage();
          return;
        }

        if (data && data.length > 0) {
          setPosts(data.map(transformPost));
          setUseSupabase(true);
        } else {
          // No data in Supabase, use fallback
          console.log('No posts in Supabase, using fallback data');
          setPosts(fallbackPosts);
          setUseSupabase(false);
        }
        setIsLoaded(true);
      } catch (err) {
        console.warn('Failed to connect to Supabase, using localStorage:', err);
        setUseSupabase(false);
        loadFromLocalStorage();
      }
    };

    const loadFromLocalStorage = () => {
      const savedPosts = localStorage.getItem('zeroBlogPosts');
      if (savedPosts) {
        setPosts(JSON.parse(savedPosts));
      } else {
        setPosts(fallbackPosts);
        localStorage.setItem('zeroBlogPosts', JSON.stringify(fallbackPosts));
      }
      setIsLoaded(true);
    };

    loadPosts();
  }, []);

  // Sync to localStorage when using localStorage mode
  useEffect(() => {
    if (isLoaded && !useSupabase) {
      localStorage.setItem('zeroBlogPosts', JSON.stringify(posts));
    }
  }, [posts, isLoaded, useSupabase]);

  // CRUD Operations
  const createPost = async (postData) => {
    const readTime = `${Math.ceil(postData.content.split(' ').length / 200)} min`;

    if (useSupabase) {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .insert([{
            title: postData.title,
            excerpt: postData.excerpt,
            content: postData.content,
            category: postData.category,
            published: postData.published || false,
            featured: postData.featured || false,
            read_time: readTime,
          }])
          .select()
          .single();

        if (error) throw error;

        const newPost = transformPost(data);
        setPosts(prev => [newPost, ...prev]);
        return newPost;
      } catch (err) {
        console.error('Failed to create post in Supabase:', err);
        setError(err.message);
        return null;
      }
    } else {
      // localStorage fallback
      const newPost = {
        ...postData,
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        readTime,
      };
      setPosts(prev => [newPost, ...prev]);
      return newPost;
    }
  };

  const updatePost = async (id, postData) => {
    const readTime = `${Math.ceil(postData.content.split(' ').length / 200)} min`;

    if (useSupabase) {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .update({
            title: postData.title,
            excerpt: postData.excerpt,
            content: postData.content,
            category: postData.category,
            published: postData.published,
            featured: postData.featured,
            read_time: readTime,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        setPosts(prev => prev.map(post =>
          post.id === id ? transformPost(data) : post
        ));
      } catch (err) {
        console.error('Failed to update post in Supabase:', err);
        setError(err.message);
      }
    } else {
      // localStorage fallback
      setPosts(prev => prev.map(post =>
        post.id === id
          ? { ...post, ...postData, readTime }
          : post
      ));
    }
  };

  const deletePost = async (id) => {
    if (useSupabase) {
      try {
        const { error } = await supabase
          .from('blog_posts')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setPosts(prev => prev.filter(post => post.id !== id));
      } catch (err) {
        console.error('Failed to delete post from Supabase:', err);
        setError(err.message);
      }
    } else {
      // localStorage fallback
      setPosts(prev => prev.filter(post => post.id !== id));
    }
  };

  const getPost = (id) => {
    return posts.find(post => post.id === id);
  };

  const getPublishedPosts = () => {
    return posts.filter(post => post.published);
  };

  const getFeaturedPosts = () => {
    return posts.filter(post => post.published && post.featured);
  };

  const togglePublish = async (id) => {
    const post = posts.find(p => p.id === id);
    if (!post) return;

    if (useSupabase) {
      try {
        const { error } = await supabase
          .from('blog_posts')
          .update({ published: !post.published, updated_at: new Date().toISOString() })
          .eq('id', id);

        if (error) throw error;

        setPosts(prev => prev.map(p =>
          p.id === id ? { ...p, published: !p.published } : p
        ));
      } catch (err) {
        console.error('Failed to toggle publish in Supabase:', err);
        setError(err.message);
      }
    } else {
      // localStorage fallback
      setPosts(prev => prev.map(p =>
        p.id === id ? { ...p, published: !p.published } : p
      ));
    }
  };

  const toggleFeatured = async (id) => {
    const post = posts.find(p => p.id === id);
    if (!post) return;

    if (useSupabase) {
      try {
        const { error } = await supabase
          .from('blog_posts')
          .update({ featured: !post.featured, updated_at: new Date().toISOString() })
          .eq('id', id);

        if (error) throw error;

        setPosts(prev => prev.map(p =>
          p.id === id ? { ...p, featured: !p.featured } : p
        ));
      } catch (err) {
        console.error('Failed to toggle featured in Supabase:', err);
        setError(err.message);
      }
    } else {
      // localStorage fallback
      setPosts(prev => prev.map(p =>
        p.id === id ? { ...p, featured: !p.featured } : p
      ));
    }
  };

  // Refresh posts from Supabase
  const refreshPosts = async () => {
    if (!useSupabase) return;

    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPosts(data.map(transformPost));
    } catch (err) {
      console.error('Failed to refresh posts:', err);
      setError(err.message);
    }
  };

  return (
    <BlogContext.Provider value={{
      posts,
      isLoaded,
      useSupabase,
      error,
      createPost,
      updatePost,
      deletePost,
      getPost,
      getPublishedPosts,
      getFeaturedPosts,
      togglePublish,
      toggleFeatured,
      refreshPosts,
    }}>
      {children}
    </BlogContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBlog() {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
}

export default BlogContext;
