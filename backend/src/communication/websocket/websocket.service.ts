import { Injectable } from '@nestjs/common';
import { Sensor } from '@prisma/client';
import { Server } from 'socket.io';

export type SensorValue = Omit<
  Sensor & { value: number; raw: number; path: string },
  'id' | 'name' | 'horn'
>;
@Injectable()
export class WebsocketService {
  public socket: Server = null;
  sendAmmoniaValue(output: SensorValue) {
    if (!this.socket) return;
    this.socket.emit('onMessage', output);
  }
  sendAliveAddresses(output: string) {
    console.log(output);
    if (!this.socket) return;
    this.socket.emit('canAddresses', output);
  }
  sendErrorMessage(data: { timestamp: Date; message: string }) {
    if (!this.socket) return;
    this.socket.emit('errorMessage', data);
  }
}
