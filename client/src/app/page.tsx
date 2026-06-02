"use client";

import React from "react";
import Link from "next/link";
import { Shield, ArrowRight, Zap, CheckSquare, Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "hsl(var(--bg-primary))",
        color: "hsl(var(--text-primary))",
        position: "relative",
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
      }}
    >
      {/* Background aesthetic blobs */}
      <div
        style={{
          position: "absolute",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, hsl(var(--primary) / 0.12) 0%, transparent 70%)",
          top: "-150px",
          left: "-150px",
          filter: "blur(60px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, hsl(var(--accent) / 0.12) 0%, transparent 70%)",
          bottom: "-150px",
          right: "-150px",
          filter: "blur(60px)",
        }}
      />

      <div
        className="glass-panel"
        style={{
          maxWidth: "800px",
          width: "100%",
          padding: "60px",
          textAlign: "center",
          boxShadow: "var(--shadow-lg), 0 20px 80px rgba(0,0,0,0.1)",
          animation: "fadeIn 0.6s ease forwards",
        }}
      >
        <div
          className="gradient-bg"
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            color: "#fff",
            boxShadow: "0 8px 30px hsl(var(--primary) / 0.25)",
          }}
        >
          <Shield size={28} />
        </div>

        <h1
          className="gradient-text"
          style={{
            fontSize: "3.5rem",
            fontWeight: 800,
            letterSpacing: "-1.5px",
            lineHeight: 1.1,
            marginBottom: "16px",
          }}
        >
          CollabSphere
        </h1>

        <p
          style={{
            fontSize: "1.125rem",
            color: "hsl(var(--text-secondary))",
            maxWidth: "600px",
            margin: "0 auto 40px",
            lineHeight: 1.6,
          }}
        >
          Empower your team with a high-performance workspace. Experience glassmorphic dashboards, custom workload balance analytics, granular roles, and instant task validations.
        </p>

        {/* Action Button */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "48px" }}>
          <Link
            href="/login"
            className="gradient-bg"
            style={{
              padding: "16px 36px",
              borderRadius: "12px",
              fontWeight: 700,
              fontSize: "1.05rem",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              boxShadow: "0 10px 30px hsl(var(--primary) / 0.3)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 12px 40px hsl(var(--primary) / 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 10px 30px hsl(var(--primary) / 0.3)";
            }}
          >
            <span>Enter Secure Workspace</span>
            <ArrowRight size={20} />
          </Link>
        </div>

        {/* Feature Icons Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "24px",
            borderTop: "1px solid hsl(var(--border-color) / 0.6)",
            paddingTop: "40px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <Zap size={22} style={{ color: "hsl(var(--primary))" }} />
            <h4 style={{ fontWeight: 700, fontSize: "0.95rem" }}>Role-Based Access</h4>
            <p style={{ fontSize: "0.8rem", color: "hsl(var(--text-secondary))" }}>
              Secure portals for Admin, PM, and Team Members.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <CheckSquare size={22} style={{ color: "hsl(var(--primary))" }} />
            <h4 style={{ fontWeight: 700, fontSize: "0.95rem" }}>Task Automation</h4>
            <p style={{ fontSize: "0.8rem", color: "hsl(var(--text-secondary))" }}>
              Automated collision checks and deadline rules.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <Sparkles size={22} style={{ color: "hsl(var(--primary))" }} />
            <h4 style={{ fontWeight: 700, fontSize: "0.95rem" }}>Workload Charts</h4>
            <p style={{ fontSize: "0.8rem", color: "hsl(var(--text-secondary))" }}>
              Dynamic workload charts and timeline activity streaming.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
