import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const sampleBlogPosts = [
  {
    slug: 'neon-relaunch-2026-everything-you-need-to-know',
    title: 'NEON Relaunch 2026: Everything You Need to Know',
    excerpt: 'After years of anticipation, NEON Energy Drink is making its triumphant return. Here is everything you need to know about the biggest energy drink comeback of the decade.',
    content: `# NEON Relaunch 2026: Everything You Need to Know

The wait is finally over. NEON Energy Drink, the brand that took the energy drink world by storm in 2013, is making its highly anticipated return in 2026.

## The Story So Far

Originally founded in Bend, Oregon by Harvard Business School alumnus Dakota Rea, NEON quickly became one of the fastest-growing beverage brands in history. Within its first year, NEON expanded to 48 states, and within five years, the brand had reached 14 countries worldwide.

## What's New in 2026

The relaunched NEON brings several exciting updates:

- **Enhanced Formula**: Our new formula features 150mg of natural caffeine from green tea, providing smooth, sustained energy without the crash.
- **Zero Sugar Options**: All NEON varieties now come with zero added sugar.
- **Sustainable Packaging**: Our new cans are made from 100% recycled aluminum.

## How to Get Involved

There are several ways to be part of the NEON relaunch:

1. **Pre-Order**: Secure your supply before the official launch
2. **Crowdfunding**: Back our campaign and receive exclusive rewards
3. **Franchise Opportunity**: Become a NEON territory partner

Join us as we light up the world once again with the legendary taste and energy boost that defined a generation.`,
    featuredImage: '/vice-city-sunset.jpg',
    category: 'news',
    metaTitle: 'NEON Relaunch 2026 - Official Announcement',
    metaDescription: 'NEON Energy Drink is back! Learn about the 2026 relaunch, new formula, and how to get involved.',
    keywords: 'NEON relaunch, energy drink 2026, NEON comeback',
    status: 'published',
    authorName: 'Dakota Rea',
    views: 15234
  },
  {
    slug: 'natural-caffeine-vs-synthetic-what-you-need-to-know',
    title: 'Natural Caffeine vs Synthetic: What You Need to Know',
    excerpt: 'Not all caffeine is created equal. Discover why natural caffeine from green tea provides a superior energy experience compared to synthetic alternatives.',
    content: `# Natural Caffeine vs Synthetic: What You Need to Know

When it comes to energy drinks, the source of caffeine matters more than you might think. At NEON, we exclusively use natural caffeine derived from green tea, and here's why that makes a difference.

## Understanding Caffeine Sources

**Natural Caffeine** is extracted from plants like green tea, coffee beans, and guarana. It comes bundled with other beneficial compounds like L-theanine, which promotes calm focus.

**Synthetic Caffeine** is manufactured in laboratories and is chemically identical to natural caffeine, but lacks the accompanying beneficial compounds.

## The NEON Difference

Each can of NEON contains 150mg of natural caffeine from green tea. This provides:

- **Smooth Energy Release**: No sudden spikes or crashes
- **Enhanced Focus**: L-theanine works synergistically with caffeine
- **Antioxidant Benefits**: Green tea extract provides additional health benefits

## The Science Behind It

Studies have shown that natural caffeine paired with L-theanine can improve cognitive performance while reducing the jittery side effects often associated with synthetic caffeine.

Choose NEON for clean, natural energy that works with your body, not against it.`,
    featuredImage: '/beverage-splash-1.webp',
    category: 'health',
    metaTitle: 'Natural vs Synthetic Caffeine - NEON Energy',
    metaDescription: 'Learn why natural caffeine from green tea provides better energy than synthetic alternatives.',
    keywords: 'natural caffeine, green tea caffeine, healthy energy drink',
    status: 'published',
    authorName: 'NEON Health Team',
    views: 8456
  },
  {
    slug: 'building-passive-income-with-neon-vending-machines',
    title: 'Building Passive Income with NEON Vending Machines',
    excerpt: 'Discover how entrepreneurs are earning $600+ per month in passive income with NEON AI-powered vending machines.',
    content: `# Building Passive Income with NEON Vending Machines

The NEON vending machine opportunity represents one of the most exciting micro-franchise models in the beverage industry. Here's how you can build a passive income stream with minimal effort.

## The Opportunity

NEON's AI-powered vending machines are revolutionizing the energy drink market. With smart inventory management, cashless payments, and real-time analytics, these machines practically run themselves.

## The Numbers

- **Average Monthly Profit**: $600+ per machine
- **ROI Timeline**: 6-24 months
- **Initial Investment**: Starting at $4,500

## What's Included

When you become a NEON vending partner, you receive:

1. State-of-the-art AI-powered vending machine
2. Exclusive territory rights
3. Full training and support
4. Marketing materials
5. 24/7 technical support

## Success Stories

*"I started with one machine at a local gym. Within six months, I had three machines generating over $2,000 in monthly passive income."* - Marcus T., NEON Partner

## Getting Started

The process is simple:

1. Select your territory
2. Choose your financing option
3. Complete training
4. Launch your machine

Ready to start building your passive income empire? Apply for a territory today.`,
    featuredImage: '/vending-machine.jpg',
    category: 'franchise',
    metaTitle: 'NEON Vending Machine Franchise Opportunity',
    metaDescription: 'Learn how to earn passive income with NEON AI-powered vending machines. $600+ monthly profit potential.',
    keywords: 'vending machine business, passive income, NEON franchise',
    status: 'published',
    authorName: 'NEON Business Team',
    views: 12089
  },
  {
    slug: 'celebrity-endorsements-neon-in-music-videos',
    title: 'Celebrity Endorsements: NEON in Music Videos',
    excerpt: 'From Chris Brown to Snoop Dogg, see how NEON Energy Drink has been featured in some of the biggest music videos of all time.',
    content: `# Celebrity Endorsements: NEON in Music Videos

NEON Energy Drink has been featured alongside some of the world's biggest stars, appearing in music videos with combined views exceeding 500 million.

## Featured Artists

### Chris Brown & Deorro - "Five More Hours"
With over 350 million views, this collaboration prominently featured NEON throughout the video, introducing the brand to a massive global audience.

### Christina Milian ft. Snoop Dogg - "Like Me"
Pop star Christina Milian became a brand ambassador for NEON, featuring the drink in multiple music videos including her hit collaboration with Snoop Dogg.

### Chris Brown - "Zero"
Another Chris Brown hit featuring NEON product placement, reaching 69 million views.

## The Impact

These celebrity endorsements helped NEON reach an estimated 15% of the world's population within just 5 years of launch. The brand became synonymous with the energy and excitement of the music industry.

## The Relaunch

As we prepare for the 2026 relaunch, we're excited to announce new celebrity partnerships that will take NEON to even greater heights. Stay tuned for announcements!`,
    featuredImage: '/vice-city-neon-street.jpg',
    category: 'news',
    metaTitle: 'NEON Energy Drink Celebrity Endorsements',
    metaDescription: 'Discover how NEON has been featured in music videos by Chris Brown, Snoop Dogg, and Christina Milian.',
    keywords: 'NEON celebrities, Chris Brown, Snoop Dogg, music video',
    status: 'published',
    authorName: 'NEON Marketing Team',
    views: 9823
  },
  {
    slug: 'distributor-success-story-from-side-hustle-to-six-figures',
    title: 'Distributor Success Story: From Side Hustle to Six Figures',
    excerpt: 'Meet Sarah, a former teacher who built a six-figure income as a NEON distributor. Here is her inspiring journey.',
    content: `# Distributor Success Story: From Side Hustle to Six Figures

Sarah Martinez was a high school teacher earning $45,000 a year when she discovered NEON's distributor opportunity. Two years later, she's earning over $150,000 annually and has helped dozens of others achieve financial freedom.

## The Beginning

"I was skeptical at first," Sarah admits. "I'd seen network marketing companies before and wasn't interested. But NEON was different. The product was genuinely great, and the compensation plan was transparent."

## Building the Business

Sarah started by sharing NEON with her gym friends. "I wasn't selling—I was just sharing something I loved. When people saw my energy levels and asked what I was drinking, I told them about NEON."

## The Turning Point

Within six months, Sarah had built a team of 15 distributors. "That's when the residual income started to compound. I was earning commissions not just on my sales, but on my team's sales too."

## Today

Sarah now leads a team of over 200 distributors across 12 states. She's achieved the Diamond rank and earns:

- 30% direct commissions
- Binary team bonuses
- Leadership matching bonuses
- Rank advancement bonuses

## Her Advice

"Don't think of this as selling. Think of it as sharing something you believe in. The product sells itself—you just need to introduce people to it."

Ready to write your own success story? Join the NEON team today.`,
    featuredImage: '/beverage-splash-2.webp',
    category: 'distributor',
    metaTitle: 'NEON Distributor Success Story - Six Figure Income',
    metaDescription: 'Learn how Sarah went from teacher to six-figure earner as a NEON distributor.',
    keywords: 'NEON distributor, success story, network marketing',
    status: 'published',
    authorName: 'NEON Success Team',
    views: 7234
  }
];

async function seedBlogPosts() {
  console.log('Connecting to database...');
  
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection);
  
  console.log('Inserting sample blog posts...');
  
  for (const post of sampleBlogPosts) {
    try {
      await connection.execute(
        `INSERT INTO blog_posts (slug, title, excerpt, content, featuredImage, category, metaTitle, metaDescription, keywords, status, views, publishedAt, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())
         ON DUPLICATE KEY UPDATE title = VALUES(title)`,
        [
          post.slug,
          post.title,
          post.excerpt,
          post.content,
          post.featuredImage,
          post.category,
          post.metaTitle,
          post.metaDescription,
          post.keywords,
          post.status,
          post.views
        ]
      );
      console.log(`  ✓ Inserted: ${post.title}`);
    } catch (error) {
      console.error(`  ✗ Failed to insert: ${post.title}`, error.message);
    }
  }
  
  await connection.end();
  console.log('Done! Sample blog posts have been added.');
}

seedBlogPosts().catch(console.error);
