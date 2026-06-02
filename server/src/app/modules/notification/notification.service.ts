import { Notification } from "./notification.model";

const getNotificationsForUser = async (userId: string) => {
  return await Notification.find({ user: userId })
    .sort("-createdAt")
    .limit(50);
};

const markAsRead = async (notificationId: string, userId: string) => {
  return await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { isRead: true },
    { new: true }
  );
};

const markAllAsReadForUser = async (userId: string) => {
  return await Notification.updateMany(
    { user: userId, isRead: false },
    { isRead: true }
  );
};

export const NotificationServices = {
  getNotificationsForUser,
  markAsRead,
  markAllAsReadForUser,
};
