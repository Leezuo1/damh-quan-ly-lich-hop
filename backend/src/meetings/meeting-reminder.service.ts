import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Meeting,
  MeetingDocument,
  MeetingStatus,
  ParticipantStatus,
} from './schemas/meeting.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';

const REMINDER_WINDOW_MINUTES = 15;

@Injectable()
export class MeetingReminderService {
  private readonly logger = new Logger(MeetingReminderService.name);

  constructor(
    @InjectModel(Meeting.name) private meetingModel: Model<MeetingDocument>,
    private notificationsService: NotificationsService,
  ) {}

  // Quét mỗi phút, gửi nhắc nhở cho cuộc họp bắt đầu trong 15 phút tới
  @Cron(CronExpression.EVERY_MINUTE)
  async sendUpcomingReminders() {
    const now = new Date();
    const windowEnd = new Date(
      now.getTime() + REMINDER_WINDOW_MINUTES * 60 * 1000,
    );

    const meetings = await this.meetingModel.find({
      status: MeetingStatus.SCHEDULED,
      reminderSent: false,
      startTime: { $gte: now, $lte: windowEnd },
    });

    for (const meeting of meetings) {
      const recipients = new Set<string>([
        meeting.organizer.toString(),
        ...meeting.participants
          .filter((p) => p.status !== ParticipantStatus.DECLINED)
          .map((p) => p.user.toString()),
      ]);

      await this.notificationsService.createMany(
        Array.from(recipients).map((recipient) => ({
          recipient,
          type: NotificationType.REMINDER,
          meeting: meeting._id,
          message: `Nhắc nhở: "${meeting.title}" bắt đầu sau ${REMINDER_WINDOW_MINUTES} phút`,
        })),
      );

      meeting.reminderSent = true;
      await meeting.save();
      this.logger.log(`Đã gửi nhắc nhở cho cuộc họp ${meeting.title}`);
    }
  }
}
