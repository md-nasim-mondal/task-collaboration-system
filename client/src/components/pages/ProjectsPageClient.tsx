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
import Loading from "../Loading";

interface Project {
  _id: string;
  name: string;
  description?: string;
  deadline: string;
  status: string;
  members: any[];
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
}

interface MemberOption {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function ProjectsPageClient({
  initialProjects,
  initialMembers,
}: {
  initialProjects: Project[];
  initialMembers: MemberOption[];
}) {
  const { apiFetch, showToast, user } = useAuth();
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>(initialProjects || []);
  const [memberOptions, setMemberOptions] = useState<MemberOption[]>(
    initialMembers || [],
  );
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  // Create/Edit Project Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("Active");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const isEligibleToCreate =
    user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER";

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append("searchTerm", searchTerm);
      if (statusFilter) queryParams.append("status", statusFilter);

      const res = await apiFetch(`/projects?${queryParams.toString()}`);
      if (res.success) {
        setProjects(res.data);
      }
    } catch (err: any) {
      showToast(err.message || "Failed to load projects", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await apiFetch("/user"); // get all active users to add as members
      if (res.success) {
        setMemberOptions(res.data);
      }
    } catch (err: any) {
      console.error("Failed to load user options", err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      // If initialProjects is provided and searchTerm/statusFilter are empty,
      // we don't necessarily need to fetch unless it's a manual clear.
      // But to be safe and fix the "clear not showing all" issue, we allow fetch when empty.
      fetchProjects();
    }, 400); // Debounce search

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
    // Format date for input
    const date = new Date(proj.deadline);
    const dateStr = date.toISOString().split("T")[0];
    setDeadline(dateStr);
    setStatus(proj.status);
    setSelectedMembers(proj.members.map((m) => m._id));
    setIsModalOpen(true);
  };

  const handleCreateOrUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !deadline) return;

    // Direct client date verification
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (new Date(deadline) < now) {
      showToast("Please select a valid deadline.", "error");
      return;
    }

    try {
      setFormLoading(true);
      const payload = {
        name,
        description,
        deadline,
        status,
        members: selectedMembers,
      };

      const endpoint = editingProject
        ? `/projects/${editingProject._id}`
        : "/projects";
      const method = editingProject ? "PATCH" : "POST";

      const res = await apiFetch(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      if (res.success) {
        showToast(
          `Project ${editingProject ? "updated" : "created"} successfully!`,
          "success",
        );
        setIsModalOpen(false);
        fetchProjects();
        router.refresh();
      }
    } catch (err: any) {
      showToast(
        err.message ||
          `Failed to ${editingProject ? "update" : "create"} project`,
        "error",
      );
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
      const res = await apiFetch(`/projects/${projectId}`, {
        method: "DELETE",
      });

      if (res.success) {
        showToast("Project deleted successfully", "success");
        fetchProjects();
        router.refresh();
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

  // Get Today's Date String for Date input min constraint
  const getTodayDateString = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  };

  return (
    <>
      <div style={{ animation: "fadeIn var(--transition-normal) forwards" }}>
      {/* Header Row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
          marginBottom: "32px",
        }}>
        <div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2rem",
              fontWeight: 800,
            }}>
            Projects Workspace
          </h1>
          <p style={{ color: "hsl(var(--text-secondary))", marginTop: "4px" }}>
            Coordinate timelines, invite team members, and monitor boards.
          </p>
        </div>

        {isEligibleToCreate && (
          <button
            onClick={handleOpenCreateModal}
            className='gradient-bg'
            style={{
              padding: "12px 20px",
              borderRadius: "10px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 12px hsl(var(--primary) / 0.2)",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-1px)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }>
            <Plus size={18} />
            <span>Create Project</span>
          </button>
        )}
      </div>

      {/* Filter Controls Row */}
      <div
        className='glass-panel'
        style={{
          padding: isMobile ? "16px" : "16px 24px",
          marginBottom: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: isMobile ? "flex-start" : "center",
          gap: "20px",
          flexWrap: "wrap",
        }}>
        {/* Search Box */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "0 16px",
            height: "44px",
            borderRadius: "10px",
            border: `1px solid ${isSearchFocused ? "hsl(var(--primary))" : "hsl(var(--border-color))"}`,
            backgroundColor: "hsl(var(--bg-primary) / 0.5)",
            flexGrow: 1,
            maxWidth: "450px",
            minWidth: "260px",
            transition: "all var(--transition-normal)",
            boxShadow: isSearchFocused
              ? "0 0 0 4px hsl(var(--primary) / 0.1)"
              : "none",
          }}>
          <Search
            size={20}
            style={{
              color: isSearchFocused
                ? "hsl(var(--primary))"
                : "hsl(var(--text-muted))",
              transition: "color var(--transition-normal)",
              flexShrink: 0,
            }}
          />
          <input
            type='text'
            placeholder='Search projects by name...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            style={{
              flex: 1,
              height: "100%",
              border: "none",
              backgroundColor: "transparent",
              color: "hsl(var(--text-primary))",
              outline: "none",
              fontSize: "1rem",
              boxShadow: "none",
              padding: 0,
              margin: 0,
              minWidth: 0,
              display: "block",
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "hsl(var(--text-muted))",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "hsl(var(--danger))")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "hsl(var(--text-muted))")
              }>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Status Dropdown Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Filter size={18} style={{ color: "hsl(var(--text-secondary))" }} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              border: "1px solid hsl(var(--border-color))",
              backgroundColor: "hsl(var(--bg-primary) / 0.5)",
              color: "hsl(var(--text-primary))",
              cursor: "pointer",
              fontWeight: 500,
              outline: "none",
            }}>
            <option value='' style={{ backgroundColor: "hsl(var(--bg-secondary))", color: "hsl(var(--text-primary))" }}>All Project Statuses</option>
            <option value='Active' style={{ backgroundColor: "hsl(var(--bg-secondary))", color: "hsl(var(--text-primary))" }}>Active</option>
            <option value='Completed' style={{ backgroundColor: "hsl(var(--bg-secondary))", color: "hsl(var(--text-primary))" }}>Completed</option>
            <option value='On Hold' style={{ backgroundColor: "hsl(var(--bg-secondary))", color: "hsl(var(--text-primary))" }}>On Hold</option>
          </select>
        </div>
      </div>

      {/* Projects Cards Grid */}
      {loading ? (
        <Loading text='Loading projects...' />
      ) : projects.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "24px",
          }}>
          {projects.map((proj) => {
            const overdue =
              new Date(proj.deadline) < new Date() &&
              proj.status !== "Completed";
            return (
              <div
                key={proj._id}
                className='glass-panel glass-panel-hover'
                style={{
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: "220px",
                  border: overdue
                    ? "1px solid hsl(var(--danger) / 0.3)"
                    : undefined,
                }}>
                <div>
                  {/* Status Badge row */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "16px",
                    }}>
                    <span
                      className={`badge badge-${
                        proj.status === "Active"
                          ? "progress"
                          : proj.status === "Completed"
                            ? "completed"
                            : "todo"
                      }`}>
                      {proj.status}
                    </span>
                    {overdue && (
                      <span
                        className='badge badge-high'
                        style={{
                          fontSize: "0.7rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}>
                        <Clock size={12} />
                        Overdue
                      </span>
                    )}
                  </div>

                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      marginBottom: "8px",
                      color: "hsl(var(--text-primary))",
                    }}>
                    {proj.name}
                  </h3>
                  <p
                    style={{
                      color: "hsl(var(--text-secondary))",
                      fontSize: "0.9rem",
                      lineHeight: "1.5",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      marginBottom: "16px",
                    }}>
                    {proj.description || "No description provided."}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "0.85rem",
                      color: "hsl(var(--text-muted))",
                    }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}>
                      <Calendar size={14} />
                      <span>
                        {new Date(proj.deadline).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}>
                      <Users size={14} />
                      <span>{proj.members.length} Members</span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      paddingTop: "16px",
                      borderTop: "1px solid hsl(var(--border-color) / 0.5)",
                    }}>
                    <button
                      onClick={() => router.push(`/projects/${proj._id}`)}
                      style={{
                        flex: 1,
                        padding: "8px",
                        borderRadius: "8px",
                        backgroundColor: "hsl(var(--primary) / 0.1)",
                        color: "hsl(var(--primary))",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "hsl(var(--primary) / 0.15)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "hsl(var(--primary) / 0.1)")
                      }>
                      <FolderKanban size={16} />
                      Board
                    </button>

                    {isEligibleToCreate && (
                      <button
                        onClick={() => handleOpenEditModal(proj)}
                        style={{
                          padding: "8px 12px",
                          borderRadius: "8px",
                          backgroundColor: "hsl(var(--bg-tertiary))",
                          color: "hsl(var(--text-secondary))",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "hsl(var(--border-color))";
                          e.currentTarget.style.color =
                            "hsl(var(--text-primary))";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "hsl(var(--bg-tertiary))";
                          e.currentTarget.style.color =
                            "hsl(var(--text-secondary))";
                        }}>
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
        <div
          className='glass-panel'
          style={{
            padding: "80px 24px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
          }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              backgroundColor: "hsl(var(--primary) / 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "hsl(var(--primary))",
              marginBottom: "12px",
            }}>
            <FolderOpen size={40} />
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>
            No projects found
          </h2>
          <p
            style={{
              color: "hsl(var(--text-secondary))",
              maxWidth: "400px",
              lineHeight: 1.6,
            }}>
            We couldn't find any projects matching your current filters. Try
            adjusting your search or status filter.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("");
            }}
            className='gradient-bg'
            style={{
              padding: "12px 24px",
              borderRadius: "10px",
              fontWeight: 600,
              cursor: "pointer",
              border: "none",
              marginTop: "8px",
            }}>
            Reset All Filters
          </button>
        </div>
      )}

      </div>

      {/* CREATE PROJECT MODAL */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(6px)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: isMobile ? "8px" : "24px",
          }}
          onClick={() => setIsModalOpen(false)}>
          <div
            className='glass-panel'
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "600px",
              width: "100%",
              padding: isMobile ? "20px 20px 32px 20px" : "32px 32px 48px 32px",
              boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
              backgroundColor: "hsl(var(--bg-secondary))",
              position: "relative",
              animation: "fadeIn var(--transition-normal) forwards",
              maxHeight: "85vh",
              overflowY: "auto",
            }}>
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                position: "absolute",
                top: "24px",
                right: "24px",
                cursor: "pointer",
                color: "hsl(var(--text-secondary))",
                background: "none",
                border: "none",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(var(--primary))")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(var(--text-secondary))")}>
              <X size={24} />
            </button>

            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.75rem",
                fontWeight: 800,
                marginBottom: "28px",
                textAlign: "center",
                background: "linear-gradient(135deg, #fff 0%, #a5b4fc 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
              {editingProject ? "Edit Project Details" : "Create New Project"}
            </h2>

            <form
              onSubmit={handleCreateOrUpdateProject}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Project Name */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>
                  Project Name *
                </label>
                <input
                  type='text'
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder='E.g. Website Redesign'
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1px solid hsl(var(--border-color))",
                    backgroundColor: "hsl(var(--bg-primary) / 0.5)",
                    color: "hsl(var(--text-primary))",
                    fontSize: "1rem",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "hsl(var(--primary))")}
                  onBlur={(e) => (e.target.style.borderColor = "hsl(var(--border-color))")}
                />
              </div>

              {/* Description */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder='Brief scope summary...'
                  rows={4}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1px solid hsl(var(--border-color))",
                    backgroundColor: "hsl(var(--bg-primary) / 0.5)",
                    color: "hsl(var(--text-primary))",
                    fontSize: "1rem",
                    resize: "none",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "hsl(var(--primary))")}
                  onBlur={(e) => (e.target.style.borderColor = "hsl(var(--border-color))")}
                />
              </div>

              {/* Deadline */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>
                  Project Deadline *
                </label>
                <input
                  type='date'
                  required
                  min={getTodayDateString()}
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1px solid hsl(var(--border-color))",
                    backgroundColor: "hsl(var(--bg-primary) / 0.5)",
                    color: "hsl(var(--text-primary))",
                    fontSize: "1rem",
                    outline: "none",
                  }}
                />
              </div>

              {/* Status (Only for Editing) */}
              {editingProject && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>
                    Project Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      border: "1px solid hsl(var(--border-color))",
                      backgroundColor: "hsl(var(--bg-primary) / 0.5)",
                      color: "hsl(var(--text-primary))",
                      fontSize: "1rem",
                      outline: "none",
                      cursor: "pointer",
                    }}>
                    <option value='Active' style={{ backgroundColor: "hsl(var(--bg-secondary))" }}>Active</option>
                    <option value='Completed' style={{ backgroundColor: "hsl(var(--bg-secondary))" }}>Completed</option>
                    <option value='On Hold' style={{ backgroundColor: "hsl(var(--bg-secondary))" }}>On Hold</option>
                  </select>
                </div>
              )}

              {/* Members Selection List */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>
                  Add Members
                </label>
                <div
                  style={{
                    maxHeight: "150px",
                    overflowY: "auto",
                    border: "1px solid hsl(var(--border-color))",
                    borderRadius: "10px",
                    padding: "12px",
                    backgroundColor: "hsl(var(--bg-primary) / 0.3)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}>
                  {memberOptions.map((opt) => (
                    <label
                      key={opt._id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        fontSize: "0.875rem",
                        cursor: "pointer",
                        padding: "8px",
                        borderRadius: "8px",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "hsl(var(--bg-tertiary))")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
                      <input
                        type='checkbox'
                        checked={selectedMembers.includes(opt._id)}
                        onChange={() => handleMemberToggle(opt._id)}
                        style={{ cursor: "pointer" }}
                      />
                      <span>
                        {opt.name} ({opt.role.replace("_", " ")})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button
                  type='button'
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: "14px",
                    borderRadius: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    backgroundColor: "hsl(var(--bg-tertiary))",
                    border: "1px solid hsl(var(--border-color))",
                    color: "hsl(var(--text-primary))",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "hsl(var(--border-color))")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "hsl(var(--bg-tertiary))")}>
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={formLoading}
                  className='gradient-bg'
                  style={{
                    flex: 2,
                    padding: "14px",
                    borderRadius: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    border: "none",
                    color: "white",
                    boxShadow: "0 10px 15px -3px hsl(var(--primary) / 0.3)",
                    transition: "transform 0.2s",
                    opacity: formLoading ? 0.7 : 1,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}>
                  {formLoading
                    ? "Processing..."
                    : editingProject
                      ? "Save Changes"
                      : "Launch Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
