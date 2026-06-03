"use client";

import React from "react";
import Link from "next/link";
import { Shield, ArrowRight, Zap, CheckSquare, Sparkles } from "lucide-react";

export default function LandingPageClient() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground relative overflow-hidden justify-center items-center p-6">
      {/* Background aesthetic blobs */}
      <div className="absolute w-125 h-125 rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.12)_0%,transparent_70%)] -top-37.5 -left-37.5 blur-[60px]" />
      <div className="absolute w-125 h-125 rounded-full bg-[radial-gradient(circle,hsl(var(--accent)/0.12)_0%,transparent_70%)] -bottom-37.5 -right-37.5 blur-[60px]" />

      <div className="glass-panel max-w-200 w-full p-15 text-center shadow-[var(--shadow-lg),0_20px_80px_rgba(0,0,0,0.1)] animate-[fadeIn_0.6s_ease_forwards]">
        <div className="gradient-bg w-14 h-14 rounded-[14px] flex items-center justify-center mx-auto mb-6 text-white shadow-[0_8px_30px_hsl(var(--primary)/0.25)]">
          <Shield size={28} />
        </div>

        <h1 className="gradient-text text-[3.5rem] font-extrabold tracking-[-1.5px] leading-[1.1] mb-4">
          CollabSphere
        </h1>

        <p className="text-lg text-secondary max-w-150 mx-auto mb-10 leading-relaxed">
          Empower your team with a high-performance workspace. Experience glassmorphic dashboards,
          custom workload balance analytics, granular roles, and instant task validations.
        </p>

        {/* CTA Button */}
        <div className="flex justify-center mb-12">
          <Link
            href="/login"
            className="gradient-bg px-9 py-4 rounded-xl font-bold text-[1.05rem] flex items-center gap-2.5 text-white shadow-[0_10px_30px_hsl(var(--primary)/0.3)] hover:-translate-y-0.5 hover:shadow-[0_12px_40px_hsl(var(--primary)/0.4)] active:translate-y-0 transition-all duration-200"
          >
            <span>Enter Secure Workspace</span>
            <ArrowRight size={20} />
          </Link>
        </div>

        {/* Feature Icons */}
        <div
          className="border-t border-border/60 pt-10"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px" }}
        >
          <div className="flex flex-col items-center gap-2">
            <Zap size={22} className="text-primary" />
            <h4 className="font-bold text-[0.95rem] text-foreground">Role-Based Access</h4>
            <p className="text-[0.8rem] text-secondary">Secure portals for Admin, PM, and Team Members.</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <CheckSquare size={22} className="text-primary" />
            <h4 className="font-bold text-[0.95rem] text-foreground">Task Automation</h4>
            <p className="text-[0.8rem] text-secondary">Automated collision checks and deadline rules.</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Sparkles size={22} className="text-primary" />
            <h4 className="font-bold text-[0.95rem] text-foreground">Workload Charts</h4>
            <p className="text-[0.8rem] text-secondary">Dynamic workload charts and timeline activity streaming.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
