"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Calendar, Users, Plus, ArrowLeft, Clock, X } from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";
import Loading from "../ui/Loading";
import { Project, Member, Task } from "@/types";

const inputClass =
  "w-full p-2.5 px-3.5 rounded-lg border border-border bg-background/50 text-foreground text-sm outline-none focus:border-primary transition-all duration-200";

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
  const [userOptions, setUserOptions] = useState<Member[]>(initialUsers || []);
  const [loading, setLoading] = useState(!initialProject);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskPriority, setTaskPriority] = useState("Medium");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [taskFormLoading, setTaskFormLoading] = useState(false);

  const [inviteUserId, setInviteUserId] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

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
      if (res.success) setUserOptions(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (initialProject) return;
    if (id) {
      fetchProjectDetails();
      if (isManager) fetchInviteOptions();
    }
  }, [id, initialProject]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !taskDueDate || !taskAssignee) return;
    const now = new Date(); now.setHours(0, 0, 0, 0);
    if (new Date(taskDueDate) < now) { showToast("Please select a valid deadline.", "error"); return; }

    try {
      setTaskFormLoading(true);
      const res = await apiFetch("/tasks", {
        method: "POST",
        body: JSON.stringify({ title: taskTitle, description: taskDesc, project: id, dueDate: taskDueDate, priority: taskPriority, assignedMember: taskAssignee }),
      });
      if (res.success) {
        showToast("Task created and assigned successfully!", "success");
        setIsTaskModalOpen(false);
        setTaskTitle(""); setTaskDesc(""); setTaskDueDate(""); setTaskPriority("Medium"); setTaskAssignee("");
        fetchProjectDetails(); router.refresh();
      }
    } catch (err: any) { showToast(err.message || "Failed to create task", "error"); }
    finally { setTaskFormLoading(false); }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteUserId) return;
    try {
      setInviteLoading(true);
      const res = await apiFetch(`/projects/${id}/members`, { method: "POST", body: JSON.stringify({ userId: inviteUserId }) });
      if (res.success) {
        showToast("Member successfully invited to project!", "success");
        setIsInviteModalOpen(false); setInviteUserId("");
        fetchProjectDetails(); router.refresh();
      }
    } catch (err: any) { showToast(err.message || "Failed to invite member", "error"); }
    finally { setInviteLoading(false); }
  };

  const handleUpdateProjectStatus = async (newStatus: string) => {
    try {
      const res = await apiFetch(`/projects/${id}`, { method: "PATCH", body: JSON.stringify({ status: newStatus }) });
      if (res.success) { showToast("Project status updated", "success"); fetchProjectDetails(); router.refresh(); }
    } catch (err: any) { showToast(err.message || "Failed to update project status", "error"); }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (memberId === project?.createdBy?._id) { showToast("Cannot remove the project owner.", "error"); return; }
    const result = await Swal.fire({ title: "Remove Member?", text: "This member will no longer have access to this project.", icon: "question", showCancelButton: true, confirmButtonColor: "hsl(var(--danger))", cancelButtonColor: "hsl(var(--border-color))", confirmButtonText: "Remove Member", background: "hsl(var(--bg-secondary))", color: "hsl(var(--text-primary))" });
    if (!result.isConfirmed) return;
    try {
      const res = await apiFetch(`/projects/${id}/members/${memberId}`, { method: "DELETE" });
      if (res.success) { showToast("Member removed from project", "success"); fetchProjectDetails(); router.refresh(); }
    } catch (err: any) { showToast(err.message || "Failed to remove member", "error"); }
  };

  const handleDeleteTask = async (taskId: string) => {
    const result = await Swal.fire({ title: "Delete Task?", text: "This action cannot be undone.", icon: "warning", showCancelButton: true, confirmButtonColor: "hsl(var(--danger))", cancelButtonColor: "hsl(var(--border-color))", confirmButtonText: "Yes, delete", background: "hsl(var(--bg-secondary))", color: "hsl(var(--text-primary))" });
    if (!result.isConfirmed) return;
    try {
      const res = await apiFetch(`/tasks/${taskId}`, { method: "DELETE" });
      if (res.success) { showToast("Task deleted successfully", "success"); fetchProjectDetails(); router.refresh(); }
    } catch (err: any) { showToast(err.message || "Failed to delete task", "error"); }
  };

  const handleDeleteProject = async () => {
    const result = await Swal.fire({ title: "Delete Entire Project?", text: "This will permanently remove this project and all its tasks. This action is irreversible!", icon: "warning", showCancelButton: true, confirmButtonColor: "hsl(var(--danger))", cancelButtonColor: "hsl(var(--border-color))", confirmButtonText: "Yes, delete project", background: "hsl(var(--bg-secondary))", color: "hsl(var(--text-primary))" });
    if (!result.isConfirmed) return;
    try {
      const res = await apiFetch(`/projects/${id}`, { method: "DELETE" });
      if (res.success) { showToast("Project deleted successfully", "success"); router.push("/projects"); router.refresh(); }
    } catch (err: any) { showToast(err.message || "Failed to delete project", "error"); }
  };

  const todoTasks = tasks.filter((t) => t.status === "Todo");
  const inProgressTasks = tasks.filter((t) => t.status === "In Progress");
  const completedTasks = tasks.filter((t) => t.status === "Completed");
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  const getTodayDateString = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  };

  if (loading || !project) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loading text="Loading project board..." />
      </div>
    );
  }

  return (
    <>
      <div className="animate-[fadeIn_var(--transition-normal)_forwards]">
        {/* Back Link */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-secondary text-sm font-semibold mb-6 hover:text-primary transition-colors duration-200"
        >
          <ArrowLeft size={16} /> Back to Projects
        </Link>

        {/* Project Header */}
        <div className="glass-panel p-5 md:p-8 mb-8 flex flex-col gap-6">
          <div className="flex justify-between items-start flex-wrap gap-5">
            <div>
              <h1 className="font-display text-3xl font-extrabold text-foreground">{project.name}</h1>
              <p className="text-secondary mt-2 text-[0.95rem]">
                {project.description || "No project description loaded."}
              </p>
            </div>

            <div className="flex gap-3 items-center">
              <select
                value={project.status}
                onChange={(e) => handleUpdateProjectStatus(e.target.value)}
                disabled={!isManager}
                className={`p-1.5 px-3 rounded-lg border border-border text-sm font-semibold outline-none transition-all duration-200 ${
                  isManager ? "cursor-pointer" : "cursor-default opacity-70"
                } ${
                  project.status === "Completed"
                    ? "bg-success/10 text-success"
                    : project.status === "Active"
                      ? "bg-primary/10 text-primary"
                      : "bg-secondary-bg text-foreground"
                }`}
              >
                <option value="Active" className="bg-secondary-bg text-foreground">Active</option>
                <option value="Completed" className="bg-secondary-bg text-foreground">Completed</option>
                <option value="On Hold" className="bg-secondary-bg text-foreground">On Hold</option>
              </select>

              {isManager && (
                <button
                  onClick={handleDeleteProject}
                  className="p-2 rounded-lg border-none bg-danger/10 text-danger cursor-pointer hover:bg-danger/20 transition-colors duration-200"
                  title="Delete Project"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Timeline & Members */}
          <div className="flex justify-between items-center flex-wrap gap-6 border-t border-border/50 pt-6">
            <div className="flex gap-6 flex-wrap">
              {/* Deadline */}
              <div className="flex items-center gap-2.5">
                <Calendar size={18} className="text-secondary" />
                <div>
                  <p className="text-xs text-muted font-medium">Deadline</p>
                  <p className="text-sm font-bold text-foreground">
                    {new Date(project.deadline || "").toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-2.5 min-w-45">
                <div>
                  <p className="text-xs text-muted font-medium">Progress ({completionRate}%)</p>
                  <div className="h-2 w-35 bg-border rounded-full overflow-hidden mt-1.5">
                    <div
                      className="h-full bg-success rounded-full transition-[width] duration-700"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Members Avatars */}
            <div className="flex items-center gap-3.5">
              <div className="flex items-center">
                {(project.members || []).slice(0, 5).map((memb, idx) => (
                  <div
                    key={memb._id}
                    className="gradient-bg w-8 h-8 rounded-full border-2 border-secondary-bg flex items-center justify-center text-white text-xs font-bold cursor-help"
                    title={`${memb.name} (${memb.role.replace("_", " ")})`}
                    style={{ marginLeft: idx > 0 ? "-8px" : 0, zIndex: 5 - idx }}
                  >
                    {memb.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                ))}
                {(project.members || []).length > 5 && (
                  <div className="w-8 h-8 rounded-full border-2 border-secondary-bg bg-border text-secondary text-xs font-bold flex items-center justify-center" style={{ marginLeft: "-8px", zIndex: 0 }}>
                    +{(project.members || []).length - 5}
                  </div>
                )}
              </div>

              {isManager && (
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="cursor-pointer p-1.5 px-3 rounded-md border border-border text-sm font-semibold flex items-center gap-1.5 text-secondary hover:bg-border hover:text-foreground transition-all duration-200 bg-transparent"
                >
                  <Users size={14} />
                  <span>Invite</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Kanban Header */}
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-foreground">Project Tasks</h3>
          {isManager && (
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="cursor-pointer p-2 px-4 rounded-lg border-none bg-primary/10 text-primary text-sm font-bold flex items-center gap-1.5 hover:bg-primary/20 transition-colors duration-200"
            >
              <Plus size={16} />
              <span>Add Task</span>
            </button>
          )}
        </div>

        {/* Kanban Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Todo */}
          <KanbanColumn
            title="Todo"
            tasks={todoTasks}
            countClass="bg-border text-foreground"
            emptyLabel="No tasks in Todo"
          />
          {/* In Progress */}
          <KanbanColumn
            title="In Progress"
            tasks={inProgressTasks}
            countClass="bg-primary/10 text-primary"
            emptyLabel="No tasks In Progress"
          />
          {/* Completed */}
          <KanbanColumn
            title="Completed"
            tasks={completedTasks}
            countClass="bg-success/10 text-success"
            emptyLabel="No completed tasks"
          />
        </div>
      </div>

      {/* ADD TASK MODAL */}
      {isTaskModalOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-md z-1000 flex items-center justify-center p-2 sm:p-6"
          onClick={() => setIsTaskModalOpen(false)}
        >
          <div
            className="glass-panel max-w-150 w-full p-5 sm:p-8 sm:pb-12 relative bg-secondary-bg max-h-[85vh] overflow-y-auto animate-[fadeIn_var(--transition-normal)_forwards]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsTaskModalOpen(false)}
              className="absolute top-6 right-6 cursor-pointer text-secondary hover:text-primary border-none bg-transparent outline-none transition-colors duration-200"
            >
              <X size={20} />
            </button>

            <h2 className="font-display text-2xl font-bold text-foreground mb-6">Add Project Task</h2>

            <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground">Task Title *</label>
                <input type="text" required value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="E.g. Design Landing Page" className={inputClass} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground">Description</label>
                <textarea value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} placeholder="Specify requirements..." rows={3} className={`${inputClass} resize-none`} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-foreground">Due Date *</label>
                  <input type="date" required min={getTodayDateString()} value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} className={inputClass} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-foreground">Priority</label>
                  <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)} className={`${inputClass} cursor-pointer`}>
                    <option value="High" className="bg-secondary-bg">High</option>
                    <option value="Medium" className="bg-secondary-bg">Medium</option>
                    <option value="Low" className="bg-secondary-bg">Low</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground">Assign To</label>
                <select value={taskAssignee} onChange={(e) => setTaskAssignee(e.target.value)} className={`${inputClass} cursor-pointer`}>
                  <option value="" className="bg-secondary-bg">Unassigned</option>
                  {(project.members || []).map((opt) => (
                    <option key={opt._id} value={opt._id} className="bg-secondary-bg">
                      {opt.name} ({opt.role.replace("_", " ")})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-3">
                <button type="button" onClick={() => setIsTaskModalOpen(false)} className="py-2.5 px-5 rounded-lg cursor-pointer border border-border bg-transparent text-foreground font-semibold hover:bg-border transition-colors duration-200">
                  Cancel
                </button>
                <button type="submit" disabled={taskFormLoading} className="py-2.5 px-5 rounded-lg cursor-pointer border-none gradient-bg text-white font-semibold disabled:opacity-70">
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
          className="fixed inset-0 bg-black/40 backdrop-blur-md z-1000 flex items-center justify-center p-2 sm:p-6"
          onClick={() => setIsInviteModalOpen(false)}
        >
          <div
            className="glass-panel max-w-md w-full p-5 sm:p-8 relative bg-secondary-bg max-h-[90vh] overflow-y-auto animate-[fadeIn_var(--transition-normal)_forwards]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute top-6 right-6 cursor-pointer text-secondary hover:text-primary border-none bg-transparent outline-none transition-colors duration-200"
            >
              <X size={20} />
            </button>

            <h2 className="font-display text-xl font-bold text-foreground mb-5">Add Project Member</h2>

            <form onSubmit={handleInviteMember} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground">Select User</label>
                <select required value={inviteUserId} onChange={(e) => setInviteUserId(e.target.value)} className={`${inputClass} cursor-pointer`}>
                  <option value="">Select a user to add...</option>
                  {userOptions
                    .filter((o) => !(project.members || []).some((m) => m._id === o._id))
                    .map((opt) => (
                      <option key={opt._id} value={opt._id} className="bg-secondary-bg">
                        {opt.name} ({opt.role.replace("_", " ")})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-3">
                <button type="button" onClick={() => setIsInviteModalOpen(false)} className="py-2 px-4 rounded-md cursor-pointer border border-border bg-transparent text-foreground text-sm font-semibold hover:bg-border transition-colors duration-200">
                  Cancel
                </button>
                <button type="submit" disabled={inviteLoading} className="py-2 px-4 rounded-md cursor-pointer border-none gradient-bg text-white text-sm font-semibold disabled:opacity-70">
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

// Kanban Column Component
function KanbanColumn({
  title, tasks, countClass, emptyLabel,
}: {
  title: string;
  tasks: Task[];
  countClass: string;
  emptyLabel: string;
}) {
  return (
    <div className="glass-panel p-5 bg-secondary-bg/40">
      <div className="flex justify-between mb-4">
        <h4 className="font-bold text-[0.95rem] text-foreground">{title}</h4>
        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${countClass}`}>
          {tasks.length}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {tasks.map((t) => <TaskCard key={t._id} task={t} />)}
        {tasks.length === 0 && (
          <div className="text-center py-5 text-muted text-xs">{emptyLabel}</div>
        )}
      </div>
    </div>
  );
}

// Task Card Component
const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
  const router = useRouter();
  const overdue = new Date(task.dueDate) < new Date() && task.status !== "Completed";

  return (
    <div
      className={`glass-panel p-4 cursor-pointer flex flex-col gap-3 bg-secondary-bg shadow-sm hover:-translate-y-px hover:border-primary/15 transition-all duration-200 ${
        overdue ? "border-danger/30" : ""
      }`}
      onClick={() => router.push("/tasks")}
    >
      <div>
        <h5 className="font-bold text-sm text-foreground mb-1">{task.title}</h5>
        {task.description && (
          <p className="text-xs text-secondary leading-snug line-clamp-2">{task.description}</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center border-t border-border/40 pt-3">
        <div className="flex gap-2 items-center">
          <span className={`badge badge-${task.priority.toLowerCase()} py-0.5! px-1.5! text-[0.65rem]!`}>
            {task.priority}
          </span>
          <span className={`text-[0.675rem] flex items-center gap-0.5 font-medium ${overdue ? "text-danger font-bold" : "text-muted"}`}>
            <Clock size={10} />
            {new Date(task.dueDate).toLocaleDateString([], { month: "short", day: "numeric" })}
          </span>
        </div>

        {task.assignedMember ? (
          <div
            className="gradient-bg w-6 h-6 rounded-full flex items-center justify-center text-white text-[0.65rem] font-bold cursor-help"
            title={`Assigned to: ${task.assignedMember.name}`}
          >
            {task.assignedMember.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full bg-border text-muted flex items-center justify-center text-[0.65rem] font-medium" title="Unassigned">
            U
          </div>
        )}
      </div>
    </div>
  );
};
