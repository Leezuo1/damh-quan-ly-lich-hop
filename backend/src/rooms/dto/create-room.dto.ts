import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(1)
  capacity: number;

  @IsOptional()
  @IsString()
  floor?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equipment?: string[];
}
