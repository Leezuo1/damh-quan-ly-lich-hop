import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(dto: CreateUserDto): Promise<UserDocument> {
    const existing = await this.userModel.findOne({
      email: dto.email.toLowerCase(),
    });
    if (existing) {
      throw new ConflictException('Email đã được sử dụng');
    }
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    return this.userModel.create({
      name: dto.name,
      email: dto.email.toLowerCase(),
      passwordHash,
      position: dto.position,
    });
  }

  findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() });
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    return user;
  }

  async findManyByIds(
    ids: (string | Types.ObjectId)[],
  ): Promise<UserDocument[]> {
    return this.userModel.find({ _id: { $in: ids } });
  }

  // Tìm người để mời họp: theo tên hoặc email, loại trừ chính mình
  async search(query: string, excludeUserId?: string): Promise<UserDocument[]> {
    const filter: Record<string, unknown> = query
      ? {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } },
          ],
        }
      : {};
    if (excludeUserId) {
      filter._id = { $ne: excludeUserId };
    }
    return this.userModel.find(filter).limit(20);
  }

  async updateProfile(
    id: string,
    dto: UpdateProfileDto,
  ): Promise<UserDocument> {
    const user = await this.findById(id);
    if (dto.name !== undefined) user.name = dto.name;
    if (dto.position !== undefined) user.position = dto.position;
    await user.save();
    return user;
  }

  async changePassword(id: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.findById(id);
    const matches = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!matches) {
      throw new UnauthorizedException('Mật khẩu hiện tại không đúng');
    }
    user.passwordHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
    await user.save();
  }

  async validateCredentials(
    email: string,
    password: string,
  ): Promise<UserDocument | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;
    const matches = await bcrypt.compare(password, user.passwordHash);
    return matches ? user : null;
  }
}
