import { Injectable } from '@nestjs/common';
import { Panel, Prisma } from '@prisma/client';
import { PrismaService } from 'src/databases/prisma.service';
export type BatchPayload = {
  count: number;
};
@Injectable()
export class PanelService {
  constructor(private prisma: PrismaService) {}
  async panel(
    panelWhereUniqueInput: Prisma.PanelWhereUniqueInput,
  ): Promise<Panel | null> {
    return this.prisma.panel.findUnique({
      where: panelWhereUniqueInput,
    });
  }
  async panels(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.PanelWhereUniqueInput;
    where?: Prisma.PanelWhereInput;
    orderBy?: Prisma.PanelOrderByWithRelationInput;
  }): Promise<Panel[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.panel.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }
  async createPanel(data: Prisma.PanelCreateInput): Promise<Panel> {
    return this.prisma.panel.create({
      data,
    });
  }

  async updatePanel(params: {
    where: Prisma.PanelWhereUniqueInput;
    data: Prisma.PanelUpdateInput;
  }): Promise<Panel> {
    const { where, data } = params;
    return this.prisma.panel.update({
      data,
      where,
    });
  }

  async updatePanels(params: {
    where: Prisma.PanelWhereInput;
    data: Prisma.PanelUpdateInput;
  }): Promise<BatchPayload> {
    const { where, data } = params;
    return this.prisma.panel.updateMany({
      data,
      where,
    });
  }
  async deletePanel(where: Prisma.PanelWhereUniqueInput): Promise<Panel> {
    return this.prisma.panel.delete({
      where,
    });
  }
}
