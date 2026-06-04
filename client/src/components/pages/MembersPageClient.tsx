"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Search, X, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import Loading from "@/components/ui/Loading";
import { Member, Workload } from "@/types";
import { MemberCard } from "../members/MemberCard";

export default function MembersPageClient({
  initialMembers,
  initialWorkload,
}: {
  initialMembers: Member[];
  initialWorkload: Workload[];
}) {
  const { user, apiFetch, showToast } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role === "TEAM_MEMBER") {
      router.push("/dashboard");
    }
  }, [user, router]);

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
      if (res.success) setMembers(res.data);
    } catch (err: any) {
      showToast(err.message || "Failed to load members", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkloads = async () => {
    try {
      const res = await apiFetch("/dashboard/workload");
      if (res.success) setWorkloads(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers();
      fetchWorkloads();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const getMemberWorkload = (memberId: string) => {
    return (
      workloads.find((w) => w.member._id === memberId) || {
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
      }
    );
  };

  return (
    <div className="animate-[fadeIn_var(--transition-normal)_forwards]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-foreground">
          Team Members
        </h1>
        <p className="text-secondary mt-1 text-sm">
          Monitor team workload, manage roles, and collaborate effectively.
        </p>
      </div>

      {/* Search & Count Bar */}
      <div className="glass-panel p-6 mb-8 flex justify-between items-center flex-wrap gap-5">
        <div
          className={`flex items-center gap-3 px-4 h-11 rounded-[10px] border bg-background/50 grow max-w-112.5 min-w-50 transition-all duration-200 ${
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
            placeholder="Search members by name or email..."
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

        <div className="text-sm font-medium text-secondary">
          Total Members:{" "}
          <span className="text-primary font-bold">{members.length}</span>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <Loading text="Fetching team members..." />
      ) : members.length > 0 ? (
        <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
          {members.map((member) => (
            <MemberCard
              key={member._id}
              member={member}
              workload={getMemberWorkload(member._id)}
              onClick={() => router.push(`/tasks?assignedMember=${member._id}`)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="glass-panel p-20 text-center flex flex-col items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
            <Users size={40} />
          </div>
          <h2 className="text-2xl font-bold text-foreground">No members found</h2>
          <p className="text-secondary max-w-100 leading-relaxed">
            We couldn&apos;t find any team members matching &ldquo;
            <strong>{searchTerm}</strong>&rdquo;. Check your spelling or try
            searching for something else.
          </p>
          <button
            onClick={() => setSearchTerm("")}
            className="gradient-bg px-6 py-3 rounded-[10px] font-semibold cursor-pointer border-none text-white mt-2 hover:-translate-y-0.5 active:translate-y-0 transition-transform duration-200"
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
}
