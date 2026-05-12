/**
 * SEO Head Component
 * Updates document title and meta tags for each page.
 * Critical for search engine visibility and organic traffic.
 */
import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  path: string;
}

export default function SEOHead({ title, description, path }: SEOHeadProps) {
  useEffect(() => {
    // Update title
    document.title = title;

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", description);

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `https://toolpix.manus.space${path}`);

    // Open Graph tags
    const ogTags: Record<string, string> = {
      "og:title": title,
      "og:description": description,
      "og:url": `https://toolpix.manus.space${path}`,
      "og:type": "website",
      "og:site_name": "ToolPix",
    };

    Object.entries(ogTags).forEach(([property, content]) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", property);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    });
  }, [title, description, path]);

  return null;
}
