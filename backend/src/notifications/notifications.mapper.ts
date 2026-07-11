import { NotificationDocument } from './schemas/notification.schema';

export function toPublicNotification(n: NotificationDocument) {
  return {
    id: n._id.toString(),
    type: n.type,
    message: n.message,
    isRead: n.isRead,
    createdAt: n.createdAt,
    meeting: n.meeting,
    actor: n.actor,
  };
}
