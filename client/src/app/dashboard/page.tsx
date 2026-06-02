import React from "react";
import DashboardPageClient from "./DashboardPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CollabSphere | Workspace Dashboard",
  description: "Monitor your team's workload balance, project execution KPIs, and task warnings on the CollabSphere dashboard.",
};

export default function DashboardPage() {
  return <DashboardPageClient />;
}
