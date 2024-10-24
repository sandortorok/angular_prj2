import { Injectable } from '@nestjs/common';
import { SensorHistory, Prisma } from '@prisma/client';
import { PrismaService } from 'src/databases/prisma.service';
export type BatchPayload = {
  count: number;
};
@Injectable()
export class SensorHistoryService {
  constructor(private prisma: PrismaService) {}

  async getMultiple(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.SensorHistoryWhereUniqueInput;
    where?: Prisma.SensorHistoryWhereInput;
    orderBy?: Prisma.SensorHistoryOrderByWithRelationInput;
  }): Promise<SensorHistory[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.sensorHistory.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }
  async create(data: Prisma.SensorHistoryCreateInput): Promise<SensorHistory> {
    return this.prisma.sensorHistory.create({
      data,
    });
  }
  async deleteRecord(
    where: Prisma.SensorHistoryWhereUniqueInput,
  ): Promise<SensorHistory> {
    return this.prisma.sensorHistory.delete({
      where,
    });
  }
  async deleteMultiple(
    where: Prisma.SensorHistoryWhereInput,
  ): Promise<BatchPayload> {
    return this.prisma.sensorHistory.deleteMany({
      where,
    });
  }
}
