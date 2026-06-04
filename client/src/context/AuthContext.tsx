"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
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
  const refreshPromiseRef = useRef<Promise<string> | null>(null);

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

  const handleSessionExpiration = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Clear cookie
    document.cookie =
      "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    setToken(null);
    setUser(null);
    setNotifications([]);
    setUnreadCount(0);
    showToast("Session expired. Please log in again.", "error");
    router.push("/login");

    // Clear refresh token cookies on backend
    fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch((err) => {
      console.warn("Backend logout failed during session expiration:", err);
    });
  };

  const performTokenRefresh = async (): Promise<string> => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to refresh token");
      }

      const data = await res.json();
      if (data.success && data.data && data.data.accessToken) {
        const newAccessToken = data.data.accessToken;

        localStorage.setItem("token", newAccessToken);
        document.cookie = `accessToken=${newAccessToken}; path=/; max-age=604800; SameSite=Lax`;
        setToken(newAccessToken);

        return newAccessToken;
      } else {
        throw new Error("Invalid token refresh response");
      }
    } catch (err) {
      handleSessionExpiration();
      throw err;
    } finally {
      refreshPromiseRef.current = null;
    }
  };

  const makeRequest = async (endpoint: string, options: RequestInit, currentToken: string | null) => {
    const headers = new Headers(options.headers || {});

    if (currentToken) {
      headers.set("Authorization", `Bearer ${currentToken}`);
    }
    if (!(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include",
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
      let errorMessage =
        typeof data === "string"
          ? data
          : data.message || data.error || "Something went wrong";

      if (data.message === "Zod Error" && Array.isArray(data.errorSources)) {
        errorMessage = data.errorSources
          .map((err: any) => `${err.path}: ${err.message}`)
          .join(", ");
      }

      const errorObj = new Error(errorMessage) as any;
      errorObj.status = res.status;
      throw errorObj;
    }
    return data;
  };

  // Standard API request wrapper integrating access tokens
  const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    // 1. If refreshing is currently in progress, wait for the new token
    if (refreshPromiseRef.current) {
      try {
        const newToken = await refreshPromiseRef.current;
        return await makeRequest(endpoint, options, newToken);
      } catch (err) {
        throw err;
      }
    }

    // 2. Make the initial request
    const activeToken = token || localStorage.getItem("token");
    try {
      return await makeRequest(endpoint, options, activeToken);
    } catch (err: any) {
      // 3. If unauthorized (expired token), trigger refresh and retry
      if (
        err.status === 401 ||
        err.message === "Invalid or expired token" ||
        err.message === "No token provided"
      ) {
        // Skip refreshing if this request IS the refresh-token endpoint itself to prevent infinite loop
        if (endpoint === "/auth/refresh-token") {
          throw err;
        }

        // Check if the token was already refreshed by another concurrent request in the meantime
        const latestToken = token || localStorage.getItem("token");
        if (latestToken && latestToken !== activeToken) {
          return await makeRequest(endpoint, options, latestToken);
        }

        if (!refreshPromiseRef.current) {
          refreshPromiseRef.current = performTokenRefresh();
        }

        try {
          const newToken = await refreshPromiseRef.current;
          return await makeRequest(endpoint, options, newToken);
        } catch (refreshErr) {
          throw refreshErr;
        }
      }
      throw err;
    }
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

    // Clear refresh token cookies on backend
    fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch((err) => {
      console.warn("Backend logout failed:", err);
    });
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
