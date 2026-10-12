"use client";

import { WebGLShader } from "@/components/ui/web-gl-shader";
import { LiquidButton } from "@/components/ui/liquid-glass-button";

export default function DemoOne() {
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden min-h-screen bg-[#021a12]">
      <WebGLShader />
      <div className="relative z-10 border border-[#27272a] p-2 w-full mx-auto max-w-3xl backdrop-blur-md bg-black/40 rounded-2xl shadow-2xl m-4">
        <main className="relative border border-[#27272a] py-10 px-6 overflow-hidden rounded-xl">
          <h1 className="mb-3 text-white text-center text-7xl font-extrabold tracking-tighter md:text-[clamp(2rem,8vw,7rem)]">
            Design is Everything
          </h1>
          <p className="text-white/60 px-6 text-center text-xs md:text-sm lg:text-lg">
            Unleashing creativity through bold visuals, seamless interfaces, and limitless possibilities.
          </p>
          <div className="my-8 flex items-center justify-center gap-2">
            <span className="relative flex h-3 w-3 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </span>
            <p className="text-xs text-green-500 font-medium tracking-wide">Available for New Projects</p>
          </div>

          <div className="flex justify-center">
            <LiquidButton className="text-white border border-emerald-400/50 rounded-full" size={"xl"}>
              Let&apos;s Go
            </LiquidButton>
          </div>
        </main>
      </div>
    </div>
  );
}
