import React from "react";
import { ChartData } from "@/types";

interface DashboardChartsProps {
  chartData: ChartData | null;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ chartData }) => {
  return (
    <div
      className="dashboard-grid mb-8"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}
    >
      {/* Task Status Distribution */}
      <div className="glass-panel p-6">
        <h3 className="font-bold text-lg text-foreground mb-1">Task Status Breakdown</h3>
        <p className="text-secondary text-sm mb-6">Visual distribution of work items.</p>
        <div className="flex flex-col gap-4">
          {chartData?.taskStatusDistribution.map((item) => {
            const colors: Record<string, string> = {
              Todo: "bg-secondary-bg",
              "In Progress": "bg-warning",
              Completed: "bg-success",
            };
            return (
              <div key={item.status} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-3.5 h-3.5 rounded-full ${colors[item.status] || "bg-primary"}`} />
                  <span className="font-semibold text-foreground">{item.status}</span>
                </div>
                <span className="font-bold text-secondary">{item.count} Tasks</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Priority Distribution */}
      <div className="glass-panel p-6">
        <h3 className="font-bold text-lg text-foreground mb-1">Priority Distribution</h3>
        <p className="text-secondary text-sm mb-6">Workload weighting by priority levels.</p>
        <div className="flex flex-col gap-4">
          {chartData?.tasksByPriority.map((item) => {
            const colors: Record<string, string> = {
              High: "bg-danger",
              Medium: "bg-warning",
              Low: "bg-success",
            };
            return (
              <div key={item.priority} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-3.5 h-3.5 rounded-full ${colors[item.priority] || "bg-primary"}`} />
                  <span className="font-semibold text-foreground">{item.priority} Priority</span>
                </div>
                <span className="font-bold text-secondary">{item.count} Tasks</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
