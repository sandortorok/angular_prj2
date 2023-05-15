import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class WebsocketService {
  public socket: Server = null;
  sendMessage(output: { sensorAddress: number; value: number }) {
    if (!this.socket) return;
    this.socket.emit('onMessage', output);
  }
  sendAliveAddresses(output: Array<string>) {
    if (!this.socket) return;
    this.socket.emit('canAddresses', output);
  }
}
