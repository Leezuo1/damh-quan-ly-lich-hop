import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Meeting, MeetingSchema } from './schemas/meeting.schema';
import { MeetingsService } from './meetings.service';
import { MeetingsController } from './meetings.controller';
import { MeetingReminderService } from './meeting-reminder.service';
import { RoomsModule } from '../rooms/rooms.module';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Meeting.name, schema: MeetingSchema }]),
    RoomsModule,
    UsersModule,
    NotificationsModule,
  ],
  providers: [MeetingsService, MeetingReminderService],
  controllers: [MeetingsController],
  exports: [MeetingsService],
})
export class MeetingsModule {}
