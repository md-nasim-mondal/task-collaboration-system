import React from "react";
import { FolderKanban, Calendar, Users, Clock } from "lucide-react";
import { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
  isEligibleToCreate: boolean;
  onEdit: () => void;
  onBoardClick: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  isEligibleToCreate,
  onEdit,
  onBoardClick,
}) => {
  const overdue =
    new Date(project.deadline || "") < new Date() && project.status !== "Completed";

  return (
    <div
      className={`glass-panel glass-panel-hover p-6 flex flex-col justify-between min-h-55 ${
        overdue ? "border-danger/30" : ""
      }`}
    >
      <div>
        <div className="flex justify-between items-center mb-4">
          <span
            className={`badge badge-${
              project.status === "Active"
                ? "progress"
                : project.status === "Completed"
                  ? "completed"
                  : "todo"
            }`}
          >
            {project.status}
          </span>
          {overdue && (
            <span className="badge badge-high text-[0.7rem] flex items-center gap-1">
              <Clock size={12} /> Overdue
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold mb-2 text-foreground">{project.name}</h3>
        <p className="text-secondary text-sm leading-relaxed line-clamp-2 mb-4">
          {project.description || "No description provided."}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center text-sm text-muted">
          <div className="flex items-center gap-1.5">
            <Calendar size={14} />
            <span>
              {new Date(project.deadline || "").toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={14} />
            <span>{(project.members || []).length} Members</span>
          </div>
        </div>

        <div className="flex gap-2.5 pt-4 border-t border-border/50">
          <button
            onClick={onBoardClick}
            className="flex-1 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold cursor-pointer border-none flex items-center justify-center gap-1.5 hover:bg-primary/20 transition-colors duration-200"
          >
            <FolderKanban size={16} /> Board
          </button>

          {isEligibleToCreate && (
            <button
              onClick={onEdit}
              className="py-2 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] text-secondary text-sm font-semibold cursor-pointer border-none hover:bg-border hover:text-foreground transition-all duration-200"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
