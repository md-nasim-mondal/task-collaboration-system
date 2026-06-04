import React from "react";
import { Task } from "@/types";
import { TaskCard } from "./TaskCard";

interface ProjectTaskColumnProps {
  title: string;
  tasks: Task[];
  countClass: string;
  emptyLabel: string;
  isManager?: boolean;
  onDelete?: (id: string) => void;
}

export const ProjectTaskColumn: React.FC<ProjectTaskColumnProps> = ({
  title,
  tasks,
  countClass,
  emptyLabel,
  isManager,
  onDelete,
}) => {
  return (
    <div className="glass-panel p-5 bg-secondary-bg/40">
      <div className="flex justify-between mb-4">
        <h4 className="font-bold text-[0.95rem] text-foreground">{title}</h4>
        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${countClass}`}>
          {tasks.length}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {tasks.map((t) => (
          <TaskCard key={t._id} task={t} isManager={isManager} onDelete={onDelete} />
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-5 text-muted text-xs">{emptyLabel}</div>
        )}
      </div>
    </div>
  );
};
