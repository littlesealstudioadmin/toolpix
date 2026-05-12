import { useCallback, useState } from "react";
import { Upload, ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

interface FileDropZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in MB
}

export default function FileDropZone({
  onFileSelect,
  accept = "image/*",
  maxSize = 50,
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.size > maxSize * 1024 * 1024) {
          alert(`File size must be less than ${maxSize}MB`);
          return;
        }
        onFileSelect(file);
      }
    },
    [onFileSelect, maxSize]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.size > maxSize * 1024 * 1024) {
          alert(`File size must be less than ${maxSize}MB`);
          return;
        }
        onFileSelect(file);
      }
    },
    [onFileSelect, maxSize]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <label
        className={`drop-zone cursor-pointer min-h-[240px] ${isDragging ? "active" : ""}`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-4 text-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
            isDragging ? "bg-primary/10" : "bg-muted"
          }`}>
            {isDragging ? (
              <Upload className="w-7 h-7 text-primary" />
            ) : (
              <ImageIcon className="w-7 h-7 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="text-base font-medium text-foreground mb-1">
              {isDragging ? "Drop your image here" : "Drag & drop your image"}
            </p>
            <p className="text-sm text-muted-foreground">
              or <span className="text-primary font-medium">browse files</span>
            </p>
          </div>
          <p className="text-xs text-muted-foreground/70">
            Supports PNG, JPG, WebP, GIF up to {maxSize}MB
          </p>
        </div>
      </label>
    </motion.div>
  );
}
