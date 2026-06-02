import React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";

// This layout automatically wraps all routes in the (dashboard) group
// with the sidebar + header shell. Individual pages only render their content.
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
