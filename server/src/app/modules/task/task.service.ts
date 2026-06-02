import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { logActivity } from "../../utils/activityLogger";
import { sendNotification } from "../../utils/notifier";
import { Project } from "../project/project.model";
import { ITask } from "./task.interface";
import { Task } from "./task.model";
import { Role } from "../user/user.interface";

const createTask = async (payload: ITask, creatorId: string) => {
  // Validate past due date
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  if (new Date(payload.dueDate) < now) {
    throw new AppError(httpStatus.BAD_REQUEST, "Please select a valid deadline.");
  }

  // Verify Project exists
  const project = await Project.findById(payload.project);
  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, "Project not found");
  }

  // Prevent duplicate task titles inside the same project
  const isDuplicate = await Task.findOne({
    project: payload.project,
    title: { $regex: new RegExp(`^${payload.title.trim()}$`, "i") },
  });
  if (isDuplicate) {
    throw new AppError(httpStatus.BAD_REQUEST, "This task already exists in the project.");
  }

  const task = await Task.create({
    ...payload,
    createdBy: creatorId,
  });

  // Log activity
  await logActivity(
    `Task "${task.title}" created in Project "${project.name}"`,
    creatorId,
    project._id,
    task._id
  );

  // Notify assigned member
  if (payload.assignedMember) {
    await sendNotification(
      `You have been assigned the task "${task.title}" in project "${project.name}"`,
      payload.assignedMember.toString()
    );
    await logActivity(
      `Task "${task.title}" assigned to member`,
      creatorId,
      project._id,
      task._id
    );
  }

  return task;
};

const updateTask = async (
  taskId: string,
  payload: Partial<ITask>,
  userId: string,
  role: string
) => {
  const task = await Task.findById(taskId).populate("project", "name");
  if (!task) {
    throw new AppError(httpStatus.NOT_FOUND, "Task not found");
  }

  const projectName = (task.project as any)?.name || "Project";

  // Role permissions: Team Member can only update task status (if assigned to them)
  if (role === Role.TEAM_MEMBER) {
    if (!task.assignedMember || task.assignedMember.toString() !== userId) {
      throw new AppError(httpStatus.FORBIDDEN, "You can only update tasks assigned to you");
    }

    // Filter payload to only allow status, comments, or attachments additions
    const allowedKeys = ["status", "comments", "attachments"];
    const payloadKeys = Object.keys(payload);
    const isModifyingOtherFields = payloadKeys.some((k) => !allowedKeys.includes(k));
    if (isModifyingOtherFields) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Team members can only update task status, add comments, or add attachments"
      );
    }
  }

  // Validate past due date if provided
  if (payload.dueDate) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (new Date(payload.dueDate) < now) {
      throw new AppError(httpStatus.BAD_REQUEST, "Please select a valid deadline.");
    }
  }

  // Prevent duplicate task titles inside the same project
  if (payload.title && payload.title.trim() !== task.title) {
    const isDuplicate = await Task.findOne({
      project: task.project,
      title: { $regex: new RegExp(`^${payload.title.trim()}$`, "i") },
      _id: { $ne: taskId },
    });
    if (isDuplicate) {
      throw new AppError(httpStatus.BAD_REQUEST, "This task already exists in the project.");
    }
  }

  // Prevent assigning completed tasks / "Completed tasks cannot be reassigned."
  if (task.status === "Completed" && payload.assignedMember) {
    if (payload.assignedMember.toString() !== task.assignedMember?.toString()) {
      throw new AppError(httpStatus.BAD_REQUEST, "Completed tasks cannot be reassigned.");
    }
  }

  // If assignee is changing, log and notify
  if (payload.assignedMember && payload.assignedMember.toString() !== task.assignedMember?.toString()) {
    await sendNotification(
      `You have been assigned the task "${task.title}" in project "${projectName}"`,
      payload.assignedMember.toString()
    );
    await logActivity(
      `Task "${task.title}" assigned to member`,
      userId,
      task.project as any,
      task._id
    );
  }

  // If status is changing, log activity
  if (payload.status && payload.status !== task.status) {
    await logActivity(
      `Task "${task.title}" marked as ${payload.status}`,
      userId,
      task.project as any,
      task._id
    );
  }

  const updatedTask = await Task.findByIdAndUpdate(taskId, payload, {
    new: true,
    runValidators: true,
  })
    .populate("assignedMember", "name email role picture")
    .populate("project", "name status")
    .populate("comments.user", "name email role picture");

  return updatedTask;
};

const deleteTask = async (taskId: string, userId: string) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError(httpStatus.NOT_FOUND, "Task not found");
  }

  await Task.findByIdAndDelete(taskId);

  // Log activity
  await logActivity(`Task "${task.title}" deleted`, userId, task.project);

  return task;
};

const getTaskById = async (taskId: string) => {
  const task = await Task.findById(taskId)
    .populate("assignedMember", "name email role picture")
    .populate("project", "name status members")
    .populate("comments.user", "name email role picture");

  if (!task) {
    throw new AppError(httpStatus.NOT_FOUND, "Task not found");
  }
  return task;
};

const getAllTasks = async (query: Record<string, string>, userId: string, role: string) => {
  const filter: Record<string, any> = {};

  // If the user is a Team Member, they can only see tasks of projects they are members of
  if (role === Role.TEAM_MEMBER) {
    const userProjects = await Project.find({ members: userId }).select("_id");
    const projectIds = userProjects.map((p) => p._id);
    filter.project = { $in: projectIds };
  }

  // Handle explicit project filter if provided in query
  if (query.project) {
    filter.project = query.project;
  }

  // Handle status filter
  if (query.status) {
    filter.status = query.status;
  }

  // Handle priority filter
  if (query.priority) {
    filter.priority = query.priority;
  }

  // Handle assigned member filter
  if (query.assignedMember) {
    filter.assignedMember = query.assignedMember;
  }

  // Search by title or description
  if (query.searchTerm) {
    filter.$or = [
      { title: { $regex: query.searchTerm, $options: "i" } },
      { description: { $regex: query.searchTerm, $options: "i" } },
    ];
  }

  // Overdue status filter (virtual filter)
  if (query.deadlineStatus) {
    const today = new Date();
    if (query.deadlineStatus === "Overdue") {
      filter.dueDate = { $lt: today };
      filter.status = { $ne: "Completed" };
    } else if (query.deadlineStatus === "Upcoming") {
      filter.dueDate = { $gte: today };
      filter.status = { $ne: "Completed" };
    }
  }

  // Build query with sorting and pagination
  const sort = query.sort || "-createdAt";
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const tasksQuery = Task.find(filter)
    .populate("assignedMember", "name email role picture")
    .populate("project", "name status")
    .populate("comments.user", "name email role picture");

  // Apply sorting
  // E.g. sort by Nearest Deadline (dueDate), Highest Priority (priority), Latest Created (createdAt)
  let sortString = "-createdAt";
  if (sort === "deadline") sortString = "dueDate";
  else if (sort === "priority") sortString = "-priority"; // In JS we will sort priority if needed, or simple string sort
  else if (sort === "updated") sortString = "-updatedAt";
  else if (sort === "created") sortString = "-createdAt";

  const result = await tasksQuery.sort(sortString).skip(skip).limit(limit);
  const total = await Task.countDocuments(filter);
  const totalPage = Math.ceil(total / limit);

  return {
    result,
    meta: { page, limit, total, totalPage },
  };
};

const addComment = async (taskId: string, userId: string, text: string) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError(httpStatus.NOT_FOUND, "Task not found");
  }

  task.comments.push({
    user: userId,
    text,
    createdAt: new Date(),
  });

  await task.save();

  const updatedTask = await Task.findById(taskId)
    .populate("assignedMember", "name email role picture")
    .populate("project", "name status")
    .populate("comments.user", "name email role picture");

  // Log activity
  await logActivity(`Comment added to Task "${task.title}"`, userId, task.project, task._id);

  return updatedTask;
};

const addAttachment = async (taskId: string, userId: string, name: string, url: string) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError(httpStatus.NOT_FOUND, "Task not found");
  }

  task.attachments.push({ name, url });
  await task.save();

  const updatedTask = await Task.findById(taskId)
    .populate("assignedMember", "name email role picture")
    .populate("project", "name status")
    .populate("comments.user", "name email role picture");

  // Log activity
  await logActivity(`Attachment uploaded to Task "${task.title}"`, userId, task.project, task._id);

  return updatedTask;
};

export const TaskServices = {
  createTask,
  updateTask,
  deleteTask,
  getTaskById,
  getAllTasks,
  addComment,
  addAttachment,
};
