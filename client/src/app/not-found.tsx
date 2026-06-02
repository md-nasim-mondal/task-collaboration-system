"use client";

import Link from "next/navigation";
import { useRouter } from "next/navigation";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        textAlign: "center",
        backgroundColor: "hsl(var(--bg-primary))",
      }}>
      <div
        style={{
          position: "relative",
          marginBottom: "40px",
        }}>
        <h1
          style={{
            fontSize: "12rem",
            fontWeight: 900,
            lineHeight: 1,
            margin: 0,
            opacity: 0.05,
            userSelect: "none",
          }}>
          404
        </h1>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "100%",
          }}>
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              backgroundColor: "hsl(var(--primary) / 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "hsl(var(--primary))",
              margin: "0 auto 24px",
            }}>
            <Search size={60} />
          </div>
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              color: "hsl(var(--text-primary))",
            }}>
            Page Not Found
          </h2>
        </div>
      </div>

      <p
        style={{
          color: "hsl(var(--text-secondary))",
          maxWidth: "460px",
          fontSize: "1.125rem",
          lineHeight: 1.6,
          marginBottom: "32px",
        }}>
        Oops! The page you're looking for doesn't exist or has been moved. 
        Let's get you back on track.
      </p>

      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}>
        <button
          onClick={() => router.back()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 24px",
            borderRadius: "12px",
            backgroundColor: "hsl(var(--bg-secondary))",
            border: "1px solid hsl(var(--border-color))",
            color: "hsl(var(--text-primary))",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "hsl(var(--bg-tertiary))")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "hsl(var(--bg-secondary))")}>
          <ArrowLeft size={20} />
          Go Back
        </button>

        <button
          onClick={() => router.push("/dashboard")}
          className="gradient-bg"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 24px",
            borderRadius: "12px",
            border: "none",
            color: "white",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 10px 15px -3px hsl(var(--primary) / 0.3)",
          }}>
          <Home size={20} />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
