"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface TiltedGridImage {
  src: string;
  alt?: string;
  title?: string;
  badge?: string;
}

export interface TiltedGridHeroProps extends React.HTMLAttributes<HTMLDivElement> {
  images: TiltedGridImage[];
  className?: string;
  children?: React.ReactNode;
  speed?: number; // Speed in seconds for a full loop cycle
  tiltAngle?: number; // Tilt degrees
  pauseOnHover?: boolean;
}

export function TiltedGridHero({
  images,
  className,
  children,
  speed = 40,
  tiltAngle = -10,
  pauseOnHover = true,
  ...props
}: TiltedGridHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Smooth mouse tilt parallax
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseOffset({ x: x * 8, y: y * 8 });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
    setIsHovered(false);
  };

  // Duplicate items for seamless continuous looping marquee
  const loopImagesRow1 = [...images, ...images, ...images];
  const loopImagesRow2 = [...images.slice().reverse(), ...images.slice().reverse(), ...images.slice().reverse()];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative w-full overflow-hidden perspective-[1200px] select-none",
        className
      )}
      {...props}
    >
      {/* 3D Tilted Curved Canvas Container */}
      <div
        className="absolute -inset-x-20 -inset-y-24 pointer-events-none transition-transform duration-700 ease-out flex flex-col justify-center gap-5"
        style={{
          transform: `perspective(1200px) rotateX(${18 + mouseOffset.y}deg) rotateY(${tiltAngle + mouseOffset.x}deg) rotateZ(-4deg) scale(1.08)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Row 1: Flowing Left */}
        <div
          className={cn(
            "flex gap-5 w-max will-change-transform animate-tilted-marquee-left",
            pauseOnHover && isHovered && "animation-play-state-paused"
          )}
          style={{
            animationDuration: `${speed}s`,
          }}
        >
          {loopImagesRow1.map((item, idx) => (
            <div
              key={`row1-${idx}`}
              className="relative w-48 sm:w-60 md:w-72 h-36 sm:h-44 md:h-52 shrink-0 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-900/80 transition-transform duration-300 hover:scale-105 hover:border-emerald-500/50 group"
            >
              <img
                src={item.src}
                alt={item.alt || `Tilted grid showcase image ${idx + 1}`}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              {item.badge && (
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                  {item.badge}
                </span>
              )}
              {item.title && (
                <span className="absolute bottom-3 left-3 right-3 text-xs font-semibold text-white truncate">
                  {item.title}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Row 2: Flowing Right (Offset) */}
        <div
          className={cn(
            "flex gap-5 w-max will-change-transform animate-tilted-marquee-right",
            pauseOnHover && isHovered && "animation-play-state-paused"
          )}
          style={{
            animationDuration: `${speed * 1.15}s`,
          }}
        >
          {loopImagesRow2.map((item, idx) => (
            <div
              key={`row2-${idx}`}
              className="relative w-48 sm:w-60 md:w-72 h-36 sm:h-44 md:h-52 shrink-0 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-900/80 transition-transform duration-300 hover:scale-105 hover:border-teal-500/50 group"
            >
              <img
                src={item.src}
                alt={item.alt || `Tilted grid showcase image ${idx + 1}`}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              {item.badge && (
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 backdrop-blur-md">
                  {item.badge}
                </span>
              )}
              {item.title && (
                <span className="absolute bottom-3 left-3 right-3 text-xs font-semibold text-white truncate">
                  {item.title}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Atmospheric Vignette & Depth Mask Overlays */}
      {/* Horizontal fade */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 sm:w-44 md:w-64 bg-gradient-to-r from-background via-background/80 to-transparent z-1" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 sm:w-44 md:w-64 bg-gradient-to-l from-background via-background/80 to-transparent z-1" />

      {/* Vertical fade */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 sm:h-36 bg-gradient-to-b from-background via-background/60 to-transparent z-1" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 sm:h-36 bg-gradient-to-t from-background via-background/60 to-transparent z-1" />

      {/* Central Ambient Dark Radial Spotlight */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.65)_0%,rgba(0,0,0,0.85)_60%,rgba(0,0,0,0.95)_100%)] z-2" />

      {/* Foreground Content */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
        {children}
      </div>

      <style jsx global>{`
        @keyframes tiltedMarqueeLeft {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        @keyframes tiltedMarqueeRight {
          0% {
            transform: translateX(-33.333%);
          }
          100% {
            transform: translateX(0);
          }
        }
        .animate-tilted-marquee-left {
          animation: tiltedMarqueeLeft linear infinite;
        }
        .animate-tilted-marquee-right {
          animation: tiltedMarqueeRight linear infinite;
        }
        .animation-play-state-paused {
          animation-play-state: paused !important;
        }
      `}</style>
    </div>
  );
}
