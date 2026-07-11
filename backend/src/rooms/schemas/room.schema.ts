import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RoomDocument = HydratedDocument<Room>;

@Schema({ timestamps: true })
export class Room {
  @Prop({ required: true, trim: true })
  name: string; // vd: "Phòng họp A"

  @Prop({ required: true })
  capacity: number;

  @Prop()
  floor?: string;

  @Prop({ type: [String], default: [] })
  equipment: string[]; // vd: ["Máy chiếu", "Bảng trắng"]
}

export const RoomSchema = SchemaFactory.createForClass(Room);
