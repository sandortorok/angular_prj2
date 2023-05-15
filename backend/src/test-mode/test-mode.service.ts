import { Injectable } from '@nestjs/common';
import { Tesztmode } from '@prisma/client';
import { PrismaService } from 'src/databases/prisma.service';

@Injectable()
export class TestModeService {
  constructor(private prisma: PrismaService) {}
  async getMode(): Promise<Tesztmode | null> {
    return this.prisma.tesztmode.findUnique({
      where: { id: 1 },
    });
  }

  async updateMode(isOn: boolean): Promise<Tesztmode> {
    return this.prisma.tesztmode.update({
      data: { isOn: isOn },
      where: { id: 1 },
    });
  }
}
