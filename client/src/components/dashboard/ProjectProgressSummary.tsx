import React from "react";
import { Folder } from "lucide-react";
import { ProjectProgress } from "@/types";

interface ProjectProgressSummaryProps {
  progress: ProjectProgress[];
  onProjectClick: (projectId: string) => void;
}

export const ProjectProgressSummary: React.FC<ProjectProgressSummaryProps> = ({
  progress,
  onProjectClick,
}) => {
  return (
    <div className="glass-panel p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-lg text-foreground">Project Execution Progress</h3>
          <p className="text-secondary text-sm">Real-time status metrics of active projects.</p>
        </div>
      </div>
      <div className="flex flex-col gap-5">
        {progress.length > 0 ? (
          progress.map((p) => {
            const pct = p.totalTasks > 0 ? Math.round((p.completedTasks / p.totalTasks) * 100) : 0;
            return (
              <div
                key={p.projectId}
                onClick={() => onProjectClick(p.projectId)}
                className="group cursor-pointer hover:bg-secondary-bg/20 p-2.5 rounded-[10px] transition-colors duration-150"
              >
                <div className="flex justify-between text-sm mb-2 font-medium">
                  <span className="text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5 font-semibold">
                    <Folder size={16} /> {p.name}
                  </span>
                  <span className="text-secondary font-bold">
                    {pct}% ({p.completedTasks}/{p.totalTasks} Tasks)
                  </span>
                </div>
                <div className="h-2.5 bg-border rounded-full overflow-hidden">
                  <div
                    className="gradient-bg h-full rounded-full transition-[width] duration-1000 ease-in-out"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-secondary text-sm text-center py-4">No active projects found.</p>
        )}
      </div>
    </div>
  );
};
