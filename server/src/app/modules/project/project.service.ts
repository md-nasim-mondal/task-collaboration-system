import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { IProject } from "./project.interface";
import { Project } from "./project.model";
import { logActivity } from "../../utils/activityLogger";
import { sendNotification } from "../../utils/notifier";

const createProject = async (payload: IProject, creatorId: string) => {
  // Validate past deadline
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  if (new Date(payload.deadline) < now) {
    throw new AppError(httpStatus.BAD_REQUEST, "Please select a valid deadline.");
  }

  // Preemptive duplicate name check
  const isExist = await Project.findOne({ name: payload.name });
  if (isExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "Project with this name already exists.");
  }

  // Add creator as default member if not present
  const members = payload.members || [];
  if (!members.includes(creatorId)) {
    members.push(creatorId);
  }

  const project = await Project.create({
    ...payload,
    members,
    createdBy: creatorId,
  });

  // Log activity
  await logActivity(`Project "${project.name}" created`, creatorId, project._id);

  return project;
};

const updateProject = async (projectId: string, payload: Partial<IProject>, userId: string) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, "Project not found");
  }

  // Validate past deadline if updated
  if (payload.deadline) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (new Date(payload.deadline) < now) {
      throw new AppError(httpStatus.BAD_REQUEST, "Please select a valid deadline.");
    }
  }

  if (payload.name) {
    const isExist = await Project.findOne({ name: payload.name, _id: { $ne: projectId } });
    if (isExist) {
      throw new AppError(httpStatus.BAD_REQUEST, "Project with this name already exists.");
    }
  }

  // Identify new members added to notify them
  if (payload.members) {
    const currentMembers = project.members.map((m) => m.toString());
    const newMembers = payload.members.filter((m) => !currentMembers.includes(m.toString()));

    for (const memberId of newMembers) {
      await sendNotification(`You have been added to Project "${project.name}"`, memberId.toString());
      await logActivity(`Member added to "${project.name}"`, userId, project._id);
    }
  }

  const updatedProject = await Project.findByIdAndUpdate(projectId, payload, {
    new: true,
    runValidators: true,
  }).populate("members", "name email role picture");

  // Log update activity
  await logActivity(`Project "${project.name}" updated`, userId, project._id);

  return updatedProject;
};

const deleteProject = async (projectId: string, userId: string) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, "Project not found");
  }

  await Project.findByIdAndDelete(projectId);

  // Log deletion activity
  await logActivity(`Project "${project.name}" deleted`, userId);

  return project;
};

const getProjectById = async (projectId: string) => {
  const project = await Project.findById(projectId)
    .populate("members", "name email role picture")
    .populate("createdBy", "name email");

  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, "Project not found");
  }
  return project;
};

const getAllProjects = async (userId: string, role: string, query: Record<string, any>) => {
  const filter: Record<string, any> = {};

  // If not Admin, user can only see projects they are members of
  if (role !== "ADMIN") {
    filter.members = userId;
  }

  // Status Filter
  if (query.status) {
    filter.status = query.status;
  }

  // Name Search
  if (query.searchTerm) {
    filter.name = { $regex: query.searchTerm, $options: "i" };
  }

  const projects = await Project.find(filter)
    .populate("members", "name email role picture")
    .populate("createdBy", "name email")
    .sort("-createdAt");

  return projects;
};

export const ProjectServices = {
  createProject,
  updateProject,
  deleteProject,
  getProjectById,
  getAllProjects,
};
