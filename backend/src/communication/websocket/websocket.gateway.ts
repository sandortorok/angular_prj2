import { TestModeService } from './../../test-mode/test-mode.service';
import {
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { WebsocketService } from './websocket.service';
import { SirenService } from 'src/siren/siren.service';
import { SerialService } from '../serial/serial.service';
import { LogicService } from 'src/logic/logic.service';

@WebSocketGateway({ cors: true })
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private socketService: WebsocketService,
    private sirenService: SirenService,
    private serialService: SerialService,
    private tms: TestModeService,
    private logic: LogicService,
  ) {}
  afterInit(server: Server) {
    console.log('init');
    this.socketService.socket = server;
  }
  handleConnection(client: any) {
    console.log(client.id);
    console.log('Connected!');
  }
  handleDisconnect(client: any) {
    console.log(client.id);
    console.log('Disconnected!');
  }
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('changeSiren')
  async handleMessage(client: any, payload: string) {
    const newSiren: { name: string; muted?: boolean; on?: boolean } =
      JSON.parse(payload);
    this.logic.updateSiren(newSiren);
  }
  @SubscribeMessage('testModeChange')
  async testModeChange(client: any, payload: string) {
    const boolValue = !!parseInt(payload);
    this.tms.updateMode(boolValue);
    console.log('test changed to', boolValue);
    this.logic.testModeSubject.next(boolValue);
  }
}
