"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Mail,
  Lock,
  LogIn,
  UserCheck,
  Eye,
  EyeOff,
} from "lucide-react";

export default function LoginPageClient() {
  const { login, demoLogin, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 480);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLocalLoading(true);
    const success = await login(email, password);
    setLocalLoading(false);
    if (success) {
      router.push("/dashboard");
    }
  };

  const handleDemoClick = async (
    role: "ADMIN" | "PROJECT_MANAGER" | "TEAM_MEMBER",
  ) => {
    setLocalLoading(true);
    const success = await demoLogin(role);
    setLocalLoading(false);
    if (success) {
      router.push("/dashboard");
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center relative overflow-hidden bg-background p-6'>
      {/* Background visual art blobs for premium aesthetic */}
      <div className='absolute w-100 h-100 rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.15)_0%,transparent_70%)] -top-25 -left-25 blur-2xl z-0' />
      <div className='absolute w-100 h-100 rounded-full bg-[radial-gradient(circle,hsl(var(--accent)/0.15)_0%,transparent_70%)] -bottom-25 -right-25 blur-2xl z-0' />

      <div className='glass-panel max-w-120 w-full p-12 z-10 shadow-lg shadow-[rgba(99,102,241,0.05)] border border-white/5 animate-[fadeIn_0.5s_ease_forwards]'>
        {/* Brand Logo & Intro */}
        <div className='text-center mb-10'>
          <div className='gradient-bg w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 text-white shadow-[0_8px_24px_hsl(var(--primary)/0.25)]'>
            <Shield size={24} />
          </div>
          <h1 className='gradient-text text-3xl font-extrabold tracking-tight mb-2'>
            CollabSphere
          </h1>
          <p className='text-secondary text-[0.925rem]'>
            Smart Project & Task Collaboration Workspace
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
          <div className='flex flex-col gap-2'>
            <label className='text-sm font-semibold text-secondary'>
              Email Address
            </label>
            <div className='flex items-center gap-3 px-3.5 h-12 rounded-[10px] border border-border bg-secondary-bg/50 transition-all duration-200 focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/10'>
              <Mail size={18} className='text-muted shrink-0' />
              <input
                type='email'
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='you@example.com'
                className='w-full h-full py-3 bg-transparent border-none outline-none text-foreground'
              />
            </div>
          </div>

          <div className='flex flex-col gap-2'>
            <div className='flex justify-between'>
              <label className='text-sm font-semibold text-secondary'>
                Password
              </label>
            </div>
            <div className='flex items-center gap-3 px-3.5 h-12 rounded-[10px] border border-border bg-secondary-bg/50 transition-all duration-200 focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/10'>
              <Lock size={18} className='text-muted shrink-0' />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='••••••••'
                className='w-full h-full py-3 bg-transparent border-none outline-none text-foreground'
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='bg-transparent border-none cursor-pointer text-secondary flex items-center justify-center p-1'>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type='submit'
            disabled={localLoading || isLoading}
            className='gradient-bg py-3.5 rounded-[10px] font-semibold cursor-pointer flex items-center justify-center gap-2 shadow-[0_4px_12px_hsl(var(--primary)/0.2)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:pointer-events-none disabled:transform-none'>
            <LogIn size={18} />
            {localLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className='flex items-center my-8 text-muted text-[0.8rem]'>
          <div className='grow h-px bg-border' />
          <span className='px-3 font-medium'>DEMO SANDBOX LOGIN</span>
          <div className='grow h-px bg-border' />
        </div>

        {/* Instant Role Seeding Buttons */}
        <div
          className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-1"} gap-2.5`}>
          <button
            onClick={() => handleDemoClick("ADMIN")}
            disabled={localLoading}
            className='flex items-center justify-between px-4 py-2.5 rounded-lg border border-border bg-secondary-bg cursor-pointer text-sm font-semibold text-secondary transition-all duration-200 hover:border-primary hover:bg-primary/4 disabled:opacity-50'>
            <div className='flex items-center gap-2.5'>
              <UserCheck size={16} className='text-primary' />
              <span>Login as Demo Admin</span>
            </div>
            <span className='text-xs text-muted'>Full access</span>
          </button>

          <button
            onClick={() => handleDemoClick("PROJECT_MANAGER")}
            disabled={localLoading}
            className='flex items-center justify-between px-4 py-2.5 rounded-lg border border-border bg-secondary-bg cursor-pointer text-sm font-semibold text-secondary transition-all duration-200 hover:border-primary hover:bg-primary/4 disabled:opacity-50'>
            <div className='flex items-center gap-2.5'>
              <UserCheck size={16} className='text-primary' />
              <span>Login as Demo Project Manager</span>
            </div>
            <span className='text-xs text-muted'>PM role</span>
          </button>

          <button
            onClick={() => handleDemoClick("TEAM_MEMBER")}
            disabled={localLoading}
            className='flex items-center justify-between px-4 py-2.5 rounded-lg border border-border bg-secondary-bg cursor-pointer text-sm font-semibold text-secondary transition-all duration-200 hover:border-primary hover:bg-primary/4 disabled:opacity-50'>
            <div className='flex items-center gap-2.5'>
              <UserCheck size={16} className='text-primary' />
              <span>Login as Demo Team Member</span>
            </div>
            <span className='text-xs text-muted'>Member role</span>
          </button>
        </div>

        {/* Footer */}
        <p className='text-center mt-8 text-sm text-secondary'>
          Don't have an account?{" "}
          <Link
            href='/signup'
            className='text-primary font-semibold hover:underline'>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
