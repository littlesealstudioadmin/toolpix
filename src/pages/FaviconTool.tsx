import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Download, Images, RotateCcw } from "lucide-react";
import FileDropZone from "@/components/FileDropZone";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import {
  createPngIco,
  downloadBlob,
  formatFileSize,
  loadImage,
  renderSquareIcon,
  type ImageInfo,
} from "@/lib/imageUtils";
import { toast } from "sonner";

const iconSizes = [16, 32, 48, 64, 128, 180, 192, 512];

interface IconResult {
  size: number;
  blob: Blob;
  url: string;
}

export default function FaviconTool() {
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [icons, setIcons] = useState<IconResult[]>([]);
  const [icoBlob, setIcoBlob] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleFileSelect = useCallback(async (file: File) => {
    try {
      const info = await loadImage(file);
      setImageInfo(info);
      icons.forEach((icon) => URL.revokeObjectURL(icon.url));
      setIcons([]);
      setIcoBlob(null);
    } catch {
      toast.error("Failed to load image. Please try another file.");
    }
  }, [icons]);

  const generateIcons = async () => {
    if (!imageInfo) return;
    setProcessing(true);
    try {
      icons.forEach((icon) => URL.revokeObjectURL(icon.url));
      const nextIcons = await Promise.all(
        iconSizes.map(async (size) => {
          const blob = await renderSquareIcon(imageInfo.file, size);
          return { size, blob, url: URL.createObjectURL(blob) };
        })
      );
      const nextIco = await createPngIco(imageInfo.file);
      setIcons(nextIcons);
      setIcoBlob(nextIco);
      toast.success(`Generated ${nextIcons.length} icon sizes`);
    } catch {
      toast.error("Failed to generate icons.");
    } finally {
      setProcessing(false);
    }
  };

  const downloadIcon = (icon: IconResult) => {
    downloadBlob(icon.blob, `icon-${icon.size}x${icon.size}.png`);
  };

  const downloadIco = () => {
    if (!icoBlob) return;
    downloadBlob(icoBlob, "favicon.ico");
  };

  const handleReset = () => {
    if (imageInfo) URL.revokeObjectURL(imageInfo.url);
    icons.forEach((icon) => URL.revokeObjectURL(icon.url));
    setImageInfo(null);
    setIcons([]);
    setIcoBlob(null);
  };

  return (
    <div className="py-8 md:py-12">
      <SEOHead
        title="Favicon and App Icon Generator Free | ToolPix"
        description="Generate favicon.ico and common PNG app icon sizes from one image locally in your browser."
        path="/favicon"
      />
      <div className="container max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-8 rounded-full bg-gradient-to-b from-[#FF6B6B] to-[#F472B6]" />
            <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight">Favicon Generator</h1>
          </div>
          <p className="text-muted-foreground ml-5">Create favicon.ico and web app icon PNGs from a single source image.</p>
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
                <img src={imageInfo.url} alt="Preview" className="max-h-[280px] max-w-full object-contain rounded-lg shadow-sm" />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex gap-3">
                <Button onClick={generateIcons} disabled={processing} className="flex-1 gap-2 bg-gradient-to-r from-[#FF6B6B] to-[#F472B6] text-white border-0">
                  <Images className="w-4 h-4" /> {processing ? "Generating..." : "Generate Icons"}
                </Button>
                {icoBlob && (
                  <Button onClick={downloadIco} variant="outline" className="gap-2">
                    <Download className="w-4 h-4" /> favicon.ico
                  </Button>
                )}
              </div>
            </div>

            {icons.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {icons.map((icon) => (
                  <button
                    key={icon.size}
                    onClick={() => downloadIcon(icon)}
                    className="rounded-xl border border-border bg-card p-4 text-left hover:bg-muted/40 transition-colors active:scale-[0.98]"
                  >
                    <div className="h-20 flex items-center justify-center mb-3">
                      <img src={icon.url} alt={`${icon.size} icon`} className="max-h-16 max-w-16 rounded-md" />
                    </div>
                    <div className="text-sm font-medium">{icon.size}x{icon.size}</div>
                    <div className="text-xs text-muted-foreground">{formatFileSize(icon.blob.size)}</div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
