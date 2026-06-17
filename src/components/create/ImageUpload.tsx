"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Upload, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPT = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const upload = useCallback(
    async (file: File) => {
      if (!ACCEPT.includes(file.type)) {
        toast.error("Only JPG, PNG, WebP and GIF images are supported");
        return;
      }
      if (file.size > MAX_SIZE) {
        toast.error("Image must be under 5MB");
        return;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Upload failed");
        }
        const { url } = await res.json();
        onChange(url);
        toast.success("Chart uploaded");
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) upload(file);
    },
    [upload]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) upload(file);
      e.target.value = "";
    },
    [upload]
  );

  if (value) {
    return (
      <div className="relative rounded-xl overflow-hidden border border-zinc-800 group">
        <div className="aspect-video relative bg-zinc-950">
          <Image src={value} alt="Chart preview" fill className="object-contain" />
        </div>
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute top-2 right-2 w-7 h-7 bg-black/70 hover:bg-black/90 text-white rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <label
      className={cn(
        "flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all",
        dragOver
          ? "border-indigo-500/60 bg-indigo-500/5"
          : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/30",
        uploading && "opacity-60 pointer-events-none"
      )}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={ACCEPT.join(",")}
        onChange={handleChange}
        className="sr-only"
        disabled={uploading}
      />
      {uploading ? (
        <>
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-500">Uploading...</p>
        </>
      ) : (
        <>
          <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center">
            {dragOver ? (
              <Upload className="w-5 h-5 text-indigo-400" />
            ) : (
              <ImageIcon className="w-5 h-5 text-zinc-500" />
            )}
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-zinc-400">
              {dragOver ? "Drop to upload" : "Drop chart here or click to browse"}
            </p>
            <p className="text-xs text-zinc-600 mt-1">PNG, JPG, WebP up to 5MB</p>
          </div>
        </>
      )}
    </label>
  );
}
