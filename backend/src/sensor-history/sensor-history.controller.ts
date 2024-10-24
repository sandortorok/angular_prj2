import { SensorHistoryService } from './sensor-history.service';
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Put,
} from '@nestjs/common';
import { SensorHistory } from '@prisma/client';
@Controller('sensor-history')
export class SensorHistoryController {
  constructor(private readonly sensorHistoryService: SensorHistoryService) {}

  @Get('all')
  getPanels(): Promise<SensorHistory[]> {
    return this.sensorHistoryService.getMultiple({});
  }
}
