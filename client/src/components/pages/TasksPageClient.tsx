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
  Filter,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Loading from "../ui/Loading";
import { Task, Member, Project } from "@/types";
import TaskDetailsModal from "../tasks/TaskDetailsModal";
import CreateTaskModal from "../tasks/CreateTaskModal";

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

  // Create Task Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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

  const handleOpenTask = async (task: Task) => {
    try {
      setSelectedTask(task);
      setIsTaskModalOpen(true);

      const res = await apiFetch(`/tasks/${task._id}`);
      if (res.success) {
        setSelectedTask(res.data);
      }
    } catch (err: any) {
      showToast(err.message || "Failed to fetch task details", "error");
    }
  };

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
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: isMobile ? "flex-start" : "center", alignItems: "center", gap: "16px" }}>
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
            alignItems: "center",
            justifyContent: isMobile ? "flex-start" : "center",
            gap: "12px",
            borderTop: "1px solid hsl(var(--border-color) / 0.5)",
            paddingTop: "16px",
          }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "hsl(var(--text-secondary))", fontSize: "0.85rem", fontWeight: 600, marginRight: "4px" }}>
            <Filter size={16} />
            <span>Filter By:</span>
          </div>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid hsl(var(--border-color))",
              backgroundColor: "hsl(var(--bg-primary) / 0.5)",
              color: "hsl(var(--text-primary))",
              fontSize: "0.85rem",
              fontWeight: 500,
              cursor: "pointer",
              outline: "none",
            }}>
            <option value='' style={{ backgroundColor: "hsl(var(--bg-secondary))", color: "hsl(var(--text-primary))" }}>All Statuses</option>
            <option value='Todo' style={{ backgroundColor: "hsl(var(--bg-secondary))", color: "hsl(var(--text-primary))" }}>Todo</option>
            <option value='In Progress' style={{ backgroundColor: "hsl(var(--bg-secondary))", color: "hsl(var(--text-primary))" }}>In Progress</option>
            <option value='Completed' style={{ backgroundColor: "hsl(var(--bg-secondary))", color: "hsl(var(--text-primary))" }}>Completed</option>
          </select>

          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid hsl(var(--border-color))",
              backgroundColor: "hsl(var(--bg-primary) / 0.5)",
              color: "hsl(var(--text-primary))",
              fontSize: "0.85rem",
              fontWeight: 500,
              cursor: "pointer",
              outline: "none",
            }}>
            <option value='' style={{ backgroundColor: "hsl(var(--bg-secondary))", color: "hsl(var(--text-primary))" }}>All Priorities</option>
            <option value='High' style={{ backgroundColor: "hsl(var(--bg-secondary))", color: "hsl(var(--text-primary))" }}>High Priority</option>
            <option value='Medium' style={{ backgroundColor: "hsl(var(--bg-secondary))", color: "hsl(var(--text-primary))" }}>Medium Priority</option>
            <option value='Low' style={{ backgroundColor: "hsl(var(--bg-secondary))", color: "hsl(var(--text-primary))" }}>Low Priority</option>
          </select>

          {/* Project */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid hsl(var(--border-color))",
              backgroundColor: "hsl(var(--bg-primary) / 0.5)",
              color: "hsl(var(--text-primary))",
              fontSize: "0.85rem",
              fontWeight: 500,
              cursor: "pointer",
              outline: "none",
              maxWidth: "180px",
            }}>
            <option value='' style={{ backgroundColor: "hsl(var(--bg-secondary))", color: "hsl(var(--text-primary))" }}>All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id} style={{ backgroundColor: "hsl(var(--bg-secondary))", color: "hsl(var(--text-primary))" }}>
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
              backgroundColor: "hsl(var(--bg-primary) / 0.5)",
              color: "hsl(var(--text-primary))",
              fontSize: "0.85rem",
              fontWeight: 500,
              cursor: "pointer",
              outline: "none",
              maxWidth: "180px",
            }}>
            <option value='' style={{ backgroundColor: "hsl(var(--bg-secondary))", color: "hsl(var(--text-primary))" }}>All Assignees</option>
            {teamMembers.map((m) => (
              <option key={m._id} value={m._id} style={{ backgroundColor: "hsl(var(--bg-secondary))", color: "hsl(var(--text-primary))" }}>
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
              backgroundColor: "hsl(var(--bg-primary) / 0.5)",
              color:
                deadlineStatusFilter === "Overdue"
                  ? "hsl(var(--danger))"
                  : "hsl(var(--text-primary))",
              fontSize: "0.85rem",
              fontWeight: deadlineStatusFilter === "Overdue" ? 600 : 500,
              cursor: "pointer",
              outline: "none",
            }}>
            <option value='' style={{ backgroundColor: "hsl(var(--bg-secondary))", color: "hsl(var(--text-primary))" }}>All Deadlines</option>
            <option value='Upcoming' style={{ backgroundColor: "hsl(var(--bg-secondary))", color: "hsl(var(--text-primary))" }}>Upcoming Only</option>
            <option value='Overdue' style={{ backgroundColor: "hsl(var(--bg-secondary))", color: "hsl(var(--text-primary))" }}>Overdue Warnings ⚠️</option>
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
        <TaskDetailsModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          task={selectedTask}
          isMobile={isMobile}
          isManager={isManager}
          teamMembers={teamMembers}
          onRefresh={fetchTasks}
        />
      )}

      {/* CREATE TASK MODAL */}
      {isCreateModalOpen && (
        <CreateTaskModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          projects={projects}
          teamMembers={teamMembers}
          isMobile={isMobile}
          onRefresh={fetchTasks}
        />
      )}
    </>
  );
}
