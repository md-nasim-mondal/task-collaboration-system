import React from "react";
import { X } from "lucide-react";
import { Member } from "@/types";

interface AddProjectTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  taskTitle: string;
  setTaskTitle: (val: string) => void;
  taskDesc: string;
  setTaskDesc: (val: string) => void;
  taskDueDate: string;
  setTaskDueDate: (val: string) => void;
  taskPriority: string;
  setTaskPriority: (val: string) => void;
  taskAssignee: string;
  setTaskAssignee: (val: string) => void;
  members: Member[];
  formLoading: boolean;
  minDate: string;
}

const inputClass =
  "w-full p-2.5 px-3.5 rounded-lg border border-border bg-background/50 text-foreground text-sm outline-none focus:border-primary transition-all duration-200";

export const AddProjectTaskModal: React.FC<AddProjectTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  taskTitle,
  setTaskTitle,
  taskDesc,
  setTaskDesc,
  taskDueDate,
  setTaskDueDate,
  taskPriority,
  setTaskPriority,
  taskAssignee,
  setTaskAssignee,
  members,
  formLoading,
  minDate,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-md z-1000 flex items-center justify-center p-2 sm:p-6"
      onClick={onClose}
    >
      <div
        className="glass-panel max-w-150 w-full p-5 sm:p-8 sm:pb-12 relative bg-secondary-bg max-h-[85vh] overflow-y-auto animate-[fadeIn_var(--transition-normal)_forwards]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 cursor-pointer text-secondary hover:text-primary border-none bg-transparent outline-none transition-colors duration-200"
        >
          <X size={20} />
        </button>

        <h2 className="font-display text-2xl font-bold text-foreground mb-6">Add Project Task</h2>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">Task Title *</label>
            <input
              type="text"
              required
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="E.g. Design Landing Page"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">Description</label>
            <textarea
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
              placeholder="Specify requirements..."
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">Due Date *</label>
              <input
                type="date"
                required
                min={minDate}
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">Priority</label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="High" className="bg-secondary-bg">High</option>
                <option value="Medium" className="bg-secondary-bg">Medium</option>
                <option value="Low" className="bg-secondary-bg">Low</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">Assign To</label>
            <select
              value={taskAssignee}
              onChange={(e) => setTaskAssignee(e.target.value)}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="" className="bg-secondary-bg">Unassigned</option>
              {(members || []).map((opt) => (
                <option key={opt._id} value={opt._id} className="bg-secondary-bg">
                  {opt.name} ({opt.role.replace("_", " ")})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 rounded-lg cursor-pointer border border-border bg-transparent text-foreground font-semibold hover:bg-border transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="py-2.5 px-5 rounded-lg cursor-pointer border-none gradient-bg text-white font-semibold disabled:opacity-70"
            >
              {formLoading ? "Creating..." : "Save Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
