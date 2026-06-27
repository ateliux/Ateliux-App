import { Injectable, NotFoundException } from '@nestjs/common';
import { InboxChannel, InboxSource } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateContactLeadDto } from './dto/create-contact-lead.dto';
import type { UpdateContactLeadDto } from './dto/update-contact-lead.dto';

@Injectable()
export class ContactLeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async create(dto: CreateContactLeadDto) {
    const conversation = await this.prisma.inboxConversation.create({
      data: {
        channel: InboxChannel.SUPPORT,
        source: InboxSource.CONTACT,
        subject: `Contato de ${dto.name}`,
        preview: dto.message,
      },
    });

    const lead = await this.prisma.contactLead.create({
      data: {
        ...dto,
        inboxConversationId: conversation.id,
      },
    });

    await this.mail.enqueue({
      to: 'atendimento@ateliux.com.br',
      subject: 'Novo contato recebido',
      template: 'contact-received',
      data: { name: dto.name, email: dto.email, message: dto.message },
    });

    return lead;
  }

  findAll() {
    return this.prisma.contactLead.findMany({
      orderBy: { createdAt: 'desc' },
      include: { inboxConversation: true },
    });
  }

  async findOne(id: string) {
    const lead = await this.prisma.contactLead.findUnique({
      where: { id },
      include: { inboxConversation: true },
    });
    if (!lead) throw new NotFoundException('Contact lead not found.');
    return lead;
  }

  async update(id: string, dto: UpdateContactLeadDto) {
    await this.findOne(id);
    return this.prisma.contactLead.update({ where: { id }, data: dto });
  }

  async convertToClient(id: string) {
    const lead = await this.findOne(id);
    return {
      ready: true,
      leadId: lead.id,
      note: 'Conversion endpoint prepared; client creation should be confirmed by admin workflow.',
    };
  }

  async reply(id: string) {
    const lead = await this.findOne(id);
    return {
      queued: true,
      leadId: lead.id,
      note: 'Reply endpoint prepared; wire mail template when admin message UI is connected.',
    };
  }
}
