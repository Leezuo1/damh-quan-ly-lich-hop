import {
  IsBooleanString,
  IsISO8601,
  IsMongoId,
  IsOptional,
} from 'class-validator';

export class ListMeetingsQuery {
  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;

  @IsOptional()
  @IsMongoId()
  roomId?: string;

  @IsOptional()
  @IsMongoId()
  organizerId?: string;

  // chỉ lấy cuộc họp mà user hiện tại là người tổ chức hoặc người tham gia
  @IsOptional()
  @IsBooleanString()
  mine?: string;
}
