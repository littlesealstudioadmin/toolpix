/**
 * Resize Tool Page
 * Design: Gradient accent = coral to peach (#FF6B6B → #FEC89A)
 * Features: Width/Height input, maintain aspect ratio, preset sizes
 */
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Download, RotateCcw, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import FileDropZone from "@/components/FileDropZone";
import { loadImage, resizeImage, downloadBlob, formatFileSize, type ImageInfo } from "@/lib/imageUtils";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";
import AdSlot from "@/components/AdSlot";

const presets = [
  { label: "Instagram Post", w: 1080, h: 1080 },
  { label: "Instagram Story", w: 1080, h: 1920 },
  { label: "Facebook Cover", w: 820, h: 312 },
  { label: "Twitter Header", w: 1500, h: 500 },
  { label: "YouTube Thumbnail", w: 1280, h: 720 },
  { label: "HD (1920x1080)", w: 1920, h: 1080 },
];

export default function ResizeTool() {
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    try {
      const info = await loadImage(file);
      setImageInfo(info);
      setWidth(info.width);
      setHeight(info.height);
      setResultUrl(null);
      setResultBlob(null);
    } catch {
      toast.error("Failed to load image. Please try another file.");
    }
  }, []);

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    if (lockAspect && imageInfo) {
      const ratio = imageInfo.height / imageInfo.width;
      setHeight(Math.round(newWidth * ratio));
    }
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    if (lockAspect && imageInfo) {
      const ratio = imageInfo.width / imageInfo.height;
      setWidth(Math.round(newHeight * ratio));
    }
  };

  const handlePreset = (w: number, h: number) => {
    setWidth(w);
    setHeight(h);
    setLockAspect(false);
  };

  const handleResize = async () => {
    if (!imageInfo) return;
    setProcessing(true);
    try {
      const blob = await resizeImage(imageInfo.file, width, height, false);
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setResultBlob(blob);
      toast.success(`Resized to ${width}x${height} (${formatFileSize(blob.size)})`);
    } catch {
      toast.error("Failed to resize image.");
    }
    setProcessing(false);
  };

  const handleDownload = () => {
    if (!resultBlob || !imageInfo) return;
    const ext = imageInfo.name.split(".").pop() || "png";
    const name = imageInfo.name.replace(/\.[^.]+$/, "") + `_${width}x${height}.${ext}`;
    downloadBlob(resultBlob, name);
  };

  const handleReset = () => {
    if (imageInfo) URL.revokeObjectURL(imageInfo.url);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setImageInfo(null);
    setResultUrl(null);
    setResultBlob(null);
  };

  return (
    <div className="py-8 md:py-12">
      <SEOHead
        title="Free Image Resizer Online - Resize Photos Instantly | ToolPix"
        description="Resize images to any dimension for free. Perfect for social media, web, and print. Supports PNG, JPG, WebP. No upload needed - 100% private."
        path="/resize"
      />
      <div className="container max-w-4xl">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-8 rounded-full bg-gradient-to-b from-[#FF6B6B] to-[#FEC89A]" />
            <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight">
              Image Resize
            </h1>
          </div>
          <p className="text-muted-foreground ml-5">
            Resize your images to exact dimensions. Supports PNG, JPG, WebP, and GIF.
          </p>
        </motion.div>

        {!imageInfo ? (
          <FileDropZone onFileSelect={handleFileSelect} />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Image Preview */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium truncate max-w-[200px]">{imageInfo.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {imageInfo.width}x{imageInfo.height} &middot; {formatFileSize(imageInfo.size)}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <RotateCcw className="w-4 h-4 mr-1" /> New Image
                </Button>
              </div>
              <div className="p-6 bg-muted/20 flex justify-center">
                <img
                  src={resultUrl || imageInfo.url}
                  alt="Preview"
                  className="max-h-[300px] max-w-full object-contain rounded-lg shadow-sm"
                />
              </div>
            </div>

            {/* Controls */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-display font-semibold text-sm mb-4">Resize Settings</h3>
              
              {/* Dimension Inputs */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Width (px)</label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => handleWidthChange(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <button
                  onClick={() => setLockAspect(!lockAspect)}
                  className="mt-5 p-2 rounded-lg hover:bg-muted transition-colors"
                  title={lockAspect ? "Unlock aspect ratio" : "Lock aspect ratio"}
                >
                  {lockAspect ? (
                    <Lock className="w-4 h-4 text-primary" />
                  ) : (
                    <Unlock className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Height (px)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => handleHeightChange(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              {/* Presets */}
              <div className="mb-5">
                <label className="text-xs text-muted-foreground mb-2 block">Quick Presets</label>
                <div className="flex flex-wrap gap-2">
                  {presets.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => handlePreset(p.w, p.h)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-muted hover:border-primary/30 transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleResize}
                  disabled={processing || width <= 0 || height <= 0}
                  className="flex-1 bg-gradient-to-r from-[#FF6B6B] to-[#FEC89A] text-white border-0 hover:opacity-90"
                >
                  {processing ? "Processing..." : "Resize Image"}
                </Button>
                {resultBlob && (
                  <Button onClick={handleDownload} variant="outline" className="gap-2">
                    <Download className="w-4 h-4" /> Download
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Ad Slot */}
        <div className="py-4">
          <AdSlot format="rectangle" />
        </div>

        {/* SEO Content */}
        <div className="mt-16 prose prose-gray max-w-none">
          <h2 className="font-display font-bold text-2xl tracking-tight mb-4">
            How to Resize Images Online
          </h2>
          <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
            <p>
              Our free image resizer lets you change the dimensions of any image in seconds. 
              Simply upload your image, set your desired width and height, and download the resized version. 
              All processing happens locally in your browser for maximum privacy and speed.
            </p>
            <p>
              Use our preset sizes for popular social media platforms including Instagram, Facebook, Twitter, 
              and YouTube. You can also enter custom dimensions with or without maintaining the original aspect ratio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
