import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { MeetingsService } from './meetings.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { ListMeetingsQuery } from './dto/list-meetings.query';
import { RespondMeetingDto } from './dto/respond-meeting.dto';
import { toPublicMeeting } from './meetings.mapper';
import { ParticipantStatus } from './schemas/meeting.schema';

@Controller('meetings')
@UseGuards(JwtAuthGuard)
export class MeetingsController {
  constructor(private meetingsService: MeetingsService) {}

  @Post()
  async create(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() dto: CreateMeetingDto,
  ) {
    const meeting = await this.meetingsService.create(dto, currentUser.userId);
    return toPublicMeeting(meeting);
  }

  @Get()
  async findAll(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Query() query: ListMeetingsQuery,
  ) {
    const meetings = await this.meetingsService.findAll(
      query,
      currentUser.userId,
    );
    return meetings.map(toPublicMeeting);
  }

  // Danh sách phục vụ trang "Cuộc họp của tôi"
  @Get('mine')
  async findMine(@CurrentUser() currentUser: CurrentUserPayload) {
    const meetings = await this.meetingsService.findMine(currentUser.userId);
    return meetings.map(toPublicMeeting);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const meeting = await this.meetingsService.findById(id);
    return toPublicMeeting(meeting);
  }

  @Patch(':id')
  async update(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateMeetingDto,
  ) {
    const meeting = await this.meetingsService.update(
      id,
      dto,
      currentUser.userId,
    );
    return toPublicMeeting(meeting);
  }

  @Delete(':id')
  async cancel(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id') id: string,
  ) {
    const meeting = await this.meetingsService.cancel(id, currentUser.userId);
    return toPublicMeeting(meeting);
  }

  @Patch(':id/restore')
  async restore(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id') id: string,
  ) {
    const meeting = await this.meetingsService.restore(id, currentUser.userId);
    return toPublicMeeting(meeting);
  }

  // Người được mời chấp nhận/từ chối lời mời họp
  @Patch(':id/respond')
  async respond(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: RespondMeetingDto,
  ) {
    const meeting = await this.meetingsService.respond(
      id,
      currentUser.userId,
      dto.status as ParticipantStatus,
    );
    return toPublicMeeting(meeting);
  }
}
