import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AdminRole, UserRole } from '@prisma/client';
import type { Request } from 'express';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { ClientAuthGuard } from '../auth/guards/client-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { IdParamDto } from '../common/dto/id-param.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import type { RequestUser } from '../common/utils/request-user';
import { MAX_GLOBAL_UPLOAD_SIZE } from './constants/upload-policy';
import { PrepareUploadDto } from './dto/prepare-upload.dto';
import { SecureUploadDto } from './dto/secure-upload.dto';
import { UploadsService } from './uploads.service';

@ApiTags('Uploads')
@ApiBearerAuth()
@Controller()
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_GLOBAL_UPLOAD_SIZE, files: 1 } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: uploadSchema(false) })
  @Post('uploads')
  uploadAuthenticated(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: SecureUploadDto & PrepareUploadDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    if (!file && dto.folder) return this.uploads.prepare(dto.folder);
    if (user.role === UserRole.CLIENT) return this.uploads.uploadClient(file, dto, user, metaFromRequest(request));
    return this.uploads.uploadAdmin(file, dto, user, metaFromRequest(request));
  }

  @UseGuards(JwtAuthGuard)
  @Post('uploads/prepare')
  prepareExplicit(@Body() dto: PrepareUploadDto) {
    return this.uploads.prepare(dto.folder);
  }

  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @UseGuards(ClientAuthGuard)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_GLOBAL_UPLOAD_SIZE, files: 1 } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: uploadSchema(false) })
  @Post('client/uploads')
  uploadClient(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: SecureUploadDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    return this.uploads.uploadClient(file, dto, user, metaFromRequest(request));
  }

  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(
    AdminRole.ADMIN,
    AdminRole.PROJECT_MANAGER,
    AdminRole.SUPPORT,
    AdminRole.EDITOR,
    AdminRole.FINANCE,
    AdminRole.DESIGNER_DEV,
    AdminRole.ATTENDANCE,
  )
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_GLOBAL_UPLOAD_SIZE, files: 1 } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: uploadSchema(true) })
  @Post('admin/uploads')
  uploadAdmin(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: SecureUploadDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    return this.uploads.uploadAdmin(file, dto, user, metaFromRequest(request));
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_GLOBAL_UPLOAD_SIZE, files: 1 } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: uploadSchema(false) })
  @Post('uploads/public')
  uploadPublic(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: SecureUploadDto,
    @Req() request: Request,
  ) {
    return this.uploads.uploadPublic(file, dto, metaFromRequest(request));
  }

  @UseGuards(JwtAuthGuard)
  @Get('uploads/:id/signed-url')
  signedUrl(@CurrentUser() user: RequestUser, @Param() params: IdParamDto) {
    return this.uploads.signedUrl(params.id, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('uploads/:id')
  delete(@CurrentUser() user: RequestUser, @Param() params: IdParamDto) {
    return this.uploads.delete(params.id, user);
  }
}

function metaFromRequest(request: Request) {
  return {
    ipAddress: request.ip,
    userAgent: request.get('user-agent'),
  };
}

function uploadSchema(includeClientId: boolean) {
  return {
    type: 'object',
    required: ['context', 'file'],
    properties: {
      context: {
        type: 'string',
        enum: [
          'avatar',
          'blog_cover',
          'contact_attachment',
          'support_attachment',
          'client_file',
          'approval_attachment',
          'briefing_attachment',
          'finance_receipt',
          'preview_asset',
        ],
      },
      clientId: includeClientId ? { type: 'string' } : { type: 'string', nullable: true },
      projectId: { type: 'string', nullable: true },
      file: { type: 'string', format: 'binary' },
    },
  };
}
