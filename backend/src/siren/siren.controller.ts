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
import { Siren } from '@prisma/client';
import { SirenService } from './siren.service';

@Controller('siren')
export class SirenController {
  constructor(private readonly sirenService: SirenService) {}

  @Get('all')
  getSirens(): Promise<Siren[]> {
    return this.sirenService.sirens({});
  }

  @Get('nametaken/:name')
  nameTaken(@Param('name') name: string): Promise<boolean> {
    return this.sirenService.isNameTaken(name);
  }

  @Patch('name/:id')
  changeName(
    @Param('id') id: number,
    @Body('name') name: string,
  ): Promise<Siren> {
    return this.sirenService.updateSiren({
      where: { id: Number(id) },
      data: { name: name },
    });
  }

  @Patch('muted/:id')
  changeMuted(
    @Param('id') id: number,
    @Body('muted') muted: boolean,
  ): Promise<Siren> {
    return this.sirenService.updateSiren({
      where: { id: Number(id) },
      data: { muted: muted },
    });
  }
  @Put('/:id')
  async updateSiren(
    @Param('id') id: number,
    @Body('siren') siren: Siren,
  ): Promise<Siren> {
    try {
      const s = await this.sirenService.updateSiren({
        where: { id: Number(id) },
        data: { name: siren.name, address: siren.address },
      });
      return s;
    } catch (err) {
      if (err.code === 'P2002') {
        if (err.meta.target === 'Siren_name_key') {
          throw new HttpException('Name taken', HttpStatus.CONFLICT);
        }
      } else {
        throw err;
      }
    }
  }
  @Post()
  createSiren(@Body('siren') siren: Siren): Promise<Siren> {
    return this.sirenService.createSiren(siren);
  }

  @Delete('/:id')
  deleteSiren(@Param('id') id: number) {
    return this.sirenService.deleteSiren({ id: Number(id) });
  }
}
