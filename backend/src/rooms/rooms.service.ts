import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room, RoomDocument } from './schemas/room.schema';
import {
  Meeting,
  MeetingDocument,
  MeetingStatus,
} from '../meetings/schemas/meeting.schema';
import { CreateRoomDto } from './dto/create-room.dto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
    @InjectModel(Meeting.name) private meetingModel: Model<MeetingDocument>,
  ) {}

  findAll(): Promise<RoomDocument[]> {
    return this.roomModel.find().sort({ name: 1 });
  }

  async findById(id: string): Promise<RoomDocument> {
    const room = await this.roomModel.findById(id);
    if (!room) throw new NotFoundException('Không tìm thấy phòng họp');
    return room;
  }

  create(dto: CreateRoomDto): Promise<RoomDocument> {
    return this.roomModel.create(dto);
  }

  // Trả về danh sách phòng kèm trạng thái còn trống/đang bận trong khung giờ cho trước
  async findAllWithAvailability(startTime?: Date, endTime?: Date) {
    const rooms = await this.findAll();
    if (!startTime || !endTime) {
      return rooms.map((room) => ({ room, available: true }));
    }
    const busyMeetings = await this.meetingModel.find({
      room: { $in: rooms.map((r) => r._id) },
      status: MeetingStatus.SCHEDULED,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });
    const busyRoomIds = new Set(busyMeetings.map((m) => m.room.toString()));
    return rooms.map((room) => ({
      room,
      available: !busyRoomIds.has(String(room._id)),
    }));
  }
}
