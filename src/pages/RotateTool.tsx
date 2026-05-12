import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Download, FlipHorizontal, FlipVertical, RotateCcw, RotateCw } from "lucide-react";
import FileDropZone from "@/components/FileDropZone";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import {
  downloadBlob,
  formatFileSize,
  loadImage,
  transformImage,
  type ImageInfo,
  type RotateAngle,
} from "@/lib/imageUtils";
import { toast } from "sonner";

export default function RotateTool() {
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [angle, setAngle] = useState<RotateAngle>(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);

  const previewStyle = useMemo(
    () => ({
      transform: `rotate(${angle}deg) scaleX(${flipHorizontal ? -1 : 1}) scaleY(${flipVertical ? -1 : 1})`,
    }),
    [angle, flipHorizontal, flipVertical]
  );

  const handleFileSelect = useCallback(async (file: File) => {
    try {
      const info = await loadImage(file);
      setImageInfo(info);
      setAngle(0);
      setFlipHorizontal(false);
      setFlipVertical(false);
      setResultUrl(null);
      setResultBlob(null);
    } catch {
      toast.error("Failed to load image. Please try another file.");
    }
  }, []);

  const processImage = async () => {
    if (!imageInfo) return;
    setProcessing(true);
    try {
      const blob = await transformImage(imageInfo.file, angle, flipHorizontal, flipVertical);
      const url = URL.createObjectURL(blob);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(url);
      setResultBlob(blob);
      toast.success(`Image transformed (${formatFileSize(blob.size)})`);
    } catch {
      toast.error("Failed to transform image.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !imageInfo) return;
    const ext = imageInfo.name.split(".").pop() || "png";
    const baseName = imageInfo.name.replace(/\.[^.]+$/, "");
    downloadBlob(resultBlob, `${baseName}_rotated.${ext}`);
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
        title="Rotate and Flip Images Online Free | ToolPix"
        description="Rotate photos by 90, 180, or 270 degrees and flip images horizontally or vertically in your browser."
        path="/rotate"
      />
      <div className="container max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-8 rounded-full bg-gradient-to-b from-[#38BDF8] to-[#6366F1]" />
            <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight">Rotate & Flip</h1>
          </div>
          <p className="text-muted-foreground ml-5">Rotate images and mirror them horizontally or vertically.</p>
        </motion.div>

        {!imageInfo ? (
          <FileDropZone onFileSelect={handleFileSelect} />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-sm font-medium truncate block">{imageInfo.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {imageInfo.width}x{imageInfo.height} &middot; {formatFileSize(imageInfo.size)}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <RotateCcw className="w-4 h-4 mr-1" /> New Image
                </Button>
              </div>
              <div className="p-6 bg-muted/20 flex justify-center overflow-hidden">
                <img
                  src={resultUrl || imageInfo.url}
                  alt="Preview"
                  style={resultUrl ? undefined : previewStyle}
                  className="max-h-[340px] max-w-full object-contain rounded-lg shadow-sm transition-transform"
                />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-display font-semibold text-sm mb-4">Transform Settings</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
                {[0, 90, 180, 270].map((value) => (
                  <button
                    key={value}
                    onClick={() => setAngle(value as RotateAngle)}
                    className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                      angle === value ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"
                    }`}
                  >
                    {value}°
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mb-5">
                <Button variant={flipHorizontal ? "default" : "outline"} onClick={() => setFlipHorizontal((value) => !value)} className="gap-2">
                  <FlipHorizontal className="w-4 h-4" /> Flip horizontal
                </Button>
                <Button variant={flipVertical ? "default" : "outline"} onClick={() => setFlipVertical((value) => !value)} className="gap-2">
                  <FlipVertical className="w-4 h-4" /> Flip vertical
                </Button>
              </div>
              <div className="flex gap-3">
                <Button onClick={processImage} disabled={processing} className="flex-1 gap-2 bg-gradient-to-r from-[#38BDF8] to-[#6366F1] text-white border-0">
                  <RotateCw className="w-4 h-4" /> {processing ? "Processing..." : "Apply Transform"}
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
      </div>
    </div>
  );
}
