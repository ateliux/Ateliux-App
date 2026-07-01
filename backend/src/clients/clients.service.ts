import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AccountStatus, UserRole } from '@prisma/client';
import { hash } from 'bcryptjs';
import type { RequestUser } from '../common/utils/request-user';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateClientDto } from './dto/create-client.dto';
import type { UpdateClientPipelineStatusDto } from './dto/update-client-pipeline-status.dto';
import type { UpdateClientStatusDto } from './dto/update-client-status.dto';
import type { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  findAll() {
    return this.prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
      include: { responsible: { include: { user: true } }, account: true, projects: true },
    });
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        responsible: { include: { user: true } },
        account: { include: { user: true } },
        projects: true,
      },
    });

    if (!client) throw new NotFoundException('Client not found.');
    return client;
  }

  async create(dto: CreateClientDto) {
    const existing = await this.prisma.client.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Client e-mail already exists.');

    return this.prisma.client.create({
      data: {
        name: dto.name,
        company: dto.company,
        email: dto.email,
        phone: dto.phone,
        plan: dto.plan,
        responsibleId: dto.responsibleId,
        status: AccountStatus.INVITED,
      },
    });
  }

  async update(id: string, dto: UpdateClientDto) {
    await this.findOne(id);
    return this.prisma.client.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.client.update({ where: { id }, data: { status: AccountStatus.ARCHIVED } });
    return { success: true };
  }

  async invite(id: string) {
    const client = await this.findOne(id);
    const temporaryPassword = `Ateliux-${Date.now()}`;
    const passwordHash = await hash(temporaryPassword, 12);

    await this.prisma.$transaction(async (tx) => {
      let user = await tx.user.findUnique({ where: { email: client.email } });
      if (!user) {
        user = await tx.user.create({
          data: {
            name: client.name,
            email: client.email,
            passwordHash,
            role: UserRole.CLIENT,
            status: AccountStatus.INVITED,
          },
        });
      }

      await tx.clientAccount.upsert({
        where: { clientId: client.id },
        create: {
          clientId: client.id,
          userId: user.id,
          inviteStatus: AccountStatus.INVITED,
        },
        update: {
          inviteStatus: AccountStatus.INVITED,
        },
      });
    });

    await this.mail.enqueue({
      to: client.email,
      subject: 'Convite para acessar o Portal Ateliux',
      template: 'client-invite',
      data: { clientName: client.name, temporaryPassword },
    });

    return { success: true };
  }

  async updateStatus(id: string, dto: UpdateClientStatusDto) {
    await this.findOne(id);
    return this.prisma.client.update({ where: { id }, data: { status: dto.status } });
  }

  async updatePipelineStatus(id: string, dto: UpdateClientPipelineStatusDto, user?: RequestUser) {
    const previous = await this.findOne(id);
    const client = await this.prisma.client.update({
      where: { id },
      data: { pipelineStatus: dto.status },
      include: { responsible: { include: { user: true } }, account: true, projects: true },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: user?.adminUserId ?? user?.id,
        actorType: user ? 'admin' : 'system',
        action: 'CLIENT_PIPELINE_STATUS_UPDATED',
        entityType: 'Client',
        entityId: client.id,
        clientId: client.id,
        metadata: {
          title: 'Status comercial do cliente atualizado',
          description: 'Status comercial interno atualizado pela equipe Ateliux.',
          before: previous.pipelineStatus,
          after: client.pipelineStatus,
        },
      },
    });

    return client;
  }
}
