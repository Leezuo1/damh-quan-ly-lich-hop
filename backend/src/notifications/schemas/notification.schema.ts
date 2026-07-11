import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

export enum NotificationType {
  INVITE = 'invite', // mời họp, chờ chấp nhận/từ chối
  REMINDER = 'reminder', // nhắc sắp tới giờ họp
  RESPONSE = 'response', // người tham gia đã chấp nhận/từ chối
  UPDATE = 'update', // lịch họp bị sửa/hủy
}

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  recipient: Types.ObjectId;

  @Prop({ enum: NotificationType, required: true })
  type: NotificationType;

  @Prop({ type: Types.ObjectId, ref: 'Meeting', required: true })
  meeting: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  actor?: Types.ObjectId; // người gây ra sự kiện (người tổ chức, hoặc người phản hồi)

  @Prop({ required: true })
  message: string;

  @Prop({ default: false })
  isRead: boolean;

  // Được Mongoose tự thêm nhờ { timestamps: true }, khai báo lại để có kiểu dữ liệu
  createdAt?: Date;
  updatedAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ recipient: 1, createdAt: -1 });
