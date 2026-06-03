"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import {
  FolderKanban,
  FolderOpen,
  Search,
  Filter,
  Plus,
  Calendar,
  Users,
  Clock,
  X,
} from "lucide-react";
import Loading from "../ui/Loading";
import { Project, Member } from "@/types";

const inputClass =
  "w-full p-3 px-4 rounded-[10px] border border-border bg-background/50 text-foreground text-base outline-none focus:border-primary transition-all duration-200";

export default function ProjectsPageClient({
  initialProjects,
  initialMembers,
}: {
  initialProjects: Project[];
  initialMembers: Member[];
}) {
  const { apiFetch, showToast, user } = useAuth();
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>(initialProjects || []);
  const [memberOptions, setMemberOptions] = useState<Member[]>(initialMembers || []);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("Active");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [formLoading, setFormLoading] = useState(false);

  const isEligibleToCreate = user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER";

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append("searchTerm", searchTerm);
      if (statusFilter) queryParams.append("status", statusFilter);
      const res = await apiFetch(`/projects?${queryParams.toString()}`);
      if (res.success) setProjects(res.data);
    } catch (err: any) {
      showToast(err.message || "Failed to load projects", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await apiFetch("/user");
      if (res.success) setMemberOptions(res.data);
    } catch (err: any) {
      console.error("Failed to load user options", err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => { fetchProjects(); }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    if (isModalOpen && memberOptions.length === 0 && isEligibleToCreate) {
      fetchMembers();
    }
  }, [isModalOpen]);

  const handleOpenCreateModal = () => {
    setEditingProject(null);
    setName(""); setDescription(""); setDeadline(""); setStatus("Active"); setSelectedMembers([]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (proj: Project) => {
    setEditingProject(proj);
    setName(proj.name);
    setDescription(proj.description || "");
    const date = new Date(proj.deadline || "");
    setDeadline(date.toISOString().split("T")[0]);
    setStatus(proj.status || "Active");
    setSelectedMembers((proj.members || []).map((m) => m._id));
    setIsModalOpen(true);
  };

  const handleCreateOrUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !deadline) return;

    const now = new Date(); now.setHours(0, 0, 0, 0);
    if (new Date(deadline) < now) {
      showToast("Please select a valid deadline.", "error");
      return;
    }

    try {
      setFormLoading(true);
      const payload = { name, description, deadline, status, members: selectedMembers };
      const endpoint = editingProject ? `/projects/${editingProject._id}` : "/projects";
      const method = editingProject ? "PATCH" : "POST";

      const res = await apiFetch(endpoint, { method, body: JSON.stringify(payload) });
      if (res.success) {
        showToast(`Project ${editingProject ? "updated" : "created"} successfully!`, "success");
        setIsModalOpen(false);
        fetchProjects();
        router.refresh();
      }
    } catch (err: any) {
      showToast(err.message || `Failed to ${editingProject ? "update" : "create"} project`, "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete all associated tasks and cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "hsl(var(--danger))",
      cancelButtonColor: "hsl(var(--border-color))",
      confirmButtonText: "Yes, delete it!",
      background: "hsl(var(--bg-secondary))",
      color: "hsl(var(--text-primary))",
    });
    if (!result.isConfirmed) return;

    try {
      const res = await apiFetch(`/projects/${projectId}`, { method: "DELETE" });
      if (res.success) {
        showToast("Project deleted successfully", "success");
        fetchProjects(); router.refresh();
      }
    } catch (err: any) {
      showToast(err.message || "Failed to delete project", "error");
    }
  };

  const handleMemberToggle = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id],
    );
  };

  const getTodayDateString = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  };

  return (
    <>
      <div className="animate-[fadeIn_var(--transition-normal)_forwards]">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-5 mb-8">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-foreground">Projects Workspace</h1>
            <p className="text-secondary mt-1 text-sm">
              Coordinate timelines, invite team members, and monitor boards.
            </p>
          </div>
          {isEligibleToCreate && (
            <button
              onClick={handleOpenCreateModal}
              className="gradient-bg px-5 py-3 rounded-[10px] font-semibold flex items-center gap-2 cursor-pointer border-none text-white shadow-[0_4px_12px_hsl(var(--primary)/0.2)] hover:-translate-y-0.5 active:translate-y-0 transition-transform duration-200"
            >
              <Plus size={18} />
              <span>Create Project</span>
            </button>
          )}
        </div>

        {/* Filter Bar */}
        <div className="glass-panel p-4 px-6 mb-8 flex items-center justify-start md:justify-center gap-5 flex-wrap">
          <div
            className={`flex items-center gap-3 px-4 h-11 rounded-[10px] border bg-background/50 grow max-w-112.5 min-w-65 transition-all duration-200 ${
              isSearchFocused ? "border-primary ring-4 ring-primary/10" : "border-border"
            }`}
          >
            <Search
              size={20}
              className={`shrink-0 transition-colors duration-200 ${isSearchFocused ? "text-primary" : "text-muted"}`}
            />
            <input
              type="text"
              placeholder="Search projects by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="flex-1 h-full border-none bg-transparent text-foreground outline-none text-base placeholder:text-muted min-w-0"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="bg-transparent border-none cursor-pointer p-1 text-muted hover:text-danger transition-colors duration-200 flex items-center"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <Filter size={18} className="text-secondary" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2.5 px-4 rounded-lg border border-border bg-background/50 text-foreground font-medium outline-none cursor-pointer focus:border-primary transition-all duration-200"
            >
              <option value="" className="bg-secondary-bg">All Project Statuses</option>
              <option value="Active" className="bg-secondary-bg">Active</option>
              <option value="Completed" className="bg-secondary-bg">Completed</option>
              <option value="On Hold" className="bg-secondary-bg">On Hold</option>
            </select>
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <Loading text="Loading projects..." />
        ) : projects.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
            {projects.map((proj) => {
              const overdue = new Date(proj.deadline || "") < new Date() && proj.status !== "Completed";
              return (
                <div
                  key={proj._id}
                  className={`glass-panel glass-panel-hover p-6 flex flex-col justify-between min-h-55 ${
                    overdue ? "border-danger/30" : ""
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span
                        className={`badge badge-${
                          proj.status === "Active" ? "progress" : proj.status === "Completed" ? "completed" : "todo"
                        }`}
                      >
                        {proj.status}
                      </span>
                      {overdue && (
                        <span className="badge badge-high text-[0.7rem] flex items-center gap-1">
                          <Clock size={12} /> Overdue
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold mb-2 text-foreground">{proj.name}</h3>
                    <p className="text-secondary text-sm leading-relaxed line-clamp-2 mb-4">
                      {proj.description || "No description provided."}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center text-sm text-muted">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        <span>
                          {new Date(proj.deadline || "").toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users size={14} />
                        <span>{(proj.members || []).length} Members</span>
                      </div>
                    </div>

                    <div className="flex gap-2.5 pt-4 border-t border-border/50">
                      <button
                        onClick={() => router.push(`/projects/${proj._id}`)}
                        className="flex-1 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold cursor-pointer border-none flex items-center justify-center gap-1.5 hover:bg-primary/20 transition-colors duration-200"
                      >
                        <FolderKanban size={16} /> Board
                      </button>

                      {isEligibleToCreate && (
                        <button
                          onClick={() => handleOpenEditModal(proj)}
                          className="py-2 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] text-secondary text-sm font-semibold cursor-pointer border-none hover:bg-border hover:text-foreground transition-all duration-200"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-panel p-20 text-center flex flex-col items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
              <FolderOpen size={40} />
            </div>
            <h2 className="text-2xl font-bold text-foreground">No projects found</h2>
            <p className="text-secondary max-w-100 leading-relaxed">
              We couldn&apos;t find any projects matching your current filters. Try adjusting your search or status filter.
            </p>
            <button
              onClick={() => { setSearchTerm(""); setStatusFilter(""); }}
              className="gradient-bg px-6 py-3 rounded-[10px] font-semibold cursor-pointer border-none text-white mt-2 hover:-translate-y-0.5 active:translate-y-0 transition-transform duration-200"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* CREATE / EDIT PROJECT MODAL */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-md z-2000 flex items-center justify-center p-2 sm:p-6"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="glass-panel max-w-150 w-full p-5 sm:p-8 sm:pb-12 relative shadow-2xl bg-secondary-bg max-h-[85vh] overflow-y-auto animate-[fadeIn_var(--transition-normal)_forwards]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 cursor-pointer text-secondary hover:text-primary border-none bg-transparent outline-none transition-colors duration-200"
            >
              <X size={24} />
            </button>

            <h2 className="gradient-text font-display text-2xl sm:text-3xl font-extrabold mb-7 text-center">
              {editingProject ? "Edit Project Details" : "Create New Project"}
            </h2>

            <form onSubmit={handleCreateOrUpdateProject} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[0.85rem] font-bold text-secondary">Project Name *</label>
                <input
                  type="text" required value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.g. Website Redesign"
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[0.85rem] font-bold text-secondary">Description</label>
                <textarea
                  value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief scope summary..." rows={4}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[0.85rem] font-bold text-secondary">Project Deadline *</label>
                <input
                  type="date" required min={getTodayDateString()} value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className={inputClass}
                />
              </div>

              {editingProject && (
                <div className="flex flex-col gap-2">
                  <label className="text-[0.85rem] font-bold text-secondary">Project Status</label>
                  <select
                    value={status} onChange={(e) => setStatus(e.target.value)}
                    className={`${inputClass} cursor-pointer`}
                  >
                    <option value="Active" className="bg-secondary-bg">Active</option>
                    <option value="Completed" className="bg-secondary-bg">Completed</option>
                    <option value="On Hold" className="bg-secondary-bg">On Hold</option>
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
                        onChange={() => handleMemberToggle(opt._id)}
                        className="cursor-pointer"
                      />
                      <span>{opt.name} ({opt.role.replace("_", " ")})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-3">
                <button
                  type="button" onClick={() => setIsModalOpen(false)}
                  className="flex-1 p-3.5 rounded-xl font-bold cursor-pointer bg-[hsl(var(--bg-tertiary))] border border-border text-foreground hover:bg-border transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={formLoading}
                  className="flex-2 p-3.5 rounded-xl font-bold cursor-pointer border-none text-white gradient-bg shadow-[0_10px_15px_-3px_hsl(var(--primary)/0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-transform duration-200 disabled:opacity-70"
                >
                  {formLoading ? "Processing..." : editingProject ? "Save Changes" : "Launch Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
