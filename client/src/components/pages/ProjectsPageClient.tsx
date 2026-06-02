"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  FolderKanban,
  Search,
  Filter,
  Plus,
  Calendar,
  Users,
  Clock,
  ArrowUpRight,
  X,
} from "lucide-react";

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
  const [memberOptions, setMemberOptions] = useState<MemberOption[]>(initialMembers || []);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Create Project Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
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
    if (initialProjects && !searchTerm && !statusFilter) {
      return;
    }
    fetchProjects();
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    if (isModalOpen && memberOptions.length === 0 && isEligibleToCreate) {
      fetchMembers();
    }
  }, [isModalOpen]);

  const handleCreateProject = async (e: React.FormEvent) => {
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
        members: selectedMembers,
      };

      const res = await apiFetch("/projects", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.success) {
        showToast("Project created successfully!", "success");
        setIsModalOpen(false);
        // Reset form
        setName("");
        setDescription("");
        setDeadline("");
        setSelectedMembers([]);
        fetchProjects();
      }
    } catch (err: any) {
      showToast(err.message || "Failed to create project", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleMemberToggle = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
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
    <DashboardLayout>
      <div style={{ animation: "fadeIn var(--transition-normal) forwards" }}>
        {/* Header Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800 }}>
              Projects Workspace
            </h1>
            <p style={{ color: "hsl(var(--text-secondary))", marginTop: "4px" }}>
              Coordinate timelines, invite team members, and monitor boards.
            </p>
          </div>

          {isEligibleToCreate && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="gradient-bg"
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
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <Plus size={18} />
              <span>Create Project</span>
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div
          className="glass-panel"
          style={{
            padding: "16px 24px",
            marginBottom: "32px",
            display: "flex",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          {/* Search Box */}
          <div style={{ position: "relative", flexGrow: 1, minWidth: "260px" }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "hsl(var(--text-muted))",
              }}
            />
            <input
              type="text"
              placeholder="Search projects by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px 10px 42px",
                borderRadius: "8px",
                border: "1px solid hsl(var(--border-color))",
                backgroundColor: "hsl(var(--bg-primary) / 0.5)",
              }}
            />
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
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              <option value="">All Project Statuses</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>
        </div>

        {/* Projects Cards Grid */}
        {loading ? (
          <div style={{ display: "flex", height: "40vh", alignItems: "center", justifyContent: "center" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                border: "3px solid hsl(var(--primary) / 0.1)",
                borderTop: "3px solid hsl(var(--primary))",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
          </div>
        ) : projects.length === 0 ? (
          <div
            className="glass-panel"
            style={{
              padding: "60px 40px",
              textAlign: "center",
              color: "hsl(var(--text-muted))",
            }}
          >
            <FolderKanban size={48} style={{ margin: "0 auto 16px", opacity: 0.5 }} />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "hsl(var(--text-primary))" }}>
              No Projects Found
            </h3>
            <p style={{ marginTop: "4px" }}>
              You don't have any projects matches. Create a project to begin!
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "24px",
            }}
          >
            {projects.map((proj) => {
              const overdue = new Date(proj.deadline) < new Date() && proj.status !== "Completed";
              return (
                <div
                  key={proj._id}
                  className="glass-panel glass-panel-hover"
                  style={{
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: "220px",
                    border: overdue ? "1px solid hsl(var(--danger) / 0.3)" : undefined,
                  }}
                >
                  <div>
                    {/* Status Badge row */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "16px",
                      }}
                    >
                      <span
                        className={`badge badge-${
                          proj.status === "Active"
                            ? "progress"
                            : proj.status === "Completed"
                            ? "completed"
                            : "todo"
                        }`}
                      >
                        {proj.status}
                      </span>
                      {overdue && (
                        <span
                          className="badge badge-high"
                          style={{ display: "flex", alignItems: "center", gap: "4px" }}
                        >
                          <Clock size={12} /> Overdue
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "8px" }}>
                      {proj.name}
                    </h3>
                    <p
                      style={{
                        fontSize: "0.85rem",
                        color: "hsl(var(--text-secondary))",
                        marginBottom: "20px",
                        lineHeight: 1.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {proj.description || "No description provided."}
                    </p>
                  </div>

                  {/* Metadata Row */}
                  <div
                    style={{
                      borderTop: "1px solid hsl(var(--border-color) / 0.5)",
                      paddingTop: "16px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "hsl(var(--text-secondary))",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Calendar size={14} />
                        {new Date(proj.deadline).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "hsl(var(--text-secondary))",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Users size={14} />
                        {proj.members?.length || 0}
                      </span>
                    </div>

                    <button
                      onClick={() => router.push(`/projects/${proj._id}`)}
                      style={{
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        color: "hsl(var(--primary))",
                      }}
                    >
                      <span>Open</span>
                      <ArrowUpRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

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
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px",
            }}
          >
            <div
              className="glass-panel"
              style={{
                maxWidth: "600px",
                width: "100%",
                padding: "32px",
                boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
                backgroundColor: "hsl(var(--bg-secondary))",
                position: "relative",
              }}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  position: "absolute",
                  top: "24px",
                  right: "24px",
                  cursor: "pointer",
                  color: "hsl(var(--text-secondary))",
                }}
              >
                <X size={20} />
              </button>

              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, marginBottom: "24px" }}>
                Create New Project
              </h2>

              <form onSubmit={handleCreateProject} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {/* Project Name */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>Project Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g. Website Redesign"
                    style={{
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border-color))",
                      backgroundColor: "hsl(var(--bg-primary) / 0.5)",
                    }}
                  />
                </div>

                {/* Description */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief scope summary..."
                    rows={3}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border-color))",
                      backgroundColor: "hsl(var(--bg-primary) / 0.5)",
                      resize: "none",
                    }}
                  />
                </div>

                {/* Deadline */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>Project Deadline *</label>
                  <input
                    type="date"
                    required
                    min={getTodayDateString()} // HTML5 browser min validation
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border-color))",
                      backgroundColor: "hsl(var(--bg-primary) / 0.5)",
                    }}
                  />
                </div>

                {/* Members Selection List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>Add Members</label>
                  <div
                    style={{
                      maxHeight: "150px",
                      overflowY: "auto",
                      border: "1px solid hsl(var(--border-color))",
                      borderRadius: "8px",
                      padding: "10px",
                      backgroundColor: "hsl(var(--bg-primary) / 0.3)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    {memberOptions.map((opt) => (
                      <label
                        key={opt._id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          fontSize: "0.85rem",
                          cursor: "pointer",
                          padding: "6px",
                          borderRadius: "4px",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "hsl(var(--border-color))")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(opt._id)}
                          onChange={() => handleMemberToggle(opt._id)}
                        />
                        <span>
                          {opt.name} ({opt.role.replace("_", " ")})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      border: "1px solid hsl(var(--border-color))",
                      fontWeight: 600,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="gradient-bg"
                    style={{
                      padding: "10px 20px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: 600,
                      opacity: formLoading ? 0.7 : 1,
                    }}
                  >
                    {formLoading ? "Creating..." : "Save Project"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
