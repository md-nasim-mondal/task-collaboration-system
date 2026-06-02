import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { NotificationServices } from "./notification.service";

const getMyNotifications = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const result = await NotificationServices.getNotificationsForUser(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notifications retrieved successfully",
    data: result,
  });
});

const markNotificationRead = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const id = req.params.id as string;
  const result = await NotificationServices.markAsRead(id, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notification marked as read",
    data: result,
  });
});

const markAllNotificationsRead = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  await NotificationServices.markAllAsReadForUser(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All notifications marked as read",
    data: null,
  });
});

export const NotificationControllers = {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
