import { Injectable } from '@nestjs/common';
import { ErrorMessage } from '@prisma/client';
import { PrismaService } from 'src/databases/prisma.service';

@Injectable()
export class ErrorMessageService {
  constructor(private prisma: PrismaService) {}

  async getMessages(): Promise<Array<ErrorMessage>> {
    return this.prisma.errorMessage.findMany({
      orderBy: { timestamp: 'desc' },
    });
  }

  async addErrorMessage(data: {
    timestamp: Date;
    message: string;
  }): Promise<ErrorMessage> {
    return this.prisma.errorMessage.create({
      data,
    });
  }
}
