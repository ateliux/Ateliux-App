import { Injectable, NotFoundException } from '@nestjs/common';
import { NewsletterStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';
import type { UpdateSubscriberDto } from './dto/update-subscriber.dto';

@Injectable()
export class NewsletterService {
  constructor(private readonly prisma: PrismaService) {}

  subscribe(dto: SubscribeNewsletterDto) {
    return this.prisma.newsletterSubscriber.upsert({
      where: { email: dto.email },
      create: { ...dto, status: NewsletterStatus.NEW },
      update: { status: NewsletterStatus.ACTIVE, name: dto.name, origin: dto.origin },
    });
  }

  unsubscribe(dto: SubscribeNewsletterDto) {
    return this.prisma.newsletterSubscriber.upsert({
      where: { email: dto.email },
      create: { ...dto, status: NewsletterStatus.UNSUBSCRIBED },
      update: { status: NewsletterStatus.UNSUBSCRIBED },
    });
  }

  findAll() {
    return this.prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async update(id: string, dto: UpdateSubscriberDto) {
    await this.ensureExists(id);
    return this.prisma.newsletterSubscriber.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.newsletterSubscriber.delete({ where: { id } });
    return { success: true };
  }

  export() {
    return this.findAll();
  }

  private async ensureExists(id: string) {
    const subscriber = await this.prisma.newsletterSubscriber.findUnique({ where: { id } });
    if (!subscriber) throw new NotFoundException('Subscriber not found.');
    return subscriber;
  }
}
