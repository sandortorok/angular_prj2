import { Sensor } from '@prisma/client';
import { Controller, Get } from '@nestjs/common';
import { SensorService } from './sensor/sensor.service';

@Controller()
export class AppController {
  constructor(private readonly sensorService: SensorService) {}

  @Get()
  async getHello(): Promise<Sensor[]> {
    return await this.sensorService.sensors({ where: { horn: true } });
  }
}
