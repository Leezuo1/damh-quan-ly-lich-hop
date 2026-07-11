import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MeetingDocument = HydratedDocument<Meeting>;

export enum ParticipantStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
}

export enum MeetingStatus {
  SCHEDULED = 'scheduled',
  CANCELLED = 'cancelled',
}

@Schema({ _id: false })
export class Participant {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ enum: ParticipantStatus, default: ParticipantStatus.PENDING })
  status: ParticipantStatus;

  @Prop()
  respondedAt?: Date;
}

export const ParticipantSchema = SchemaFactory.createForClass(Participant);

@Schema({ timestamps: true })
export class Meeting {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop()
  description?: string;

  // Lưu mốc thời gian tuyệt đối để so sánh trùng lịch không phụ thuộc timezone string
  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;

  @Prop({ type: Types.ObjectId, ref: 'Room', required: true })
  room: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  organizer: Types.ObjectId;

  @Prop({ type: [ParticipantSchema], default: [] })
  participants: Participant[];

  @Prop({ enum: MeetingStatus, default: MeetingStatus.SCHEDULED })
  status: MeetingStatus;

  @Prop({ default: false })
  isImportant: boolean;

  @Prop()
  onlineLink?: string;

  // Đánh dấu đã gửi thông báo nhắc nhở trước giờ họp, tránh gửi lặp
  @Prop({ default: false })
  reminderSent: boolean;
}

export const MeetingSchema = SchemaFactory.createForClass(Meeting);
MeetingSchema.index({ room: 1, startTime: 1, endTime: 1 });
MeetingSchema.index({ 'participants.user': 1, startTime: 1, endTime: 1 });
MeetingSchema.index({ organizer: 1 });
