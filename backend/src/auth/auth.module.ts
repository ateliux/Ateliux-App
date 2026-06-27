import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AdminAuthController } from './admin-auth.controller';
import { AuthService } from './auth.service';
import { ClientAuthController } from './client-auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [ConfigModule, PassportModule, JwtModule.register({})],
  controllers: [ClientAuthController, AdminAuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
