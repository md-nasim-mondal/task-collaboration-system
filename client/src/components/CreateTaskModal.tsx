"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Project, Member } from "@/types";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  teamMembers: Member[];
  isMobile: boolean;
  onRefresh: () => void;
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  projects,
  teamMembers,
  isMobile,
  onRefresh,
}: CreateTaskModalProps) {
  const { apiFetch, showToast } = useAuth();

  const [createLoading, setCreateLoading] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newProject, setNewProject] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const [newPriority, setNewPriority] = useState("Medium");
  const [newDueDate, setNewDueDate] = useState("");

  if (!isOpen) return null;

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newProject || !newAssignee || !newDueDate) {
      showToast("Please fill all required fields", "error");
      return;
    }

    try {
      setCreateLoading(true);
      const res = await apiFetch("/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDesc.trim() || undefined,
          project: newProject,
          assignedMember: newAssignee,
          priority: newPriority,
          dueDate: newDueDate,
        }),
      });

      if (res.success) {
        showToast("Task created successfully", "success");
        // reset form
        setNewTitle("");
        setNewDesc("");
        setNewProject("");
        setNewAssignee("");
        setNewPriority("Medium");
        setNewDueDate("");
        onClose();
        onRefresh();
      }
    } catch (err: any) {
      showToast(err.message || "Failed to create task", "error");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
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
          onClick={onClose}
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
              onClick={onClose}
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
  );
}
