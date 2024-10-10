import { PanelService } from './panel.service';
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Put,
} from '@nestjs/common';
import { Panel } from '@prisma/client';

@Controller('panel')
export class PanelController {
  constructor(private readonly panelService: PanelService) {}

  @Get('all')
  getPanels(): Promise<Panel[]> {
    return this.panelService.panels({});
  }
  @Put('/:id')
  async updatePanel(
    @Param('id') id: number,
    @Body('panel') panel: Panel,
  ): Promise<Panel> {
    try {
      const s = await this.panelService.updatePanel({
        where: { id: Number(id) },
        data: { address: panel.address },
      });
      return s;
    } catch (err) {
      if (err.code === 'P2002') {
        if (err.meta.target === 'Panel_address_key') {
          throw new HttpException('Address taken', HttpStatus.CONFLICT);
        }
      } else {
        throw err;
      }
    }
  }
}
