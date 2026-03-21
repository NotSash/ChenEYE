"use client";

import React, { useState, useCallback } from "react";
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";

interface LightboxProps {
  images: { url: string; name?: string }[];
  initialIndex?: number;
  onClose: () => void;
}

export function Lightbox({ images, initialIndex = 0, onClose }: LightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);

  const prev = () => { setIndex((i) => (i > 0 ? i - 1 : images.length - 1)); setScale(1); };
  const next = () => { setIndex((i) => (i < images.length - 1 ? i + 1 : 0)); setScale(1); };

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  }, [index]);

  const toggleZoom = () => setScale((s) => s === 1 ? 2 : 1);

  return (
    <div
      className="fixed inset-0 z-[90] bg-black/95 flex flex-col lightbox-enter"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      autoFocus
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 text-white/80">
        <span className="text-sm font-medium">{index + 1} / {images.length}</span>
        <div className="flex items-center gap-2">
          <button onClick={toggleZoom} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors">
            {scale > 1 ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
          </button>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Image */}
      <div className="flex-1 flex items-center justify-center px-4 overflow-hidden" onClick={onClose}>
        <img
          src={images[index].url}
          alt={images[index].name || "Evidence"}
          className="max-w-full max-h-full object-contain rounded-lg transition-transform duration-300 select-none"
          style={{ transform: `scale(${scale})`, cursor: scale > 1 ? "zoom-out" : "zoom-in" }}
          onClick={(e) => { e.stopPropagation(); toggleZoom(); }}
          draggable={false}
        />
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Caption */}
      <div className="px-4 py-3 text-center">
        <p className="text-xs text-white/50">{images[index].name || `Evidence ${index + 1}`}</p>
      </div>

      <style jsx global>{`
        @keyframes lightboxEnter {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .lightbox-enter { animation: lightboxEnter 0.2s ease; }
      `}</style>
    </div>
  );
}
