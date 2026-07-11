import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Meeting,
  MeetingDocument,
  MeetingStatus,
  ParticipantStatus,
} from './schemas/meeting.schema';
import { RoomsService } from '../rooms/rooms.service';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { ListMeetingsQuery } from './dto/list-meetings.query';

const POPULATE_ROOM = 'room';
const POPULATE_ORGANIZER = 'organizer';
const POPULATE_PARTICIPANTS = 'participants.user';

export interface RoomConflict {
  meetingId: string;
  meetingTitle: string;
  startTime: Date;
  endTime: Date;
}

export interface ParticipantConflict {
  userId: string;
  name: string;
  meetingId: string;
  meetingTitle: string;
}

export interface ConflictReport {
  hasConflict: boolean;
  room?: RoomConflict;
  participants: ParticipantConflict[];
}

@Injectable()
export class MeetingsService {
  constructor(
    @InjectModel(Meeting.name) private meetingModel: Model<MeetingDocument>,
    private roomsService: RoomsService,
    private usersService: UsersService,
    private notificationsService: NotificationsService,
  ) {}

  // Khung giờ [start, end) chồng lấn nhau khi: existingStart < newEnd && existingEnd > newStart
  private overlapFilter(startTime: Date, endTime: Date) {
    return { startTime: { $lt: endTime }, endTime: { $gt: startTime } };
  }

  async checkConflicts(params: {
    roomId: string;
    startTime: Date;
    endTime: Date;
    participantIds: string[];
    excludeMeetingId?: string;
  }): Promise<ConflictReport> {
    const { roomId, startTime, endTime, participantIds, excludeMeetingId } =
      params;

    const baseFilter: Record<string, unknown> = {
      status: MeetingStatus.SCHEDULED,
      ...this.overlapFilter(startTime, endTime),
    };
    if (excludeMeetingId) {
      baseFilter._id = { $ne: excludeMeetingId };
    }

    const roomConflictDoc = await this.meetingModel.findOne({
      ...baseFilter,
      room: roomId,
    });

    const participantConflictDocs = await this.meetingModel.find({
      ...baseFilter,
      'participants.user': { $in: participantIds },
      'participants.status': { $ne: ParticipantStatus.DECLINED },
    });

    const participantIdSet = new Set(participantIds.map(String));
    const participantConflicts: ParticipantConflict[] = [];
    if (participantConflictDocs.length > 0) {
      const involvedUserIds = new Set<string>();
      for (const doc of participantConflictDocs) {
        for (const p of doc.participants) {
          const uid = p.user.toString();
          if (
            participantIdSet.has(uid) &&
            p.status !== ParticipantStatus.DECLINED
          ) {
            involvedUserIds.add(uid);
            participantConflicts.push({
              userId: uid,
              name: '',
              meetingId: doc._id.toString(),
              meetingTitle: doc.title,
            });
          }
        }
      }
      const users = await this.usersService.findManyByIds(
        Array.from(involvedUserIds),
      );
      const nameById = new Map(users.map((u) => [u._id.toString(), u.name]));
      participantConflicts.forEach((c) => {
        c.name = nameById.get(c.userId) ?? 'Người dùng';
      });
    }

    const report: ConflictReport = {
      hasConflict: !!roomConflictDoc || participantConflicts.length > 0,
      participants: participantConflicts,
    };
    if (roomConflictDoc) {
      report.room = {
        meetingId: roomConflictDoc._id.toString(),
        meetingTitle: roomConflictDoc.title,
        startTime: roomConflictDoc.startTime,
        endTime: roomConflictDoc.endTime,
      };
    }
    return report;
  }

  async create(
    dto: CreateMeetingDto,
    organizerId: string,
  ): Promise<MeetingDocument> {
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);
    if (endTime <= startTime) {
      throw new BadRequestException(
        'Thời gian kết thúc phải sau thời gian bắt đầu',
      );
    }

    await this.roomsService.findById(dto.roomId);
    const participants = await this.usersService.findManyByIds(
      dto.participantIds,
    );
    if (participants.length !== dto.participantIds.length) {
      throw new BadRequestException('Có người tham gia không tồn tại');
    }

    if (!dto.force) {
      const conflicts = await this.checkConflicts({
        roomId: dto.roomId,
        startTime,
        endTime,
        participantIds: dto.participantIds,
      });
      if (conflicts.hasConflict) {
        throw new ConflictException(conflicts);
      }
    }

    const meeting = await this.meetingModel.create({
      title: dto.title,
      description: dto.description,
      startTime,
      endTime,
      room: dto.roomId,
      organizer: organizerId,
      participants: dto.participantIds.map((userId) => ({
        user: userId,
        status: ParticipantStatus.PENDING,
      })),
      isImportant: dto.isImportant ?? false,
      onlineLink: dto.onlineLink,
    });

    const organizer = await this.usersService.findById(organizerId);
    await this.notificationsService.createMany(
      dto.participantIds.map((userId) => ({
        recipient: userId,
        type: NotificationType.INVITE,
        meeting: meeting._id,
        actor: organizerId,
        message: `${organizer.name} mời bạn họp "${meeting.title}"`,
      })),
    );

    return this.populate(meeting);
  }

  async findAll(
    query: ListMeetingsQuery,
    currentUserId: string,
  ): Promise<MeetingDocument[]> {
    const filter: Record<string, unknown> = {};

    if (query.to) {
      filter.startTime = { $lt: new Date(query.to) };
    }
    if (query.from) {
      // cuộc họp thuộc khoảng [from, to): bắt đầu trước "to" và kết thúc sau "from"
      filter.endTime = { $gt: new Date(query.from) };
    }
    if (query.roomId) filter.room = query.roomId;
    if (query.organizerId) filter.organizer = query.organizerId;
    if (query.mine === 'true') {
      filter.$or = [
        { organizer: currentUserId },
        { 'participants.user': currentUserId },
      ];
    }

    return this.meetingModel
      .find(filter)
      .sort({ startTime: 1 })
      .populate(POPULATE_ROOM)
      .populate(POPULATE_ORGANIZER)
      .populate(POPULATE_PARTICIPANTS);
  }

  async findMine(userId: string): Promise<MeetingDocument[]> {
    return this.meetingModel
      .find({ $or: [{ organizer: userId }, { 'participants.user': userId }] })
      .sort({ startTime: -1 })
      .populate(POPULATE_ROOM)
      .populate(POPULATE_ORGANIZER)
      .populate(POPULATE_PARTICIPANTS);
  }

  async findById(id: string): Promise<MeetingDocument> {
    const meeting = await this.meetingModel
      .findById(id)
      .populate(POPULATE_ROOM)
      .populate(POPULATE_ORGANIZER)
      .populate(POPULATE_PARTICIPANTS);
    if (!meeting) throw new NotFoundException('Không tìm thấy cuộc họp');
    return meeting;
  }

  private async getOwnedMeeting(
    id: string,
    userId: string,
  ): Promise<MeetingDocument> {
    const meeting = await this.meetingModel.findById(id);
    if (!meeting) throw new NotFoundException('Không tìm thấy cuộc họp');
    if (meeting.organizer.toString() !== userId) {
      throw new ForbiddenException(
        'Chỉ người tổ chức mới có quyền thực hiện thao tác này',
      );
    }
    return meeting;
  }

  async update(
    id: string,
    dto: UpdateMeetingDto,
    userId: string,
  ): Promise<MeetingDocument> {
    const meeting = await this.getOwnedMeeting(id, userId);

    const newStartTime = dto.startTime
      ? new Date(dto.startTime)
      : meeting.startTime;
    const newEndTime = dto.endTime ? new Date(dto.endTime) : meeting.endTime;
    if (newEndTime <= newStartTime) {
      throw new BadRequestException(
        'Thời gian kết thúc phải sau thời gian bắt đầu',
      );
    }
    const newRoomId = dto.roomId ?? meeting.room.toString();
    const newParticipantIds =
      dto.participantIds ?? meeting.participants.map((p) => p.user.toString());

    if (dto.roomId) await this.roomsService.findById(dto.roomId);

    if (!dto.force) {
      const conflicts = await this.checkConflicts({
        roomId: newRoomId,
        startTime: newStartTime,
        endTime: newEndTime,
        participantIds: newParticipantIds,
        excludeMeetingId: id,
      });
      if (conflicts.hasConflict) {
        throw new ConflictException(conflicts);
      }
    }

    const previousParticipantIds = new Set(
      meeting.participants.map((p) => p.user.toString()),
    );
    const addedParticipantIds = newParticipantIds.filter(
      (pid) => !previousParticipantIds.has(pid),
    );

    if (dto.title !== undefined) meeting.title = dto.title;
    if (dto.description !== undefined) meeting.description = dto.description;
    if (dto.startTime !== undefined) meeting.startTime = newStartTime;
    if (dto.endTime !== undefined) meeting.endTime = newEndTime;
    if (dto.roomId !== undefined) meeting.room = new Types.ObjectId(dto.roomId);
    if (dto.isImportant !== undefined) meeting.isImportant = dto.isImportant;
    if (dto.onlineLink !== undefined) meeting.onlineLink = dto.onlineLink;
    if (dto.participantIds !== undefined) {
      meeting.participants = newParticipantIds.map((userId2) => {
        const existing = meeting.participants.find(
          (p) => p.user.toString() === userId2,
        );
        return (
          existing ?? {
            user: new Types.ObjectId(userId2),
            status: ParticipantStatus.PENDING,
          }
        );
      });
    }
    await meeting.save();

    const organizer = await this.usersService.findById(userId);
    if (addedParticipantIds.length > 0) {
      await this.notificationsService.createMany(
        addedParticipantIds.map((pid) => ({
          recipient: pid,
          type: NotificationType.INVITE,
          meeting: meeting._id,
          actor: userId,
          message: `${organizer.name} mời bạn họp "${meeting.title}"`,
        })),
      );
    }
    const unchangedParticipantIds = newParticipantIds.filter((pid) =>
      previousParticipantIds.has(pid),
    );
    if (
      dto.startTime !== undefined ||
      dto.endTime !== undefined ||
      dto.roomId !== undefined
    ) {
      await this.notificationsService.createMany(
        unchangedParticipantIds.map((pid) => ({
          recipient: pid,
          type: NotificationType.UPDATE,
          meeting: meeting._id,
          actor: userId,
          message: `Cuộc họp "${meeting.title}" đã được cập nhật thời gian/phòng họp`,
        })),
      );
    }

    return this.populate(meeting);
  }

  async cancel(id: string, userId: string): Promise<MeetingDocument> {
    const meeting = await this.getOwnedMeeting(id, userId);
    meeting.status = MeetingStatus.CANCELLED;
    await meeting.save();

    const organizer = await this.usersService.findById(userId);
    await this.notificationsService.createMany(
      meeting.participants.map((p) => ({
        recipient: p.user,
        type: NotificationType.UPDATE,
        meeting: meeting._id,
        actor: userId,
        message: `${organizer.name} đã hủy cuộc họp "${meeting.title}"`,
      })),
    );
    return this.populate(meeting);
  }

  async restore(id: string, userId: string): Promise<MeetingDocument> {
    const meeting = await this.getOwnedMeeting(id, userId);
    meeting.status = MeetingStatus.SCHEDULED;
    await meeting.save();
    return this.populate(meeting);
  }

  async respond(
    id: string,
    userId: string,
    status: ParticipantStatus,
  ): Promise<MeetingDocument> {
    const meeting = await this.meetingModel.findById(id);
    if (!meeting) throw new NotFoundException('Không tìm thấy cuộc họp');
    const participant = meeting.participants.find(
      (p) => p.user.toString() === userId,
    );
    if (!participant) {
      throw new ForbiddenException(
        'Bạn không phải người được mời trong cuộc họp này',
      );
    }
    participant.status = status;
    participant.respondedAt = new Date();
    await meeting.save();

    const responder = await this.usersService.findById(userId);
    const verb =
      status === ParticipantStatus.ACCEPTED ? 'chấp nhận' : 'từ chối';
    await this.notificationsService.create({
      recipient: meeting.organizer,
      type: NotificationType.RESPONSE,
      meeting: meeting._id,
      actor: userId,
      message: `${responder.name} đã ${verb} lời mời họp "${meeting.title}"`,
    });

    return this.populate(meeting);
  }

  private populate(meeting: MeetingDocument) {
    return meeting.populate([
      POPULATE_ROOM,
      POPULATE_ORGANIZER,
      POPULATE_PARTICIPANTS,
    ]);
  }
}
