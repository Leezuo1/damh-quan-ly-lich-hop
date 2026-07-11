import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        // Số giây token còn hiệu lực, vd 86400 = 1 ngày.
        // ConfigService trả về string thô từ .env — phải Number() lại, nếu không
        // "86400" (không có đơn vị) sẽ bị thư viện ms() hiểu nhầm thành mili-giây
        // (~86s) thay vì giây, khiến token hết hạn gần như ngay lập tức.
        signOptions: {
          expiresIn: Number(config.get<string>('JWT_EXPIRES_IN_SECONDS', '86400')),
        },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
