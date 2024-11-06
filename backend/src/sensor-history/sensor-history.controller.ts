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
  getAllHistory(): Promise<SensorHistory[]> {
    return this.sensorHistoryService.getMultiple({});
  }

  @Get(':id')
  getSensorHistory(@Param('id') id: number): Promise<SensorHistory[]> {
    return this.sensorHistoryService.getMultiple({
      where: { sensorId: Number(id) },
    });
  }
  @Get('year/:date')
  getYearlyData(@Param('date') date) {
    return this.sensorHistoryService.getYearly(date).then((res) => {
      return res.map((data) => {
        return { ...data, month: Number(data.month), year: Number(data.year) };
      });
    });
  }
  @Get('month/:date')
  getMonthlyData(@Param('date') date) {
    return this.sensorHistoryService.getMonthly(date);
  }
  @Get('week/:date')
  getWeeklyData(@Param('date') date) {
    return this.sensorHistoryService.getWeekly(date);
  }
  @Get('day/:date')
  getDailyData(@Param('date') date) {
    return this.sensorHistoryService.getDaily(date).then((res) => {
      return res.map((data) => {
        return { ...data, hour: Number(data.hour) };
      });
    });
  }
  @Get('hour/:date/:hour')
  getHourlyData(@Param('date') date, @Param('hour') hour) {
    return this.sensorHistoryService
      .getHourly(date, Number(hour))
      .then((res) => {
        return res.map((data) => {
          return {
            ...data,
            hour: Number(data.hour),
            minute: Number(data.minute),
          };
        });
      });
  }
}
