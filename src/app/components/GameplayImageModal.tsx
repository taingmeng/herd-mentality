"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";

interface Props {
  src: string;
  alt: string;
}

export default function GameplayImageModal({ src, alt }: Props) {
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const offsetAtDragStart = useRef({ x: 0, y: 0 });

  const openModal = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setOpen(true);
  };

  const closeModal = () => setOpen(false);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setScale((s) => Math.min(5, Math.max(1, s - e.deltaY * 0.001)));
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    offsetAtDragStart.current = offset;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setOffset({
      x: offsetAtDragStart.current.x + e.clientX - dragStart.current.x,
      y: offsetAtDragStart.current.y + e.clientY - dragStart.current.y,
    });
  };

  const onMouseUp = () => { isDragging.current = false; };

  const onBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) closeModal();
  };

  return (
    <>
      <Image
        src={src}
        alt={alt}
        width={800}
        height={500}
        className="rounded-2xl w-full max-w-2xl border-[3px] border-white/20 cursor-zoom-in"
        onClick={openModal}
      />

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={onBackdropClick}
        >
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>

          <div
            className="relative overflow-hidden w-full h-full flex items-center justify-center"
            onWheel={onWheel}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            style={{ cursor: scale > 1 ? "grab" : "zoom-in" }}
          >
            <Image
              src={src}
              alt={alt}
              width={1600}
              height={1000}
              className="max-w-[90vw] max-h-[90vh] rounded-xl object-contain select-none"
              style={{
                transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)`,
                transition: isDragging.current ? "none" : "transform 0.1s ease",
              }}
              draggable={false}
            />
          </div>
        </div>
      )}
    </>
  );
}
