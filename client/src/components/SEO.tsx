import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "product";
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

const BASE_URL = "https://neonenergy.com";
const DEFAULT_IMAGE = "/og-image.png";
const SITE_NAME = "NEON Energy Drink";

// SEO Keywords and Hashtags
// Public hashtags (visible in meta tags)
const PUBLIC_HASHTAGS = [
  "#NeonEnergyDrink",
  "#Neon",
  "#EnergyDrinks",
  "#CleanEnergy",
  "#NaturalEnergy",
  "#HealthyEnergy",
  "#EnergyBoost",
  "#FitnessEnergy",
  "#PreWorkout",
  "#NoCrash",
  "#ZeroSugar",
  "#OrganicEnergy",
  "#GreenEnergy",
  "#SustainableEnergy",
  "#EnergyDrinkRelaunch",
];

// Hidden hashtags (embedded in page but not displayed)
const HIDDEN_HASHTAGS = [
  "visalus",
  "vi",
  "vineon",
];

// Comprehensive SEO keywords
const COMPREHENSIVE_KEYWORDS = [
  "NEON energy drink",
  "natural energy drink",
  "clean energy drink",
  "healthy energy drink",
  "organic energy drink",
  "energy drink relaunch",
  "energy drink franchise",
  "energy drink distributor",
  "energy drink pre-order",
  "energy drink crowdfunding",
  "zero sugar energy drink",
  "no crash energy drink",
  "green tea energy drink",
  "natural caffeine",
  "B vitamins energy",
  "taurine energy drink",
  "fitness energy drink",
  "pre workout energy",
  "sustainable energy drink",
  "vegan energy drink",
  "plant-based energy",
  "energy drink business opportunity",
  "energy drink MLM",
  "energy drink network marketing",
  "NEON franchise",
  "NEON distributor",
  "NEON vending machines",
  "NEON NFT",
];

export function SEO({
  title,
  description,
  keywords = COMPREHENSIVE_KEYWORDS.join(", "),
  image = DEFAULT_IMAGE,
  url = "",
  type = "website",
  author = "NEON Energy Drink",
  publishedTime,
  modifiedTime,
}: SEOProps) {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const fullUrl = `${BASE_URL}${url}`;
  const fullImage = image.startsWith("http") ? image : `${BASE_URL}${image}`;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Helper to update or create meta tags
    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? "property" : "name";
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    // Basic Meta Tags
    setMeta("description", description);
    setMeta("keywords", keywords);
    setMeta("author", author);
    setMeta("robots", "index, follow");
    setMeta("viewport", "width=device-width, initial-scale=1.0");
    setMeta("theme-color", "#c8ff00");
    
    // Public Hashtags (visible in meta)
    setMeta("hashtags", PUBLIC_HASHTAGS.join(" "));
    
    // Hidden SEO terms (embedded but not displayed)
    setMeta("hidden-keywords", HIDDEN_HASHTAGS.join(", "));
    
    // Additional SEO meta tags
    setMeta("news_keywords", "NEON energy drink, energy drink relaunch, natural energy, clean energy");
    setMeta("classification", "Energy Drinks, Health & Wellness, Beverages");
    setMeta("category", "Energy Drinks");
    setMeta("coverage", "Worldwide");
    setMeta("distribution", "Global");
    setMeta("rating", "General");
    setMeta("revisit-after", "1 day");
    setMeta("language", "en");

    // Open Graph Tags
    setMeta("og:title", fullTitle, true);
    setMeta("og:description", description, true);
    setMeta("og:image", fullImage, true);
    setMeta("og:url", fullUrl, true);
    setMeta("og:type", type, true);
    setMeta("og:site_name", SITE_NAME, true);
    setMeta("og:locale", "en_US", true);

    // Twitter Card Tags
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:image", fullImage);
    setMeta("twitter:site", "@NEONEnergy");
    setMeta("twitter:creator", "@NEONEnergy");

    // Article-specific tags
    if (type === "article") {
      if (publishedTime) {
        setMeta("article:published_time", publishedTime, true);
      }
      if (modifiedTime) {
        setMeta("article:modified_time", modifiedTime, true);
      }
      setMeta("article:author", author, true);
    }

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", fullUrl);

    // Structured Data (JSON-LD)
    let script = document.querySelector('script[data-seo="structured-data"]');
    if (!script) {
      script = document.createElement("script");
      script.setAttribute("type", "application/ld+json");
      script.setAttribute("data-seo", "structured-data");
      document.head.appendChild(script);
    }

    const structuredData = {
      "@context": "https://schema.org",
      "@type": type === "article" ? "Article" : "WebPage",
      name: title,
      description: description,
      url: fullUrl,
      image: fullImage,
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
        logo: {
          "@type": "ImageObject",
          url: `${BASE_URL}/logo.png`,
        },
      },
      ...(type === "article" && {
        author: {
          "@type": "Person",
          name: author,
        },
        datePublished: publishedTime,
        dateModified: modifiedTime || publishedTime,
      }),
    };

    script.textContent = JSON.stringify(structuredData);

    // Organization Schema (only on homepage)
    if (url === "/" || url === "") {
      let orgScript = document.querySelector('script[data-seo="organization"]');
      if (!orgScript) {
        orgScript = document.createElement("script");
        orgScript.setAttribute("type", "application/ld+json");
        orgScript.setAttribute("data-seo", "organization");
        document.head.appendChild(orgScript);
      }

      const orgData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: SITE_NAME,
        url: BASE_URL,
        logo: `${BASE_URL}/logo.png`,
        description: "NEON Energy Drink - The next generation of clean, natural energy.",
        sameAs: [
          "https://twitter.com/NEONEnergy",
          "https://facebook.com/NEONEnergy",
          "https://instagram.com/NEONEnergy",
          "https://youtube.com/NEONEnergy",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+1-800-NEON-ENERGY",
          contactType: "customer service",
          availableLanguage: ["English"],
        },
      };

      orgScript.textContent = JSON.stringify(orgData);
    }
  }, [title, description, keywords, image, url, type, author, publishedTime, modifiedTime, fullTitle, fullUrl, fullImage]);

  return null;
}

// Product Schema for product pages
export function ProductSEO({
  name,
  description,
  price,
  currency = "USD",
  image,
  sku,
  availability = "InStock",
}: {
  name: string;
  description: string;
  price: number;
  currency?: string;
  image: string;
  sku: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder";
}) {
  useEffect(() => {
    let script = document.querySelector(`script[data-seo="product-${sku}"]`);
    if (!script) {
      script = document.createElement("script");
      script.setAttribute("type", "application/ld+json");
      script.setAttribute("data-seo", `product-${sku}`);
      document.head.appendChild(script);
    }

    const productData = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: name,
      description: description,
      image: image,
      sku: sku,
      brand: {
        "@type": "Brand",
        name: "NEON Energy Drink",
      },
      offers: {
        "@type": "Offer",
        price: price,
        priceCurrency: currency,
        availability: `https://schema.org/${availability}`,
        seller: {
          "@type": "Organization",
          name: "NEON Energy Drink",
        },
      },
    };

    script.textContent = JSON.stringify(productData);

    return () => {
      script?.remove();
    };
  }, [name, description, price, currency, image, sku, availability]);

  return null;
}

// FAQ Schema for FAQ page
export function FAQSchemaSEO({
  faqs,
}: {
  faqs: Array<{ question: string; answer: string }>;
}) {
  useEffect(() => {
    let script = document.querySelector('script[data-seo="faq"]');
    if (!script) {
      script = document.createElement("script");
      script.setAttribute("type", "application/ld+json");
      script.setAttribute("data-seo", "faq");
      document.head.appendChild(script);
    }

    const faqData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    };

    script.textContent = JSON.stringify(faqData);

    return () => {
      script?.remove();
    };
  }, [faqs]);

  return null;
}

export default SEO;
