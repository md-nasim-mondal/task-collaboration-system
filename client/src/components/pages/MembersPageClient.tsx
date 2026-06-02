"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Search, Mail, Shield, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface Member {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface Workload {
  member: {
    _id: string;
    name: string;
    email: string;
    role: string;
    picture?: string;
  };
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
}

export default function MembersPageClient({
  initialMembers,
  initialWorkload,
}: {
  initialMembers: Member[];
  initialWorkload: Workload[];
}) {
  const { apiFetch, showToast } = useAuth();
  const router = useRouter();

  const [members, setMembers] = useState<Member[]>(initialMembers || []);
  const [workloads, setWorkloads] = useState<Workload[]>(initialWorkload || []);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append("searchTerm", searchTerm);

      const res = await apiFetch(`/user?${queryParams.toString()}`);
      if (res.success) {
        setMembers(res.data);
      }
    } catch (err: any) {
      showToast(err.message || "Failed to load members", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkloads = async () => {
    try {
      const res = await apiFetch("/dashboard/workload");
      if (res.success) {
        setWorkloads(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      // Fetch members whenever searchTerm changes with a debounce
      fetchMembers();
      fetchWorkloads();
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredMembers = members;

  const getMemberWorkload = (memberId: string) => {
    return (
      workloads.find((w) => w.member._id === memberId) || {
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
      }
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div style={{ animation: "fadeIn var(--transition-normal) forwards" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "2rem",
            fontWeight: 800,
          }}>
          Team Members
        </h1>
        <p style={{ color: "hsl(var(--text-secondary))", marginTop: "4px" }}>
          Monitor team workload, manage roles, and collaborate effectively.
        </p>
      </div>

      <div
        className='glass-panel'
        style={{
          padding: "24px",
          marginBottom: "32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
        }}>
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
        </div>

        <div
          style={{
            color: "hsl(var(--text-secondary))",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}>
          Total Members:{" "}
          <span style={{ color: "hsl(var(--primary))", fontWeight: 700 }}>
            {members.length}
          </span>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "24px",
        }}>
        {filteredMembers.map((member) => {
          const workload = getMemberWorkload(member._id);
          const progress =
            workload.totalTasks > 0
              ? Math.round(
                  (workload.completedTasks / workload.totalTasks) * 100,
                )
              : 0;

          return (
            <div
              key={member._id}
              className='glass-panel'
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                transition: "transform var(--transition-fast)",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-4px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
              onClick={() =>
                router.push(`/tasks?assignedMember=${member._id}`)
              }>
              <div
                style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div
                  className='gradient-bg'
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "1.2rem",
                    fontWeight: 800,
                  }}>
                  {getInitials(member.name)}
                </div>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                    {member.name}
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      color: "hsl(var(--text-secondary))",
                      fontSize: "0.85rem",
                      marginTop: "4px",
                    }}>
                    <Mail size={14} />
                    <span>{member.email}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    backgroundColor: "hsl(var(--primary) / 0.1)",
                    color: "hsl(var(--primary))",
                  }}>
                  <Shield size={12} />
                  {member.role.replace("_", " ")}
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    backgroundColor:
                      member.status === "ACTIVE"
                        ? "hsl(var(--success) / 0.1)"
                        : "hsl(var(--danger) / 0.1)",
                    color:
                      member.status === "ACTIVE"
                        ? "hsl(var(--success))"
                        : "hsl(var(--danger))",
                  }}>
                  {member.status}
                </span>
              </div>

              <div style={{ marginTop: "8px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                    fontSize: "0.85rem",
                  }}>
                  <span style={{ fontWeight: 600 }}>Task Progress</span>
                  <span style={{ color: "hsl(var(--text-secondary))" }}>
                    {progress}% Completed
                  </span>
                </div>
                <div
                  style={{
                    height: "8px",
                    backgroundColor: "hsl(var(--border-color) / 0.3)",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${progress}%`,
                      backgroundColor: "hsl(var(--primary))",
                      transition: "width 0.5s ease-out",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "12px",
                  padding: "16px",
                  backgroundColor: "hsl(var(--bg-secondary) / 0.5)",
                  borderRadius: "12px",
                }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800 }}>
                    {workload.totalTasks}
                  </div>
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "hsl(var(--text-muted))",
                      textTransform: "uppercase",
                    }}>
                    Total
                  </div>
                </div>
                <div
                  style={{
                    textAlign: "center",
                    borderLeft: "1px solid hsl(var(--border-color) / 0.5)",
                    borderRight: "1px solid hsl(var(--border-color) / 0.5)",
                  }}>
                  <div
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 800,
                      color: "hsl(var(--success))",
                    }}>
                    {workload.completedTasks}
                  </div>
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "hsl(var(--text-muted))",
                      textTransform: "uppercase",
                    }}>
                    Done
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 800,
                      color: "hsl(var(--warning-text))",
                    }}>
                    {workload.pendingTasks}
                  </div>
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "hsl(var(--text-muted))",
                      textTransform: "uppercase",
                    }}>
                    Pending
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: "auto",
                  paddingTop: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "hsl(var(--primary))",
                }}>
                <span>View Assigned Tasks</span>
                <ChevronRight size={16} />
              </div>
            </div>
          );
        })}
      </div>

      {filteredMembers.length === 0 && (
        <div
          className='glass-panel'
          style={{
            padding: "40px",
            textAlign: "center",
            color: "hsl(var(--text-muted))",
          }}>
          No members found matching your search.
        </div>
      )}
    </div>
  );
}
