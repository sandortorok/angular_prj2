import { Body, Controller, Get, Patch } from '@nestjs/common';
import { Tesztmode } from '@prisma/client';
import { TestModeService } from './test-mode.service';

@Controller('testmode')
export class TestModeController {
  constructor(private readonly service: TestModeService) {}

  @Get('')
  getMode(): Promise<Tesztmode> {
    return this.service.getMode();
  }
  @Patch('update')
  updateMode(@Body('value') value: boolean): Promise<Tesztmode> {
    return this.service.updateMode(value);
  }
}
