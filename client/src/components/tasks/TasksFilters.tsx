import React from "react";
import { Search, ArrowUpDown, Filter, X } from "lucide-react";
import { Project, Member } from "@/types";

interface TasksFiltersProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  isSearchFocused: boolean;
  setIsSearchFocused: (v: boolean) => void;
  sortOption: string;
  setSortOption: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  priorityFilter: string;
  setPriorityFilter: (v: string) => void;
  projectFilter: string;
  setProjectFilter: (v: string) => void;
  assigneeFilter: string;
  setAssigneeFilter: (v: string) => void;
  deadlineStatusFilter: string;
  setDeadlineStatusFilter: (v: string) => void;
  projects: Project[];
  teamMembers: Member[];
}

const filterSelectClass =
  "p-2 px-3 rounded-md border border-border bg-background/50 text-foreground text-[0.85rem] font-medium cursor-pointer outline-none focus:border-primary transition-all duration-200";

export const TasksFilters: React.FC<TasksFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  isSearchFocused,
  setIsSearchFocused,
  sortOption,
  setSortOption,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  projectFilter,
  setProjectFilter,
  assigneeFilter,
  setAssigneeFilter,
  deadlineStatusFilter,
  setDeadlineStatusFilter,
  projects,
  teamMembers,
}) => {
  return (
    <div className="glass-panel p-4 md:p-6 mb-8 flex flex-col gap-4">
      {/* Row 1: Search & Sort */}
      <div className="flex flex-wrap justify-start md:justify-center items-center gap-4">
        {/* Search Box */}
        <div
          className={`flex items-center gap-3 px-4 h-11 rounded-[10px] border bg-background/50 grow max-w-112.5 min-w-60 transition-all duration-200 ${
            isSearchFocused ? "border-primary ring-4 ring-primary/10" : "border-border"
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
            <option value="-createdAt" className="bg-secondary-bg">
              Newest Created
            </option>
            <option value="created" className="bg-secondary-bg">
              Oldest Created
            </option>
            <option value="deadline" className="bg-secondary-bg">
              Nearest Due Date
            </option>
            <option value="-priority" className="bg-secondary-bg">
              Highest Priority
            </option>
            <option value="updated" className="bg-secondary-bg">
              Latest Updated
            </option>
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
          <option value="" className="bg-secondary-bg">
            All Statuses
          </option>
          <option value="Todo" className="bg-secondary-bg">
            Todo
          </option>
          <option value="In Progress" className="bg-secondary-bg">
            In Progress
          </option>
          <option value="Completed" className="bg-secondary-bg">
            Completed
          </option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className={filterSelectClass}
        >
          <option value="" className="bg-secondary-bg">
            All Priorities
          </option>
          <option value="High" className="bg-secondary-bg">
            High Priority
          </option>
          <option value="Medium" className="bg-secondary-bg">
            Medium Priority
          </option>
          <option value="Low" className="bg-secondary-bg">
            Low Priority
          </option>
        </select>

        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className={`${filterSelectClass} max-w-45`}
        >
          <option value="" className="bg-secondary-bg">
            All Projects
          </option>
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
          <option value="" className="bg-secondary-bg">
            All Assignees
          </option>
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
            deadlineStatusFilter === "Overdue" ? "text-danger font-semibold" : ""
          }`}
        >
          <option value="" className="bg-secondary-bg">
            All Deadlines
          </option>
          <option value="Upcoming" className="bg-secondary-bg">
            Upcoming Only
          </option>
          <option value="Overdue" className="bg-secondary-bg">
            Overdue Warnings ⚠️
          </option>
        </select>
      </div>
    </div>
  );
};
