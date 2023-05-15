import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './databases/prisma.service';
import { SensorService } from './sensor/sensor.service';
import { SensorController } from './sensor/sensor.controller';
import { SerialService } from './communication/serial/serial.service';
import { WebsocketService } from './communication/websocket/websocket.service';
import { RedisService } from './databases/redis.service';
import { WebsocketGateway } from './communication/websocket/websocket.gateway';
import { SirenService } from './siren/siren.service';
import { SirenController } from './siren/siren.controller';
import { TestModeController } from './test-mode/test-mode.controller';
import { TestModeService } from './test-mode/test-mode.service';
import { LogicService } from './logic/logic.service';
import { ErrorMessageService } from './error-message/error-message.service';
import { ErrorMessageController } from './error-message/error-message.controller';

@Module({
  imports: [],
  controllers: [
    AppController,
    SensorController,
    SirenController,
    TestModeController,
    ErrorMessageController,
  ],
  providers: [
    AppService,
    PrismaService,
    SensorService,
    WebsocketService,
    RedisService,
    WebsocketGateway,
    SirenService,
    TestModeService,
    SerialService,
    LogicService,
    ErrorMessageService,
  ],
})
export class AppModule {}
