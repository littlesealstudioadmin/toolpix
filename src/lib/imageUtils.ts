/**
 * Client-side image processing utilities using Canvas API.
 * All processing happens in the browser - no server upload needed.
 */

export interface ImageInfo {
  file: File;
  width: number;
  height: number;
  size: number;
  type: string;
  name: string;
  url: string;
}

export async function loadImage(file: File): Promise<ImageInfo> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      resolve({
        file,
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: file.size,
        type: file.type,
        name: file.name,
        url,
      });
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

// Resize image
export async function resizeImage(
  file: File,
  targetWidth: number,
  targetHeight: number,
  maintainAspect: boolean = true
): Promise<Blob> {
  const img = await createImageElement(file);
  let w = targetWidth;
  let h = targetHeight;

  if (maintainAspect) {
    const ratio = img.naturalWidth / img.naturalHeight;
    if (w / h > ratio) {
      w = Math.round(h * ratio);
    } else {
      h = Math.round(w / ratio);
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to resize image"));
        return;
      }
      resolve(blob);
    }, file.type || "image/png", 0.92);
  });
}

// Compress image
export async function compressImage(
  file: File,
  quality: number // 0 to 1
): Promise<Blob> {
  const img = await createImageElement(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);

  const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to compress image"));
        return;
      }
      resolve(blob);
    }, outputType, quality);
  });
}

// Convert image format
export type ImageFormat = "image/png" | "image/jpeg" | "image/webp";
export type RotateAngle = 0 | 90 | 180 | 270;
export type WatermarkPosition =
  | "top-left"
  | "top-right"
  | "center"
  | "bottom-left"
  | "bottom-right";

export async function convertImage(
  file: File,
  targetFormat: ImageFormat,
  quality: number = 0.92
): Promise<Blob> {
  const img = await createImageElement(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;

  // For JPEG, fill white background (no transparency)
  if (targetFormat === "image/jpeg") {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to convert image"));
        return;
      }
      resolve(blob);
    }, targetFormat, quality);
  });
}

// Crop image
export async function cropImage(
  file: File,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<Blob> {
  const img = await createImageElement(file);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, x, y, width, height, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to crop image"));
        return;
      }
      resolve(blob);
    }, file.type || "image/png", 0.92);
  });
}

export async function transformImage(
  file: File,
  angle: RotateAngle,
  flipHorizontal: boolean,
  flipVertical: boolean
): Promise<Blob> {
  const img = await createImageElement(file);
  const swapsDimensions = angle === 90 || angle === 270;
  const canvas = document.createElement("canvas");
  canvas.width = swapsDimensions ? img.naturalHeight : img.naturalWidth;
  canvas.height = swapsDimensions ? img.naturalWidth : img.naturalHeight;

  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

  return canvasToBlob(canvas, file.type || "image/png", 0.92, "Failed to transform image");
}

export interface WatermarkOptions {
  text: string;
  position: WatermarkPosition;
  fontSize: number;
  opacity: number;
  color: string;
}

export async function addTextWatermark(
  file: File,
  options: WatermarkOptions
): Promise<Blob> {
  const img = await createImageElement(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);

  const margin = Math.max(24, Math.round(Math.min(canvas.width, canvas.height) * 0.04));
  ctx.font = `600 ${options.fontSize}px "Plus Jakarta Sans", system-ui, sans-serif`;
  ctx.fillStyle = options.color;
  ctx.globalAlpha = options.opacity;
  ctx.textBaseline = "middle";

  const metrics = ctx.measureText(options.text);
  const textHeight = options.fontSize;
  const xByPosition: Record<WatermarkPosition, number> = {
    "top-left": margin,
    "top-right": canvas.width - margin - metrics.width,
    center: (canvas.width - metrics.width) / 2,
    "bottom-left": margin,
    "bottom-right": canvas.width - margin - metrics.width,
  };
  const yByPosition: Record<WatermarkPosition, number> = {
    "top-left": margin + textHeight / 2,
    "top-right": margin + textHeight / 2,
    center: canvas.height / 2,
    "bottom-left": canvas.height - margin - textHeight / 2,
    "bottom-right": canvas.height - margin - textHeight / 2,
  };

  ctx.fillText(options.text, xByPosition[options.position], yByPosition[options.position]);
  ctx.globalAlpha = 1;

  return canvasToBlob(canvas, file.type || "image/png", 0.92, "Failed to add watermark");
}

export async function stripImageMetadata(file: File): Promise<Blob> {
  const img = await createImageElement(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;

  if (file.type === "image/jpeg") {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0);
  const outputType = file.type === "image/webp" ? "image/webp" : file.type === "image/png" ? "image/png" : "image/jpeg";
  return canvasToBlob(canvas, outputType, 0.95, "Failed to remove metadata");
}

export async function renderSquareIcon(file: File, size: number): Promise<Blob> {
  const img = await createImageElement(file);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const sourceSize = Math.min(img.naturalWidth, img.naturalHeight);
  const sx = (img.naturalWidth - sourceSize) / 2;
  const sy = (img.naturalHeight - sourceSize) / 2;
  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(img, sx, sy, sourceSize, sourceSize, 0, 0, size, size);

  return canvasToBlob(canvas, "image/png", 0.92, "Failed to create icon");
}

export async function createPngIco(file: File, sizes: number[] = [16, 32, 48]): Promise<Blob> {
  const pngs = await Promise.all(sizes.map(async (size) => ({
    size,
    bytes: new Uint8Array(await (await renderSquareIcon(file, size)).arrayBuffer()),
  })));

  const headerSize = 6;
  const directorySize = 16 * pngs.length;
  const totalSize = headerSize + directorySize + pngs.reduce((sum, item) => sum + item.bytes.length, 0);
  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, pngs.length, true);

  let imageOffset = headerSize + directorySize;
  pngs.forEach((item, index) => {
    const entryOffset = headerSize + index * 16;
    view.setUint8(entryOffset, item.size >= 256 ? 0 : item.size);
    view.setUint8(entryOffset + 1, item.size >= 256 ? 0 : item.size);
    view.setUint8(entryOffset + 2, 0);
    view.setUint8(entryOffset + 3, 0);
    view.setUint16(entryOffset + 4, 1, true);
    view.setUint16(entryOffset + 6, 32, true);
    view.setUint32(entryOffset + 8, item.bytes.length, true);
    view.setUint32(entryOffset + 12, imageOffset, true);
    bytes.set(item.bytes, imageOffset);
    imageOffset += item.bytes.length;
  });

  return new Blob([buffer], { type: "image/x-icon" });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
  errorMessage: string
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error(errorMessage));
        return;
      }
      resolve(blob);
    }, type, quality);
  });
}

// Helper: create image element from file
function createImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

// Download blob as file
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Get file extension from mime type
export function getExtension(mimeType: string): string {
  const map: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/bmp": "bmp",
  };
  return map[mimeType] || "png";
}
