/**
 * Crop Tool Page
 * Design: Gradient accent = lime to emerald (#BEF264 → #10B981)
 * Features: Visual crop area selection, preset aspect ratios
 */
import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import FileDropZone from "@/components/FileDropZone";
import { loadImage, cropImage, downloadBlob, formatFileSize, type ImageInfo } from "@/lib/imageUtils";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";
import AdSlot from "@/components/AdSlot";

const aspectPresets = [
  { label: "Free", ratio: 0 },
  { label: "1:1", ratio: 1 },
  { label: "4:3", ratio: 4 / 3 },
  { label: "3:4", ratio: 3 / 4 },
  { label: "16:9", ratio: 16 / 9 },
  { label: "9:16", ratio: 9 / 16 },
];

export default function CropTool() {
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [aspectRatio, setAspectRatio] = useState(0);

  // Crop area state (in image coordinates)
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropW, setCropW] = useState(0);
  const [cropH, setCropH] = useState(0);

  // Canvas ref for visual crop
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [displayScale, setDisplayScale] = useState(1);

  const handleFileSelect = useCallback(async (file: File) => {
    try {
      const info = await loadImage(file);
      setImageInfo(info);
      setCropX(0);
      setCropY(0);
      setCropW(info.width);
      setCropH(info.height);
      setResultUrl(null);
      setResultBlob(null);
    } catch {
      toast.error("Failed to load image. Please try another file.");
    }
  }, []);

  // Draw crop overlay
  useEffect(() => {
    if (!imageInfo || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const maxW = container.clientWidth - 32;
    const maxH = 400;

    const scale = Math.min(maxW / imageInfo.width, maxH / imageInfo.height, 1);
    setDisplayScale(scale);

    canvas.width = imageInfo.width * scale;
    canvas.height = imageInfo.height * scale;

    const ctx = canvas.getContext("2d")!;
    const img = new window.Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Dark overlay
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Clear crop area
      const sx = cropX * scale;
      const sy = cropY * scale;
      const sw = cropW * scale;
      const sh = cropH * scale;

      ctx.clearRect(sx, sy, sw, sh);
      ctx.drawImage(
        img,
        cropX, cropY, cropW, cropH,
        sx, sy, sw, sh
      );

      // Crop border
      ctx.strokeStyle = "#10B981";
      ctx.lineWidth = 2;
      ctx.strokeRect(sx, sy, sw, sh);

      // Corner handles
      const handleSize = 8;
      ctx.fillStyle = "#10B981";
      const corners = [
        [sx, sy], [sx + sw, sy],
        [sx, sy + sh], [sx + sw, sy + sh],
      ];
      corners.forEach(([cx, cy]) => {
        ctx.fillRect(cx - handleSize / 2, cy - handleSize / 2, handleSize, handleSize);
      });
    };
    img.src = imageInfo.url;
  }, [imageInfo, cropX, cropY, cropW, cropH]);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = (e.clientX - rect.left) / displayScale;
    const y = (e.clientY - rect.top) / displayScale;
    setIsDragging(true);
    setDragStart({ x, y });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !imageInfo) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = Math.max(0, Math.min((e.clientX - rect.left) / displayScale, imageInfo.width));
    const y = Math.max(0, Math.min((e.clientY - rect.top) / displayScale, imageInfo.height));

    const newX = Math.min(dragStart.x, x);
    const newY = Math.min(dragStart.y, y);
    let newW = Math.abs(x - dragStart.x);
    let newH = Math.abs(y - dragStart.y);

    if (aspectRatio > 0) {
      newH = newW / aspectRatio;
      if (newY + newH > imageInfo.height) {
        newH = imageInfo.height - newY;
        newW = newH * aspectRatio;
      }
    }

    setCropX(Math.round(newX));
    setCropY(Math.round(newY));
    setCropW(Math.round(newW));
    setCropH(Math.round(newH));
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const handleCrop = async () => {
    if (!imageInfo || cropW <= 0 || cropH <= 0) return;
    setProcessing(true);
    try {
      const blob = await cropImage(imageInfo.file, cropX, cropY, cropW, cropH);
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setResultBlob(blob);
      toast.success(`Cropped to ${cropW}x${cropH} (${formatFileSize(blob.size)})`);
    } catch {
      toast.error("Failed to crop image.");
    }
    setProcessing(false);
  };

  const handleDownload = () => {
    if (!resultBlob || !imageInfo) return;
    const ext = imageInfo.name.split(".").pop() || "png";
    const name = imageInfo.name.replace(/\.[^.]+$/, "") + `_cropped.${ext}`;
    downloadBlob(resultBlob, name);
  };

  const handleReset = () => {
    if (imageInfo) URL.revokeObjectURL(imageInfo.url);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setImageInfo(null);
    setResultUrl(null);
    setResultBlob(null);
  };

  const handleAspectChange = (ratio: number) => {
    setAspectRatio(ratio);
    if (imageInfo && ratio > 0) {
      const newW = Math.min(imageInfo.width, imageInfo.height * ratio);
      const newH = newW / ratio;
      setCropX(Math.round((imageInfo.width - newW) / 2));
      setCropY(Math.round((imageInfo.height - newH) / 2));
      setCropW(Math.round(newW));
      setCropH(Math.round(newH));
    } else if (imageInfo) {
      setCropX(0);
      setCropY(0);
      setCropW(imageInfo.width);
      setCropH(imageInfo.height);
    }
  };

  return (
    <div className="py-8 md:py-12">
      <SEOHead
        title="Free Image Cropper Online - Crop Photos Instantly | ToolPix"
        description="Crop images with precision for free. Custom aspect ratios, preset sizes for social media. No upload needed - instant browser processing."
        path="/crop"
      />
      <div className="container max-w-4xl">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-8 rounded-full bg-gradient-to-b from-[#BEF264] to-[#10B981]" />
            <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight">
              Image Crop
            </h1>
          </div>
          <p className="text-muted-foreground ml-5">
            Crop images with precision. Draw a selection area or use preset aspect ratios.
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
            {/* Crop Canvas */}
            {!resultUrl && (
              <div ref={containerRef} className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium truncate max-w-[200px]">{imageInfo.name}</span>
                    <span className="text-xs text-muted-foreground">
                      Selection: {cropW}x{cropH}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleReset}>
                    <RotateCcw className="w-4 h-4 mr-1" /> New Image
                  </Button>
                </div>
                <div className="p-4 bg-muted/20 flex justify-center">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseUp}
                    className="cursor-crosshair rounded-lg max-w-full"
                  />
                </div>
              </div>
            )}

            {/* Result Preview */}
            {resultUrl && (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <span className="text-sm font-medium">Cropped Result</span>
                  <Button variant="ghost" size="sm" onClick={handleReset}>
                    <RotateCcw className="w-4 h-4 mr-1" /> New Image
                  </Button>
                </div>
                <div className="p-6 bg-muted/20 flex justify-center">
                  <img
                    src={resultUrl}
                    alt="Cropped"
                    className="max-h-[300px] max-w-full object-contain rounded-lg shadow-sm"
                  />
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-display font-semibold text-sm mb-4">Aspect Ratio</h3>
              
              <div className="flex flex-wrap gap-2 mb-5">
                {aspectPresets.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => handleAspectChange(p.ratio)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                      aspectRatio === p.ratio
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-border hover:border-emerald-300"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Manual Input */}
              <div className="grid grid-cols-4 gap-3 mb-5">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">X</label>
                  <input
                    type="number"
                    value={cropX}
                    onChange={(e) => setCropX(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg border border-input bg-background text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Y</label>
                  <input
                    type="number"
                    value={cropY}
                    onChange={(e) => setCropY(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg border border-input bg-background text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Width</label>
                  <input
                    type="number"
                    value={cropW}
                    onChange={(e) => setCropW(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg border border-input bg-background text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Height</label>
                  <input
                    type="number"
                    value={cropH}
                    onChange={(e) => setCropH(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg border border-input bg-background text-xs"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleCrop}
                  disabled={processing || cropW <= 0 || cropH <= 0}
                  className="flex-1 bg-gradient-to-r from-[#BEF264] to-[#10B981] text-white border-0 hover:opacity-90"
                >
                  {processing ? "Cropping..." : "Crop Image"}
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
            How to Crop Images Online
          </h2>
          <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
            <p>
              Our free image cropper lets you select and extract any portion of your image with pixel-perfect precision. 
              Use preset aspect ratios for social media or enter custom coordinates for exact control.
            </p>
            <p>
              Simply upload your image, draw a selection area by clicking and dragging, 
              then download the cropped result. All processing happens in your browser — fast, free, and private.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
