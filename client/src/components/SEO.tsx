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
const DEFAULT_IMAGE = "/neon-can-new.png";
const SITE_NAME = "NEON Energy Drink";

export function SEO({
  title,
  description,
  keywords = "energy drink, NEON, natural energy, organic energy drink, healthy energy, caffeine, taurine, B vitamins, pre-order, crowdfunding, franchise, distributor",
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
    setMeta("theme-color", "#b8e600");

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
