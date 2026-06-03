export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  picture?: string;
  status?: string;
}

export interface Member {
  _id: string;
  name: string;
  email: string;
  role: string;
  status?: string;
  picture?: string;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  deadline?: string;
  status?: string;
  members?: Member[];
  createdBy?: {
    _id: string;
    name: string;
    email?: string;
  };
}

export interface Comment {
  user: Member;
  text: string;
  createdAt: string;
}

export interface Attachment {
  name: string;
  url: string;
}

export interface Task {
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

export interface Workload {
  member: Member;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
}

export interface KPIs {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
}

export interface ProjectProgress {
  projectId: string;
  name: string;
  deadline: string;
  status: string;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completionRate: number;
}

export interface ChartData {
  tasksByPriority: { priority: string; count: number }[];
  taskStatusDistribution: { status: string; count: number }[];
}
