import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { RequestUser } from '../common/utils/request-user';
import type { CreateFinanceRecordDto } from './dto/create-finance-record.dto';
import type { UpdateFinanceRecordDto } from './dto/update-finance-record.dto';

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  findClientAll(user: RequestUser) {
    if (!user.clientId) throw new ForbiddenException('Client id missing.');
    return this.prisma.financeRecord.findMany({
      where: { clientId: user.clientId, visibleToClient: true },
      orderBy: { dueDate: 'asc' },
      include: { receiptFile: true, project: true },
    });
  }

  findAdminAll() {
    return this.prisma.financeRecord.findMany({
      orderBy: { dueDate: 'asc' },
      include: { client: true, project: true, receiptFile: true },
    });
  }

  create(dto: CreateFinanceRecordDto) {
    return this.prisma.financeRecord.create({
      data: {
        ...dto,
        dueDate: new Date(dto.dueDate),
      },
    });
  }

  async update(id: string, dto: UpdateFinanceRecordDto) {
    await this.ensureExists(id);
    return this.prisma.financeRecord.update({
      where: { id },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.financeRecord.delete({ where: { id } });
    return { success: true };
  }

  private async ensureExists(id: string) {
    const record = await this.prisma.financeRecord.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Finance record not found.');
    return record;
  }
}
