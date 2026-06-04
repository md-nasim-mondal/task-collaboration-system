"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { FolderOpen, Search, Filter, Plus, X } from "lucide-react";
import Loading from "@/components/ui/Loading";
import { Project, Member } from "@/types";
import { ProjectCard } from "../projects/ProjectCard";
import { ProjectFormModal } from "../projects/ProjectFormModal";

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
    const timer = setTimeout(() => {
      fetchProjects();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    if (isModalOpen && memberOptions.length === 0 && isEligibleToCreate) {
      fetchMembers();
    }
  }, [isModalOpen]);

  const handleOpenCreateModal = () => {
    setEditingProject(null);
    setName("");
    setDescription("");
    setDeadline("");
    setStatus("Active");
    setSelectedMembers([]);
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

    const now = new Date();
    now.setHours(0, 0, 0, 0);
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
      showToast(
        err.message || `Failed to ${editingProject ? "update" : "create"} project`,
        "error",
      );
    } finally {
      setFormLoading(false);
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
            <h1 className="font-display text-3xl font-extrabold text-foreground">
              Projects Workspace
            </h1>
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
              <option value="" className="bg-secondary-bg">
                All Project Statuses
              </option>
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
        </div>

        {/* Projects Grid */}
        {loading ? (
          <Loading text="Loading projects..." />
        ) : projects.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "24px",
            }}
          >
            {projects.map((proj) => (
              <ProjectCard
                key={proj._id}
                project={proj}
                isEligibleToCreate={isEligibleToCreate}
                onEdit={() => handleOpenEditModal(proj)}
                onBoardClick={() => router.push(`/projects/${proj._id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="glass-panel p-20 text-center flex flex-col items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
              <FolderOpen size={40} />
            </div>
            <h2 className="text-2xl font-bold text-foreground">No projects found</h2>
            <p className="text-secondary max-w-100 leading-relaxed">
              We couldn&apos;t find any projects matching your current filters. Try adjusting your
              search or status filter.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
              }}
              className="gradient-bg px-6 py-3 rounded-[10px] font-semibold cursor-pointer border-none text-white mt-2 hover:-translate-y-0.5 active:translate-y-0 transition-transform duration-200"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* CREATE / EDIT PROJECT MODAL */}
      <ProjectFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdateProject}
        editingProject={editingProject}
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
        deadline={deadline}
        setDeadline={setDeadline}
        status={status}
        setStatus={setStatus}
        selectedMembers={selectedMembers}
        onMemberToggle={handleMemberToggle}
        memberOptions={memberOptions}
        formLoading={formLoading}
        minDate={getTodayDateString()}
      />
    </>
  );
}
