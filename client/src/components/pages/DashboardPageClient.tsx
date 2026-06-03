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
import Loading from "../Loading";

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

  const isAdminOrManager =
    user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER";

  const [kpis, setKpis] = useState<KPIs | null>(initialKpis);
  const [progress, setProgress] = useState<ProjectProgress[]>(
    initialProgress || [],
  );
  const [workloads, setWorkloads] = useState<Workload[]>(
    initialWorkloads || [],
  );
  const [chartData, setChartData] = useState<ChartData | null>(
    initialChartData,
  );
  const [activities, setActivities] = useState<any[]>(initialActivities || []);
  const [loading, setLoading] = useState(!initialKpis);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (initialKpis) {
      return;
    }

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
        showToast(
          err.message || "Failed to load dashboard statistics",
          "error",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [initialKpis]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          height: "60vh",
          alignItems: "center",
          justifyContent: "center",
        }}>
        <Loading text='Analyzing workspace data...' />
      </div>
    );
  }

  // Fallback defaults if charts are empty
  const priorityDistribution = chartData?.tasksByPriority || [];
  const statusDistribution = chartData?.taskStatusDistribution || [];

  return (
    <div style={{ animation: "fadeIn var(--transition-normal) forwards" }}>
      {/* Header Title */}
      <div style={{ marginBottom: "32px", padding: isMobile ? "0 4px" : "0" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: isMobile ? "1.5rem" : "2rem",
            fontWeight: 800,
          }}>
          Welcome back, {user?.name?.split(" ")[0] || "User"}!
        </h1>
        <p
          style={{
            color: "hsl(var(--text-secondary))",
            marginTop: "4px",
            fontSize: isMobile ? "0.85rem" : "1rem",
          }}>
          {isAdminOrManager
            ? "Real-time project analytics, team workloads, and pending alerts."
            : "Here's an overview of your assigned tasks and project progress."}
        </p>
      </div>

      {/* OVERDUE ALERT CARD BANNER */}
      {kpis && kpis.overdueTasks > 0 && (
        <div
          className='glass-panel'
          style={{
            backgroundColor: "hsl(var(--danger) / 0.04)",
            borderColor: "hsl(var(--danger) / 0.3)",
            padding: "16px 24px",
            marginBottom: "32px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "hsl(var(--danger) / 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "hsl(var(--danger))",
            }}>
            <AlertOctagon size={22} />
          </div>
          <div>
            <h4
              style={{
                fontWeight: 700,
                color: "hsl(var(--text-primary))",
                fontSize: "0.95rem",
              }}>
              System Warning: {kpis.overdueTasks} Overdue Task
              {kpis.overdueTasks > 1 ? "s" : ""} Detected!
            </h4>
            <p
              style={{
                color: "hsl(var(--text-secondary))",
                fontSize: "0.85rem",
                marginTop: "2px",
              }}>
              Some active tasks have passed their scheduled due dates. Please
              review assignments and adjust priorities.
            </p>
          </div>
        </div>
      )}

      {/* KPI CARDS GRID */}
      <div
        className='dashboard-grid'
        style={{
          marginBottom: "32px",
          gridTemplateColumns: isMobile
            ? "repeat(auto-fit, minmax(200px, 1fr))"
            : "repeat(auto-fit, minmax(240px, 1fr))",
        }}>
        {/* Card 1 */}
        <div
          className='glass-panel glass-panel-hover'
          style={{ padding: "24px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "hsl(var(--text-secondary))",
              }}>
              Active Projects
            </span>
            <div
              style={{
                padding: "8px",
                borderRadius: "10px",
                backgroundColor: "hsl(var(--primary) / 0.1)",
                color: "hsl(var(--primary))",
              }}>
              <FolderKanban size={20} />
            </div>
          </div>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, marginTop: "16px" }}>
            {kpis?.totalProjects || 0}
          </h2>
          <p
            style={{
              fontSize: "0.75rem",
              color: "hsl(var(--text-muted))",
              marginTop: "6px",
            }}>
            Projects tracked in pipeline
          </p>
        </div>

        {/* Card 2 */}
        <div
          className='glass-panel glass-panel-hover'
          style={{ padding: "24px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "hsl(var(--text-secondary))",
              }}>
              Total Task Count
            </span>
            <div
              style={{
                padding: "8px",
                borderRadius: "10px",
                backgroundColor: "hsl(var(--accent) / 0.1)",
                color: "hsl(var(--accent))",
              }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, marginTop: "16px" }}>
            {kpis?.totalTasks || 0}
          </h2>
          <p
            style={{
              fontSize: "0.75rem",
              color: "hsl(var(--text-muted))",
              marginTop: "6px",
            }}>
            Across all project boards
          </p>
        </div>

        {/* Card 3 */}
        <div
          className='glass-panel glass-panel-hover'
          style={{ padding: "24px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "hsl(var(--text-secondary))",
              }}>
              Completed Tasks
            </span>
            <div
              style={{
                padding: "8px",
                borderRadius: "10px",
                backgroundColor: "hsl(var(--success) / 0.1)",
                color: "hsl(var(--success))",
              }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, marginTop: "16px" }}>
            {kpis?.completedTasks || 0}
          </h2>
          <p
            style={{
              fontSize: "0.75rem",
              color: "hsl(var(--success))",
              fontWeight: 600,
              marginTop: "6px",
            }}>
            {kpis?.totalTasks && kpis.totalTasks > 0
              ? Math.round((kpis.completedTasks / kpis.totalTasks) * 100)
              : 0}
            % Completion Rate
          </p>
        </div>

        {/* Card 4 */}
        <div
          className='glass-panel glass-panel-hover'
          style={{
            padding: "24px",
            border:
              kpis && kpis.overdueTasks > 0
                ? "1px solid hsl(var(--danger) / 0.3)"
                : undefined,
          }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "hsl(var(--text-secondary))",
              }}>
              Overdue Warning
            </span>
            <div
              style={{
                padding: "8px",
                borderRadius: "10px",
                backgroundColor:
                  kpis && kpis.overdueTasks > 0
                    ? "hsl(var(--danger) / 0.15)"
                    : "hsl(var(--border-color))",
                color:
                  kpis && kpis.overdueTasks > 0
                    ? "hsl(var(--danger))"
                    : "hsl(var(--text-secondary))",
              }}>
              <Clock size={20} />
            </div>
          </div>
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              marginTop: "16px",
              color:
                kpis && kpis.overdueTasks > 0
                  ? "hsl(var(--danger))"
                  : "inherit",
            }}>
            {kpis?.overdueTasks || 0}
          </h2>
          <p
            style={{
              fontSize: "0.75rem",
              color: "hsl(var(--text-muted))",
              marginTop: "6px",
            }}>
            Tasks requiring attention
          </p>
        </div>
      </div>

      {/* PROJECTS PROGRESS OVERVIEW */}
      <div
        className='glass-panel'
        style={{ padding: "30px", marginBottom: "32px" }}>
        <h3
          style={{
            fontSize: "1.125rem",
            fontWeight: 700,
            marginBottom: "24px",
          }}>
          Active Projects Pipeline Summary
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "24px",
          }}>
          {progress.length === 0 ? (
            <p
              style={{ color: "hsl(var(--text-muted))", fontSize: "0.875rem" }}>
              No active projects tracked yet.
            </p>
          ) : (
            progress.map((proj) => {
              const pending = proj.totalTasks - proj.completedTasks;
              const isOverdue =
                proj.deadline && new Date(proj.deadline) < new Date();
              return (
                <div
                  key={proj.projectId}
                  onClick={() => router.push(`/projects/${proj.projectId}`)}
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    backgroundColor: "hsl(var(--bg-secondary) / 0.5)",
                    border: "1px solid hsl(var(--border-color) / 0.5)",
                    cursor: "pointer",
                    transition: "transform 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "scale(1.02)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "12px",
                    }}>
                    <h4 style={{ fontWeight: 700, fontSize: "1rem" }}>
                      {proj.name}
                    </h4>
                    {isOverdue && (
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: "hsl(var(--danger))",
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}>
                        <Clock size={12} /> Overdue
                      </span>
                    )}
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.85rem",
                        marginBottom: "8px",
                      }}>
                      <span
                        style={{
                          color: "hsl(var(--text-primary))",
                          fontWeight: 600,
                        }}>
                        {proj.completedTasks}/{proj.totalTasks} Tasks (
                        {proj.completionRate}%)
                      </span>
                      <span
                        style={{
                          fontWeight: 700,
                          color: "hsl(var(--primary))",
                        }}>
                        {pending} Pending
                      </span>
                    </div>
                    <div
                      style={{
                        height: "10px",
                        backgroundColor: "hsl(var(--border-color) / 0.3)",
                        borderRadius: "5px",
                        overflow: "hidden",
                        border: "1px solid hsl(var(--border-color) / 0.1)",
                      }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${proj.completionRate}%`,
                          background:
                            proj.completionRate === 100
                              ? "linear-gradient(90deg, hsl(var(--success)) 0%, hsl(var(--success) / 0.8) 100%)"
                              : "linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)",
                          borderRadius: "5px",
                          boxShadow: "0 0 10px hsl(var(--primary) / 0.3)",
                          transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "hsl(var(--text-muted))",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}>
                    <Calendar size={12} />
                    Due {new Date(proj.deadline).toLocaleDateString()}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* TWO-COLUMN GRAPH & CHARTS ROW */}
      {isAdminOrManager && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "1fr"
              : "repeat(auto-fit, minmax(400px, 1fr))",
            gap: "32px",
            marginBottom: "32px",
          }}>
          {/* Status Distribution Custom SVG Chart */}
          <div className='glass-panel' style={{ padding: "30px" }}>
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: 700,
                marginBottom: "24px",
              }}>
              Task Status Distribution
            </h3>
            {statusDistribution.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "200px",
                  gap: "12px",
                  color: "hsl(var(--text-muted))",
                }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    backgroundColor: "hsl(var(--bg-secondary))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                  <CheckSquare size={24} />
                </div>
                <p style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                  No task state data available yet.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                }}>
                {statusDistribution.map((item) => {
                  const maxCount =
                    Math.max(...statusDistribution.map((i) => i.count)) || 1;
                  const percent = Math.round((item.count / maxCount) * 100);
                  let barColor = "hsl(var(--primary))";
                  if (item.status === "Completed")
                    barColor = "hsl(var(--success))";
                  if (item.status === "Todo")
                    barColor = "hsl(var(--text-muted))";

                  return (
                    <div
                      key={item.status}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "0.85rem",
                        }}>
                        <span style={{ fontWeight: 600 }}>{item.status}</span>
                        <span
                          style={{
                            color: "hsl(var(--text-secondary))",
                            fontWeight: 700,
                          }}>
                          {item.count} task{item.count !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div
                        style={{
                          height: "10px",
                          width: "100%",
                          borderRadius: "5px",
                          backgroundColor: "hsl(var(--border-color))",
                          overflow: "hidden",
                        }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${percent}%`,
                            borderRadius: "5px",
                            backgroundColor: barColor,
                            transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Priority Distribution Custom SVG Chart */}
          <div className='glass-panel' style={{ padding: "30px" }}>
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: 700,
                marginBottom: "24px",
              }}>
              Task Priority Breakdown
            </h3>
            {priorityDistribution.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "200px",
                  gap: "12px",
                  color: "hsl(var(--text-muted))",
                }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    backgroundColor: "hsl(var(--bg-secondary))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                  <BarChart3 size={24} />
                </div>
                <p style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                  No task priority data available yet.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                }}>
                {priorityDistribution.map((item) => {
                  const maxCount =
                    Math.max(...priorityDistribution.map((i) => i.count)) || 1;
                  const percent = Math.round((item.count / maxCount) * 100);
                  let barColor = "hsl(var(--primary))";
                  if (item.priority === "High") barColor = "hsl(var(--danger))";
                  if (item.priority === "Medium")
                    barColor = "hsl(var(--warning))";
                  if (item.priority === "Low") barColor = "hsl(var(--success))";

                  return (
                    <div
                      key={item.priority}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "0.85rem",
                        }}>
                        <span style={{ fontWeight: 600 }}>
                          {item.priority} Priority
                        </span>
                        <span
                          style={{
                            color: "hsl(var(--text-secondary))",
                            fontWeight: 700,
                          }}>
                          {item.count} task{item.count !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div
                        style={{
                          height: "10px",
                          width: "100%",
                          borderRadius: "5px",
                          backgroundColor: "hsl(var(--border-color))",
                          overflow: "hidden",
                        }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${percent}%`,
                            borderRadius: "5px",
                            backgroundColor: barColor,
                            transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
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

      {/* WORKLOAD & ACTIVITIES ROW */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "1fr"
            : isAdminOrManager
              ? "repeat(auto-fit, minmax(400px, 1fr))"
              : "1fr",
          gap: "32px",
        }}>
        {/* Member Workload Summary - Only for Admin/Manager */}
        {isAdminOrManager && (
          <div className='glass-panel' style={{ padding: "30px" }}>
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: 700,
                marginBottom: "24px",
              }}>
              Member Workload Balance
            </h3>
            {workloads.length === 0 ? (
              <p
                style={{
                  color: "hsl(var(--text-muted))",
                  fontSize: "0.875rem",
                }}>
                No active team members with assigned tasks.
              </p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}>
                {workloads.map((item) => {
                  const rate =
                    item.totalTasks > 0
                      ? Math.round(
                          (item.completedTasks / item.totalTasks) * 100,
                        )
                      : 0;
                  return (
                    <div
                      key={item.member._id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        paddingBottom: "14px",
                        borderBottom:
                          "1px solid hsl(var(--border-color) / 0.5)",
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
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "0.8rem",
                          flexShrink: 0,
                        }}>
                        {item.member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                      <div style={{ flexGrow: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "6px",
                          }}>
                          <div>
                            <p
                              style={{ fontSize: "0.875rem", fontWeight: 700 }}>
                              {item.member.name}
                            </p>
                            <p
                              style={{
                                fontSize: "0.75rem",
                                color: "hsl(var(--text-muted))",
                              }}>
                              {item.member.role.replace("_", " ")}
                            </p>
                          </div>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              color: "hsl(var(--primary))",
                            }}>
                            {item.completedTasks}/{item.totalTasks} Tasks (
                            {rate}%)
                          </span>
                        </div>
                        <div
                          style={{
                            height: "6px",
                            backgroundColor: "hsl(var(--border-color))",
                            borderRadius: "3px",
                            overflow: "hidden",
                          }}>
                          <div
                            style={{
                              height: "100%",
                              width: `${rate}%`,
                              backgroundColor: "hsl(var(--success))",
                              borderRadius: "3px",
                            }}
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

        {/* Recent System Activity Logs */}
        <div className='glass-panel' style={{ padding: "30px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "24px",
            }}>
            <Activity size={20} style={{ color: "hsl(var(--primary))" }} />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700 }}>
              Timeline Activity Logs
            </h3>
          </div>
          {activities.length === 0 ? (
            <p
              style={{
                color: "hsl(var(--text-muted))",
                fontSize: "0.875rem",
              }}>
              No recent activity recorded in workspace.
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "18px",
              }}>
              {activities.map((act) => (
                <div
                  key={act._id}
                  style={{
                    display: "flex",
                    gap: "14px",
                    position: "relative",
                    paddingBottom: "4px",
                  }}>
                  {/* Circle icon */}
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: "hsl(var(--primary))",
                      marginTop: "5px",
                      flexShrink: 0,
                      boxShadow: "0 0 0 4px hsl(var(--primary) / 0.1)",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                    }}>
                    <p
                      style={{
                        fontSize: "0.85rem",
                        color: "hsl(var(--text-primary))",
                        fontWeight: 550,
                      }}>
                      {act.action}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "hsl(var(--text-muted))",
                          fontWeight: 500,
                        }}>
                        By {act.user?.name || "System"}
                      </span>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "hsl(var(--text-muted))",
                        }}>
                        •
                      </span>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "hsl(var(--text-muted))",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}>
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
