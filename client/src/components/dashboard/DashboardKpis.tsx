import React from "react";
import { FolderKanban, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { KPIs } from "@/types";

interface DashboardKpisProps {
  kpis: KPIs | null;
}

export const DashboardKpis: React.FC<DashboardKpisProps> = ({ kpis }) => {
  return (
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
  );
};
