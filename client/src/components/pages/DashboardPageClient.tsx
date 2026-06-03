"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertOctagon,
  TrendingUp,
  Activity,
  Calendar,
  CheckSquare,
  BarChart3,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Loading from "../ui/Loading";
import { KPIs, ProjectProgress, Workload, ChartData } from "@/types";

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

  const priorityDistribution = chartData?.tasksByPriority || [];
  const statusDistribution = chartData?.taskStatusDistribution || [];

  const getStatusBarColor = (status: string) => {
    if (status === "Completed") return "hsl(var(--success))";
    if (status === "Todo") return "hsl(var(--text-muted))";
    return "hsl(var(--primary))";
  };

  const getPriorityBarColor = (priority: string) => {
    if (priority === "High") return "hsl(var(--danger))";
    if (priority === "Medium") return "hsl(var(--warning))";
    if (priority === "Low") return "hsl(var(--success))";
    return "hsl(var(--primary))";
  };

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
      <div
        className="dashboard-grid mb-8"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
      >
        {/* Active Projects */}
        <div className="glass-panel glass-panel-hover p-6">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-secondary">Active Projects</span>
            <div className="p-2 rounded-[10px] bg-primary/10 text-primary">
              <FolderKanban size={20} />
            </div>
          </div>
          <h2 className="text-4xl font-extrabold mt-4 text-foreground">{kpis?.totalProjects || 0}</h2>
          <p className="text-xs text-muted mt-1.5">Projects tracked in pipeline</p>
        </div>

        {/* Total Tasks */}
        <div className="glass-panel glass-panel-hover p-6">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-secondary">Total Task Count</span>
            <div className="p-2 rounded-[10px] bg-accent/10 text-accent">
              <TrendingUp size={20} />
            </div>
          </div>
          <h2 className="text-4xl font-extrabold mt-4 text-foreground">{kpis?.totalTasks || 0}</h2>
          <p className="text-xs text-muted mt-1.5">Across all project boards</p>
        </div>

        {/* Completed Tasks */}
        <div className="glass-panel glass-panel-hover p-6">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-secondary">Completed Tasks</span>
            <div className="p-2 rounded-[10px] bg-success/10 text-success">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <h2 className="text-4xl font-extrabold mt-4 text-foreground">{kpis?.completedTasks || 0}</h2>
          <p className="text-xs text-success font-semibold mt-1.5">
            {kpis?.totalTasks && kpis.totalTasks > 0
              ? Math.round((kpis.completedTasks / kpis.totalTasks) * 100)
              : 0}
            % Completion Rate
          </p>
        </div>

        {/* Overdue */}
        <div
          className={`glass-panel glass-panel-hover p-6 ${
            kpis && kpis.overdueTasks > 0 ? "border-danger/30" : ""
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-secondary">Overdue Warning</span>
            <div
              className={`p-2 rounded-[10px] ${
                kpis && kpis.overdueTasks > 0
                  ? "bg-danger/15 text-danger"
                  : "bg-border text-secondary"
              }`}
            >
              <Clock size={20} />
            </div>
          </div>
          <h2
            className={`text-4xl font-extrabold mt-4 ${
              kpis && kpis.overdueTasks > 0 ? "text-danger" : "text-foreground"
            }`}
          >
            {kpis?.overdueTasks || 0}
          </h2>
          <p className="text-xs text-muted mt-1.5">Tasks requiring attention</p>
        </div>
      </div>

      {/* PROJECTS PROGRESS OVERVIEW */}
      <div className="glass-panel p-7 mb-8">
        <h3 className="text-lg font-bold text-foreground mb-6">Active Projects Pipeline Summary</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
          {progress.length === 0 ? (
            <p className="text-muted text-sm">No active projects tracked yet.</p>
          ) : (
            progress.map((proj) => {
              const pending = proj.totalTasks - proj.completedTasks;
              const isOverdue = proj.deadline && new Date(proj.deadline) < new Date();
              return (
                <div
                  key={proj.projectId}
                  onClick={() => router.push(`/projects/${proj.projectId}`)}
                  className="p-4 rounded-xl bg-secondary-bg/50 border border-border/50 cursor-pointer hover:scale-[1.02] transition-transform duration-200"
                >
                  <div className="flex justify-between mb-3">
                    <h4 className="font-bold text-foreground">{proj.name}</h4>
                    {isOverdue && (
                      <span className="text-[0.7rem] text-danger font-bold flex items-center gap-1">
                        <Clock size={12} /> Overdue
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-foreground font-semibold">
                        {proj.completedTasks}/{proj.totalTasks} Tasks ({proj.completionRate}%)
                      </span>
                      <span className="font-bold text-primary">{pending} Pending</span>
                    </div>
                    <div className="h-2.5 bg-border/30 rounded-full overflow-hidden border border-border/10">
                      <div
                        className="h-full rounded-full transition-[width] duration-1000 ease-in-out shadow-[0_0_10px_hsl(var(--primary)/0.3)]"
                        style={{
                          width: `${proj.completionRate}%`,
                          background:
                            proj.completionRate === 100
                              ? "linear-gradient(90deg, hsl(var(--success)) 0%, hsl(var(--success)/0.8) 100%)"
                              : "linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.8) 100%)",
                        }}
                      />
                    </div>
                  </div>

                  <div className="text-xs text-muted flex items-center gap-1.5">
                    <Calendar size={12} />
                    Due {new Date(proj.deadline).toLocaleDateString()}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* CHARTS ROW */}
      {isAdminOrManager && (
        <div
          className="mb-8"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: "32px",
          }}
        >
          {/* Status Distribution */}
          <div className="glass-panel p-7">
            <h3 className="text-lg font-bold text-foreground mb-6">Task Status Distribution</h3>
            {statusDistribution.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-50 gap-3 text-muted">
                <div className="w-12 h-12 rounded-xl bg-secondary-bg flex items-center justify-center">
                  <CheckSquare size={24} />
                </div>
                <p className="text-sm font-medium">No task state data available yet.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {statusDistribution.map((item) => {
                  const maxCount = Math.max(...statusDistribution.map((i) => i.count)) || 1;
                  const percent = Math.round((item.count / maxCount) * 100);
                  return (
                    <div key={item.status} className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold text-foreground">{item.status}</span>
                        <span className="text-secondary font-bold">
                          {item.count} task{item.count !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-border overflow-hidden">
                        <div
                          className="h-full rounded-full transition-[width] duration-1000 ease-in-out"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: getStatusBarColor(item.status),
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Priority Distribution */}
          <div className="glass-panel p-7">
            <h3 className="text-lg font-bold text-foreground mb-6">Task Priority Breakdown</h3>
            {priorityDistribution.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-50 gap-3 text-muted">
                <div className="w-12 h-12 rounded-xl bg-secondary-bg flex items-center justify-center">
                  <BarChart3 size={24} />
                </div>
                <p className="text-sm font-medium">No task priority data available yet.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {priorityDistribution.map((item) => {
                  const maxCount = Math.max(...priorityDistribution.map((i) => i.count)) || 1;
                  const percent = Math.round((item.count / maxCount) * 100);
                  return (
                    <div key={item.priority} className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold text-foreground">{item.priority} Priority</span>
                        <span className="text-secondary font-bold">
                          {item.count} task{item.count !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-border overflow-hidden">
                        <div
                          className="h-full rounded-full transition-[width] duration-1000 ease-in-out"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: getPriorityBarColor(item.priority),
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

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
        {isAdminOrManager && (
          <div className="glass-panel p-7">
            <h3 className="text-lg font-bold text-foreground mb-6">Member Workload Balance</h3>
            {workloads.length === 0 ? (
              <p className="text-muted text-sm">No active team members with assigned tasks.</p>
            ) : (
              <div className="flex flex-col gap-5">
                {workloads.map((item) => {
                  const rate =
                    item.totalTasks > 0
                      ? Math.round((item.completedTasks / item.totalTasks) * 100)
                      : 0;
                  return (
                    <div
                      key={item.member._id}
                      className="flex items-center gap-4 pb-3.5 border-b border-border/50"
                    >
                      <div className="gradient-bg w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-[0.8rem] shrink-0">
                        {item.member.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <div className="grow">
                        <div className="flex justify-between items-center mb-1.5">
                          <div>
                            <p className="text-sm font-bold text-foreground">{item.member.name}</p>
                            <p className="text-xs text-muted">{item.member.role.replace("_", " ")}</p>
                          </div>
                          <span className="text-xs font-bold text-primary">
                            {item.completedTasks}/{item.totalTasks} ({rate}%)
                          </span>
                        </div>
                        <div className="h-1.5 bg-border rounded-full overflow-hidden">
                          <div
                            className="h-full bg-success rounded-full transition-[width] duration-700"
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Activity Logs */}
        <div className="glass-panel p-7">
          <div className="flex items-center gap-2.5 mb-6">
            <Activity size={20} className="text-primary" />
            <h3 className="text-lg font-bold text-foreground">Timeline Activity Logs</h3>
          </div>
          {activities.length === 0 ? (
            <p className="text-muted text-sm">No recent activity recorded in workspace.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {activities.map((act) => (
                <div key={act._id} className="flex gap-3.5 relative pb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5 shrink-0 shadow-[0_0_0_4px_hsl(var(--primary)/0.1)]" />
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[0.85rem] text-foreground font-[550]">{act.action}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted font-medium">
                        By {act.user?.name || "System"}
                      </span>
                      <span className="text-xs text-muted">•</span>
                      <span className="text-xs text-muted flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(act.createdAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
