import React from "react";
import { MessageSquare, Paperclip, Folder, Calendar } from "lucide-react";
import { Task } from "@/types";

interface TasksTableProps {
  tasks: Task[];
  isMobile: boolean;
  isManager: boolean;
  userId?: string;
  onOpenTask: (task: Task) => void;
  onQuickStatusUpdate: (taskId: string, newStatus: string) => void;
}

export const TasksTable: React.FC<TasksTableProps> = ({
  tasks,
  isMobile,
  isManager,
  userId,
  onOpenTask,
  onQuickStatusUpdate,
}) => {
  return (
    <div className="glass-panel overflow-hidden">
      <div className="overflow-x-auto border-none">
        <table
          className="w-full text-left"
          style={{ minWidth: isMobile ? "600px" : "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr className="border-b border-border bg-secondary-bg/50 text-xs font-bold text-secondary uppercase tracking-wider">
              <th className="p-4 px-5">Task Title</th>
              <th className="p-4 px-5">Project</th>
              <th className="p-4 px-5">Assignee</th>
              <th className="p-4 px-5">Priority</th>
              <th className="p-4 px-5">Due Date</th>
              <th className="p-4 px-5">Status</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const overdue = new Date(task.dueDate) < new Date() && task.status !== "Completed";
              const isAssignedToCurrentUser = task.assignedMember?._id === userId;
              const canUpdateStatus = isManager || isAssignedToCurrentUser;

              return (
                <tr
                  key={task._id}
                  onClick={() => onOpenTask(task)}
                  className="border-b border-border/40 cursor-pointer text-[0.875rem] transition-colors duration-150 hover:bg-primary/3"
                >
                  {/* Title */}
                  <td className="p-4 px-5 font-semibold text-foreground">
                    <div className="flex flex-col gap-0.5">
                      <span>{task.title}</span>
                      <div className="flex gap-2.5 items-center mt-1">
                        {task.comments?.length > 0 && (
                          <span className="text-[0.7rem] text-muted flex items-center gap-0.5">
                            <MessageSquare size={12} /> {task.comments.length}
                          </span>
                        )}
                        {task.attachments?.length > 0 && (
                          <span className="text-[0.7rem] text-muted flex items-center gap-0.5">
                            <Paperclip size={12} /> {task.attachments.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Project */}
                  <td className="p-4 px-5 text-secondary">
                    <span className="inline-flex items-center gap-1">
                      <Folder size={14} /> {task.project?.name || "Workspace"}
                    </span>
                  </td>

                  {/* Assignee */}
                  <td className="p-4 px-5">
                    {task.assignedMember ? (
                      <div className="flex items-center gap-2">
                        <div className="gradient-bg w-6 h-6 rounded-full flex items-center justify-center text-white text-[0.65rem] font-bold">
                          {task.assignedMember.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                        <span className="text-[0.8rem] font-medium text-foreground">
                          {task.assignedMember.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted text-[0.8rem]">Unassigned</span>
                    )}
                  </td>

                  {/* Priority */}
                  <td className="p-4 px-5">
                    <span className={`badge badge-${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                  </td>

                  {/* Due Date */}
                  <td className={`p-4 px-5 ${overdue ? "text-danger font-bold" : "text-secondary"}`}>
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar size={14} />
                      {new Date(task.dueDate).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}
                      {overdue && " (Overdue)"}
                    </span>
                  </td>

                  {/* Status Quick-Select */}
                  <td className="p-4 px-5" onClick={(e) => e.stopPropagation()}>
                    <select
                      disabled={!canUpdateStatus}
                      value={task.status}
                      onChange={(e) => onQuickStatusUpdate(task._id, e.target.value)}
                      className={`p-1.5 px-2.5 rounded-md border border-border text-xs font-semibold outline-none transition-all duration-200 ${
                        task.status === "Completed"
                          ? "bg-success/10 text-success"
                          : task.status === "In Progress"
                            ? "bg-warning/10 text-warning"
                            : "bg-secondary-bg text-foreground"
                      } ${canUpdateStatus ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}
                    >
                      <option value="Todo" className="bg-secondary-bg text-foreground">
                        Todo
                      </option>
                      <option value="In Progress" className="bg-secondary-bg text-foreground">
                        In Progress
                      </option>
                      <option value="Completed" className="bg-secondary-bg text-foreground">
                        Completed
                      </option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
