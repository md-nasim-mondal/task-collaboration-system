"use client";

import React from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import "@/app/globals.css";
import { X, CheckCircle2, AlertTriangle, Info } from "lucide-react";

// Inline ToastManager to present visual notifications nicely
const ToastManager: React.FC = () => {
  const { toasts, removeToast } = useAuth();

  return (
    <div
      style={{
        position: "fixed",
        top: "24px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        maxWidth: "360px",
        width: "100%",
        pointerEvents: "none",
      }}
    >
      {toasts.map((toast) => {
        let borderLeft = "4px solid hsl(var(--primary))";
        let icon = <Info size={20} style={{ color: "hsl(var(--primary))" }} />;

        if (toast.type === "success") {
          borderLeft = "4px solid hsl(var(--success))";
          icon = <CheckCircle2 size={20} style={{ color: "hsl(var(--success))" }} />;
        } else if (toast.type === "error") {
          borderLeft = "4px solid hsl(var(--danger))";
          icon = <AlertTriangle size={20} style={{ color: "hsl(var(--danger))" }} />;
        }

        return (
          <div
            key={toast.id}
            className="glass-panel"
            style={{
              padding: "16px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              justifyContent: "space-between",
              borderLeft,
              animation: "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              pointerEvents: "auto",
              boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {icon}
              <span
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "hsl(var(--text-primary))",
                }}
              >
                {toast.message}
              </span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                cursor: "pointer",
                padding: "2px",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0.7,
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>CollabSphere | Smart Project & Task Collaboration</title>
        <meta
          name="description"
          content="Empower your team with real-time project management, workload balance charts, task automation, and interactive analytics."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <ToastManager />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
