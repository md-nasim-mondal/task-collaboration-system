import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ActivityLogServices } from "./activityLog.service";

const getAllActivityLogs = catchAsync(async (_req, res) => {
  const result = await ActivityLogServices.getAllActivityLogs();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Recent activity logs retrieved successfully",
    data: result,
  });
});

export const ActivityLogControllers = {
  getAllActivityLogs,
};
