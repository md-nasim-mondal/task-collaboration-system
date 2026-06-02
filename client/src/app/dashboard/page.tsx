import React from "react";
import DashboardPageClient from "@/components/pages/DashboardPageClient";
import { serverFetch } from "@/utils/serverFetch";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CollabSphere | Analytics Dashboard",
  description: "View real-time workspace metrics, team workload charts, system warning alerts, and active project pipelines.",
};

export default async function DashboardPage() {
  let initialKpis = null;
  let initialProgress = [];
  let initialWorkloads = [];
  let initialChartData = null;
  let initialActivities = [];

  try {
    const [kpiRes, progRes, workRes, chartRes, actRes] = await Promise.all([
      serverFetch("/dashboard/kpis").catch(() => null),
      serverFetch("/dashboard/project-progress").catch(() => ({ success: true, data: [] })),
      serverFetch("/dashboard/workload").catch(() => ({ success: true, data: [] })),
      serverFetch("/dashboard/charts").catch(() => null),
      serverFetch("/activity-logs").catch(() => ({ success: true, data: [] })),
    ]);

    if (kpiRes && kpiRes.success) initialKpis = kpiRes.data;
    if (progRes && progRes.success) initialProgress = progRes.data;
    if (workRes && workRes.success) initialWorkloads = workRes.data;
    if (chartRes && chartRes.success) initialChartData = chartRes.data;
    if (actRes && actRes.success) initialActivities = actRes.data;
  } catch (err) {
    console.error("Dashboard server-side prefetch failed:", err);
  }

  // Cast to any to bypass stale Next.js App Router type cache
  const ClientComponent = DashboardPageClient as any;

  return (
    <ClientComponent
      initialKpis={initialKpis}
      initialProgress={initialProgress}
      initialWorkloads={initialWorkloads}
      initialChartData={initialChartData}
      initialActivities={initialActivities}
    />
  );
}
