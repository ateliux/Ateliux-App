import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ApprovalStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { RequestUser } from '../common/utils/request-user';
import type { CreateApprovalDto } from './dto/create-approval.dto';
import type { RequestChangesDto } from './dto/request-changes.dto';
import type { UpdateApprovalDto } from './dto/update-approval.dto';

@Injectable()
export class ApprovalsService {
  constructor(private readonly prisma: PrismaService) {}

  findClientAll(user: RequestUser) {
    if (!user.clientId) throw new ForbiddenException('Client id missing.');
    return this.prisma.approval.findMany({
      where: { clientId: user.clientId, status: { not: ApprovalStatus.DRAFT } },
      orderBy: { createdAt: 'desc' },
      include: { preview: true, project: true },
    });
  }

  findAdminAll() {
    return this.prisma.approval.findMany({
      orderBy: { createdAt: 'desc' },
      include: { client: true, project: true, preview: true },
    });
  }

  create(dto: CreateApprovalDto) {
    return this.prisma.approval.create({ data: dto });
  }

  async update(id: string, dto: UpdateApprovalDto) {
    await this.ensureExists(id);
    return this.prisma.approval.update({ where: { id }, data: dto });
  }

  async send(id: string) {
    await this.ensureExists(id);
    return this.prisma.approval.update({
      where: { id },
      data: { status: ApprovalStatus.WAITING_CLIENT, sentAt: new Date() },
    });
  }

  async approve(user: RequestUser, id: string) {
    const approval = await this.ensureClientApproval(user, id);
    return this.prisma.approval.update({
      where: { id: approval.id },
      data: { status: ApprovalStatus.APPROVED, respondedAt: new Date(), clientComment: 'Approved' },
    });
  }

  async requestChanges(user: RequestUser, id: string, dto: RequestChangesDto) {
    const approval = await this.ensureClientApproval(user, id);
    return this.prisma.approval.update({
      where: { id: approval.id },
      data: {
        status: ApprovalStatus.CHANGES_REQUESTED,
        respondedAt: new Date(),
        clientComment: dto.comment,
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.approval.update({ where: { id }, data: { status: ApprovalStatus.CANCELLED } });
    return { success: true };
  }

  private async ensureExists(id: string) {
    const approval = await this.prisma.approval.findUnique({ where: { id } });
    if (!approval) throw new NotFoundException('Approval not found.');
    return approval;
  }

  private async ensureClientApproval(user: RequestUser, id: string) {
    if (!user.clientId) throw new ForbiddenException('Client id missing.');
    const approval = await this.prisma.approval.findFirst({
      where: { id, clientId: user.clientId },
    });
    if (!approval) throw new NotFoundException('Approval not found.');
    return approval;
  }
}
