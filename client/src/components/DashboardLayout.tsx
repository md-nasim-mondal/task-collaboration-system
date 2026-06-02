"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Bell,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  CheckCircle,
} from "lucide-react";

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    user,
    isAuthenticated,
    isLoading,
    logout,
    notifications,
    unreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead,
  } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Authentication Route Guard
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "hsl(var(--bg-primary))",
          color: "hsl(var(--primary))",
          fontSize: "1.25rem",
          fontWeight: 600,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              border: "4px solid hsl(var(--primary) / 0.2)",
              borderTop: "4px solid hsl(var(--primary))",
              borderRadius: "50%",
              margin: "0 auto 16px",
              animation: "spin 1s linear infinite",
            }}
          />
          Loading workspace...
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Projects", href: "/projects", icon: <FolderKanban size={20} /> },
    { name: "Tasks Center", href: "/tasks", icon: <CheckSquare size={20} /> },
  ];

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "hsl(var(--bg-primary))",
        transition: "background-color var(--transition-normal)",
      }}
    >
      {/* SIDEBAR */}
      <aside
        className="glass-panel"
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
        }}
      >
        {/* Sidebar Header Logo */}
        <div
          style={{
            padding: "24px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            borderBottom: "1px solid hsl(var(--border-color))",
          }}
        >
          <div
            className="gradient-bg"
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
            }}
          >
            C
          </div>
          {sidebarOpen && (
            <span
              className="gradient-text"
              style={{
                fontSize: "1.25rem",
                fontWeight: 800,
                letterSpacing: "-0.5px",
              }}
            >
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
          }}
        >
          {navLinks.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
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
                  color: active ? "hsl(var(--primary))" : "hsl(var(--text-secondary))",
                  backgroundColor: active ? "hsl(var(--primary) / 0.08)" : "transparent",
                  fontWeight: active ? 600 : 500,
                  transition: "background var(--transition-fast), color var(--transition-fast)",
                }}
                className={!active ? "nav-link-hover" : ""}
              >
                {link.icon}
                {sidebarOpen && <span>{link.name}</span>}
              </button>
            );
          })}
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
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              className="gradient-bg"
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
              }}
            >
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
                  }}
                >
                  {user.name}
                </span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "hsl(var(--text-muted))",
                    fontWeight: 500,
                  }}
                >
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
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "hsl(var(--danger) / 0.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          overflow: "hidden",
        }}
      >
        {/* HEADER NAVBAR */}
        <header
          className="glass-panel"
          style={{
            height: "70px",
            borderRadius: 0,
            borderWidth: "0 0 1px 0",
            margin: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            backgroundColor: "hsl(var(--bg-secondary))",
            zIndex: 90,
          }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              cursor: "pointer",
              padding: "8px",
              borderRadius: "8px",
              color: "hsl(var(--text-secondary))",
            }}
          >
            <Menu size={20} />
          </button>

          {/* Action Row */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              style={{
                cursor: "pointer",
                padding: "8px",
                borderRadius: "50%",
                color: "hsl(var(--text-secondary))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "hsl(var(--border-color))")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* Notifications Alert Dropdown Button */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                style={{
                  cursor: "pointer",
                  padding: "8px",
                  borderRadius: "50%",
                  color: "hsl(var(--text-secondary))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "hsl(var(--border-color))")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <Bell size={20} />
                {unreadNotificationsCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "2px",
                      right: "2px",
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      backgroundColor: "hsl(var(--danger))",
                      color: "#fff",
                      fontSize: "0.675rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
            </div>

            {/* Profile Avatar Quick-dropdown */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div
                  className="gradient-bg"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                    color: "#fff",
                    fontSize: "0.875rem",
                  }}
                >
                  {user ? getInitials(user.name) : "U"}
                </div>
              </button>

              {profileDropdownOpen && (
                <div
                  className="glass-panel"
                  style={{
                    position: "absolute",
                    top: "48px",
                    right: 0,
                    width: "220px",
                    padding: "8px",
                    boxShadow: "var(--shadow-lg)",
                    backgroundColor: "hsl(var(--bg-secondary))",
                    animation: "fadeIn 0.2s ease forwards",
                  }}
                >
                  <div style={{ padding: "12px", borderBottom: "1px solid hsl(var(--border-color))" }}>
                    <p style={{ fontWeight: 600, fontSize: "0.875rem" }}>{user?.name}</p>
                    <p style={{ fontSize: "0.75rem", color: "hsl(var(--text-muted))" }}>{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      router.push("/tasks");
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 12px",
                      width: "100%",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                      textAlign: "left",
                    }}
                    className="profile-menu-item"
                  >
                    <UserIcon size={16} /> My Assignments
                  </button>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 12px",
                      width: "100%",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                      color: "hsl(var(--danger))",
                      textAlign: "left",
                    }}
                    className="profile-menu-item"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* COLLAPSIBLE NOTIFICATION DRAWER */}
        {notificationOpen && (
          <div
            className="glass-panel"
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              height: "100vh",
              width: "360px",
              borderRadius: 0,
              margin: 0,
              borderWidth: "0 0 0 1px",
              boxShadow: "0 0 40px rgba(0, 0, 0, 0.2)",
              zIndex: 1000,
              backgroundColor: "hsl(var(--bg-secondary))",
              display: "flex",
              flexDirection: "column",
              animation: "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            }}
          >
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid hsl(var(--border-color))",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700 }}>Notifications</h3>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    style={{
                      fontSize: "0.75rem",
                      color: "hsl(var(--primary))",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setNotificationOpen(false)}
                  style={{
                    padding: "4px",
                    borderRadius: "50%",
                    cursor: "pointer",
                    color: "hsl(var(--text-secondary))",
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div style={{ flexGrow: 1, overflowY: "auto", padding: "16px" }}>
              {notifications.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "hsl(var(--text-muted))" }}>
                  <Bell size={40} style={{ strokeWidth: 1, marginBottom: "12px" }} />
                  <p>All caught up! No notifications.</p>
                </div>
              ) : (
                notifications.map((notif: any) => (
                  <div
                    key={notif._id}
                    style={{
                      padding: "14px",
                      borderRadius: "10px",
                      backgroundColor: notif.isRead ? "transparent" : "hsl(var(--bg-primary))",
                      border: "1px solid hsl(var(--border-color))",
                      marginBottom: "12px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                      position: "relative",
                      transition: "background var(--transition-fast)",
                    }}
                  >
                    <p style={{ fontSize: "0.875rem", fontWeight: notif.isRead ? 400 : 600 }}>
                      {notif.message}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.75rem", color: "hsl(var(--text-muted))" }}>
                        {new Date(notif.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {!notif.isRead && (
                        <button
                          onClick={() => markNotificationRead(notif._id)}
                          style={{
                            cursor: "pointer",
                            color: "hsl(var(--success))",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                          }}
                        >
                          <CheckCircle size={14} /> Mark read
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* WORKSPACE PAGES MOUNT POINT */}
        <main
          style={{
            flexGrow: 1,
            overflowY: "auto",
            padding: "32px",
          }}
        >
          {children}
        </main>
      </div>

      <style>{`
        .nav-link-hover:hover {
          background-color: hsl(var(--border-color));
          color: hsl(var(--text-primary));
        }
        .profile-menu-item:hover {
          background-color: hsl(var(--bg-primary));
        }
      `}</style>
    </div>
  );
};
