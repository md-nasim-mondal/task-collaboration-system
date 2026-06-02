import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ProjectServices } from "./project.service";

const createProject = catchAsync(async (req, res) => {
  const creatorId = req.user.userId;
  const result = await ProjectServices.createProject(req.body, creatorId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Project created successfully",
    data: result,
  });
});

const updateProject = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const result = await ProjectServices.updateProject(id, req.body, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Project updated successfully",
    data: result,
  });
});

const deleteProject = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const result = await ProjectServices.deleteProject(id, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Project deleted successfully",
    data: result,
  });
});

const getProjectById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ProjectServices.getProjectById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Project retrieved successfully",
    data: result,
  });
});

const getAllProjects = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const role = req.user.role;
  const result = await ProjectServices.getAllProjects(userId, role, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Projects retrieved successfully",
    data: result,
  });
});

export const ProjectControllers = {
  createProject,
  updateProject,
  deleteProject,
  getProjectById,
  getAllProjects,
};
