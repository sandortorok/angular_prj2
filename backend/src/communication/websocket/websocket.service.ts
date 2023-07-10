import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class WebsocketService {
  public socket: Server = null;
  sendAmmoniaValue(output: {
    sensorAddress: number;
    value: number;
    raw: number;
  }) {
    if (!this.socket) return;
    this.socket.emit('onMessage', output);
  }
  sendAliveAddresses(output: Array<string>) {
    if (!this.socket) return;
    this.socket.emit('canAddresses', output);
  }
  sendErrorMessage(data: { timestamp: Date; message: string }) {
    if (!this.socket) return;
    this.socket.emit('errorMessage', data);
  }
}
