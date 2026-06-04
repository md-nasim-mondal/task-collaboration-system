"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import Loading from "@/components/ui/Loading";
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

  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    return <Loading fullPage={true} text="Loading workspace..." />;
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
    <div className="flex h-screen overflow-hidden bg-background transition-colors duration-250 relative">
      {/* SIDEBAR OVERLAY FOR MOBILE */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-95 backdrop-blur-[2px]"
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`top-0 h-screen z-100 left-0 transition-transform duration-300 ${
          isMobile ? "fixed" : "sticky"
        } ${isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0"}`}
      >
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
      <div className="flex flex-col grow overflow-hidden">
        {/* HEADER NAVBAR */}
        <header className="h-18 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-90 px-4 md:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="cursor-pointer p-2 rounded-lg text-secondary bg-transparent hover:bg-border hover:text-foreground border-none transition-colors duration-200"
            >
              <Menu size={22} />
            </button>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="cursor-pointer p-2 rounded-full text-secondary flex items-center justify-center hover:bg-border transition-colors border-none bg-transparent"
              title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* Notifications Alert Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="cursor-pointer p-2 rounded-full text-secondary flex items-center justify-center relative hover:bg-border transition-colors border-none bg-transparent"
              >
                <Bell size={20} />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4.5 h-4.5 rounded-full bg-danger text-white text-[0.675rem] font-bold flex items-center justify-center">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
            </div>

            {/* Profile Avatar Quick-dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="cursor-pointer flex items-center gap-2 border-none bg-transparent outline-none"
              >
                <div className="gradient-bg w-9 h-9 rounded-full flex items-center justify-center font-semibold text-white text-[0.875rem] shadow-sm">
                  {user ? getInitials(user.name) : "U"}
                </div>
              </button>

              {profileDropdownOpen && (
                <div className="absolute top-12 right-0 w-55 p-2 glass-panel shadow-lg bg-secondary-bg animate-[fadeIn_0.2s_ease_forwards] z-100">
                  <div className="p-3 border-b border-border">
                    <p className="font-semibold text-sm text-foreground">
                      {user?.name}
                    </p>
                    <p className="text-xs text-muted">
                      {user?.email}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      router.push("/tasks");
                    }}
                    className="flex items-center gap-2.5 p-2.5 w-full rounded-md cursor-pointer text-sm text-left border-none bg-transparent text-secondary hover:bg-background hover:text-foreground transition-all duration-200"
                  >
                    <UserIcon size={16} /> My Assignments
                  </button>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="flex items-center gap-2.5 p-2.5 w-full rounded-md cursor-pointer text-sm text-left border-none bg-transparent text-danger hover:bg-danger/10 transition-all duration-200"
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
            className={`fixed top-0 right-0 h-screen glass-panel rounded-none! m-0 border-y-0 border-r-0 border-l border-border shadow-2xl z-1000 bg-secondary-bg flex flex-col animate-[slideInRight_0.3s_cubic-bezier(0.16,1,0.3,1)_forwards] ${
              isMobile ? "w-full border-none" : "w-90"
            }`}
          >
            <div className="p-5 px-6 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">
                Notifications
              </h3>
              <div className="flex gap-3 items-center">
                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-xs text-primary font-semibold cursor-pointer border-none bg-transparent"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setNotificationOpen(false)}
                  className="p-1 rounded-full cursor-pointer text-secondary hover:bg-border transition-colors border-none bg-transparent"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="grow overflow-y-auto p-4">
              {notifications.length === 0 ? (
                <div className="text-center py-10 text-muted">
                  <Bell
                    size={40}
                    className="stroke-1 mb-3 mx-auto"
                  />
                  <p>All caught up! No notifications.</p>
                </div>
              ) : (
                notifications.map((notif: any) => (
                  <div
                    key={notif._id}
                    className={`p-3.5 rounded-[10px] border border-border mb-3 flex flex-col gap-1.5 relative transition-colors duration-150 ${
                      notif.isRead ? "bg-transparent" : "bg-background"
                    }`}
                  >
                    <p className={`text-sm ${notif.isRead ? "font-normal text-secondary" : "font-semibold text-foreground"}`}>
                      {notif.message}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted">
                        {new Date(notif.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {!notif.isRead && (
                        <button
                          onClick={() => markNotificationRead(notif._id)}
                          className="cursor-pointer text-success flex items-center gap-1 text-xs font-semibold border-none bg-transparent"
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
        <main className="grow overflow-y-auto min-w-70 p-5 px-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
