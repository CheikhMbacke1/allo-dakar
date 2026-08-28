import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '@allo-dakar/shared';

@Controller('bookings/:bookingId/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  send(
    @CurrentUser() user: JwtPayload,
    @Param('bookingId') bookingId: string,
    @Body() dto: CreateMessageDto,
  ) {
    return this.messagesService.send(user.sub, bookingId, dto);
  }

  @Get()
  list(@CurrentUser() user: JwtPayload, @Param('bookingId') bookingId: string) {
    return this.messagesService.listForBooking(user.sub, bookingId);
  }
}
