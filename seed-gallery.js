// SEED GALLERY IMAGES
// Run this in browser console AFTER logging into /admin
// This uses your authenticated session to insert the images

const galleryItems = [
  { title: 'TEDx CMRIT Hyderabad', caption: 'Speaking at TEDx CMRIT', category: 'Speaking', display_order: 0 },
  { title: 'Jagriti Yatra 2023', caption: 'Train journey across India', category: 'Journey', display_order: 1 },
  { title: 'EvolveX Demo Day', caption: 'Startup demo day event', category: 'Events', display_order: 2 },
  { title: 'Founder Circle Meetup', caption: 'Community gathering', category: 'Community', display_order: 3 },
  { title: 'Draper Startup House', caption: 'Partner collaboration', category: 'Partners', display_order: 4 },
  { title: 'Rural India Expedition', caption: 'Exploring rural India', category: 'Journey', display_order: 5 },
];

// Copy everything below and paste in browser console while logged into admin:
(async () => {
  const SUPABASE_URL = 'https://jzbkpdxykuqbildukftz.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_xpQttjn7pfWme1SY8OzWOQ_YCE0HpJN';

  // Get auth token from localStorage
  const authData = localStorage.getItem('sb-jzbkpdxykuqbildukftz-auth-token');
  let accessToken = SUPABASE_ANON_KEY;

  if (authData) {
    const parsed = JSON.parse(authData);
    accessToken = parsed.access_token || SUPABASE_ANON_KEY;
    console.log('Using authenticated session');
  } else {
    console.log('No auth session found - please login first');
    return;
  }

  for (const item of galleryItems) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/gallery_images`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        ...item,
        image_url: '',
        is_visible: true
      })
    });
    console.log(`Inserted: ${item.title}`, response.ok ? '✓' : '✗');
  }
  console.log('Done! Go to /admin/gallery to see your images.');
})();
