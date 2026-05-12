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
