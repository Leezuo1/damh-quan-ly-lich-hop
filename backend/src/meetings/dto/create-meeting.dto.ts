import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateMeetingDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsMongoId()
  roomId: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsMongoId({ each: true })
  participantIds: string[];

  @IsOptional()
  @IsBoolean()
  isImportant?: boolean;

  @IsOptional()
  @IsString()
  onlineLink?: string;

  // true = người dùng đã xác nhận "Vẫn tạo" dù có cảnh báo trùng lịch
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  force?: boolean;
}
