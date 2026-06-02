import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { TaskServices } from "./task.service";

const createTask = catchAsync(async (req, res) => {
  const creatorId = req.user.userId;
  const result = await TaskServices.createTask(req.body, creatorId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Task created successfully",
    data: result,
  });
});

const updateTask = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const userId = req.user.userId;
  const role = req.user.role;
  const result = await TaskServices.updateTask(id, req.body, userId, role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Task updated successfully",
    data: result,
  });
});

const deleteTask = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const userId = req.user.userId;
  const result = await TaskServices.deleteTask(id, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Task deleted successfully",
    data: result,
  });
});

const getTaskById = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const result = await TaskServices.getTaskById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Task retrieved successfully",
    data: result,
  });
});

const getAllTasks = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const role = req.user.role;
  const result = await TaskServices.getAllTasks(req.query as any, userId, role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Tasks retrieved successfully",
    data: result.result,
    meta: result.meta,
  });
});

const addComment = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const userId = req.user.userId;
  const { text } = req.body;
  const result = await TaskServices.addComment(id, userId, text);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Comment added successfully",
    data: result,
  });
});

const addAttachment = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const userId = req.user.userId;
  const { name, url } = req.body;
  const result = await TaskServices.addAttachment(id, userId, name, url);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Attachment added successfully",
    data: result,
  });
});

export const TaskControllers = {
  createTask,
  updateTask,
  deleteTask,
  getTaskById,
  getAllTasks,
  addComment,
  addAttachment,
};
