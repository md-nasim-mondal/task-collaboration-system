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
  onLinkClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, onLinkClick }) => {
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
      roles: ["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"],
    },
    {
      name: "Projects",
      href: "/projects",
      icon: <FolderKanban size={20} />,
      roles: ["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"],
    },
    {
      name: "Tasks Center",
      href: "/tasks",
      icon: <CheckSquare size={20} />,
      roles: ["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"],
    },
    {
      name: "Team Members",
      href: "/members",
      icon: <Users size={20} />,
      roles: ["ADMIN", "PROJECT_MANAGER"],
    },
  ];

  const filteredLinks = navLinks.filter(
    (link) => !link.roles || link.roles.includes(user?.role || ""),
  );

  return (
    <aside
      className={`glass-panel flex flex-col h-full rounded-none! border-y-0 border-l-0 border-r border-border m-0 z-100 transition-[width] duration-300 bg-secondary-bg ${
        sidebarOpen ? "w-65" : "w-20"
      }`}
    >
      {/* Logo and Brand */}
      <div className="flex items-center gap-3.5 p-6 border-b border-border">
        <div className="gradient-bg w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-[0_4px_12px_hsl(var(--primary)/0.3)] shrink-0">
          <span className="text-xl font-black">C</span>
        </div>
        {sidebarOpen && (
          <span className="gradient-text font-display text-xl font-extrabold tracking-tight">
            CollabSphere
          </span>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-2 p-4 grow">
        {filteredLinks.map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <button
              key={link.href}
              onClick={() => {
                router.push(link.href);
                if (onLinkClick) onLinkClick();
              }}
              className={`flex items-center gap-3.5 p-3 px-4 rounded-[10px] cursor-pointer w-full text-left transition-all duration-200 border-none outline-none ${
                active
                  ? "text-primary bg-primary/8 font-semibold"
                  : "text-secondary font-medium hover:text-primary hover:bg-primary/5"
              }`}
            >
              <div className="shrink-0">{link.icon}</div>
              {sidebarOpen && <span className="text-[0.95rem]">{link.name}</span>}
            </button>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-border mt-auto">
        <div
          className={`flex items-center gap-3 p-2 rounded-xl bg-background/50 ${
            sidebarOpen ? "justify-between" : "justify-center"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="gradient-bg w-9 h-9 rounded-[10px] flex items-center justify-center text-white font-bold text-[0.85rem]">
              {getInitials(user?.name || "User")}
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-[0.85rem] font-bold truncate text-foreground">
                  {user?.name}
                </p>
                <p className="text-[0.7rem] text-muted uppercase tracking-wider font-semibold">
                  {user?.role?.replace("_", " ")}
                </p>
              </div>
            )}
          </div>

          {sidebarOpen && (
            <button
              onClick={logout}
              className="p-2 rounded-lg text-danger cursor-pointer border-none bg-transparent hover:bg-danger/10 transition-all duration-200"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
