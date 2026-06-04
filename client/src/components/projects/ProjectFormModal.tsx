import React from "react";
import { X } from "lucide-react";
import { Project, Member } from "@/types";

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  editingProject: Project | null;
  name: string;
  setName: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  deadline: string;
  setDeadline: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
  selectedMembers: string[];
  onMemberToggle: (id: string) => void;
  memberOptions: Member[];
  formLoading: boolean;
  minDate: string;
}

const inputClass =
  "w-full p-3 px-4 rounded-[10px] border border-border bg-background/50 text-foreground text-base outline-none focus:border-primary transition-all duration-200";

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingProject,
  name,
  setName,
  description,
  setDescription,
  deadline,
  setDeadline,
  status,
  setStatus,
  selectedMembers,
  onMemberToggle,
  memberOptions,
  formLoading,
  minDate,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-md z-2000 flex items-center justify-center p-2 sm:p-6"
      onClick={onClose}
    >
      <div
        className="glass-panel max-w-150 w-full p-5 sm:p-8 sm:pb-12 relative shadow-2xl bg-secondary-bg max-h-[85vh] overflow-y-auto animate-[fadeIn_var(--transition-normal)_forwards]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 cursor-pointer text-secondary hover:text-primary border-none bg-transparent outline-none transition-colors duration-200"
        >
          <X size={24} />
        </button>

        <h2 className="gradient-text font-display text-2xl sm:text-3xl font-extrabold mb-7 text-center">
          {editingProject ? "Edit Project Details" : "Create New Project"}
        </h2>

        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[0.85rem] font-bold text-secondary">Project Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="E.g. Website Redesign"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[0.85rem] font-bold text-secondary">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief scope summary..."
              rows={4}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[0.85rem] font-bold text-secondary">Project Deadline *</label>
            <input
              type="date"
              required
              min={minDate}
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className={inputClass}
            />
          </div>

          {editingProject && (
            <div className="flex flex-col gap-2">
              <label className="text-[0.85rem] font-bold text-secondary">Project Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="Active" className="bg-secondary-bg">
                  Active
                </option>
                <option value="Completed" className="bg-secondary-bg">
                  Completed
                </option>
                <option value="On Hold" className="bg-secondary-bg">
                  On Hold
                </option>
              </select>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-[0.85rem] font-bold text-secondary">Add Members</label>
            <div className="max-h-37.5 overflow-y-auto border border-border rounded-[10px] p-3 bg-background/30 flex flex-col gap-2">
              {memberOptions.map((opt) => (
                <label
                  key={opt._id}
                  className="flex items-center gap-3 text-sm cursor-pointer p-2 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] transition-colors duration-200 text-foreground"
                >
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(opt._id)}
                    onChange={() => onMemberToggle(opt._id)}
                    className="cursor-pointer"
                  />
                  <span>
                    {opt.name} ({opt.role.replace("_", " ")})
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 p-3.5 rounded-xl font-bold cursor-pointer bg-[hsl(var(--bg-tertiary))] border border-border text-foreground hover:bg-border transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="flex-2 p-3.5 rounded-xl font-bold cursor-pointer border-none text-white gradient-bg shadow-[0_10px_15px_-3px_hsl(var(--primary)/0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-transform duration-200 disabled:opacity-70"
            >
              {formLoading ? "Processing..." : editingProject ? "Save Changes" : "Launch Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
