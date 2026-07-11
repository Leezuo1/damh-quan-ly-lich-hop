import 'dotenv/config';
import * as dns from 'dns';
import * as bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { User, UserSchema } from './users/schemas/user.schema';
import { Room, RoomSchema } from './rooms/schemas/room.schema';

// DNS hệ thống trên một số máy Windows dùng resolver IPv6-only khiến Node
// không querySrv được (mongodb+srv://) dù OS resolve DNS bình thường.
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Dữ liệu mẫu khớp với các mockup UI, dùng để test nhanh không cần tạo tay qua API.
async function seed() {
  const uri =
    process.env.MONGODB_URI ?? 'mongodb://localhost:27017/quan_ly_lich_hop';
  await mongoose.connect(uri);
  console.log(`Đã kết nối MongoDB: ${uri}`);

  const UserModel = mongoose.model(User.name, UserSchema);
  const RoomModel = mongoose.model(Room.name, RoomSchema);

  await UserModel.deleteMany({});
  await RoomModel.deleteMany({});

  const passwordHash = await bcrypt.hash('123456', 10);

  const users = await UserModel.insertMany([
    {
      name: 'Nguyễn Văn A',
      email: 'vu.nguyen@company.vn',
      passwordHash,
      position: 'Nhân viên',
    },
    {
      name: 'Trần B',
      email: 'tran.b@company.vn',
      passwordHash,
      position: 'Engineer',
    },
    {
      name: 'Lê C',
      email: 'le.c@company.vn',
      passwordHash,
      position: 'Designer',
    },
    {
      name: 'Phạm D',
      email: 'pham.d@company.vn',
      passwordHash,
      position: 'PM',
    },
    {
      name: 'Nguyễn Văn Hải',
      email: 'hai.nguyen@company.vn',
      passwordHash,
      position: 'Organizer',
    },
    {
      name: 'Hoàng Thị E',
      email: 'hoang.e@company.vn',
      passwordHash,
      position: 'QA Engineer',
    },
    {
      name: 'Đặng Văn F',
      email: 'dang.f@company.vn',
      passwordHash,
      position: 'DevOps',
    },
    {
      name: 'Vũ Thị G',
      email: 'vu.g@company.vn',
      passwordHash,
      position: 'HR',
    },
    {
      name: 'Bùi Văn H',
      email: 'bui.h@company.vn',
      passwordHash,
      position: 'Backend Developer',
    },
    {
      name: 'Đỗ Thị I',
      email: 'do.i@company.vn',
      passwordHash,
      position: 'Frontend Developer',
    },
  ]);

  const rooms = await RoomModel.insertMany([
    {
      name: 'Phòng họp A',
      capacity: 20,
      floor: 'Tầng 5',
      equipment: ['Máy chiếu'],
    },
    {
      name: 'Phòng họp B',
      capacity: 10,
      floor: 'Tầng 3',
      equipment: ['Bảng trắng'],
    },
    {
      name: 'Phòng họp C',
      capacity: 8,
      floor: 'Tầng 3',
      equipment: ['Màn hình TV'],
    },
    {
      name: 'Phòng họp D',
      capacity: 15,
      floor: 'Tầng 5',
      equipment: ['Máy chiếu', 'Bảng trắng'],
    },
    {
      name: 'Phòng họp E',
      capacity: 6,
      floor: 'Tầng 2',
      equipment: ['Màn hình TV'],
    },
    {
      name: 'Phòng họp F',
      capacity: 30,
      floor: 'Tầng 6',
      equipment: ['Máy chiếu', 'Loa', 'Micro'],
    },
    {
      name: 'Phòng họp G',
      capacity: 4,
      floor: 'Tầng 2',
      equipment: ['Bảng trắng'],
    },
    {
      name: 'Phòng họp H',
      capacity: 12,
      floor: 'Tầng 4',
      equipment: ['Màn hình TV', 'Bảng trắng'],
    },
    {
      name: 'Phòng họp I',
      capacity: 8,
      floor: 'Tầng 4',
      equipment: ['Máy chiếu'],
    },
    {
      name: 'Phòng họp K',
      capacity: 25,
      floor: 'Tầng 6',
      equipment: ['Máy chiếu', 'Loa', 'Micro', 'Bảng trắng'],
    },
  ]);

  console.log(
    `Đã tạo ${users.length} người dùng (mật khẩu chung: 123456) và ${rooms.length} phòng họp.`,
  );
  console.log('Ví dụ đăng nhập: vu.nguyen@company.vn / 123456');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
