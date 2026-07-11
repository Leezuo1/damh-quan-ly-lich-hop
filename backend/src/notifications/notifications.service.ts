import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Notification,
  NotificationDocument,
  NotificationType,
} from './schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  create(params: {
    recipient: Types.ObjectId | string;
    type: NotificationType;
    meeting: Types.ObjectId | string;
    actor?: Types.ObjectId | string;
    message: string;
  }): Promise<NotificationDocument> {
    return this.notificationModel.create(params);
  }

  createMany(
    items: {
      recipient: Types.ObjectId | string;
      type: NotificationType;
      meeting: Types.ObjectId | string;
      actor?: Types.ObjectId | string;
      message: string;
    }[],
  ) {
    if (items.length === 0) return Promise.resolve([]);
    return this.notificationModel.insertMany(items);
  }

  findMine(userId: string): Promise<NotificationDocument[]> {
    return this.notificationModel
      .find({ recipient: userId })
      .sort({ createdAt: -1 })
      .populate('actor', 'name')
      .populate('meeting', 'title startTime endTime room');
  }

  countUnread(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      recipient: userId,
      isRead: false,
    });
  }

  async markRead(id: string, userId: string): Promise<NotificationDocument> {
    const notification = await this.notificationModel.findOne({
      _id: id,
      recipient: userId,
    });
    if (!notification) throw new NotFoundException('Không tìm thấy thông báo');
    notification.isRead = true;
    await notification.save();
    return notification;
  }

  async markAllRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true },
    );
  }
}
