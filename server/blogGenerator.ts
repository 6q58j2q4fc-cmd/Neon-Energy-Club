import { invokeLLM } from "./_core/llm";
import { createBlogPost } from "./db";

const blogTopics = [
  // Product topics
  { category: "product" as const, topic: "The Science Behind NEON's Natural Energy Formula" },
  { category: "product" as const, topic: "Why NEON Uses Zero Sugar Without Sacrificing Taste" },
  { category: "product" as const, topic: "NEON Original vs NEON Organic: Which Is Right For You?" },
  { category: "product" as const, topic: "The Premium Ingredients That Make NEON Different" },
  { category: "product" as const, topic: "How NEON Delivers Clean Energy Without the Crash" },
  
  // Health topics
  { category: "health" as const, topic: "5 Ways Natural Energy Drinks Support Your Active Lifestyle" },
  { category: "health" as const, topic: "The Benefits of B-Vitamins in Your Daily Energy Routine" },
  { category: "health" as const, topic: "Why Athletes Are Switching to Clean Energy Drinks" },
  { category: "health" as const, topic: "Understanding Caffeine: Natural Sources vs Synthetic" },
  { category: "health" as const, topic: "Energy Drinks and Hydration: What You Need to Know" },
  
  // Business topics
  { category: "business" as const, topic: "The $80 Billion Energy Drink Market: Where NEON Fits In" },
  { category: "business" as const, topic: "How NEON Is Disrupting the Traditional Beverage Industry" },
  { category: "business" as const, topic: "The Rise of Premium Energy Drinks in 2026" },
  { category: "business" as const, topic: "Why Investors Are Excited About NEON's Relaunch" },
  { category: "business" as const, topic: "Building a Beverage Brand in the Modern Era" },
  
  // Franchise topics
  { category: "franchise" as const, topic: "NEON AI Vending: The Future of Beverage Distribution" },
  { category: "franchise" as const, topic: "How to Choose the Perfect Territory for Your NEON Franchise" },
  { category: "franchise" as const, topic: "Success Stories: NEON Micro-Franchise Owners Share Their Journey" },
  { category: "franchise" as const, topic: "The Economics of AI-Powered Vending Machine Franchises" },
  { category: "franchise" as const, topic: "Why Micro-Franchising Is the Future of Small Business" },
  
  // Distributor topics
  { category: "distributor" as const, topic: "Getting Started as a NEON Distributor: A Complete Guide" },
  { category: "distributor" as const, topic: "Top 10 Tips for Building Your NEON Distribution Network" },
  { category: "distributor" as const, topic: "How to Maximize Your Commissions as a NEON Partner" },
  { category: "distributor" as const, topic: "Building Passive Income Through the NEON Opportunity" },
  { category: "distributor" as const, topic: "From Side Hustle to Full-Time: NEON Distributor Success Stories" },
  
  // News topics
  { category: "news" as const, topic: "NEON Energy Drink Announces Major Relaunch Campaign" },
  { category: "news" as const, topic: "NEON Partners with Top Athletes for 2026 Campaign" },
  { category: "news" as const, topic: "New NEON Flavors Coming Soon: What We Know So Far" },
  { category: "news" as const, topic: "NEON Crowdfunding Campaign Exceeds Expectations" },
  { category: "news" as const, topic: "NEON Expands Distribution Network Across Major Markets" },
  
  // Lifestyle topics
  { category: "lifestyle" as const, topic: "Morning Routines of Successful Entrepreneurs (Featuring NEON)" },
  { category: "lifestyle" as const, topic: "How to Stay Energized During Your Workout Without the Jitters" },
  { category: "lifestyle" as const, topic: "The Perfect Pre-Game Drink: Why Gamers Love NEON" },
  { category: "lifestyle" as const, topic: "Late Night Study Sessions? Here's How NEON Can Help" },
  { category: "lifestyle" as const, topic: "Energy for Creatives: Fueling Your Next Big Project" },
];

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 100);
}

export async function generateBlogPost(): Promise<{ success: boolean; title?: string; error?: string }> {
  try {
    // Pick a random topic
    const topicIndex = Math.floor(Math.random() * blogTopics.length);
    const { category, topic } = blogTopics[topicIndex];
    
    // Generate content using LLM
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a professional content writer for NEON Energy Drink, a premium natural energy drink brand. 
Write engaging, SEO-optimized blog posts that are informative, exciting, and align with the brand's premium, modern, neon-futuristic aesthetic.
The brand uses a striking neon green and black color scheme and targets health-conscious, active individuals.
Always write in a confident, energetic tone that matches the brand's vibrant personality.
Include relevant keywords naturally throughout the content.`
        },
        {
          role: "user",
          content: `Write a comprehensive blog post about: "${topic}"

The post should include:
1. An engaging introduction that hooks the reader
2. 3-5 main sections with subheadings
3. Practical tips or insights where relevant
4. A compelling conclusion with a call to action
5. The content should be 800-1200 words

Format the response as JSON with these fields:
- title: The blog post title (can be different from the topic if you have a better hook)
- excerpt: A 150-character summary for previews
- content: The full blog post in markdown format
- metaTitle: SEO-optimized title (max 60 chars)
- metaDescription: SEO meta description (max 160 chars)
- keywords: Comma-separated SEO keywords`
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "blog_post",
          strict: true,
          schema: {
            type: "object",
            properties: {
              title: { type: "string", description: "Blog post title" },
              excerpt: { type: "string", description: "Short excerpt for previews" },
              content: { type: "string", description: "Full markdown content" },
              metaTitle: { type: "string", description: "SEO title" },
              metaDescription: { type: "string", description: "SEO description" },
              keywords: { type: "string", description: "SEO keywords" }
            },
            required: ["title", "excerpt", "content", "metaTitle", "metaDescription", "keywords"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content generated from LLM");
    }

    const blogData = JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));
    const slug = generateSlug(blogData.title) + "-" + Date.now().toString(36);

    // Save to database
    await createBlogPost({
      title: blogData.title,
      slug,
      excerpt: blogData.excerpt,
      content: blogData.content,
      category,
      metaTitle: blogData.metaTitle,
      metaDescription: blogData.metaDescription,
      keywords: blogData.keywords,
      status: "published",
    });

    console.log(`[BlogGenerator] Successfully created blog post: ${blogData.title}`);
    return { success: true, title: blogData.title };
  } catch (error) {
    console.error("[BlogGenerator] Error generating blog post:", error);
    return { success: false, error: String(error) };
  }
}

// Function to be called by cron job
export async function runDailyBlogGeneration(): Promise<void> {
  console.log("[BlogGenerator] Starting daily blog generation...");
  
  // Generate 1-2 posts per day
  const postsToGenerate = Math.random() > 0.5 ? 2 : 1;
  
  for (let i = 0; i < postsToGenerate; i++) {
    const result = await generateBlogPost();
    if (result.success) {
      console.log(`[BlogGenerator] Generated post ${i + 1}/${postsToGenerate}: ${result.title}`);
    } else {
      console.error(`[BlogGenerator] Failed to generate post ${i + 1}/${postsToGenerate}: ${result.error}`);
    }
    
    // Wait a bit between posts to avoid rate limiting
    if (i < postsToGenerate - 1) {
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  console.log("[BlogGenerator] Daily blog generation complete.");
}
