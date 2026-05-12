/**
 * AdSlot Component
 * Placeholder for Google AdSense ads.
 * Replace data-ad-client and data-ad-slot with your actual AdSense values.
 * 
 * Ad placement strategy for $3/day revenue:
 * - Header banner (728x90) on all pages
 * - In-content rectangle (300x250) between tool sections
 * - Footer banner (728x90) on all pages
 * - Sidebar rectangle on tool pages (300x600)
 */
import { useEffect, useRef } from "react";

interface AdSlotProps {
  format?: "horizontal" | "rectangle" | "vertical" | "auto";
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function AdSlot({ format = "auto", className = "" }: AdSlotProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      if (window.adsbygoogle && adRef.current) {
        window.adsbygoogle.push({});
        pushed.current = true;
      }
    } catch {
      // AdSense not loaded yet - this is expected in development
    }
  }, []);

  const sizeClass = {
    horizontal: "min-h-[90px]",
    rectangle: "min-h-[250px]",
    vertical: "min-h-[600px]",
    auto: "min-h-[90px]",
  }[format];

  return (
    <div
      ref={adRef}
      className={`w-full flex items-center justify-center bg-muted/20 rounded-lg border border-dashed border-border/50 overflow-hidden ${sizeClass} ${className}`}
    >
      {/* 
        Replace this placeholder with actual AdSense code:
        
        <ins className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot="XXXXXXXXXX"
          data-ad-format={format === "auto" ? "auto" : undefined}
          data-full-width-responsive="true"
        />
      */}
      <div className="text-center p-4">
        <p className="text-xs text-muted-foreground/50 font-medium">
          Ad Space
        </p>
        <p className="text-[10px] text-muted-foreground/30">
          {format === "horizontal" && "728 x 90"}
          {format === "rectangle" && "300 x 250"}
          {format === "vertical" && "300 x 600"}
          {format === "auto" && "Responsive"}
        </p>
      </div>
    </div>
  );
}
