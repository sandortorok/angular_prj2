import { PrismaService } from '../databases/prisma.service';
import { Injectable } from '@nestjs/common';
import { Sensor, Prisma } from '@prisma/client';

@Injectable()
export class SensorService {
  constructor(private prisma: PrismaService) {}

  async sensor(
    sensorWhereUniqueInput: Prisma.SensorWhereUniqueInput,
  ): Promise<Sensor | null> {
    return this.prisma.sensor.findUnique({
      where: sensorWhereUniqueInput,
    });
  }

  async sensors(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.SensorWhereUniqueInput;
    where?: Prisma.SensorWhereInput;
    orderBy?: Prisma.SensorOrderByWithRelationInput;
  }): Promise<Sensor[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.sensor.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createSensor(data: Prisma.SensorCreateInput): Promise<Sensor> {
    return this.prisma.sensor.create({
      data,
    });
  }

  async updateSensor(params: {
    where: Prisma.SensorWhereUniqueInput;
    data: Prisma.SensorUpdateInput;
  }): Promise<Sensor> {
    const { where, data } = params;
    return this.prisma.sensor.update({
      data,
      where,
    });
  }

  async isAddressTaken(address: number, panelId: number): Promise<boolean> {
    return new Promise((resolve) => {
      this.prisma.sensor
        .findUnique({
          where: { addressIdentifier: { panelId, address } },
        })
        .then((res) => {
          resolve(!!res);
        });
    });
  }
  async isNameTaken(name: string, panelId: number): Promise<boolean> {
    return new Promise((resolve) => {
      this.prisma.sensor
        .findUnique({
          where: { nameIdentifier: { panelId, name } },
        })
        .then((res) => {
          resolve(!!res);
        });
    });
  }

  async deleteSensor(where: Prisma.SensorWhereUniqueInput): Promise<Sensor> {
    return this.prisma.sensor.delete({
      where,
    });
  }
}
