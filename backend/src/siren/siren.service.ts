import { Injectable } from '@nestjs/common';
import { Prisma, Siren } from '@prisma/client';
import { PrismaService } from 'src/databases/prisma.service';

@Injectable()
export class SirenService {
  constructor(private prisma: PrismaService) {}
  async siren(
    sirenWhereUniqueInput: Prisma.SirenWhereUniqueInput,
  ): Promise<Siren | null> {
    return this.prisma.siren.findUnique({
      where: sirenWhereUniqueInput,
    });
  }
  async sirens(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.SirenWhereUniqueInput;
    where?: Prisma.SirenWhereInput;
    orderBy?: Prisma.SirenOrderByWithRelationInput;
  }): Promise<Siren[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.siren.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }
  async createSiren(data: Prisma.SirenCreateInput): Promise<Siren> {
    return this.prisma.siren.create({
      data,
    });
  }

  async updateSiren(params: {
    where: Prisma.SirenWhereUniqueInput;
    data: Prisma.SirenUpdateInput;
  }): Promise<Siren> {
    const { where, data } = params;
    return this.prisma.siren.update({
      data,
      where,
    });
  }

  async isNameTaken(name: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.prisma.siren
        .findUnique({
          where: {
            name: name,
          },
        })
        .then((res) => {
          resolve(!!res);
        });
    });
  }

  async deleteSiren(where: Prisma.SirenWhereUniqueInput): Promise<Siren> {
    return this.prisma.siren.delete({
      where,
    });
  }
}
