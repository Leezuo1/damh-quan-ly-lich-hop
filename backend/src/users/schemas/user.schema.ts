import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum UserRole {
  EMPLOYEE = 'employee',
  ADMIN = 'admin',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ trim: true })
  position?: string; // vd: Engineer, Designer, PM

  @Prop({ enum: UserRole, default: UserRole.EMPLOYEE })
  role: UserRole;

  @Prop()
  avatarColor?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
