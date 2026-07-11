import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(private roomsService: RoomsService) {}

  // ?startTime=ISO&endTime=ISO để biết phòng nào còn trống trong khung giờ đó
  @Get()
  async findAll(
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ) {
    const results = await this.roomsService.findAllWithAvailability(
      startTime ? new Date(startTime) : undefined,
      endTime ? new Date(endTime) : undefined,
    );
    return results.map(({ room, available }) => ({
      id: room._id.toString(),
      name: room.name,
      capacity: room.capacity,
      floor: room.floor,
      equipment: room.equipment,
      available,
    }));
  }

  @Post()
  async create(@Body() dto: CreateRoomDto) {
    const room = await this.roomsService.create(dto);
    return { id: room._id.toString(), ...dto };
  }
}
