import { PanelService } from './panel.service';
import { Controller, Get } from '@nestjs/common';
import { Panel } from '@prisma/client';

@Controller('panel')
export class PanelController {
  constructor(private readonly panelService: PanelService) {}

  @Get('all')
  getSensors(): Promise<Panel[]> {
    return this.panelService.panels({});
  }
}
