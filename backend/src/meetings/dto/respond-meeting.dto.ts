import { IsIn } from 'class-validator';

export class RespondMeetingDto {
  @IsIn(['accepted', 'declined'])
  status: 'accepted' | 'declined';
}
