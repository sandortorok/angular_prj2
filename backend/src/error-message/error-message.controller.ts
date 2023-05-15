import { ErrorMessageService } from './error-message.service';
import { Controller, Get } from '@nestjs/common';
import { ErrorMessage } from '@prisma/client';

@Controller('errormessage')
export class ErrorMessageController {
  constructor(private errorService: ErrorMessageService) {}

  @Get('all')
  getSirens(): Promise<ErrorMessage[]> {
    return this.errorService.getMessages();
  }
}
