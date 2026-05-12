import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Download, RotateCcw, Type } from "lucide-react";
import FileDropZone from "@/components/FileDropZone";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import {
  addTextWatermark,
  downloadBlob,
  formatFileSize,
  loadImage,
  type ImageInfo,
  type WatermarkPosition,
} from "@/lib/imageUtils";
import { toast } from "sonner";

const positions: Array<{ value: WatermarkPosition; label: string }> = [
  { value: "top-left", label: "Top left" },
  { value: "top-right", label: "Top right" },
  { value: "center", label: "Center" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "bottom-right", label: "Bottom right" },
];

export default function WatermarkTool() {
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [text, setText] = useState("ToolPix");
  const [position, setPosition] = useState<WatermarkPosition>("bottom-right");
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(0.75);
  const [color, setColor] = useState("#ffffff");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);

  const previewWatermarkStyle = useMemo(() => {
    const base = "absolute rounded-lg px-3 py-1 font-semibold shadow-sm";
    const placement: Record<WatermarkPosition, string> = {
      "top-left": "left-4 top-4",
      "top-right": "right-4 top-4",
      center: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
      "bottom-left": "bottom-4 left-4",
      "bottom-right": "bottom-4 right-4",
    };
    return `${base} ${placement[position]}`;
  }, [position]);

  const handleFileSelect = useCallback(async (file: File) => {
    try {
      const info = await loadImage(file);
      setImageInfo(info);
      setResultUrl(null);
      setResultBlob(null);
      setFontSize(Math.max(24, Math.round(Math.min(info.width, info.height) * 0.06)));
    } catch {
      toast.error("Failed to load image. Please try another file.");
    }
  }, []);

  const processImage = async () => {
    if (!imageInfo || !text.trim()) return;
    setProcessing(true);
    try {
      const blob = await addTextWatermark(imageInfo.file, {
        text: text.trim(),
        position,
        fontSize,
        opacity,
        color,
      });
      const url = URL.createObjectURL(blob);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(url);
      setResultBlob(blob);
      toast.success(`Watermark added (${formatFileSize(blob.size)})`);
    } catch {
      toast.error("Failed to add watermark.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !imageInfo) return;
    const ext = imageInfo.name.split(".").pop() || "png";
    const baseName = imageInfo.name.replace(/\.[^.]+$/, "");
    downloadBlob(resultBlob, `${baseName}_watermarked.${ext}`);
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
        title="Add Text Watermark to Images Online Free | ToolPix"
        description="Add a text watermark to photos in your browser. Choose position, color, size, and opacity with no upload required."
        path="/watermark"
      />
      <div className="container max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-8 rounded-full bg-gradient-to-b from-[#F472B6] to-[#A78BFA]" />
            <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight">Add Watermark</h1>
          </div>
          <p className="text-muted-foreground ml-5">Place a text watermark on your image with custom size, color, and opacity.</p>
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
                <div className="relative max-w-full">
                  <img src={resultUrl || imageInfo.url} alt="Preview" className="max-h-[340px] max-w-full object-contain rounded-lg shadow-sm" />
                  {!resultUrl && text.trim() && (
                    <span
                      className={previewWatermarkStyle}
                      style={{ color, opacity, fontSize: 18, backgroundColor: "rgba(0,0,0,0.18)" }}
                    >
                      {text}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-display font-semibold text-sm mb-4">Watermark Settings</h3>
              <div className="grid gap-4 md:grid-cols-2 mb-5">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Text</label>
                  <input value={text} onChange={(event) => setText(event.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Position</label>
                  <select value={position} onChange={(event) => setPosition(event.target.value as WatermarkPosition)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    {positions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Font size: {fontSize}px</label>
                  <input type="range" min="12" max="180" value={fontSize} onChange={(event) => setFontSize(Number(event.target.value))} className="w-full" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Opacity: {Math.round(opacity * 100)}%</label>
                  <input type="range" min="0.1" max="1" step="0.05" value={opacity} onChange={(event) => setOpacity(Number(event.target.value))} className="w-full" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Color</label>
                  <input type="color" value={color} onChange={(event) => setColor(event.target.value)} className="h-10 w-20 rounded-lg border border-input bg-background p-1" />
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={processImage} disabled={processing || !text.trim()} className="flex-1 gap-2 bg-gradient-to-r from-[#F472B6] to-[#A78BFA] text-white border-0">
                  <Type className="w-4 h-4" /> {processing ? "Processing..." : "Apply Watermark"}
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
