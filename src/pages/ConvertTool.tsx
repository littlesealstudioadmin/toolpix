/**
 * Convert Tool Page
 * Design: Gradient accent = lavender to indigo (#A78BFA → #6366F1)
 * Features: Format selection (PNG, JPG, WebP), quality control
 */
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Download, RotateCcw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import FileDropZone from "@/components/FileDropZone";
import { loadImage, convertImage, downloadBlob, formatFileSize, getExtension, type ImageInfo, type ImageFormat } from "@/lib/imageUtils";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";
import AdSlot from "@/components/AdSlot";

const formats: { value: ImageFormat; label: string; description: string }[] = [
  { value: "image/png", label: "PNG", description: "Lossless, supports transparency" },
  { value: "image/jpeg", label: "JPG", description: "Smaller size, no transparency" },
  { value: "image/webp", label: "WebP", description: "Modern format, best compression" },
];

export default function ConvertTool() {
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [targetFormat, setTargetFormat] = useState<ImageFormat>("image/png");
  const [quality, setQuality] = useState(92);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    try {
      const info = await loadImage(file);
      setImageInfo(info);
      setResultUrl(null);
      setResultBlob(null);
      // Auto-suggest a different format
      if (info.type === "image/png") setTargetFormat("image/webp");
      else if (info.type === "image/jpeg") setTargetFormat("image/png");
      else setTargetFormat("image/png");
    } catch {
      toast.error("Failed to load image. Please try another file.");
    }
  }, []);

  const handleConvert = async () => {
    if (!imageInfo) return;
    setProcessing(true);
    try {
      const blob = await convertImage(imageInfo.file, targetFormat, quality / 100);
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setResultBlob(blob);
      toast.success(`Converted to ${getExtension(targetFormat).toUpperCase()} (${formatFileSize(blob.size)})`);
    } catch {
      toast.error("Failed to convert image.");
    }
    setProcessing(false);
  };

  const handleDownload = () => {
    if (!resultBlob || !imageInfo) return;
    const ext = getExtension(targetFormat);
    const name = imageInfo.name.replace(/\.[^.]+$/, "") + "." + ext;
    downloadBlob(resultBlob, name);
  };

  const handleReset = () => {
    if (imageInfo) URL.revokeObjectURL(imageInfo.url);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setImageInfo(null);
    setResultUrl(null);
    setResultBlob(null);
  };

  const sourceFormat = imageInfo ? getExtension(imageInfo.type).toUpperCase() : "";

  return (
    <div className="py-8 md:py-12">
      <SEOHead
        title="Free Image Format Converter - PNG to JPG, WebP Online | ToolPix"
        description="Convert images between PNG, JPG, and WebP formats for free. Instant browser-based conversion with no file uploads. Fast, private, and easy."
        path="/convert"
      />
      <div className="container max-w-4xl">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-8 rounded-full bg-gradient-to-b from-[#A78BFA] to-[#6366F1]" />
            <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight">
              Format Convert
            </h1>
          </div>
          <p className="text-muted-foreground ml-5">
            Convert images between PNG, JPG, and WebP formats instantly.
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
                    {formatFileSize(imageInfo.size)}
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

            {/* Conversion Flow */}
            <div className="rounded-xl border border-border bg-gradient-to-r from-[#A78BFA]/5 to-[#6366F1]/5 p-6">
              <div className="flex items-center justify-center gap-4">
                <div className="px-4 py-2 rounded-lg bg-card border border-border text-sm font-medium">
                  {sourceFormat}
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
                <div className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
                  {getExtension(targetFormat).toUpperCase()}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-display font-semibold text-sm mb-4">Output Format</h3>
              
              {/* Format Selection */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {formats.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setTargetFormat(f.value)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      targetFormat === f.value
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <p className="font-semibold text-sm">{f.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{f.description}</p>
                  </button>
                ))}
              </div>

              {/* Quality (for lossy formats) */}
              {targetFormat !== "image/png" && (
                <div className="mb-5">
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
                    className="w-full h-2 rounded-full appearance-none bg-gradient-to-r from-[#A78BFA] to-[#6366F1] cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#6366F1]"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleConvert}
                  disabled={processing}
                  className="flex-1 bg-gradient-to-r from-[#A78BFA] to-[#6366F1] text-white border-0 hover:opacity-90"
                >
                  {processing ? "Converting..." : "Convert Image"}
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
            How to Convert Image Formats Online
          </h2>
          <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
            <p>
              Convert your images between PNG, JPG, and WebP formats with our free online converter. 
              WebP offers superior compression for web use, PNG provides lossless quality with transparency, 
              and JPG is ideal for photographs with smaller file sizes.
            </p>
            <p>
              All conversion happens instantly in your browser. No file uploads, no waiting, 
              no privacy concerns. Simply select your image, choose the target format, and download the result.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
