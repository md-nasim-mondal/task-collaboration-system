"use client";

import React, { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import {
  Search,
  ArrowUpDown,
  MessageSquare,
  Paperclip,
  Calendar,
  User,
  Folder,
  X,
  Send,
  Plus,
  ClipboardList,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Loading from "../Loading";

interface Member {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Project {
  _id: string;
  name: string;
}

interface Comment {
  user: Member;
  text: string;
  createdAt: string;
}

interface Attachment {
  name: string;
  url: string;
}

interface Task {
  _id: string;
  title: string;
  description?: string;
  project: Project;
  assignedMember?: Member;
  dueDate: string;
  priority: "High" | "Medium" | "Low";
  status: "Todo" | "In Progress" | "Completed";
  attachments: Attachment[];
  comments: Comment[];
}

export default function TasksPageClient({
  initialTasks,
  initialProjects,
  initialTeamMembers,
}: {
  initialTasks: Task[];
  initialProjects: Project[];
  initialTeamMembers: Member[];
}) {
  const { apiFetch, showToast, user } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>(initialTasks || []);
  const [projects, setProjects] = useState<Project[]>(initialProjects || []);
  const [teamMembers, setTeamMembers] = useState<Member[]>(
    initialTeamMembers || [],
  );
  const [loading, setLoading] = useState(false);

  // Filter and Sort States
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [deadlineStatusFilter, setDeadlineStatusFilter] = useState("");
  const [sortOption, setSortOption] = useState("-createdAt");

  // Selected Task Detail Modal States
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [attachName, setAttachName] = useState("");
  const [attachUrl, setAttachUrl] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  // Edit Task local state inside modal
  const [editStatus, setEditStatus] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [editAssignee, setEditAssignee] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDueDate, setEditDueDate] = useState("");

  // Create Task Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newProject, setNewProject] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const [newPriority, setNewPriority] = useState("Medium");
  const [newDueDate, setNewDueDate] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const isManager = user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER";

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append("searchTerm", searchTerm);
      if (statusFilter) queryParams.append("status", statusFilter);
      if (priorityFilter) queryParams.append("priority", priorityFilter);
      if (projectFilter) queryParams.append("project", projectFilter);
      if (assigneeFilter) queryParams.append("assignedMember", assigneeFilter);
      if (deadlineStatusFilter)
        queryParams.append("deadlineStatus", deadlineStatusFilter);
      queryParams.append("sort", sortOption);

      const res = await apiFetch(`/tasks?${queryParams.toString()}`);
      if (res.success) {
        setTasks(res.data);
      }
    } catch (err: any) {
      showToast(err.message || "Failed to load tasks", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchMetaOptions = async () => {
    try {
      const [projRes, membersRes] = await Promise.all([
        apiFetch("/projects"),
        apiFetch("/user"),
      ]);
      if (projRes.success) setProjects(projRes.data);
      if (membersRes.success) setTeamMembers(membersRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      // Always fetch when dependencies change to ensure data stays in sync with filters
      fetchTasks();
    }, 400); // Debounce search

    return () => clearTimeout(timer);
  }, [
    searchTerm,
    statusFilter,
    priorityFilter,
    projectFilter,
    assigneeFilter,
    deadlineStatusFilter,
    sortOption,
  ]);

  useEffect(() => {
    if (projects.length === 0 || teamMembers.length === 0) {
      fetchMetaOptions();
    }
  }, []);

  const handleQuickStatusUpdate = async (taskId: string, newStatus: string) => {
    try {
      const res = await apiFetch(`/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.success) {
        showToast("Status updated", "success");
        fetchTasks();
        router.refresh();
      }
    } catch (err: any) {
      showToast(err.message || "Failed to update status", "error");
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newProject || !newAssignee || !newDueDate) {
      showToast("Please fill all required fields", "error");
      return;
    }

    // Date check
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (new Date(newDueDate) < now) {
      showToast("Please select a valid deadline.", "error");
      return;
    }

    try {
      setCreateLoading(true);
      const payload = {
        title: newTitle,
        description: newDesc,
        project: newProject,
        assignedMember: newAssignee,
        priority: newPriority,
        dueDate: newDueDate,
      };

      const res = await apiFetch("/tasks", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.success) {
        showToast("Task created successfully!", "success");
        setIsCreateModalOpen(false);
        // Reset form
        setNewTitle("");
        setNewDesc("");
        setNewProject("");
        setNewAssignee("");
        setNewPriority("Medium");
        setNewDueDate("");
        fetchTasks();
        router.refresh();
      }
    } catch (err: any) {
      showToast(err.message || "Failed to create task", "error");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleOpenTask = async (task: Task) => {
    try {
      setModalLoading(true);
      setSelectedTask(task);
      setIsTaskModalOpen(true);

      // Populate local edit states
      setEditStatus(task.status);
      setEditPriority(task.priority);
      setEditAssignee(task.assignedMember?._id || "");
      setEditTitle(task.title);
      setEditDesc(task.description || "");
      setEditDueDate(task.dueDate.split("T")[0]);

      // Fetch fresh details (to get latest comments/attachments)
      const res = await apiFetch(`/tasks/${task._id}`);
      if (res.success) {
        setSelectedTask(res.data);
      }
    } catch (err: any) {
      showToast(err.message || "Failed to fetch task details", "error");
    } finally {
      setModalLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedTask) return;

    // Check completed task reassignment error
    if (
      selectedTask.status === "Completed" &&
      editAssignee !== (selectedTask.assignedMember?._id || "")
    ) {
      showToast("Completed tasks cannot be reassigned.", "error");
      return;
    }

    // Date check
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (new Date(editDueDate) < now) {
      showToast("Please select a valid deadline.", "error");
      return;
    }

    try {
      setModalLoading(true);
      const payload: any = {
        status: editStatus,
      };

      // Only allow editing title, description, priority, deadline, assignee for Admin/PM
      if (isManager) {
        payload.title = editTitle;
        payload.description = editDesc;
        payload.priority = editPriority;
        payload.dueDate = editDueDate;
        payload.assignedMember = editAssignee || null;
      }

      const res = await apiFetch(`/tasks/${selectedTask._id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      if (res.success) {
        showToast("Task updated successfully!", "success");
        setIsTaskModalOpen(false);
        fetchTasks();
        router.refresh();
      }
    } catch (err: any) {
      showToast(err.message || "Failed to update task", "error");
    } finally {
      setModalLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedTask) return;

    try {
      const res = await apiFetch(`/tasks/${selectedTask._id}/comments`, {
        method: "POST",
        body: JSON.stringify({ text: commentText.trim() }),
      });

      if (res.success) {
        setSelectedTask(res.data);
        setCommentText("");
        showToast("Comment added", "success");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to add comment", "error");
    }
  };

  const handleAddAttachment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attachName.trim() || !attachUrl.trim() || !selectedTask) return;

    try {
      const res = await apiFetch(`/tasks/${selectedTask._id}/attachments`, {
        method: "POST",
        body: JSON.stringify({
          name: attachName.trim(),
          url: attachUrl.trim(),
        }),
      });

      if (res.success) {
        setSelectedTask(res.data);
        setAttachName("");
        setAttachUrl("");
        showToast("Attachment uploaded", "success");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to add attachment", "error");
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;

    const result = await Swal.fire({
      title: "Delete Task?",
      text: "Are you sure you want to remove this task from the workspace?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "hsl(var(--danger))",
      cancelButtonColor: "hsl(var(--border-color))",
      confirmButtonText: "Delete Task",
      background: "hsl(var(--bg-secondary))",
      color: "hsl(var(--text-primary))",
    });

    if (!result.isConfirmed) return;

    try {
      setModalLoading(true);
      const res = await apiFetch(`/tasks/${selectedTask._id}`, {
        method: "DELETE",
      });

      if (res.success) {
        showToast("Task deleted successfully", "success");
        setIsTaskModalOpen(false);
        fetchTasks();
        router.refresh();
      }
    } catch (err: any) {
      showToast(err.message || "Failed to delete task", "error");
    } finally {
      setModalLoading(false);
    }
  };

  const isAssignedToCurrentUser =
    selectedTask?.assignedMember?._id === user?.id;
  const canModifyStatus = isManager || isAssignedToCurrentUser;

  return (
    <>
      <div style={{ animation: "fadeIn var(--transition-normal) forwards" }}>
      {/* Header Section */}
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
            Tasks Center
          </h1>
          <p style={{ color: "hsl(var(--text-secondary))", marginTop: "4px" }}>
            Search task lists, filter parameters, and collaborate on
            assignments.
          </p>
        </div>
        {isManager && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className='gradient-bg'
            style={{
              padding: "12px 24px",
              borderRadius: "10px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              boxShadow: "0 4px 12px hsl(var(--primary) / 0.25)",
            }}>
            <Plus size={18} />
            <span>Create Task</span>
          </button>
        )}
      </div>

      {/* CONTROLS ROW */}
      <div
        className='glass-panel'
        style={{
          padding: isMobile ? "16px" : "24px",
          marginBottom: "32px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}>
        {/* Row 1: Search & Sort */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
          {/* Search */}
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
              minWidth: "280px",
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
              placeholder='Search tasks by title or content...'
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

          {/* Sort */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ArrowUpDown
              size={18}
              style={{ color: "hsl(var(--text-secondary))" }}
            />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                border: "1px solid hsl(var(--border-color))",
                backgroundColor: "hsl(var(--bg-primary) / 0.5)",
                cursor: "pointer",
                fontWeight: 500,
              }}>
              <option value='-createdAt'>Newest Created</option>
              <option value='created'>Oldest Created</option>
              <option value='deadline'>Nearest Due Date</option>
              <option value='-priority'>Highest Priority</option>
              <option value='updated'>Latest Updated</option>
            </select>
          </div>
        </div>

        {/* Row 2: Advanced Filters */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            borderTop: "1px solid hsl(var(--border-color) / 0.5)",
            paddingTop: "16px",
          }}>
          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid hsl(var(--border-color))",
              fontSize: "0.85rem",
            }}>
            <option value=''>All Statuses</option>
            <option value='Todo'>Todo</option>
            <option value='In Progress'>In Progress</option>
            <option value='Completed'>Completed</option>
          </select>

          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid hsl(var(--border-color))",
              fontSize: "0.85rem",
            }}>
            <option value=''>All Priorities</option>
            <option value='High'>High Priority</option>
            <option value='Medium'>Medium Priority</option>
            <option value='Low'>Low Priority</option>
          </select>

          {/* Project */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid hsl(var(--border-color))",
              fontSize: "0.85rem",
              maxWidth: "180px",
            }}>
            <option value=''>All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Assignee */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid hsl(var(--border-color))",
              fontSize: "0.85rem",
              maxWidth: "180px",
            }}>
            <option value=''>All Assignees</option>
            {teamMembers.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>

          {/* Overdue Warning Filter */}
          <select
            value={deadlineStatusFilter}
            onChange={(e) => setDeadlineStatusFilter(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid hsl(var(--border-color))",
              fontSize: "0.85rem",
              color:
                deadlineStatusFilter === "Overdue"
                  ? "hsl(var(--danger))"
                  : "inherit",
              fontWeight: deadlineStatusFilter === "Overdue" ? 600 : "inherit",
            }}>
            <option value=''>All Deadlines</option>
            <option value='Upcoming'>Upcoming Only</option>
            <option value='Overdue'>Overdue Warnings ⚠️</option>
          </select>
        </div>
      </div>

      {/* TASKS TABLE GRID */}
      {loading ? (
        <Loading text='Loading tasks...' />
      ) : tasks.length > 0 ? (
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
            <ClipboardList size={40} />
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>
            No tasks found
          </h2>
          <p
            style={{
              color: "hsl(var(--text-secondary))",
              maxWidth: "400px",
              lineHeight: 1.6,
            }}>
            We couldn't find any tasks matching your current filters. Try
            adjusting your search or using different filters.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("");
              setPriorityFilter("");
              setProjectFilter("");
              setAssigneeFilter("");
              setDeadlineStatusFilter("");
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
      ) : (
        <div className='glass-panel' style={{ overflow: "hidden" }}>
          <div
            className='responsive-table-container'
            style={{ border: "none", overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                minWidth: isMobile ? "600px" : "100%",
                borderCollapse: "collapse",
                textAlign: "left",
              }}>
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid hsl(var(--border-color))",
                    backgroundColor: "hsl(var(--bg-secondary) / 0.5)",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: "hsl(var(--text-secondary))",
                  }}>
                  <th style={{ padding: "16px 20px" }}>Task Title</th>
                  <th style={{ padding: "16px 20px" }}>Project</th>
                  <th style={{ padding: "16px 20px" }}>Assignee</th>
                  <th style={{ padding: "16px 20px" }}>Priority</th>
                  <th style={{ padding: "16px 20px" }}>Due Date</th>
                  <th style={{ padding: "16px 20px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => {
                  const overdue =
                    new Date(task.dueDate) < new Date() &&
                    task.status !== "Completed";
                  return (
                    <tr
                      key={task._id}
                      onClick={() => handleOpenTask(task)}
                      style={{
                        borderBottom:
                          "1px solid hsl(var(--border-color) / 0.4)",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        transition: "background var(--transition-fast)",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "hsl(var(--primary) / 0.03)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }>
                      <td style={{ padding: "16px 20px", fontWeight: 600 }}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "2px",
                          }}>
                          <span>{task.title}</span>
                          <div
                            style={{
                              display: "flex",
                              gap: "10px",
                              alignItems: "center",
                              marginTop: "4px",
                            }}>
                            {task.comments?.length > 0 && (
                              <span
                                style={{
                                  fontSize: "0.7rem",
                                  color: "hsl(var(--text-muted))",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "2px",
                                }}>
                                <MessageSquare size={12} />{" "}
                                {task.comments.length}
                              </span>
                            )}
                            {task.attachments?.length > 0 && (
                              <span
                                style={{
                                  fontSize: "0.7rem",
                                  color: "hsl(var(--text-muted))",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "2px",
                                }}>
                                <Paperclip size={12} />{" "}
                                {task.attachments.length}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "16px 20px",
                          color: "hsl(var(--text-secondary))",
                        }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}>
                          <Folder size={14} />{" "}
                          {task.project?.name || "Workspace"}
                        </span>
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        {task.assignedMember ? (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}>
                            <div
                              className='gradient-bg'
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
                            <span
                              style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                              {task.assignedMember.name}
                            </span>
                          </div>
                        ) : (
                          <span
                            style={{
                              color: "hsl(var(--text-muted))",
                              fontSize: "0.8rem",
                            }}>
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <span
                          className={`badge badge-${task.priority.toLowerCase()}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "16px 20px",
                          color: overdue
                            ? "hsl(var(--danger))"
                            : "hsl(var(--text-secondary))",
                          fontWeight: overdue ? 700 : "inherit",
                        }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                          }}>
                          <Calendar size={14} />
                          {new Date(task.dueDate).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          })}
                          {overdue && " (Overdue)"}
                        </span>
                      </td>
                      <td
                        style={{ padding: "16px 20px" }}
                        onClick={(e) => e.stopPropagation()}>
                        <select
                          disabled={
                            !(
                              isManager || task.assignedMember?._id === user?.id
                            )
                          }
                          value={task.status}
                          onChange={(e) =>
                            handleQuickStatusUpdate(task._id, e.target.value)
                          }
                          style={{
                            padding: "6px 10px",
                            borderRadius: "6px",
                            border: "1px solid hsl(var(--border-color))",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            backgroundColor:
                              task.status === "Completed"
                                ? "hsl(var(--success) / 0.1)"
                                : task.status === "In Progress"
                                  ? "hsl(var(--warning) / 0.1)"
                                  : "hsl(var(--bg-secondary))",
                            color:
                              task.status === "Completed"
                                ? "hsl(var(--success))"
                                : task.status === "In Progress"
                                  ? "hsl(var(--warning-text))"
                                  : "inherit",
                          }}>
                          <option value='Todo'>Todo</option>
                          <option value='In Progress'>In Progress</option>
                          <option value='Completed'>Completed</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      </div>

      {/* TASK DETAILS MODAL */}
      {isTaskModalOpen && selectedTask && (
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
          onClick={() => setIsTaskModalOpen(false)}>
          <div
            className='glass-panel'
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "960px",
              width: "100%",
              maxHeight: isMobile ? "95vh" : "90vh",
              display: "flex",
              flexDirection: "column",
              overflow: isMobile ? "auto" : "hidden",
              boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
              backgroundColor: "hsl(var(--bg-secondary))",
              position: "relative",
              animation: "fadeIn var(--transition-normal) forwards",
            }}>
            {/* Modal Close */}
            <button
              onClick={() => setIsTaskModalOpen(false)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                cursor: "pointer",
                color: "hsl(var(--text-secondary))",
                zIndex: 10,
              }}>
              <X size={20} />
            </button>

            {/* Modal Body Container */}
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", flexGrow: 1, overflow: isMobile ? "visible" : "hidden" }}>
              {/* Left Side: Task Fields Form */}
              <div
                style={{
                  flex: 1,
                  padding: isMobile ? "20px" : "32px",
                  overflowY: isMobile ? "visible" : "auto",
                  borderRight: isMobile ? "none" : "1px solid hsl(var(--border-color) / 0.5)",
                  borderBottom: isMobile ? "1px solid hsl(var(--border-color) / 0.5)" : "none",
                }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "hsl(var(--primary))",
                    marginBottom: "12px",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                  }}>
                  <Folder size={14} />
                  <span>
                    PROJECT: {selectedTask.project?.name || "Workspace"}
                  </span>
                </div>

                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    marginBottom: "24px",
                  }}>
                  {isManager ? (
                    <input
                      type='text'
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      style={{
                        width: "100%",
                        fontSize: "1.5rem",
                        fontWeight: 800,
                        border: "none",
                        borderBottom: "1px dashed hsl(var(--border-color))",
                        backgroundColor: "transparent",
                        padding: "2px 0",
                      }}
                    />
                  ) : (
                    selectedTask.title
                  )}
                </h2>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}>
                  {/* Description */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}>
                    <label
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        color: "hsl(var(--text-secondary))",
                      }}>
                      Description
                    </label>
                    {isManager ? (
                      <textarea
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        rows={4}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "8px",
                          border: "1px solid hsl(var(--border-color))",
                          backgroundColor: "hsl(var(--bg-primary) / 0.3)",
                          resize: "none",
                          fontSize: "0.875rem",
                        }}
                      />
                    ) : (
                      <p
                        style={{
                          fontSize: "0.875rem",
                          lineHeight: 1.5,
                          backgroundColor: "hsl(var(--bg-primary) / 0.3)",
                          padding: "12px",
                          borderRadius: "8px",
                          border: "1px solid hsl(var(--border-color) / 0.5)",
                        }}>
                        {selectedTask.description ||
                          "No description provided for this task."}
                      </p>
                    )}
                  </div>

                  {/* Metadata Dropdowns Form */}
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
                      <label
                        style={{
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          color: "hsl(var(--text-secondary))",
                        }}>
                        Due Date
                      </label>
                      {isManager ? (
                        <input
                          type='date'
                          value={editDueDate}
                          onChange={(e) => setEditDueDate(e.target.value)}
                          style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "10px",
                            borderRadius: "8px",
                            border: "1px solid hsl(var(--border-color))",
                            backgroundColor: "hsl(var(--bg-primary) / 0.3)",
                            color: "hsl(var(--text-primary))",
                            fontSize: "0.85rem",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            padding: "10px",
                            borderRadius: "8px",
                            border: "1px solid hsl(var(--border-color) / 0.5)",
                            fontSize: "0.85rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}>
                          <Calendar size={14} />
                          <span>
                            {new Date(
                              selectedTask.dueDate,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Priority */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}>
                      <label
                        style={{
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          color: "hsl(var(--text-secondary))",
                        }}>
                        Priority
                      </label>
                      {isManager ? (
                        <select
                          value={editPriority}
                          onChange={(e) => setEditPriority(e.target.value)}
                          style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "10px",
                            borderRadius: "8px",
                            border: "1px solid hsl(var(--border-color))",
                            backgroundColor: "hsl(var(--bg-primary) / 0.3)",
                            color: "hsl(var(--text-primary))",
                            fontSize: "0.85rem",
                            cursor: "pointer",
                          }}>
                          <option value='High'>High</option>
                          <option value='Medium'>Medium</option>
                          <option value='Low'>Low</option>
                        </select>
                      ) : (
                        <div
                          style={{
                            padding: "10px",
                            borderRadius: "8px",
                            border: "1px solid hsl(var(--border-color) / 0.5)",
                            fontSize: "0.85rem",
                          }}>
                          <span
                            className={`badge badge-${selectedTask.priority.toLowerCase()}`}>
                            {selectedTask.priority}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                      gap: "16px",
                    }}>
                    {/* Status */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}>
                      <label
                        style={{
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          color: "hsl(var(--text-secondary))",
                        }}>
                        Status
                      </label>
                      <select
                        disabled={!canModifyStatus}
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid hsl(var(--border-color))",
                          backgroundColor: "hsl(var(--bg-primary) / 0.3)",
                          color: "hsl(var(--text-primary))",
                          fontSize: "0.85rem",
                          cursor: canModifyStatus ? "pointer" : "not-allowed",
                          opacity: canModifyStatus ? 1 : 0.7,
                        }}>
                        <option value='Todo'>Todo</option>
                        <option value='In Progress'>In Progress</option>
                        <option value='Completed'>Completed</option>
                      </select>
                      {!canModifyStatus && (
                        <span
                          style={{
                            fontSize: "0.7rem",
                            color: "hsl(var(--danger))",
                            marginTop: "2px",
                          }}>
                          Only editable if assigned to you.
                        </span>
                      )}
                    </div>

                    {/* Assignee */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}>
                      <label
                        style={{
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          color: "hsl(var(--text-secondary))",
                        }}>
                        Assignee
                      </label>
                      {isManager ? (
                        <select
                          disabled={selectedTask.status === "Completed"}
                          value={editAssignee}
                          onChange={(e) => setEditAssignee(e.target.value)}
                          style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "10px",
                            borderRadius: "8px",
                            border: "1px solid hsl(var(--border-color))",
                            backgroundColor: "hsl(var(--bg-primary) / 0.3)",
                            color: "hsl(var(--text-primary))",
                            fontSize: "0.85rem",
                            cursor:
                              selectedTask.status === "Completed"
                                ? "not-allowed"
                                : "pointer",
                          }}>
                          <option value=''>Unassigned</option>
                          {teamMembers.map((m) => (
                            <option key={m._id} value={m._id}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div
                          style={{
                            padding: "10px",
                            borderRadius: "8px",
                            border: "1px solid hsl(var(--border-color) / 0.5)",
                            fontSize: "0.85rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}>
                          <User size={14} />
                          <span>
                            {selectedTask.assignedMember?.name || "Unassigned"}
                          </span>
                        </div>
                      )}
                      {selectedTask.status === "Completed" && isManager && (
                        <span
                          style={{
                            fontSize: "0.7rem",
                            color: "hsl(var(--text-muted))",
                            marginTop: "2px",
                          }}>
                          Completed tasks cannot be reassigned.
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Save changes action row */}
                <div
                  style={{
                    borderTop: "1px solid hsl(var(--border-color) / 0.5)",
                    paddingTop: "20px",
                    marginTop: "32px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}>
                  {isManager && (
                    <button
                      onClick={handleDeleteTask}
                      disabled={modalLoading}
                      style={{
                        padding: "10px 20px",
                        borderRadius: "8px",
                        backgroundColor: "hsl(var(--danger) / 0.1)",
                        color: "hsl(var(--danger))",
                        fontWeight: 600,
                        cursor: "pointer",
                        border: "none",
                      }}>
                      Delete Task
                    </button>
                  )}
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      marginLeft: "auto",
                    }}>
                    <button
                      onClick={() => setIsTaskModalOpen(false)}
                      style={{
                        padding: "10px 20px",
                        borderRadius: "8px",
                        border: "1px solid hsl(var(--border-color))",
                        fontWeight: 600,
                        cursor: "pointer",
                        backgroundColor: "transparent",
                      }}>
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveChanges}
                      disabled={modalLoading}
                      className='gradient-bg'
                      style={{
                        padding: "10px 24px",
                        borderRadius: "8px",
                        fontWeight: 600,
                        cursor: "pointer",
                        opacity: modalLoading ? 0.7 : 1,
                      }}>
                      {modalLoading ? "Saving..." : "Save Workspace Details"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Side: Comments and File Attachments */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  height: isMobile ? "auto" : "100%",
                  minHeight: isMobile ? "400px" : "auto",
                }}>
                <div
                  style={{
                    display: "flex",
                    borderBottom: "1px solid hsl(var(--border-color) / 0.5)",
                    backgroundColor: "hsl(var(--bg-secondary) / 0.3)",
                  }}>
                  <div
                    style={{
                      flex: 1,
                      padding: "16px",
                      textTransform: "uppercase",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      letterSpacing: "0.5px",
                      textAlign: "center",
                      borderBottom: "2px solid hsl(var(--primary))",
                      color: "hsl(var(--primary))",
                    }}>
                    Collaboration Activity
                  </div>
                </div>

                {/* Comments Feed Area */}
                <div
                  style={{
                    flexGrow: 1,
                    overflowY: "auto",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}>
                  {/* Attachments Section Inside Activity */}
                  <div>
                    <h4
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        color: "hsl(var(--text-secondary))",
                        marginBottom: "12px",
                        textTransform: "uppercase",
                      }}>
                      File Assets
                    </h4>
                    {selectedTask.attachments?.length === 0 ? (
                      <p
                        style={{
                          fontSize: "0.8rem",
                          color: "hsl(var(--text-muted))",
                        }}>
                        No shared attachments yet.
                      </p>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                          marginBottom: "12px",
                        }}>
                        {selectedTask.attachments.map((att, idx) => (
                          <a
                            key={idx}
                            href={att.url}
                            target='_blank'
                            rel='noreferrer'
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "6px 12px",
                              borderRadius: "6px",
                              border: "1px solid hsl(var(--border-color))",
                              backgroundColor: "hsl(var(--bg-primary) / 0.5)",
                              fontSize: "0.8rem",
                              fontWeight: 500,
                            }}>
                            <Paperclip size={12} />
                            <span>{att.name}</span>
                          </a>
                        ))}
                      </div>
                    )}

                    <form
                      onSubmit={handleAddAttachment}
                      style={{
                        display: "flex",
                        flexDirection: isMobile ? "column" : "row",
                        gap: "8px",
                        marginTop: "10px",
                      }}>
                      <input
                        type='text'
                        required
                        placeholder='Asset Name (e.g. Design Wireframe)'
                        value={attachName}
                        onChange={(e) => setAttachName(e.target.value)}
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          border: "1px solid hsl(var(--border-color))",
                          fontSize: "0.75rem",
                          backgroundColor: "hsl(var(--bg-primary) / 0.5)",
                          color: "hsl(var(--text-primary))",
                        }}
                      />
                      <input
                        type='url'
                        required
                        placeholder='https://drive.google.com/...'
                        value={attachUrl}
                        onChange={(e) => setAttachUrl(e.target.value)}
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          border: "1px solid hsl(var(--border-color))",
                          fontSize: "0.75rem",
                          backgroundColor: "hsl(var(--bg-primary) / 0.5)",
                          color: "hsl(var(--text-primary))",
                        }}
                      />
                      <button
                        type='submit'
                        style={{
                          cursor: "pointer",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          backgroundColor: "hsl(var(--border-color))",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          width: isMobile ? "100%" : "auto",
                        }}>
                        Upload
                      </button>
                    </form>
                  </div>

                  <div
                    style={{
                      height: "1px",
                      backgroundColor: "hsl(var(--border-color) / 0.5)",
                      margin: "8px 0",
                    }}
                  />

                  {/* Comments Feed list */}
                  <div>
                    <h4
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        color: "hsl(var(--text-secondary))",
                        marginBottom: "12px",
                        textTransform: "uppercase",
                      }}>
                      Discussion Thread
                    </h4>
                    {selectedTask.comments?.length === 0 ? (
                      <p
                        style={{
                          fontSize: "0.8rem",
                          color: "hsl(var(--text-muted))",
                          textAlign: "center",
                          padding: "20px 0",
                        }}>
                        No comments yet. Start the conversation below!
                      </p>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                        }}>
                        {selectedTask.comments.map((comm, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: "flex",
                              gap: "10px",
                              alignItems: "flex-start",
                            }}>
                            <div
                              className='gradient-bg'
                              style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#fff",
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                flexShrink: 0,
                              }}>
                              {comm.user?.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </div>
                            <div
                              style={{
                                flexGrow: 1,
                                padding: "10px 12px",
                                borderRadius: "8px",
                                backgroundColor: "hsl(var(--bg-primary) / 0.4)",
                                border:
                                  "1px solid hsl(var(--border-color) / 0.3)",
                              }}>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  marginBottom: "4px",
                                }}>
                                <span
                                  style={{
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                  }}>
                                  {comm.user?.name} (
                                  {comm.user?.role.replace("_", " ")})
                                </span>
                                <span
                                  style={{
                                    fontSize: "0.65rem",
                                    color: "hsl(var(--text-muted))",
                                  }}>
                                  {new Date(comm.createdAt).toLocaleTimeString(
                                    [],
                                    { hour: "2-digit", minute: "2-digit" },
                                  )}
                                </span>
                              </div>
                              <p
                                style={{
                                  fontSize: "0.8rem",
                                  color: "hsl(var(--text-primary))",
                                  lineHeight: 1.4,
                                }}>
                                {comm.text}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Comment Input Footer bar */}
                <form
                  onSubmit={handleAddComment}
                  style={{
                    padding: isMobile ? "12px 16px" : "20px 24px",
                    borderTop: "1px solid hsl(var(--border-color) / 0.5)",
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    gap: "12px",
                    backgroundColor: "hsl(var(--bg-secondary) / 0.5)",
                  }}>
                  <input
                    type='text'
                    placeholder='Add a comment to the thread...'
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border-color))",
                      fontSize: "0.85rem",
                      backgroundColor: "hsl(var(--bg-primary) / 0.5)",
                      color: "hsl(var(--text-primary))",
                    }}
                  />
                  <button
                    type='submit'
                    className='gradient-bg'
                    style={{
                      cursor: "pointer",
                      padding: "10px",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      width: isMobile ? "100%" : "auto",
                    }}>
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* CREATE TASK MODAL */}
      {isCreateModalOpen && (
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
          }}>
          <div
            className='glass-panel'
            style={{
              maxWidth: "600px",
              width: "100%",
              padding: isMobile ? "20px 20px 32px 20px" : "32px 32px 48px 32px",
              position: "relative",
              animation: "fadeIn var(--transition-normal) forwards",
              boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
              backgroundColor: "hsl(var(--bg-secondary))",
              maxHeight: "85vh",
              overflowY: "auto",
            }}>
            <button
              onClick={() => setIsCreateModalOpen(false)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                cursor: "pointer",
                color: "hsl(var(--text-secondary))",
                zIndex: 10,
                background: "none",
                border: "none",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "hsl(var(--primary))")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "hsl(var(--text-secondary))")
              }>
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
              Create New Task
            </h2>

            <form
              onSubmit={handleCreateTask}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>
                  Task Title *
                </label>
                <input
                  type='text'
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder='e.g. Implement API Authentication'
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
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder='Detailed instructions for the task...'
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

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: "20px",
                }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>
                    Project *
                  </label>
                  <select
                    required
                    value={newProject}
                    onChange={(e) => setNewProject(e.target.value)}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      border: "1px solid hsl(var(--border-color))",
                      backgroundColor: "hsl(var(--bg-primary) / 0.5)",
                      color: "hsl(var(--text-primary))",
                      fontSize: "1rem",
                      cursor: "pointer",
                      outline: "none",
                    }}>
                    <option value='' style={{ backgroundColor: "hsl(var(--bg-secondary))" }}>Select Project</option>
                    {projects.map((p) => (
                      <option key={p._id} value={p._id} style={{ backgroundColor: "hsl(var(--bg-secondary))" }}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>
                    Assign To *
                  </label>
                  <select
                    required
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      border: "1px solid hsl(var(--border-color))",
                      backgroundColor: "hsl(var(--bg-primary) / 0.5)",
                      color: "hsl(var(--text-primary))",
                      fontSize: "1rem",
                      cursor: "pointer",
                      outline: "none",
                    }}>
                    <option value='' style={{ backgroundColor: "hsl(var(--bg-secondary))" }}>Select Member</option>
                    {teamMembers.map((m) => (
                      <option key={m._id} value={m._id} style={{ backgroundColor: "hsl(var(--bg-secondary))" }}>
                        {m.name} ({m.role.replace("_", " ")})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: "20px",
                }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      border: "1px solid hsl(var(--border-color))",
                      backgroundColor: "hsl(var(--bg-primary) / 0.5)",
                      color: "hsl(var(--text-primary))",
                      fontSize: "1rem",
                      cursor: "pointer",
                      outline: "none",
                    }}>
                    <option value='High' style={{ backgroundColor: "hsl(var(--bg-secondary))" }}>High Priority</option>
                    <option value='Medium' style={{ backgroundColor: "hsl(var(--bg-secondary))" }}>Medium Priority</option>
                    <option value='Low' style={{ backgroundColor: "hsl(var(--bg-secondary))" }}>Low Priority</option>
                  </select>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>
                    Due Date *
                  </label>
                  <input
                    type='date'
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
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
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button
                  type='button'
                  onClick={() => setIsCreateModalOpen(false)}
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
                  disabled={createLoading}
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
                    opacity: createLoading ? 0.7 : 1,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}>
                  {createLoading ? "Creating Task..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
