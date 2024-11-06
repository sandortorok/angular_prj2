import { Injectable } from '@nestjs/common';
import { SensorHistory, Prisma } from '@prisma/client';
import { PrismaService } from 'src/databases/prisma.service';
export type BatchPayload = {
  count: number;
};
@Injectable()
export class SensorHistoryService {
  constructor(private prisma: PrismaService) {
    // this.createTestData();
    // this.deleteMultiple({});
  }

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
  async getYearly(
    date,
  ): Promise<
    Array<{ sensorId: number; value: number; year: BigInt; month: BigInt }>
  > {
    return this.prisma.$queryRaw`
      SELECT sensorId as sensorId, ROUND(avg(value),2) as value, YEAR(timestamp) as year, MONTH(timestamp) as month
      FROM SensorHistory
      WHERE YEAR(timestamp) = YEAR(${date})
      GROUP BY sensorId, year, month
      ORDER BY year DESC, month DESC;
      `;
  }
  async getMonthly(
    date,
  ): Promise<Array<{ sensorId: number; value: number; date: Date }>> {
    return this.prisma.$queryRaw`
      SELECT sensorId as sensorId, ROUND(avg(value),2) as value, DATE(timestamp) as date
      FROM SensorHistory
      WHERE YEAR(timestamp) = YEAR(${date}) AND MONTH(timestamp) = MONTH(${date})
      GROUP BY sensorId, date
      ORDER BY date DESC;
      `;
  }
  async getWeekly(date): Promise<
    Array<{
      sensorId: number;
      value: number;
      date: Date;
    }>
  > {
    return this.prisma.$queryRaw`
    SELECT sensorId as sensorId, ROUND(avg(value),2) as value, DATE(timestamp) as date
    FROM SensorHistory
    WHERE YEAR(timestamp)= YEAR(${date}) AND WEEK(timestamp, 1) = WEEK(${date},1)
    GROUP BY sensorId, date
    ORDER BY date DESC
    `;
  }
  async getDaily(date): Promise<
    Array<{
      sensorId: number;
      value: number;
      date: Date;
      hour: BigInt;
    }>
  > {
    return this.prisma.$queryRaw`
      SELECT sensorId as sensorId, ROUND(avg(value),2) as value, DATE(timestamp) as date, HOUR(timestamp) as hour
      FROM SensorHistory
      WHERE DATE(timestamp) = ${date}
      GROUP BY sensorId, date, hour
      ORDER BY date DESC, hour DESC
      `;
  }
  async getHourly(
    date: string,
    hour: number,
  ): Promise<
    Array<{
      sensorId: number;
      value: number;
      date: Date;
      hour: number;
      minute: number;
    }>
  > {
    return this.prisma.$queryRaw`
      SELECT sensorId as sensorId, ROUND(avg(value),2) as value, DATE(timestamp) as date, HOUR(timestamp) as hour, MINUTE(timestamp) as minute
      FROM SensorHistory
      WHERE DATE(timestamp) = ${date} AND HOUR(timestamp) = ${hour}
      GROUP BY sensorId, date, hour, minute
      ORDER BY date DESC, hour DESC, minute DESC
      `;
  }
  async createTestData() {
    let data = [];
    let date = new Date();
    for (let i = 0; i < 100000; i++) {
      for (let sensorId = 1; sensorId < 3; sensorId++) {
        data.push({
          timestamp: date,
          value: roundTwoDecimal(getRandomArbitrary(1, 100)),
          sensorId: sensorId,
        });
      }
      date = subtractMinutes(date, 10);
    }
    console.log(data[data.length - 1]);
    return this.prisma.sensorHistory.createMany({ data });
  }
}
function subtractMinutes(date, minutes) {
  return new Date(date.getTime() - minutes * 60000);
}
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}
function roundTwoDecimal(num) {
  return Math.round(num * 100) / 100;
}
function formatDate(d: Date) {
  return (
    [d.getFullYear(), d.getMonth() + 1, d.getDate()].join('-') +
    ' ' +
    [d.getHours(), d.getMinutes(), d.getSeconds()].join(':')
  );
}
