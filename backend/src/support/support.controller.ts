import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ClientAuthGuard } from '../auth/guards/client-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { IdParamDto } from '../common/dto/id-param.dto';
import type { RequestUser } from '../common/utils/request-user';
import { CreateMessageDto } from '../inbox/dto/create-message.dto';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { SupportService } from './support.service';

@ApiTags('Inbox')
@Controller()
export class SupportController {
  constructor(private readonly support: SupportService) {}

  @Post('support/tickets')
  createPublic(@Body() dto: CreateSupportTicketDto) {
    return this.support.createPublic(dto);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('client/support/tickets')
  findClientTickets(@CurrentUser() user: RequestUser) {
    return this.support.findClientTickets(user);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('client/support/tickets')
  createClient(@CurrentUser() user: RequestUser, @Body() dto: CreateSupportTicketDto) {
    return this.support.createClient(user, dto);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('client/support/tickets/:id/messages')
  replyClient(@CurrentUser() user: RequestUser, @Param() params: IdParamDto, @Body() dto: CreateMessageDto) {
    return this.support.replyClient(user, params.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('client/support/tickets/:id/close')
  closeClient(@CurrentUser() user: RequestUser, @Param() params: IdParamDto) {
    return this.support.closeClient(user, params.id);
  }
}
