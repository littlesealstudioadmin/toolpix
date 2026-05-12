import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Download, Eraser, RotateCcw, ShieldCheck } from "lucide-react";
import FileDropZone from "@/components/FileDropZone";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { downloadBlob, formatFileSize, loadImage, stripImageMetadata, type ImageInfo } from "@/lib/imageUtils";
import { toast } from "sonner";

export default function ExifTool() {
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);

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

  const processImage = async () => {
    if (!imageInfo) return;
    setProcessing(true);
    try {
      const blob = await stripImageMetadata(imageInfo.file);
      const url = URL.createObjectURL(blob);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(url);
      setResultBlob(blob);
      toast.success(`Metadata removed (${formatFileSize(blob.size)})`);
    } catch {
      toast.error("Failed to remove metadata.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !imageInfo) return;
    const ext = imageInfo.type === "image/png" ? "png" : imageInfo.type === "image/webp" ? "webp" : "jpg";
    const baseName = imageInfo.name.replace(/\.[^.]+$/, "");
    downloadBlob(resultBlob, `${baseName}_clean.${ext}`);
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
        title="Remove EXIF Metadata from Images Free | ToolPix"
        description="Strip EXIF metadata and location data from photos locally in your browser. No upload required."
        path="/exif"
      />
      <div className="container max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-8 rounded-full bg-gradient-to-b from-[#BEF264] to-[#10B981]" />
            <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight">Remove EXIF</h1>
          </div>
          <p className="text-muted-foreground ml-5">Strip hidden metadata such as camera details and embedded location data.</p>
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
              <div className="p-6 bg-muted/20 flex justify-center">
                <img src={resultUrl || imageInfo.url} alt="Preview" className="max-h-[340px] max-w-full object-contain rounded-lg shadow-sm" />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-start gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-sm mb-1">Browser-only privacy cleanup</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    ToolPix redraws the image to a fresh canvas and exports a clean file, which removes embedded metadata from common image formats.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={processImage} disabled={processing} className="flex-1 gap-2 bg-gradient-to-r from-[#BEF264] to-[#10B981] text-foreground border-0">
                  <Eraser className="w-4 h-4" /> {processing ? "Processing..." : "Remove Metadata"}
                </Button>
                {resultBlob && (
                  <Button onClick={handleDownload} variant="outline" className="gap-2">
                    <Download className="w-4 h-4" /> Download Clean Image
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
