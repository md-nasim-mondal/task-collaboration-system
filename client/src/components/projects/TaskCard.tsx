import React from "react";
import { useRouter } from "next/navigation";
import { Clock, Trash2 } from "lucide-react";
import { Task } from "@/types";

interface TaskCardProps {
  task: Task;
  isManager?: boolean;
  onDelete?: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, isManager, onDelete }) => {
  const router = useRouter();
  const overdue = new Date(task.dueDate) < new Date() && task.status !== "Completed";

  return (
    <div
      className={`glass-panel p-4 cursor-pointer flex flex-col gap-3 bg-secondary-bg shadow-sm hover:-translate-y-px hover:border-primary/15 transition-all duration-200 ${
        overdue ? "border-danger/30" : ""
      }`}
      onClick={() => router.push("/tasks")}
    >
      <div>
        <div className="flex justify-between items-start gap-2">
          <h5 className="font-bold text-sm text-foreground mb-1 flex-1">{task.title}</h5>
          {isManager && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task._id);
              }}
              className="p-1 rounded-md text-muted hover:text-danger hover:bg-danger/10 transition-colors duration-200 border-none bg-transparent cursor-pointer flex items-center justify-center"
              title="Delete Task"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
        {task.description && (
          <p className="text-xs text-secondary leading-snug line-clamp-2 mt-1">{task.description}</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center border-t border-border/40 pt-3">
        <div className="flex gap-2 items-center">
          <span className={`badge badge-${task.priority.toLowerCase()} py-0.5! px-1.5! text-[0.65rem]!`}>
            {task.priority}
          </span>
          <span className={`text-[0.675rem] flex items-center gap-0.5 font-medium ${overdue ? "text-danger font-bold" : "text-muted"}`}>
            <Clock size={10} />
            {new Date(task.dueDate).toLocaleDateString([], { month: "short", day: "numeric" })}
          </span>
        </div>

        {task.assignedMember ? (
          <div
            className="gradient-bg w-6 h-6 rounded-full flex items-center justify-center text-white text-[0.65rem] font-bold cursor-help"
            title={`Assigned to: ${task.assignedMember.name}`}
          >
            {task.assignedMember.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full bg-border text-muted flex items-center justify-center text-[0.65rem] font-medium" title="Unassigned">
            U
          </div>
        )}
      </div>
    </div>
  );
};
