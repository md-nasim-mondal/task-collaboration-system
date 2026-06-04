"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { AlertOctagon } from "lucide-react";
import { useRouter } from "next/navigation";
import Loading from "@/components/ui/Loading";
import { KPIs, ProjectProgress, Workload, ChartData } from "@/types";
import { DashboardKpis } from "@/components/dashboard/DashboardKpis";
import { ProjectProgressSummary } from "@/components/dashboard/ProjectProgressSummary";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { MemberWorkloadBalance } from "@/components/dashboard/MemberWorkloadBalance";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";

export default function DashboardPageClient({
  initialKpis,
  initialProgress,
  initialWorkloads,
  initialChartData,
  initialActivities,
}: {
  initialKpis: KPIs | null;
  initialProgress: ProjectProgress[];
  initialWorkloads: Workload[];
  initialChartData: ChartData | null;
  initialActivities: any[];
}) {
  const { user, apiFetch, showToast } = useAuth();
  const router = useRouter();

  const isAdminOrManager = user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER";

  const [kpis, setKpis] = useState<KPIs | null>(initialKpis);
  const [progress, setProgress] = useState<ProjectProgress[]>(initialProgress || []);
  const [workloads, setWorkloads] = useState<Workload[]>(initialWorkloads || []);
  const [chartData, setChartData] = useState<ChartData | null>(initialChartData);
  const [activities, setActivities] = useState<any[]>(initialActivities || []);
  const [loading, setLoading] = useState(!initialKpis);

  useEffect(() => {
    if (initialKpis) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [kpiRes, progRes, workRes, chartRes, actRes] = await Promise.all([
          apiFetch("/dashboard/kpis"),
          apiFetch("/dashboard/project-progress"),
          apiFetch("/dashboard/workload"),
          apiFetch("/dashboard/charts"),
          apiFetch("/activity-logs"),
        ]);

        if (kpiRes.success) setKpis(kpiRes.data);
        if (progRes.success) setProgress(progRes.data);
        if (workRes.success) setWorkloads(workRes.data);
        if (chartRes.success) setChartData(chartRes.data);
        if (actRes.success) setActivities(actRes.data);
      } catch (err: any) {
        showToast(err.message || "Failed to load dashboard statistics", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [initialKpis]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loading text="Analyzing workspace data..." />
      </div>
    );
  }

  return (
    <div className="animate-[fadeIn_var(--transition-normal)_forwards]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-extrabold text-foreground">
          Welcome back, {user?.name?.split(" ")[0] || "User"}!
        </h1>
        <p className="text-secondary mt-1 text-sm md:text-base">
          {isAdminOrManager
            ? "Real-time project analytics, team workloads, and pending alerts."
            : "Here's an overview of your assigned tasks and project progress."}
        </p>
      </div>

      {/* OVERDUE ALERT BANNER */}
      {kpis && kpis.overdueTasks > 0 && (
        <div className="glass-panel bg-danger/4 border-danger/30 p-4 px-6 mb-8 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-danger/15 flex items-center justify-center text-danger shrink-0">
            <AlertOctagon size={22} />
          </div>
          <div>
            <h4 className="font-bold text-foreground text-[0.95rem]">
              System Warning: {kpis.overdueTasks} Overdue Task
              {kpis.overdueTasks > 1 ? "s" : ""} Detected!
            </h4>
            <p className="text-secondary text-sm mt-0.5">
              Some active tasks have passed their scheduled due dates. Please review
              assignments and adjust priorities.
            </p>
          </div>
        </div>
      )}

      {/* KPI CARDS */}
      <DashboardKpis kpis={kpis} />

      {/* PROJECTS PROGRESS OVERVIEW */}
      <ProjectProgressSummary
        progress={progress}
        onProjectClick={(projectId) => router.push(`/projects/${projectId}`)}
      />

      {/* CHARTS ROW */}
      {isAdminOrManager && <DashboardCharts chartData={chartData} />}

      {/* WORKLOAD & ACTIVITY ROW */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isAdminOrManager
            ? "repeat(auto-fit, minmax(400px, 1fr))"
            : "1fr",
          gap: "32px",
        }}
      >
        {/* Member Workload */}
        {isAdminOrManager && <MemberWorkloadBalance workloads={workloads} />}

        {/* Activity Logs */}
        <ActivityTimeline activities={activities} />
      </div>
    </div>
  );
}
