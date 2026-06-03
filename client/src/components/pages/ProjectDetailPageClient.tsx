"use client";

import React, { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Calendar, Users, Plus, ArrowLeft, Clock, X } from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";
import Loading from "../Loading";

import { Project, Member, Task } from "@/types";

export default function ProjectDetailPageClient({
  projectId,
  initialProject,
  initialTasks,
  initialUsers,
}: {
  projectId: string;
  initialProject: Project | null;
  initialTasks: Task[];
  initialUsers: Member[];
}) {
  const id = projectId;
  const { apiFetch, showToast, user } = useAuth();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(initialProject);
  const [tasks, setTasks] = useState<Task[]>(initialTasks || []);
  const [userOptions, setUserOptions] = useState<Member[]>(
    initialUsers || [],
  );
  const [loading, setLoading] = useState(!initialProject);

  // Modals States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Add Task States
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskPriority, setTaskPriority] = useState("Medium");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [taskFormLoading, setTaskFormLoading] = useState(false);

  // Invite Member States
  const [inviteUserId, setInviteUserId] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const isManager = user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER";

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const [projRes, tasksRes] = await Promise.all([
        apiFetch(`/projects/${id}`),
        apiFetch(`/tasks?project=${id}`),
      ]);

      if (projRes.success) setProject(projRes.data);
      if (tasksRes.success) setTasks(tasksRes.data);
    } catch (err: any) {
      showToast(err.message || "Failed to load project details", "error");
      router.push("/projects");
    } finally {
      setLoading(false);
    }
  };

  const fetchInviteOptions = async () => {
    try {
      const res = await apiFetch("/user");
      if (res.success) {
        setUserOptions(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (initialProject) {
      return;
    }
    if (id) {
      fetchProjectDetails();
      if (isManager) {
        fetchInviteOptions();
      }
    }
  }, [id, initialProject]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !taskDueDate || !taskAssignee) return;

    // Strict Date Validation
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (new Date(taskDueDate) < now) {
      showToast("Please select a valid deadline.", "error");
      return;
    }

    try {
      setTaskFormLoading(true);
      const payload = {
        title: taskTitle,
        description: taskDesc,
        project: id,
        dueDate: taskDueDate,
        priority: taskPriority,
        assignedMember: taskAssignee,
      };

      const res = await apiFetch("/tasks", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.success) {
        showToast("Task created and assigned successfully!", "success");
        setIsTaskModalOpen(false);
        // Reset Task Form
        setTaskTitle("");
        setTaskDesc("");
        setTaskDueDate("");
        setTaskPriority("Medium");
        setTaskAssignee("");
        fetchProjectDetails();
        router.refresh();
      }
    } catch (err: any) {
      showToast(err.message || "Failed to create task", "error");
    } finally {
      setTaskFormLoading(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteUserId) return;

    try {
      setInviteLoading(true);
      const res = await apiFetch(`/projects/${id}/members`, {
        method: "POST",
        body: JSON.stringify({ userId: inviteUserId }),
      });

      if (res.success) {
        showToast("Member successfully invited to project!", "success");
        setIsInviteModalOpen(false);
        setInviteUserId("");
        fetchProjectDetails();
        router.refresh();
      }
    } catch (err: any) {
      showToast(err.message || "Failed to invite member", "error");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleUpdateProjectStatus = async (newStatus: string) => {
    try {
      const res = await apiFetch(`/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.success) {
        showToast("Project status updated", "success");
        fetchProjectDetails();
        router.refresh();
      }
    } catch (err: any) {
      showToast(err.message || "Failed to update project status", "error");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (memberId === project?.createdBy?._id) {
      showToast("Cannot remove the project owner.", "error");
      return;
    }

    const result = await Swal.fire({
      title: "Remove Member?",
      text: "This member will no longer have access to this project.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "hsl(var(--danger))",
      cancelButtonColor: "hsl(var(--border-color))",
      confirmButtonText: "Remove Member",
      background: "hsl(var(--bg-secondary))",
      color: "hsl(var(--text-primary))",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await apiFetch(`/projects/${id}/members/${memberId}`, {
        method: "DELETE",
      });

      if (res.success) {
        showToast("Member removed from project", "success");
        fetchProjectDetails();
        router.refresh();
      }
    } catch (err: any) {
      showToast(err.message || "Failed to remove member", "error");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const result = await Swal.fire({
      title: "Delete Task?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "hsl(var(--danger))",
      cancelButtonColor: "hsl(var(--border-color))",
      confirmButtonText: "Yes, delete",
      background: "hsl(var(--bg-secondary))",
      color: "hsl(var(--text-primary))",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await apiFetch(`/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (res.success) {
        showToast("Task deleted successfully", "success");
        fetchProjectDetails();
        router.refresh();
      }
    } catch (err: any) {
      showToast(err.message || "Failed to delete task", "error");
    }
  };

  const handleDeleteProject = async () => {
    const result = await Swal.fire({
      title: "Delete Entire Project?",
      text: "This will permanently remove this project and all its tasks. This action is irreversible!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "hsl(var(--danger))",
      cancelButtonColor: "hsl(var(--border-color))",
      confirmButtonText: "Yes, delete project",
      background: "hsl(var(--bg-secondary))",
      color: "hsl(var(--text-primary))",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await apiFetch(`/projects/${id}`, {
        method: "DELETE",
      });

      if (res.success) {
        showToast("Project deleted successfully", "success");
        router.push("/projects");
        router.refresh();
      }
    } catch (err: any) {
      showToast(err.message || "Failed to delete project", "error");
    }
  };

  // Group tasks into columns for Kanban display
  const todoTasks = tasks.filter((t) => t.status === "Todo");
  const inProgressTasks = tasks.filter((t) => t.status === "In Progress");
  const completedTasks = tasks.filter((t) => t.status === "Completed");

  const completionRate =
    tasks.length > 0
      ? Math.round((completedTasks.length / tasks.length) * 100)
      : 0;

  const getTodayDateString = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  };

  if (loading || !project) {
    return (
      <div
        style={{
          display: "flex",
          height: "60vh",
          alignItems: "center",
          justifyContent: "center",
        }}>
        <Loading text='Loading project board...' />
      </div>
    );
  }

  return (
    <>
      <div style={{ animation: "fadeIn var(--transition-normal) forwards" }}>
      {/* Back Link */}
      <Link
        href='/projects'
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          color: "hsl(var(--text-secondary))",
          marginBottom: "24px",
          fontSize: "0.875rem",
          fontWeight: 600,
        }}>
        <ArrowLeft size={16} /> Back to Projects
      </Link>

      {/* Project Header panel */}
      <div
        className='glass-panel'
        style={{
          padding: isMobile ? "20px" : "32px",
          marginBottom: "32px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "20px",
          }}>
          <div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.875rem",
                fontWeight: 800,
              }}>
              {project.name}
            </h1>
            <p
              style={{
                color: "hsl(var(--text-secondary))",
                marginTop: "8px",
                fontSize: "0.95rem",
              }}>
              {project.description || "No project description loaded."}
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <select
              value={project.status}
              onChange={(e) => handleUpdateProjectStatus(e.target.value)}
              disabled={!isManager}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: "1px solid hsl(var(--border-color))",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: isManager ? "pointer" : "default",
                backgroundColor:
                  project.status === "Completed"
                    ? "hsl(var(--success) / 0.1)"
                    : project.status === "Active"
                      ? "hsl(var(--primary) / 0.1)"
                      : "hsl(var(--bg-secondary))",
                color:
                  project.status === "Completed"
                    ? "hsl(var(--success))"
                    : project.status === "Active"
                      ? "hsl(var(--primary))"
                      : "inherit",
              }}>
              <option value='Active'>Active</option>
              <option value='Completed'>Completed</option>
              <option value='On Hold'>On Hold</option>
            </select>

            {isManager && (
              <button
                onClick={handleDeleteProject}
                style={{
                  padding: "8px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "hsl(var(--danger) / 0.1)",
                  color: "hsl(var(--danger))",
                  cursor: "pointer",
                }}
                title='Delete Project'>
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Timeline and members section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "24px",
            borderTop: "1px solid hsl(var(--border-color) / 0.5)",
            paddingTop: "24px",
          }}>
          <div
            style={{
              display: "flex",
              gap: "24px",
              flexWrap: "wrap",
              width: isMobile ? "100%" : "auto",
            }}>
            {/* Deadline */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Calendar
                size={18}
                style={{ color: "hsl(var(--text-secondary))" }}
              />
              <div>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "hsl(var(--text-muted))",
                    fontWeight: 500,
                  }}>
                  Deadline
                </p>
                <p style={{ fontSize: "0.875rem", fontWeight: 700 }}>
                  {new Date(project.deadline || "").toLocaleDateString([], {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Progress */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                minWidth: "180px",
              }}>
              <div>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "hsl(var(--text-muted))",
                    fontWeight: 500,
                  }}>
                  Progress ({completionRate}%)
                </p>
                <div
                  style={{
                    height: "8px",
                    width: "140px",
                    backgroundColor: "hsl(var(--border-color))",
                    borderRadius: "4px",
                    overflow: "hidden",
                    marginTop: "6px",
                  }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${completionRate}%`,
                      backgroundColor: "hsl(var(--success))",
                      borderRadius: "4px",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Members avatars list */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              {(project.members || []).slice(0, 5).map((memb, idx) => (
                <div
                  key={memb._id}
                  className='gradient-bg'
                  title={`${memb.name} (${memb.role.replace("_", " ")})`}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    border: "2px solid hsl(var(--bg-secondary))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    marginLeft: idx > 0 ? "-8px" : 0,
                    zIndex: 5 - idx,
                    cursor: "help",
                  }}>
                  {memb.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
              ))}
              {(project.members || []).length > 5 && (
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    border: "2px solid hsl(var(--bg-secondary))",
                    backgroundColor: "hsl(var(--border-color))",
                    color: "hsl(var(--text-secondary))",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginLeft: "-8px",
                    zIndex: 0,
                  }}>
                  +{(project.members || []).length - 5}
                </div>
              )}
            </div>

            {isManager && (
              <button
                onClick={() => setIsInviteModalOpen(true)}
                style={{
                  cursor: "pointer",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid hsl(var(--border-color))",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "hsl(var(--border-color))")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }>
                <Users size={14} />
                <span>Invite</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KANBAN BOARD SECTION HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}>
        <h3 style={{ fontSize: "1.125rem", fontWeight: 700 }}>Project Tasks</h3>
        {isManager && (
          <button
            onClick={() => setIsTaskModalOpen(true)}
            style={{
              cursor: "pointer",
              padding: "8px 16px",
              borderRadius: "8px",
              backgroundColor: "hsl(var(--primary) / 0.1)",
              color: "hsl(var(--primary))",
              fontSize: "0.85rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "hsl(var(--primary) / 0.15)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor =
                "hsl(var(--primary) / 0.1)")
            }>
            <Plus size={16} />
            <span>Add Task</span>
          </button>
        )}
      </div>

      {/* KANBAN COLUMNS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
          gap: "24px",
          alignItems: "start",
        }}>
        {/* COLUMN 1: TODO */}
        <div
          className='glass-panel'
          style={{
            padding: "20px",
            backgroundColor: "hsl(var(--bg-secondary) / 0.4)",
          }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}>
            <h4 style={{ fontWeight: 700, fontSize: "0.95rem" }}>Todo</h4>
            <span
              style={{
                fontSize: "0.75rem",
                padding: "2px 8px",
                borderRadius: "10px",
                backgroundColor: "hsl(var(--border-color))",
                fontWeight: 700,
              }}>
              {todoTasks.length}
            </span>
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {todoTasks.map((t) => (
              <TaskCard key={t._id} task={t} />
            ))}
            {todoTasks.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "20px",
                  color: "hsl(var(--text-muted))",
                  fontSize: "0.8rem",
                }}>
                No tasks in Todo
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 2: IN PROGRESS */}
        <div
          className='glass-panel'
          style={{
            padding: "20px",
            backgroundColor: "hsl(var(--bg-secondary) / 0.4)",
          }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}>
            <h4 style={{ fontWeight: 700, fontSize: "0.95rem" }}>
              In Progress
            </h4>
            <span
              style={{
                fontSize: "0.75rem",
                padding: "2px 8px",
                borderRadius: "10px",
                backgroundColor: "hsl(var(--primary) / 0.1)",
                color: "hsl(var(--primary))",
                fontWeight: 700,
              }}>
              {inProgressTasks.length}
            </span>
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {inProgressTasks.map((t) => (
              <TaskCard key={t._id} task={t} />
            ))}
            {inProgressTasks.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "20px",
                  color: "hsl(var(--text-muted))",
                  fontSize: "0.8rem",
                }}>
                No tasks In Progress
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 3: COMPLETED */}
        <div
          className='glass-panel'
          style={{
            padding: "20px",
            backgroundColor: "hsl(var(--bg-secondary) / 0.4)",
          }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}>
            <h4 style={{ fontWeight: 700, fontSize: "0.95rem" }}>Completed</h4>
            <span
              style={{
                fontSize: "0.75rem",
                padding: "2px 8px",
                borderRadius: "10px",
                backgroundColor: "hsl(var(--success) / 0.1)",
                color: "hsl(var(--success))",
                fontWeight: 700,
              }}>
              {completedTasks.length}
            </span>
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {completedTasks.map((t) => (
              <TaskCard key={t._id} task={t} />
            ))}
            {completedTasks.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "20px",
                  color: "hsl(var(--text-muted))",
                  fontSize: "0.8rem",
                }}>
                No completed tasks
              </div>
            )}
          </div>
        </div>
      </div>

      </div>

      {/* CREATE TASK MODAL */}
      {isTaskModalOpen && (
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
            padding: isMobile ? "8px" : "24px",
          }}>
          <div
            className='glass-panel'
            style={{
              maxWidth: "600px",
              width: "100%",
              padding: isMobile ? "20px 20px 32px 20px" : "32px 32px 48px 32px",
              backgroundColor: "hsl(var(--bg-secondary))",
              position: "relative",
              maxHeight: "85vh",
              overflowY: "auto",
            }}>
            <button
              onClick={() => setIsTaskModalOpen(false)}
              style={{
                position: "absolute",
                top: "24px",
                right: "24px",
                cursor: "pointer",
                color: "hsl(var(--text-secondary))",
              }}>
              <X size={20} />
            </button>

            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.5rem",
                fontWeight: 700,
                marginBottom: "24px",
              }}>
              Add Project Task
            </h2>

            <form
              onSubmit={handleCreateTask}
              style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Title */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}>
                <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                  Task Title *
                </label>
                <input
                  type='text'
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder='E.g. Design Landing Page'
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border-color))",
                    backgroundColor: "hsl(var(--bg-primary) / 0.5)",
                    color: "hsl(var(--text-primary))",
                  }}
                />
              </div>

              {/* Description */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}>
                <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                  Description
                </label>
                <textarea
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder='Specify requirements...'
                  rows={3}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border-color))",
                    backgroundColor: "hsl(var(--bg-primary) / 0.5)",
                    color: "hsl(var(--text-primary))",
                    resize: "none",
                  }}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: "16px",
                }}>
                {/* Due Date */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}>
                  <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                    Due Date *
                  </label>
                  <input
                    type='date'
                    required
                    min={getTodayDateString()} // Client side restriction
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border-color))",
                      backgroundColor: "hsl(var(--bg-primary) / 0.5)",
                      color: "hsl(var(--text-primary))",
                    }}
                  />
                </div>

                {/* Priority */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}>
                  <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                    Priority
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border-color))",
                      backgroundColor: "hsl(var(--bg-primary) / 0.5)",
                      color: "hsl(var(--text-primary))",
                      cursor: "pointer",
                    }}>
                    <option value='High'>High</option>
                    <option value='Medium'>Medium</option>
                    <option value='Low'>Low</option>
                  </select>
                </div>
              </div>

              {/* Assignee */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}>
                <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                  Assign To
                </label>
                <select
                  value={taskAssignee}
                  onChange={(e) => setTaskAssignee(e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border-color))",
                    backgroundColor: "hsl(var(--bg-primary) / 0.5)",
                    color: "hsl(var(--text-primary))",
                    cursor: "pointer",
                  }}>
                  <option value=''>Unassigned</option>
                  {(project.members || []).map((opt) => (
                    <option key={opt._id} value={opt._id}>
                      {opt.name} ({opt.role.replace("_", " ")})
                    </option>
                  ))}
                </select>
              </div>

              {/* Buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  marginTop: "12px",
                }}>
                <button
                  type='button'
                  onClick={() => setIsTaskModalOpen(false)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    border: "1px solid hsl(var(--border-color))",
                    fontWeight: 600,
                  }}>
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={taskFormLoading}
                  className='gradient-bg'
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: 600,
                    opacity: taskFormLoading ? 0.7 : 1,
                  }}>
                  {taskFormLoading ? "Creating..." : "Save Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVITE MEMBER MODAL */}
      {isInviteModalOpen && (
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
            padding: isMobile ? "8px" : "24px",
          }}>
          <div
            className='glass-panel'
            style={{
              maxWidth: "460px",
              width: "100%",
              padding: isMobile ? "20px" : "32px",
              backgroundColor: "hsl(var(--bg-secondary))",
              position: "relative",
              maxHeight: "90vh",
              overflowY: "auto",
            }}>
            <button
              onClick={() => setIsInviteModalOpen(false)}
              style={{
                position: "absolute",
                top: "24px",
                right: "24px",
                cursor: "pointer",
                color: "hsl(var(--text-secondary))",
              }}>
              <X size={20} />
            </button>

            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.25rem",
                fontWeight: 700,
                marginBottom: "20px",
              }}>
              Add Project Member
            </h2>

            <form
              onSubmit={handleInviteMember}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}>
                <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                  Select User
                </label>
                <select
                  required
                  value={inviteUserId}
                  onChange={(e) => setInviteUserId(e.target.value)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border-color))",
                    backgroundColor: "hsl(var(--bg-primary) / 0.5)",
                    cursor: "pointer",
                  }}>
                  <option value=''>Select a user to add...</option>
                  {userOptions
                    .filter(
                      (o) => !(project.members || []).some((m) => m._id === o._id),
                    )
                    .map((opt) => (
                      <option key={opt._id} value={opt._id}>
                        {opt.name} ({opt.role.replace("_", " ")})
                      </option>
                    ))}
                </select>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  marginTop: "12px",
                }}>
                <button
                  type='button'
                  onClick={() => setIsInviteModalOpen(false)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    border: "1px solid hsl(var(--border-color))",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}>
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={inviteLoading}
                  className='gradient-bg'
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    opacity: inviteLoading ? 0.7 : 1,
                  }}>
                  {inviteLoading ? "Adding..." : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// Kanban Task Card Component
const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
  const router = useRouter();
  const overdue =
    new Date(task.dueDate) < new Date() && task.status !== "Completed";

  return (
    <div
      className='glass-panel'
      onClick={() => router.push("/tasks")}
      style={{
        padding: "16px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        border: overdue ? "1px solid hsl(var(--danger) / 0.3)" : undefined,
        backgroundColor: "hsl(var(--bg-secondary))",
        boxShadow: "var(--shadow-sm)",
        transition:
          "transform var(--transition-fast), border-color var(--transition-fast)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.borderColor = "hsl(var(--primary) / 0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "var(--glass-border)";
      }}>
      <div>
        <h5
          style={{
            fontWeight: 700,
            fontSize: "0.875rem",
            marginBottom: "4px",
          }}>
          {task.title}
        </h5>
        {task.description && (
          <p
            style={{
              fontSize: "0.75rem",
              color: "hsl(var(--text-secondary))",
              lineHeight: 1.4,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}>
            {task.description}
          </p>
        )}
      </div>

      {/* Meta Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid hsl(var(--border-color) / 0.4)",
          paddingTop: "12px",
          marginTop: "4px",
        }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span
            className={`badge badge-${task.priority.toLowerCase()}`}
            style={{ padding: "2px 6px", fontSize: "0.65rem" }}>
            {task.priority}
          </span>
          <span
            style={{
              fontSize: "0.675rem",
              color: overdue ? "hsl(var(--danger))" : "hsl(var(--text-muted))",
              display: "flex",
              alignItems: "center",
              gap: "2px",
              fontWeight: overdue ? 700 : 500,
            }}>
            <Clock size={10} />
            {new Date(task.dueDate).toLocaleDateString([], {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        {/* Assignee Avatar */}
        {task.assignedMember ? (
          <div
            className='gradient-bg'
            title={`Assigned to: ${task.assignedMember.name}`}
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "0.65rem",
              fontWeight: 700,
            }}>
            {task.assignedMember.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </div>
        ) : (
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              backgroundColor: "hsl(var(--border-color))",
              color: "hsl(var(--text-muted))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.65rem",
              fontWeight: 500,
            }}
            title='Unassigned'>
            U
          </div>
        )}
      </div>
    </div>
  );
};
