"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Sparkles, Mail, Lock, LogIn, UserCheck } from "lucide-react";

export default function LoginPage() {
  const { login, demoLogin, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localLoading, setLocalLoading] = useState(false);

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

  const handleDemoClick = async (role: "ADMIN" | "PROJECT_MANAGER" | "TEAM_MEMBER") => {
    setLocalLoading(true);
    const success = await demoLogin(role);
    setLocalLoading(false);
    if (success) {
      router.push("/dashboard");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "hsl(var(--bg-primary))",
        padding: "24px",
      }}
    >
      {/* Background visual art blobs for premium aesthetic */}
      <div
        style={{
          position: "absolute",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)",
          top: "-100px",
          left: "-100px",
          filter: "blur(40px)",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, hsl(var(--accent) / 0.15) 0%, transparent 70%)",
          bottom: "-100px",
          right: "-100px",
          filter: "blur(40px)",
          zIndex: 0,
        }}
      />

      <div
        className="glass-panel"
        style={{
          maxWidth: "480px",
          width: "100%",
          padding: "48px",
          zIndex: 1,
          boxShadow: "var(--shadow-lg), 0 24px 80px rgba(99, 102, 241, 0.05)",
          border: "1px solid var(--glass-border)",
          animation: "fadeIn 0.5s ease forwards",
        }}
      >
        {/* Brand Logo & Intro */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            className="gradient-bg"
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              color: "#fff",
              boxShadow: "0 8px 24px hsl(var(--primary) / 0.25)",
            }}
          >
            <Shield size={24} />
          </div>
          <h1
            className="gradient-text"
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              letterSpacing: "-0.5px",
              marginBottom: "8px",
            }}
          >
            CollabSphere
          </h1>
          <p style={{ color: "hsl(var(--text-secondary))", fontSize: "0.925rem" }}>
            Smart Project & Task Collaboration Workspace
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "hsl(var(--text-secondary))" }}>
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <Mail
                size={18}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "hsl(var(--text-muted))",
                }}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: "100%",
                  padding: "12px 14px 12px 42px",
                  borderRadius: "10px",
                  border: "1px solid hsl(var(--border-color))",
                  backgroundColor: "hsl(var(--bg-secondary) / 0.5)",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "hsl(var(--primary))";
                  e.target.style.boxShadow = "0 0 0 3px hsl(var(--primary) / 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "hsl(var(--border-color))";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "hsl(var(--text-secondary))" }}>
                Password
              </label>
            </div>
            <div style={{ position: "relative" }}>
              <Lock
                size={18}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "hsl(var(--text-muted))",
                }}
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "12px 14px 12px 42px",
                  borderRadius: "10px",
                  border: "1px solid hsl(var(--border-color))",
                  backgroundColor: "hsl(var(--bg-secondary) / 0.5)",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "hsl(var(--primary))";
                  e.target.style.boxShadow = "0 0 0 3px hsl(var(--primary) / 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "hsl(var(--border-color))";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={localLoading || isLoading}
            className="gradient-bg"
            style={{
              padding: "14px",
              borderRadius: "10px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0 4px 12px hsl(var(--primary) / 0.2)",
              transition: "transform 0.2s, opacity 0.2s",
              opacity: localLoading || isLoading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!localLoading) e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              if (!localLoading) e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <LogIn size={18} />
            {localLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            margin: "32px 0 24px",
            color: "hsl(var(--text-muted))",
            fontSize: "0.8rem",
          }}
        >
          <div style={{ flexGrow: 1, height: "1px", backgroundColor: "hsl(var(--border-color))" }} />
          <span style={{ padding: "0 12px", fontWeight: 500 }}>DEMO SANDBOX LOGIN</span>
          <div style={{ flexGrow: 1, height: "1px", backgroundColor: "hsl(var(--border-color))" }} />
        </div>

        {/* Instant Role Seeding Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            onClick={() => handleDemoClick("ADMIN")}
            disabled={localLoading}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 16px",
              borderRadius: "8px",
              border: "1px solid hsl(var(--border-color))",
              backgroundColor: "hsl(var(--bg-secondary))",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 600,
              transition: "border-color 0.2s, background 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "hsl(var(--primary))";
              e.currentTarget.style.backgroundColor = "hsl(var(--primary) / 0.04)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "hsl(var(--border-color))";
              e.currentTarget.style.backgroundColor = "hsl(var(--bg-secondary))";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <UserCheck size={16} style={{ color: "hsl(var(--primary))" }} />
              <span>Login as Demo Admin</span>
            </div>
            <span style={{ fontSize: "0.75rem", color: "hsl(var(--text-muted))" }}>Full access</span>
          </button>

          <button
            onClick={() => handleDemoClick("PROJECT_MANAGER")}
            disabled={localLoading}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 16px",
              borderRadius: "8px",
              border: "1px solid hsl(var(--border-color))",
              backgroundColor: "hsl(var(--bg-secondary))",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 600,
              transition: "border-color 0.2s, background 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "hsl(var(--primary))";
              e.currentTarget.style.backgroundColor = "hsl(var(--primary) / 0.04)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "hsl(var(--border-color))";
              e.currentTarget.style.backgroundColor = "hsl(var(--bg-secondary))";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <UserCheck size={16} style={{ color: "hsl(var(--primary))" }} />
              <span>Login as Demo Project Manager</span>
            </div>
            <span style={{ fontSize: "0.75rem", color: "hsl(var(--text-muted))" }}>PM role</span>
          </button>

          <button
            onClick={() => handleDemoClick("TEAM_MEMBER")}
            disabled={localLoading}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 16px",
              borderRadius: "8px",
              border: "1px solid hsl(var(--border-color))",
              backgroundColor: "hsl(var(--bg-secondary))",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 600,
              transition: "border-color 0.2s, background 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "hsl(var(--primary))";
              e.currentTarget.style.backgroundColor = "hsl(var(--primary) / 0.04)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "hsl(var(--border-color))";
              e.currentTarget.style.backgroundColor = "hsl(var(--bg-secondary))";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <UserCheck size={16} style={{ color: "hsl(var(--primary))" }} />
              <span>Login as Demo Team Member</span>
            </div>
            <span style={{ fontSize: "0.75rem", color: "hsl(var(--text-muted))" }}>Member role</span>
          </button>
        </div>

        {/* Footer */}
        <p style={{ textAlign: "center", marginTop: "32px", fontSize: "0.875rem", color: "hsl(var(--text-secondary))" }}>
          Don't have an account?{" "}
          <Link href="/signup" style={{ color: "hsl(var(--primary))", fontWeight: 600 }}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
