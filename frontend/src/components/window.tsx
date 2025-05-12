"use client";

import { useState, useEffect, useRef, ReactNode } from "react";

interface WindowProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  initialPosition?: { x: number; y: number };
  width?: number | string;
  height?: number | string;
  className?: string;
}

export default function Window({
  title,
  isOpen,
  onClose,
  children,
  initialPosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 },
  width = 600,
  height = "auto",
  className = ""
}: WindowProps) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      const windowElement = windowRef.current;
      if (windowElement) {
        windowElement.style.transform = "scale(0.9) translate(-50%, -50%)";
        windowElement.style.opacity = "0";

        setTimeout(() => {
          windowElement.style.transform = "scale(1) translate(-50%, -50%)";
          windowElement.style.opacity = "1";
        }, 10);
      }
    } else {
      const windowElement = windowRef.current;
      if (windowElement) {
        windowElement.style.transform = "scale(0.9) translate(-50%, -50%)";
        windowElement.style.opacity = "0";

        setTimeout(() => {
          setIsVisible(false);
        }, 200);
      }
    }
  }, [isOpen]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof Element && e.target.closest('.window-content')) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  if (!isVisible) return null;

  return (
    <div
      ref={windowRef}
      className={`fixed z-50 bg-white rounded-lg shadow-2xl overflow-hidden ${className}`}
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        transition: 'transform 0.2s, opacity 0.2s'
      }}
    >
      {/* Window title bar */}
      <div
        className="bg-blue-600 text-white px-4 py-2 flex justify-between items-center cursor-move"
        onMouseDown={handleMouseDown}
      >
        <h2 className="font-semibold">{title}</h2>
        <button
          onClick={onClose}
          className="rounded-full w-6 h-6 flex items-center justify-center bg-red-500 hover:bg-red-600 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Window content */}
      <div className="window-content p-6 max-h-[70vh] overflow-auto styled-scrollbar">
        {children}
      </div>
    </div>
  );
}