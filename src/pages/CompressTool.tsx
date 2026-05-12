/**
 * Compress Tool Page
 * Design: Gradient accent = mint to cyan (#6EDCD9 → #38BDF8)
 * Features: Quality slider, before/after size comparison
 */
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import FileDropZone from "@/components/FileDropZone";
import { loadImage, compressImage, downloadBlob, formatFileSize, type ImageInfo } from "@/lib/imageUtils";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";
import AdSlot from "@/components/AdSlot";

export default function CompressTool() {
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [quality, setQuality] = useState(75);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    try {
      const info = await loadImage(file);
      setImageInfo(info);
      setResultUrl(null);
      setResultBlob(null);
    } catch {
      toast.error("Failed to load image. Please try another file.");
    }
  }, []);

  const handleCompress = async () => {
    if (!imageInfo) return;
    setProcessing(true);
    try {
      const blob = await compressImage(imageInfo.file, quality / 100);
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setResultBlob(blob);
      const savings = ((1 - blob.size / imageInfo.size) * 100).toFixed(1);
      toast.success(`Compressed! Saved ${savings}% (${formatFileSize(imageInfo.size)} → ${formatFileSize(blob.size)})`);
    } catch {
      toast.error("Failed to compress image.");
    }
    setProcessing(false);
  };

  const handleDownload = () => {
    if (!resultBlob || !imageInfo) return;
    const name = imageInfo.name.replace(/\.[^.]+$/, "") + "_compressed." + (imageInfo.type === "image/png" ? "png" : "jpg");
    downloadBlob(resultBlob, name);
  };

  const handleReset = () => {
    if (imageInfo) URL.revokeObjectURL(imageInfo.url);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setImageInfo(null);
    setResultUrl(null);
    setResultBlob(null);
  };

  const savingsPercent = resultBlob && imageInfo
    ? ((1 - resultBlob.size / imageInfo.size) * 100).toFixed(1)
    : null;

  return (
    <div className="py-8 md:py-12">
      <SEOHead
        title="Free Image Compressor Online - Reduce File Size | ToolPix"
        description="Compress images up to 80% without losing quality. Free online image compressor for PNG, JPG, WebP. No upload - instant browser processing."
        path="/compress"
      />
      <div className="container max-w-4xl">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-8 rounded-full bg-gradient-to-b from-[#6EDCD9] to-[#38BDF8]" />
            <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight">
              Image Compress
            </h1>
          </div>
          <p className="text-muted-foreground ml-5">
            Reduce image file size while maintaining visual quality. Perfect for web optimization.
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

            {/* Size Comparison */}
            {resultBlob && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl border border-border bg-gradient-to-r from-[#6EDCD9]/5 to-[#38BDF8]/5 p-6"
              >
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Original</p>
                    <p className="font-semibold text-lg">{formatFileSize(imageInfo.size)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Savings</p>
                    <p className="font-semibold text-lg text-emerald-600">-{savingsPercent}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Compressed</p>
                    <p className="font-semibold text-lg">{formatFileSize(resultBlob.size)}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Controls */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-display font-semibold text-sm mb-4">Compression Settings</h3>
              
              {/* Quality Slider */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-muted-foreground">Quality</label>
                  <span className="text-sm font-medium">{quality}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none bg-gradient-to-r from-[#6EDCD9] to-[#38BDF8] cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#38BDF8]"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Smaller file</span>
                  <span>Better quality</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleCompress}
                  disabled={processing}
                  className="flex-1 bg-gradient-to-r from-[#6EDCD9] to-[#38BDF8] text-white border-0 hover:opacity-90"
                >
                  {processing ? "Compressing..." : "Compress Image"}
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
            How to Compress Images Online
          </h2>
          <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
            <p>
              Our free image compressor reduces file sizes by up to 80% while maintaining visual quality. 
              Use the quality slider to find the perfect balance between file size and image quality.
            </p>
            <p>
              Image compression is essential for web performance. Smaller images load faster, 
              improve SEO rankings, and provide a better user experience. Our tool works entirely 
              in your browser, so your images remain private and processing is instant.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
