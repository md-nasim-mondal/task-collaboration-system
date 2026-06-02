"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Mail, Lock, User, UserPlus, Phone } from "lucide-react";

export default function SignupPage() {
  const { signup, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [localLoading, setLocalLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setLocalLoading(true);
    const success = await signup(name, email, password, phone || undefined);
    setLocalLoading(false);
    if (success) {
      router.push("/login");
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
        {/* Logo Header */}
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
            Create Account
          </h1>
          <p style={{ color: "hsl(var(--text-secondary))", fontSize: "0.925rem" }}>
            Join the CollabSphere workspace today
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "hsl(var(--text-secondary))" }}>
              Full Name
            </label>
            <div style={{ position: "relative" }}>
              <User
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
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                style={{
                  width: "100%",
                  padding: "12px 14px 12px 42px",
                  borderRadius: "10px",
                  border: "1px solid hsl(var(--border-color))",
                  backgroundColor: "hsl(var(--bg-secondary) / 0.5)",
                }}
              />
            </div>
          </div>

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
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "hsl(var(--text-secondary))" }}>
              Phone Number (Optional)
            </label>
            <div style={{ position: "relative" }}>
              <Phone
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
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                style={{
                  width: "100%",
                  padding: "12px 14px 12px 42px",
                  borderRadius: "10px",
                  border: "1px solid hsl(var(--border-color))",
                  backgroundColor: "hsl(var(--bg-secondary) / 0.5)",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "hsl(var(--text-secondary))" }}>
              Password
            </label>
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
          >
            <UserPlus size={18} />
            {localLoading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        {/* Footer */}
        <p style={{ textAlign: "center", marginTop: "32px", fontSize: "0.875rem", color: "hsl(var(--text-secondary))" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "hsl(var(--primary))", fontWeight: 600 }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
