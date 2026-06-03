"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Project, Member } from "@/types";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  teamMembers: Member[];
  isMobile: boolean;
  onRefresh: () => void;
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  projects,
  teamMembers,
  isMobile,
  onRefresh,
}: CreateTaskModalProps) {
  const { apiFetch, showToast } = useAuth();

  const [createLoading, setCreateLoading] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newProject, setNewProject] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const [newPriority, setNewPriority] = useState("Medium");
  const [newDueDate, setNewDueDate] = useState("");

  if (!isOpen) return null;

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newProject || !newAssignee || !newDueDate) {
      showToast("Please fill all required fields", "error");
      return;
    }

    try {
      setCreateLoading(true);
      const res = await apiFetch("/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDesc.trim() || undefined,
          project: newProject,
          assignedMember: newAssignee,
          priority: newPriority,
          dueDate: newDueDate,
        }),
      });

      if (res.success) {
        showToast("Task created successfully", "success");
        setNewTitle("");
        setNewDesc("");
        setNewProject("");
        setNewAssignee("");
        setNewPriority("Medium");
        setNewDueDate("");
        onClose();
        onRefresh();
      }
    } catch (err: any) {
      showToast(err.message || "Failed to create task", "error");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-2000 flex items-center justify-center p-2 sm:p-6">
      <div className="glass-panel max-w-150 w-full p-5 sm:p-8 sm:pb-12 relative animate-[fadeIn_var(--transition-normal)_forwards] shadow-2xl bg-secondary-bg max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 cursor-pointer text-secondary hover:text-primary z-10 bg-transparent border-none outline-none transition-colors duration-200"
        >
          <X size={24} />
        </button>

        <h2 className="gradient-text font-display text-2xl sm:text-3xl font-extrabold mb-7 text-center">
          Create New Task
        </h2>

        <form onSubmit={handleCreateTask} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[0.85rem] font-bold text-secondary">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Implement API Authentication"
              className="w-full border border-border rounded-[10px] p-3 px-4 bg-background/50 text-foreground text-base outline-none focus:border-primary transition-all duration-200"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[0.85rem] font-bold text-secondary">
              Description
            </label>
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Detailed instructions for the task..."
              rows={4}
              className="w-full border border-border rounded-[10px] p-3 px-4 bg-background/50 text-foreground text-base outline-none resize-none focus:border-primary transition-all duration-200"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[0.85rem] font-bold text-secondary">
                Project *
              </label>
              <select
                required
                value={newProject}
                onChange={(e) => setNewProject(e.target.value)}
                className="w-full border border-border rounded-[10px] p-3 px-4 bg-background/50 text-foreground text-base outline-none cursor-pointer focus:border-primary transition-all duration-200"
              >
                <option value="" className="bg-secondary-bg">Select Project</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id} className="bg-secondary-bg">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[0.85rem] font-bold text-secondary">
                Assign To *
              </label>
              <select
                required
                value={newAssignee}
                onChange={(e) => setNewAssignee(e.target.value)}
                className="w-full border border-border rounded-[10px] p-3 px-4 bg-background/50 text-foreground text-base outline-none cursor-pointer focus:border-primary transition-all duration-200"
              >
                <option value="" className="bg-secondary-bg">Select Member</option>
                {teamMembers.map((m) => (
                  <option key={m._id} value={m._id} className="bg-secondary-bg">
                    {m.name} ({m.role.replace("_", " ")})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[0.85rem] font-bold text-secondary">
                Priority
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="w-full border border-border rounded-[10px] p-3 px-4 bg-background/50 text-foreground text-base outline-none cursor-pointer focus:border-primary transition-all duration-200"
              >
                <option value="High" className="bg-secondary-bg">High Priority</option>
                <option value="Medium" className="bg-secondary-bg">Medium Priority</option>
                <option value="Low" className="bg-secondary-bg">Low Priority</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[0.85rem] font-bold text-secondary">
                Due Date *
              </label>
              <input
                type="date"
                required
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full border border-border rounded-[10px] p-3 px-4 bg-background/50 text-foreground text-base outline-none focus:border-primary transition-all duration-200"
              />
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
              disabled={createLoading}
              className="flex-2 p-3.5 rounded-xl font-bold cursor-pointer border-none text-white gradient-bg shadow-[0_10px_15px_-3px_hsl(var(--primary)/0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-transform duration-200 disabled:opacity-70"
            >
              {createLoading ? "Creating Task..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
