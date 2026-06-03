"use client";

import { useRouter } from "next/navigation";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
      {/* Giant 404 text behind icon */}
      <div className="relative mb-10">
        <h1 className="text-[12rem] font-black leading-none m-0 opacity-5 select-none text-foreground">
          404
        </h1>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full">
          <div className="w-30 h-30 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6">
            <Search size={60} />
          </div>
          <h2 className="text-3xl font-extrabold text-foreground">Page Not Found</h2>
        </div>
      </div>

      <p className="text-secondary max-w-115 text-lg leading-relaxed mb-8">
        Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Let&apos;s get you back on track.
      </p>

      <div className="flex gap-4 flex-wrap justify-center">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary-bg border border-border text-foreground font-semibold cursor-pointer hover:bg-[hsl(var(--bg-tertiary))] transition-colors duration-200"
        >
          <ArrowLeft size={20} />
          Go Back
        </button>

        <button
          onClick={() => router.push("/dashboard")}
          className="gradient-bg flex items-center gap-2 px-6 py-3 rounded-xl border-none text-white font-semibold cursor-pointer shadow-[0_10px_15px_-3px_hsl(var(--primary)/0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-transform duration-200"
        >
          <Home size={20} />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
