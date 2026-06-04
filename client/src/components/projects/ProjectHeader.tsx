import React from "react";
import { Calendar, Users, X } from "lucide-react";
import { Project } from "@/types";

interface ProjectHeaderProps {
  project: Project;
  isManager: boolean;
  completionRate: number;
  onUpdateStatus: (status: string) => void;
  onDeleteProject: () => void;
  onRemoveMember: (memberId: string) => void;
  onOpenInviteModal: () => void;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  isManager,
  completionRate,
  onUpdateStatus,
  onDeleteProject,
  onRemoveMember,
  onOpenInviteModal,
}) => {
  return (
    <div className="glass-panel p-5 md:p-8 mb-8 flex flex-col gap-6">
      <div className="flex justify-between items-start flex-wrap gap-5">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-foreground">{project.name}</h1>
          <p className="text-secondary mt-2 text-[0.95rem]">
            {project.description || "No project description loaded."}
          </p>
        </div>

        <div className="flex gap-3 items-center">
          <select
            value={project.status}
            onChange={(e) => onUpdateStatus(e.target.value)}
            disabled={!isManager}
            className={`p-1.5 px-3 rounded-lg border border-border text-sm font-semibold outline-none transition-all duration-200 ${
              isManager ? "cursor-pointer" : "cursor-default opacity-70"
            } ${
              project.status === "Completed"
                ? "bg-success/10 text-success"
                : project.status === "Active"
                  ? "bg-primary/10 text-primary"
                  : "bg-secondary-bg text-foreground"
            }`}
          >
            <option value="Active" className="bg-secondary-bg text-foreground">Active</option>
            <option value="Completed" className="bg-secondary-bg text-foreground">Completed</option>
            <option value="On Hold" className="bg-secondary-bg text-foreground">On Hold</option>
          </select>

          {isManager && (
            <button
              onClick={onDeleteProject}
              className="p-2 rounded-lg border-none bg-danger/10 text-danger cursor-pointer hover:bg-danger/20 transition-colors duration-200"
              title="Delete Project"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Timeline & Members */}
      <div className="flex justify-between items-center flex-wrap gap-6 border-t border-border/50 pt-6">
        <div className="flex gap-6 flex-wrap">
          {/* Deadline */}
          <div className="flex items-center gap-2.5">
            <Calendar size={18} className="text-secondary" />
            <div>
              <p className="text-xs text-muted font-medium">Deadline</p>
              <p className="text-sm font-bold text-foreground">
                {new Date(project.deadline || "").toLocaleDateString([], {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2.5 min-w-45">
            <div>
              <p className="text-xs text-muted font-medium">Progress ({completionRate}%)</p>
              <div className="h-2 w-35 bg-border rounded-full overflow-hidden mt-1.5">
                <div
                  className="h-full bg-success rounded-full transition-[width] duration-700"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Members Avatars */}
        <div className="flex items-center gap-3.5">
          <div className="flex items-center">
            {(project.members || []).slice(0, 5).map((memb, idx) => (
              <div
                key={memb._id}
                onClick={() => {
                  if (isManager && memb._id !== project.createdBy?._id) {
                    onRemoveMember(memb._id);
                  }
                }}
                className={`gradient-bg w-8 h-8 rounded-full border-2 border-secondary-bg flex items-center justify-center text-white text-xs font-bold transition-all duration-150 ${
                  isManager && memb._id !== project.createdBy?._id
                    ? "cursor-pointer hover:scale-110 hover:border-danger/60"
                    : "cursor-help"
                }`}
                title={
                  isManager && memb._id !== project.createdBy?._id
                    ? `Click to remove: ${memb.name} (${memb.role.replace("_", " ")})`
                    : `${memb.name} (${memb.role.replace("_", " ")})`
                }
                style={{ marginLeft: idx > 0 ? "-8px" : 0, zIndex: 5 - idx }}
              >
                {memb.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
              </div>
            ))}
            {(project.members || []).length > 5 && (
              <div
                className="w-8 h-8 rounded-full border-2 border-secondary-bg bg-border text-secondary text-xs font-bold flex items-center justify-center"
                style={{ marginLeft: "-8px", zIndex: 0 }}
              >
                +{(project.members || []).length - 5}
              </div>
            )}
          </div>

          {isManager && (
            <button
              onClick={onOpenInviteModal}
              className="cursor-pointer p-1.5 px-3 rounded-md border border-border text-sm font-semibold flex items-center gap-1.5 text-secondary hover:bg-border hover:text-foreground transition-all duration-200 bg-transparent"
            >
              <Users size={14} />
              <span>Invite</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
