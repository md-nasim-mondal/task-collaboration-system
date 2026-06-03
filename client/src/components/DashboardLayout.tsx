"use client";
// Collapsible layout container supporting theme changes and sidebar navigation

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import Loading from "./Loading";
import {
  Bell,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  CheckCircle,
} from "lucide-react";

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
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

  const [sidebarOpen, setSidebarOpen] = useState(false); // Default to closed on mobile
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isLoading) {
    return <Loading fullPage={true} text='Loading workspace...' />;
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

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "hsl(var(--bg-primary))",
        transition: "background-color var(--transition-normal)",
        position: "relative",
      }}>
      {/* SIDEBAR OVERLAY FOR MOBILE */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 95,
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* SIDEBAR */}
      <div
        style={{
          position: isMobile ? "fixed" : "sticky",
          top: 0,
          height: "100vh",
          zIndex: 100,
          left: 0,
          transition: "transform 0.3s ease",
          transform:
            isMobile && !sidebarOpen ? "translateX(-100%)" : "translateX(0)",
        }}>
        <Sidebar
          sidebarOpen={sidebarOpen}
          onLinkClick={() => {
            if (isMobile) {
              setSidebarOpen(false);
            }
          }}
        />
      </div>

      {/* MAIN VIEWPORT */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          overflow: "hidden",
        }}>
        {/* HEADER NAVBAR */}
        <header
          style={{
            height: "72px",
            padding: isMobile ? "0 16px" : "0 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid hsl(var(--border-color))",
            backgroundColor: "hsl(var(--bg-primary) / 0.8)",
            backdropFilter: "blur(12px)",
            position: "sticky",
            top: 0,
            zIndex: 90,
          }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                cursor: "pointer",
                padding: "8px",
                borderRadius: "8px",
                color: "hsl(var(--text-secondary))",
                backgroundColor: "transparent",
                border: "none",
              }}
              className='nav-link-hover'>
              <Menu size={22} />
            </button>
          </div>

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
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "hsl(var(--border-color))")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
              title={
                theme === "light"
                  ? "Switch to Dark Mode"
                  : "Switch to Light Mode"
              }>
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
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "hsl(var(--border-color))")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }>
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
                    }}>
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
                }}>
                <div
                  className='gradient-bg'
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
                  }}>
                  {user ? getInitials(user.name) : "U"}
                </div>
              </button>

              {profileDropdownOpen && (
                <div
                  className='glass-panel'
                  style={{
                    position: "absolute",
                    top: "48px",
                    right: 0,
                    width: "220px",
                    padding: "8px",
                    boxShadow: "var(--shadow-lg)",
                    backgroundColor: "hsl(var(--bg-secondary))",
                    animation: "fadeIn 0.2s ease forwards",
                  }}>
                  <div
                    style={{
                      padding: "12px",
                      borderBottom: "1px solid hsl(var(--border-color))",
                    }}>
                    <p style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                      {user?.name}
                    </p>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "hsl(var(--text-muted))",
                      }}>
                      {user?.email}
                    </p>
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
                    className='profile-menu-item'>
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
                    className='profile-menu-item'>
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
            className='glass-panel'
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              height: "100vh",
              width: isMobile ? "100%" : "360px",
              borderRadius: 0,
              margin: 0,
              borderWidth: isMobile ? "0" : "0 0 0 1px",
              boxShadow: "0 0 40px rgba(0, 0, 0, 0.2)",
              zIndex: 1000,
              backgroundColor: "hsl(var(--bg-secondary))",
              display: "flex",
              flexDirection: "column",
              animation:
                "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            }}>
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid hsl(var(--border-color))",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700 }}>
                Notifications
              </h3>
              <div
                style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    style={{
                      fontSize: "0.75rem",
                      color: "hsl(var(--primary))",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}>
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
                  }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            <div style={{ flexGrow: 1, overflowY: "auto", padding: "16px" }}>
              {notifications.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 0",
                    color: "hsl(var(--text-muted))",
                  }}>
                  <Bell
                    size={40}
                    style={{ strokeWidth: 1, marginBottom: "12px" }}
                  />
                  <p>All caught up! No notifications.</p>
                </div>
              ) : (
                notifications.map((notif: any) => (
                  <div
                    key={notif._id}
                    style={{
                      padding: "14px",
                      borderRadius: "10px",
                      backgroundColor: notif.isRead
                        ? "transparent"
                        : "hsl(var(--bg-primary))",
                      border: "1px solid hsl(var(--border-color))",
                      marginBottom: "12px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                      position: "relative",
                      transition: "background var(--transition-fast)",
                    }}>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: notif.isRead ? 400 : 600,
                      }}>
                      {notif.message}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "hsl(var(--text-muted))",
                        }}>
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
                          }}>
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
            padding: isMobile ? "20px 16px" : "32px",
            minWidth: "280px",
          }}>
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
