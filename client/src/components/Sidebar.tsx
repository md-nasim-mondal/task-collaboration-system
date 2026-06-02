"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  sidebarOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const navLinks = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    { name: "Projects", href: "/projects", icon: <FolderKanban size={20} /> },
    { name: "Tasks Center", href: "/tasks", icon: <CheckSquare size={20} /> },
    { name: "Team Members", href: "/members", icon: <Users size={20} /> },
  ];

  return (
    <aside
      className='glass-panel'
      style={{
        width: sidebarOpen ? "260px" : "80px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 0,
        borderWidth: "0 1px 0 0",
        margin: 0,
        zIndex: 100,
        transition: "width var(--transition-normal)",
        backgroundColor: "hsl(var(--bg-secondary))",
      }}>
      {/* Logo and Brand */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          padding: "24px 16px",
          borderBottom: "1px solid hsl(var(--border-color))",
        }}>
        <div
          className='gradient-bg'
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            boxShadow: "0 4px 12px hsl(var(--primary) / 0.3)",
            flexShrink: 0,
          }}>
          <span style={{ fontSize: "1.4rem", fontWeight: 900 }}>C</span>
        </div>
        {sidebarOpen && (
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.4rem",
              fontWeight: 800,
              letterSpacing: "-0.5px",
              background: "linear-gradient(135deg, #fff 0%, #a5b4fc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
            CollabSphere
          </span>
        )}
      </div>

      {/* Navigation Links */}
      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          padding: "16px",
          flexGrow: 1,
        }}>
        {navLinks.map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <button
              key={link.href}
              onClick={() => router.push(link.href)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "12px 16px",
                borderRadius: "10px",
                cursor: "pointer",
                width: "100%",
                color: active
                  ? "hsl(var(--primary))"
                  : "hsl(var(--text-secondary))",
                backgroundColor: active
                  ? "hsl(var(--primary) / 0.08)"
                  : "transparent",
                fontWeight: active ? 600 : 500,
                border: "none",
                textAlign: "left",
                transition:
                  "background var(--transition-fast), color var(--transition-fast)",
              }}
              className={!active ? "nav-link-hover" : ""}>
              {link.icon}
              {sidebarOpen && <span>{link.name}</span>}
            </button>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div
        style={{
          padding: "16px",
          borderTop: "1px solid hsl(var(--border-color))",
          marginTop: "auto",
        }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: sidebarOpen ? "space-between" : "center",
            gap: "12px",
            padding: "8px",
            borderRadius: "12px",
            backgroundColor: "hsl(var(--bg-primary) / 0.5)",
          }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              className='gradient-bg'
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.85rem",
              }}>
              {getInitials(user?.name || "User")}
            </div>
            {sidebarOpen && (
              <div style={{ overflow: "hidden" }}>
                <p
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                  }}>
                  {user?.name}
                </p>
                <p
                  style={{
                    fontSize: "0.7rem",
                    color: "hsl(var(--text-muted))",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontWeight: 600,
                  }}>
                  {user?.role?.replace("_", " ")}
                </p>
              </div>
            )}
          </div>

          {sidebarOpen && (
            <button
              onClick={logout}
              style={{
                padding: "8px",
                borderRadius: "8px",
                color: "hsl(var(--danger))",
                cursor: "pointer",
                border: "none",
                backgroundColor: "transparent",
                transition: "background var(--transition-fast)",
              }}
              className='nav-link-hover'
              title='Logout'>
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
