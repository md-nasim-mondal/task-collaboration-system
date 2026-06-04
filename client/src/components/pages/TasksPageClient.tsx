"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Plus, ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";
import Loading from "@/components/ui/Loading";
import { Task, Member, Project } from "@/types";
import TaskDetailsModal from "../tasks/TaskDetailsModal";
import CreateTaskModal from "../tasks/CreateTaskModal";
import { TasksFilters } from "../tasks/TasksFilters";
import { TasksTable } from "../tasks/TasksTable";

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
        <TasksFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          isSearchFocused={isSearchFocused}
          setIsSearchFocused={setIsSearchFocused}
          sortOption={sortOption}
          setSortOption={setSortOption}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          projectFilter={projectFilter}
          setProjectFilter={setProjectFilter}
          assigneeFilter={assigneeFilter}
          setAssigneeFilter={setAssigneeFilter}
          deadlineStatusFilter={deadlineStatusFilter}
          setDeadlineStatusFilter={setDeadlineStatusFilter}
          projects={projects}
          teamMembers={teamMembers}
        />

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
          <TasksTable
            tasks={tasks}
            isMobile={isMobile}
            isManager={isManager}
            userId={user?.id}
            onOpenTask={handleOpenTask}
            onQuickStatusUpdate={handleQuickStatusUpdate}
          />
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
