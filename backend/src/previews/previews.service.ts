import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ApprovalStatus, PreviewStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { RequestUser } from '../common/utils/request-user';
import type { CreatePreviewDto } from './dto/create-preview.dto';
import type { UpdatePreviewDto } from './dto/update-preview.dto';

@Injectable()
export class PreviewsService {
  constructor(private readonly prisma: PrismaService) {}

  findClientAll(user: RequestUser) {
    if (!user.clientId) throw new ForbiddenException('Client id missing.');
    return this.prisma.preview.findMany({
      where: { clientId: user.clientId, status: { not: PreviewStatus.DRAFT } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAdminAll() {
    return this.prisma.preview.findMany({
      orderBy: { createdAt: 'desc' },
      include: { client: true, project: true, approvals: true },
    });
  }

  create(dto: CreatePreviewDto) {
    return this.prisma.preview.create({ data: dto });
  }

  async update(id: string, dto: UpdatePreviewDto) {
    await this.ensureExists(id);
    return this.prisma.preview.update({ where: { id }, data: dto });
  }

  async sendForApproval(id: string) {
    const preview = await this.ensureExists(id);
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.preview.update({
        where: { id },
        data: { status: PreviewStatus.IN_APPROVAL, sentAt: new Date() },
      });

      await tx.approval.create({
        data: {
          clientId: preview.clientId,
          projectId: preview.projectId,
          previewId: preview.id,
          title: preview.title,
          type: 'Preview',
          message: `Aprovar preview ${preview.version}`,
          status: ApprovalStatus.WAITING_CLIENT,
          sentAt: new Date(),
        },
      });

      return updated;
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.preview.update({ where: { id }, data: { status: PreviewStatus.ARCHIVED } });
    return { success: true };
  }

  private async ensureExists(id: string) {
    const preview = await this.prisma.preview.findUnique({ where: { id } });
    if (!preview) throw new NotFoundException('Preview not found.');
    return preview;
  }
}
