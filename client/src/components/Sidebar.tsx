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
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface SidebarProps {
  sidebarOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
        display: "flex",
        flexDirection: "column",
        borderRadius: 0,
        borderWidth: "0 1px 0 0",
        margin: 0,
        zIndex: 100,
        transition: "width var(--transition-normal)",
        backgroundColor: "hsl(var(--bg-secondary))",
      }}>
      {/* Sidebar Header Logo */}
      <div
        style={{
          padding: "24px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          borderBottom: "1px solid hsl(var(--border-color))",
        }}>
        <div
          className='gradient-bg'
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: "1.25rem",
            color: "#fff",
            flexShrink: 0,
          }}>
          C
        </div>
        {sidebarOpen && (
          <span
            className='gradient-text'
            style={{
              fontSize: "1.25rem",
              fontWeight: 800,
              letterSpacing: "-0.5px",
            }}>
            CollabSphere
          </span>
        )}
      </div>

      {/* Sidebar Navigation Links */}
      <nav
        style={{
          padding: "24px 12px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
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

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            padding: "12px 16px",
            borderRadius: "10px",
            cursor: "pointer",
            width: "100%",
            color: "hsl(var(--text-secondary))",
            backgroundColor: "transparent",
            fontWeight: 500,
            border: "none",
            textAlign: "left",
            transition:
              "background var(--transition-fast), color var(--transition-fast)",
            marginTop: "auto",
          }}
          className='nav-link-hover'>
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          {sidebarOpen && (
            <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
          )}
        </button>
      </nav>

      {/* Sidebar Footer User Profile Summary */}
      <div
        style={{
          padding: "20px 16px",
          borderTop: "1px solid hsl(var(--border-color))",
          display: "flex",
          alignItems: "center",
          justifyContent: sidebarOpen ? "space-between" : "center",
          gap: "10px",
        }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            className='gradient-bg'
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              color: "#fff",
              fontSize: "0.875rem",
            }}>
            {user ? getInitials(user.name) : "U"}
          </div>
          {sidebarOpen && user && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  maxWidth: "120px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                {user.name}
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "hsl(var(--text-muted))",
                  fontWeight: 500,
                }}>
                {user.role.replace("_", " ")}
              </span>
            </div>
          )}
        </div>
        {sidebarOpen && (
          <button
            onClick={logout}
            style={{
              cursor: "pointer",
              padding: "8px",
              borderRadius: "8px",
              color: "hsl(var(--danger))",
              border: "none",
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "hsl(var(--danger) / 0.1)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }>
            <LogOut size={18} />
          </button>
        )}
      </div>
    </aside>
  );
};
