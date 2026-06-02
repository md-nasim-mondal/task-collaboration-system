import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { DashboardServices } from "./dashboard.service";

const getKPIs = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const role = req.user.role;
  const result = await DashboardServices.getDashboardKPIs(userId, role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Dashboard KPIs retrieved successfully",
    data: result,
  });
});

const getProjectProgress = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const role = req.user.role;
  const result = await DashboardServices.getProjectProgressSummary(userId, role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Project progress summaries retrieved successfully",
    data: result,
  });
});

const getWorkload = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const role = req.user.role;
  const result = await DashboardServices.getTeamWorkloadSummary(userId, role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Team workload summary retrieved successfully",
    data: result,
  });
});

const getChartData = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const role = req.user.role;
  const result = await DashboardServices.getDashboardChartData(userId, role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Dashboard chart datasets retrieved successfully",
    data: result,
  });
});

export const DashboardControllers = {
  getKPIs,
  getProjectProgress,
  getWorkload,
  getChartData,
};
