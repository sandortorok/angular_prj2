import { SensorService } from './sensor.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { Sensor } from '@prisma/client';

@Controller('sensor')
export class SensorController {
  constructor(private readonly sensorService: SensorService) {}
  @Get('all')
  getSensors(): Promise<Sensor[]> {
    return this.sensorService.sensors({});
  }

  @Get('addresstaken/:panelid/:address')
  adressTaken(
    @Param('panelid') panelId: number,
    @Param('address') address: number,
  ): Promise<boolean> {
    return this.sensorService.isAddressTaken(Number(address), Number(panelId));
  }

  @Get('nametaken/:panelid/:name')
  nameTaken(
    @Param('panelid') panelId: number,
    @Param('name') name: string,
  ): Promise<boolean> {
    return this.sensorService.isNameTaken(name, Number(panelId));
  }

  @Patch('name/:id')
  changeName(
    @Param('id') id: number,
    @Body('name') name: string,
  ): Promise<Sensor> {
    return this.sensorService.updateSensor({
      where: { id: Number(id) },
      data: { name: name },
    });
  }

  @Patch('horn/:id')
  changeHorn(
    @Param('id') id: number,
    @Body('horn') horn: boolean,
  ): Promise<Sensor> {
    return this.sensorService.updateSensor({
      where: { id: Number(id) },
      data: { horn: horn },
    });
  }
  @Put('/:id')
  async updateSensor(
    @Param('id') id: number,
    @Body('sensor') sensor: Sensor,
  ): Promise<Sensor> {
    try {
      const s = await this.sensorService.updateSensor({
        where: { id: Number(id) },
        data: { name: sensor.name, address: sensor.address },
      });
      return s;
    } catch (err) {
      if (err.code === 'P2002') {
        if (err.meta.target === 'Sensor_name_key') {
          throw new HttpException('Name taken', HttpStatus.CONFLICT);
        } else if (err.meta.target === 'Sensor_address_key') {
          throw new HttpException('Address taken', HttpStatus.CONFLICT);
        }
      } else {
        throw err;
      }
    }
  }
  @Post()
  createSensor(@Body('sensor') sensor: Sensor): Promise<Sensor> {
    return this.sensorService.createSensor(sensor);
  }

  @Delete('/:id')
  deleteSensor(@Param('id') id: number) {
    return this.sensorService.deleteSensor({ id: Number(id) });
  }
}
