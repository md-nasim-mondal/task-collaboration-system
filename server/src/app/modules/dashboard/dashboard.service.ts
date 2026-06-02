import { Project } from "../project/project.model";
import { Task } from "../task/task.model";
import { TaskStatus } from "../task/task.interface";
import { Role } from "../user/user.interface";

// Utility to get project filter based on user role
const getProjectFilterForUser = async (userId: string, role: string) => {
  const filter: Record<string, any> = {};
  if (role !== Role.ADMIN) {
    filter.members = userId;
  }
  return filter;
};

const getDashboardKPIs = async (userId: string, role: string) => {
  const projectFilter = await getProjectFilterForUser(userId, role);
  
  // 1. Total Projects
  const totalProjects = await Project.countDocuments(projectFilter);

  // Get project IDs that the user has access to
  const projects = await Project.find(projectFilter).select("_id");
  const projectIds = projects.map((p) => p._id);

  // Task filter based on accessible projects
  const taskFilter: Record<string, any> = { project: { $in: projectIds } };

  // 2. Total Tasks
  const totalTasks = await Task.countDocuments(taskFilter);

  // 3. Completed Tasks
  const completedTasks = await Task.countDocuments({
    ...taskFilter,
    status: TaskStatus.COMPLETED,
  });

  // 4. Pending Tasks (Todo + In Progress)
  const pendingTasks = await Task.countDocuments({
    ...taskFilter,
    status: { $in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS] },
  });

  // 5. Overdue Tasks (Past due date and not completed)
  const today = new Date();
  const overdueTasks = await Task.countDocuments({
    ...taskFilter,
    dueDate: { $lt: today },
    status: { $ne: TaskStatus.COMPLETED },
  });

  return {
    totalProjects,
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
  };
};

const getProjectProgressSummary = async (userId: string, role: string) => {
  const projectFilter = await getProjectFilterForUser(userId, role);
  const projects = await Project.find(projectFilter).select("_id name deadline status");

  const summaries = [];

  for (const proj of projects) {
    const totalTasks = await Task.countDocuments({ project: proj._id });
    const completedTasks = await Task.countDocuments({
      project: proj._id,
      status: TaskStatus.COMPLETED,
    });
    const pendingTasks = await Task.countDocuments({
      project: proj._id,
      status: { $in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS] },
    });

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    summaries.push({
      projectId: proj._id,
      name: proj.name,
      deadline: proj.deadline,
      status: proj.status,
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate,
    });
  }

  return summaries;
};

const getTeamWorkloadSummary = async (userId: string, role: string) => {
  const projectFilter = await getProjectFilterForUser(userId, role);
  const projects = await Project.find(projectFilter).populate("members", "name email role picture");
  
  // Collect unique users that are members in the user's projects
  const uniqueUsersMap = new Map<string, any>();
  
  for (const proj of projects) {
    for (const member of proj.members as any[]) {
      uniqueUsersMap.set(member._id.toString(), member);
    }
  }

  const workloads = [];

  for (const [memberId, member] of uniqueUsersMap.entries()) {
    // Tasks assigned to this member within projects the active user has access to
    const projectIds = projects.map((p) => p._id);
    const taskFilter = {
      project: { $in: projectIds },
      assignedMember: memberId,
    };

    const totalTasks = await Task.countDocuments(taskFilter);
    const completedTasks = await Task.countDocuments({
      ...taskFilter,
      status: TaskStatus.COMPLETED,
    });
    const pendingTasks = await Task.countDocuments({
      ...taskFilter,
      status: { $in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS] },
    });

    workloads.push({
      member: {
        _id: member._id,
        name: member.name,
        email: member.email,
        role: member.role,
        picture: member.picture,
      },
      totalTasks,
      completedTasks,
      pendingTasks,
    });
  }

  return workloads;
};

const getDashboardChartData = async (userId: string, role: string) => {
  const projectFilter = await getProjectFilterForUser(userId, role);
  const projects = await Project.find(projectFilter).select("_id");
  const projectIds = projects.map((p) => p._id);
  const taskFilter = { project: { $in: projectIds } };

  // 1. Tasks by Priority
  const priorityData = await Task.aggregate([
    { $match: taskFilter },
    { $group: { _id: "$priority", count: { $sum: 1 } } },
  ]);

  // 2. Task Status Distribution
  const statusData = await Task.aggregate([
    { $match: taskFilter },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  return {
    tasksByPriority: priorityData.map((d) => ({ priority: d._id, count: d.count })),
    taskStatusDistribution: statusData.map((d) => ({ status: d._id, count: d.count })),
  };
};

export const DashboardServices = {
  getDashboardKPIs,
  getProjectProgressSummary,
  getTeamWorkloadSummary,
  getDashboardChartData,
};
