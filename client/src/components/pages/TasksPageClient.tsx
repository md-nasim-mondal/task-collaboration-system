"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Search,
  ArrowUpDown,
  MessageSquare,
  Paperclip,
  Calendar,
  Folder,
  X,
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
  const [teamMembers, setTeamMembers] = useState<Member[]>(initialTeamMembers || []);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [deadlineStatusFilter, setDeadlineStatusFilter] = useState("");
  const [sortOption, setSortOption] = useState("-createdAt");

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
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
      if (deadlineStatusFilter) queryParams.append("deadlineStatus", deadlineStatusFilter);
      queryParams.append("sort", sortOption);

      const res = await apiFetch(`/tasks?${queryParams.toString()}`);
      if (res.success) setTasks(res.data);
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
      fetchTasks();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, priorityFilter, projectFilter, assigneeFilter, deadlineStatusFilter, sortOption]);

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
      if (res.success) setSelectedTask(res.data);
    } catch (err: any) {
      showToast(err.message || "Failed to fetch task details", "error");
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setPriorityFilter("");
    setProjectFilter("");
    setAssigneeFilter("");
    setDeadlineStatusFilter("");
  };

  const filterSelectClass =
    "p-2 px-3 rounded-md border border-border bg-background/50 text-foreground text-[0.85rem] font-medium cursor-pointer outline-none focus:border-primary transition-all duration-200";

  return (
    <>
      <div className="animate-[fadeIn_var(--transition-normal)_forwards]">
        {/* Header Section */}
        <div className="flex justify-between items-center flex-wrap gap-5 mb-8">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-foreground">
              Tasks Center
            </h1>
            <p className="text-secondary mt-1 text-sm">
              Search task lists, filter parameters, and collaborate on assignments.
            </p>
          </div>
          {isManager && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="gradient-bg px-6 py-3 rounded-[10px] font-bold flex items-center gap-2 cursor-pointer border-none text-white shadow-[0_4px_12px_hsl(var(--primary)/0.25)] hover:-translate-y-0.5 active:translate-y-0 transition-transform duration-200"
            >
              <Plus size={18} />
              <span>Create Task</span>
            </button>
          )}
        </div>

        {/* CONTROLS PANEL */}
        <div className="glass-panel p-4 md:p-6 mb-8 flex flex-col gap-4">
          {/* Row 1: Search & Sort */}
          <div className="flex flex-wrap justify-start md:justify-center items-center gap-4">
            {/* Search Box */}
            <div
              className={`flex items-center gap-3 px-4 h-11 rounded-[10px] border bg-background/50 grow max-w-112.5 min-w-60 transition-all duration-200 ${
                isSearchFocused
                  ? "border-primary ring-4 ring-primary/10"
                  : "border-border"
              }`}
            >
              <Search
                size={20}
                className={`shrink-0 transition-colors duration-200 ${
                  isSearchFocused ? "text-primary" : "text-muted"
                }`}
              />
              <input
                type="text"
                placeholder="Search tasks by title or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="flex-1 h-full border-none bg-transparent text-foreground outline-none text-base placeholder:text-muted min-w-0"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="bg-transparent border-none cursor-pointer p-1 flex items-center justify-center text-muted hover:text-danger transition-colors duration-200"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2.5">
              <ArrowUpDown size={18} className="text-secondary" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className={filterSelectClass}
              >
                <option value="-createdAt" className="bg-secondary-bg">Newest Created</option>
                <option value="created" className="bg-secondary-bg">Oldest Created</option>
                <option value="deadline" className="bg-secondary-bg">Nearest Due Date</option>
                <option value="-priority" className="bg-secondary-bg">Highest Priority</option>
                <option value="updated" className="bg-secondary-bg">Latest Updated</option>
              </select>
            </div>
          </div>

          {/* Row 2: Advanced Filters */}
          <div className="flex flex-wrap items-center justify-start md:justify-center gap-3 border-t border-border/50 pt-4">
            <div className="flex items-center gap-2 text-secondary text-[0.85rem] font-semibold mr-1">
              <Filter size={16} />
              <span>Filter By:</span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={filterSelectClass}
            >
              <option value="" className="bg-secondary-bg">All Statuses</option>
              <option value="Todo" className="bg-secondary-bg">Todo</option>
              <option value="In Progress" className="bg-secondary-bg">In Progress</option>
              <option value="Completed" className="bg-secondary-bg">Completed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className={filterSelectClass}
            >
              <option value="" className="bg-secondary-bg">All Priorities</option>
              <option value="High" className="bg-secondary-bg">High Priority</option>
              <option value="Medium" className="bg-secondary-bg">Medium Priority</option>
              <option value="Low" className="bg-secondary-bg">Low Priority</option>
            </select>

            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className={`${filterSelectClass} max-w-45`}
            >
              <option value="" className="bg-secondary-bg">All Projects</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id} className="bg-secondary-bg">
                  {p.name}
                </option>
              ))}
            </select>

            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className={`${filterSelectClass} max-w-45`}
            >
              <option value="" className="bg-secondary-bg">All Assignees</option>
              {teamMembers.map((m) => (
                <option key={m._id} value={m._id} className="bg-secondary-bg">
                  {m.name}
                </option>
              ))}
            </select>

            <select
              value={deadlineStatusFilter}
              onChange={(e) => setDeadlineStatusFilter(e.target.value)}
              className={`${filterSelectClass} ${
                deadlineStatusFilter === "Overdue"
                  ? "text-danger font-semibold"
                  : ""
              }`}
            >
              <option value="" className="bg-secondary-bg">All Deadlines</option>
              <option value="Upcoming" className="bg-secondary-bg">Upcoming Only</option>
              <option value="Overdue" className="bg-secondary-bg">Overdue Warnings ⚠️</option>
            </select>
          </div>
        </div>

        {/* TASKS CONTENT */}
        {loading ? (
          <Loading text="Loading tasks..." />
        ) : tasks.length === 0 ? (
          /* Empty State */
          <div className="glass-panel p-20 text-center flex flex-col items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
              <ClipboardList size={40} />
            </div>
            <h2 className="text-2xl font-bold text-foreground">No tasks found</h2>
            <p className="text-secondary max-w-100 leading-relaxed">
              We couldn&apos;t find any tasks matching your current filters. Try adjusting
              your search or using different filters.
            </p>
            <button
              onClick={resetFilters}
              className="gradient-bg px-6 py-3 rounded-[10px] font-semibold cursor-pointer border-none text-white mt-2 hover:-translate-y-0.5 active:translate-y-0 transition-transform duration-200"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          /* Tasks Table */
          <div className="glass-panel overflow-hidden">
            <div className="overflow-x-auto border-none">
              <table
                className="w-full text-left"
                style={{ minWidth: isMobile ? "600px" : "100%", borderCollapse: "collapse" }}
              >
                <thead>
                  <tr className="border-b border-border bg-secondary-bg/50 text-xs font-bold text-secondary uppercase tracking-wider">
                    <th className="p-4 px-5">Task Title</th>
                    <th className="p-4 px-5">Project</th>
                    <th className="p-4 px-5">Assignee</th>
                    <th className="p-4 px-5">Priority</th>
                    <th className="p-4 px-5">Due Date</th>
                    <th className="p-4 px-5">Status</th>
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
                        className="border-b border-border/40 cursor-pointer text-[0.875rem] transition-colors duration-150 hover:bg-primary/3"
                      >
                        {/* Title */}
                        <td className="p-4 px-5 font-semibold text-foreground">
                          <div className="flex flex-col gap-0.5">
                            <span>{task.title}</span>
                            <div className="flex gap-2.5 items-center mt-1">
                              {task.comments?.length > 0 && (
                                <span className="text-[0.7rem] text-muted flex items-center gap-0.5">
                                  <MessageSquare size={12} /> {task.comments.length}
                                </span>
                              )}
                              {task.attachments?.length > 0 && (
                                <span className="text-[0.7rem] text-muted flex items-center gap-0.5">
                                  <Paperclip size={12} /> {task.attachments.length}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Project */}
                        <td className="p-4 px-5 text-secondary">
                          <span className="inline-flex items-center gap-1">
                            <Folder size={14} /> {task.project?.name || "Workspace"}
                          </span>
                        </td>

                        {/* Assignee */}
                        <td className="p-4 px-5">
                          {task.assignedMember ? (
                            <div className="flex items-center gap-2">
                              <div className="gradient-bg w-6 h-6 rounded-full flex items-center justify-center text-white text-[0.65rem] font-bold">
                                {task.assignedMember.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </div>
                              <span className="text-[0.8rem] font-medium text-foreground">
                                {task.assignedMember.name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted text-[0.8rem]">Unassigned</span>
                          )}
                        </td>

                        {/* Priority */}
                        <td className="p-4 px-5">
                          <span className={`badge badge-${task.priority.toLowerCase()}`}>
                            {task.priority}
                          </span>
                        </td>

                        {/* Due Date */}
                        <td
                          className={`p-4 px-5 ${
                            overdue ? "text-danger font-bold" : "text-secondary"
                          }`}
                        >
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar size={14} />
                            {new Date(task.dueDate).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                            })}
                            {overdue && " (Overdue)"}
                          </span>
                        </td>

                        {/* Status Quick-Select */}
                        <td
                          className="p-4 px-5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <select
                            disabled={!(isManager || task.assignedMember?._id === user?.id)}
                            value={task.status}
                            onChange={(e) =>
                              handleQuickStatusUpdate(task._id, e.target.value)
                            }
                            className={`p-1.5 px-2.5 rounded-md border border-border text-xs font-semibold outline-none transition-all duration-200 ${
                              task.status === "Completed"
                                ? "bg-success/10 text-success"
                                : task.status === "In Progress"
                                  ? "bg-warning/10 text-warning"
                                  : "bg-secondary-bg text-foreground"
                            } ${
                              isManager || task.assignedMember?._id === user?.id
                                ? "cursor-pointer"
                                : "cursor-not-allowed opacity-60"
                            }`}
                          >
                            <option value="Todo" className="bg-secondary-bg text-foreground">Todo</option>
                            <option value="In Progress" className="bg-secondary-bg text-foreground">In Progress</option>
                            <option value="Completed" className="bg-secondary-bg text-foreground">Completed</option>
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
