"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "PROJECT_MANAGER" | "TEAM_MEMBER";
  picture?: string;
  phone?: string;
  address?: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  toasts: ToastMessage[];
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  removeToast: (id: string) => void;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (
    name: string,
    email: string,
    password: string,
    phone?: string,
  ) => Promise<boolean>;
  demoLogin: (
    role: "ADMIN" | "PROJECT_MANAGER" | "TEAM_MEMBER",
  ) => Promise<boolean>;
  logout: () => void;
  apiFetch: (endpoint: string, options?: RequestInit) => Promise<any>;
  notifications: any[];
  unreadNotificationsCount: number;
  fetchNotifications: () => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const router = useRouter();

  // Toast Helpers
  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success",
  ) => {
    if (type === "success") {
      toast.success(message);
    } else if (type === "error") {
      toast.error(message);
    } else {
      toast(message);
    }
  };

  const removeToast = (id: string) => {
    // Legacy support, react-hot-toast handles auto-remove
  };

  // Fetch token and user on startup
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Fetch notifications regularly when logged in
  useEffect(() => {
    if (token) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // poll every 30s
      return () => clearInterval(interval);
    }
  }, [token]);

  // Standard API request wrapper integrating access tokens
  const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const activeToken = token || localStorage.getItem("token");
    const headers = new Headers(options.headers || {});

    if (activeToken) {
      headers.set("Authorization", `Bearer ${activeToken}`);
    }
    if (!(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    let data;
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      try {
        data = await res.json();
      } catch (e) {
        const text = await res.text();
        data = { message: text || `HTTP Error ${res.status}` };
      }
    } else {
      const text = await res.text();
      data = { message: text || `HTTP Error ${res.status}` };
    }

    if (!res.ok) {
      // Handle the case where the message might be the error string itself
      let errorMessage =
        typeof data === "string"
          ? data
          : data.message || data.error || "Something went wrong";

      // If it's a Zod Error, try to extract more details
      if (data.message === "Zod Error" && Array.isArray(data.errorSources)) {
        errorMessage = data.errorSources
          .map((err: any) => `${err.path}: ${err.message}`)
          .join(", ");
      }

      throw new Error(errorMessage);
    }
    return data;
  };

  const fetchNotifications = async () => {
    try {
      const data = await apiFetch("/notifications");
      if (data.success) {
        setNotifications(data.data);
        const unread = data.data.filter((n: any) => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      showToast("Notification marked as read", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await apiFetch("/notifications/read-all", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      showToast("All notifications marked as read", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (data.success) {
        const payload = data.data;
        const accessToken = payload.accessToken;
        const loggedUser: User = {
          id: payload.user._id,
          name: payload.user.name,
          email: payload.user.email,
          role: payload.user.role,
          picture: payload.user.picture,
          phone: payload.user.phone,
          address: payload.user.address,
        };

        localStorage.setItem("token", accessToken);
        localStorage.setItem("user", JSON.stringify(loggedUser));

        // Set cookie for Next.js Server Components and Server Actions
        document.cookie = `accessToken=${accessToken}; path=/; max-age=604800; SameSite=Lax`;

        setToken(accessToken);
        setUser(loggedUser);

        showToast(`Welcome back, ${loggedUser.name}!`, "success");
        router.push("/dashboard");
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(err.message || "Failed to log in", "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    phone?: string,
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      const data = await apiFetch("/user/create-user", {
        method: "POST",
        body: JSON.stringify({ name, email, password, phone }),
      });

      if (data.success) {
        showToast("Registration successful! Please log in.", "success");
        router.push("/login");
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(err.message || "Failed to register", "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (
    role: "ADMIN" | "PROJECT_MANAGER" | "TEAM_MEMBER",
  ): Promise<boolean> => {
    let email = "admin@example.com";
    if (role === "PROJECT_MANAGER") email = "pm@example.com";
    if (role === "TEAM_MEMBER") email = "member@example.com";

    showToast(`Logging in as Demo ${role.replace("_", " ")}...`, "info");
    return await login(email, "Password123!");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Clear cookie
    document.cookie =
      "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    setToken(null);
    setUser(null);
    setNotifications([]);
    setUnreadCount(0);
    showToast("Logged out successfully", "info");
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        toasts,
        showToast,
        removeToast,
        login,
        signup,
        demoLogin,
        logout,
        apiFetch,
        notifications,
        unreadNotificationsCount: unreadCount,
        fetchNotifications,
        markAllNotificationsRead,
        markNotificationRead,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
