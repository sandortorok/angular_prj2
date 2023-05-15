import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { io } from 'socket.io-client';
@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  public sensorChange$: BehaviorSubject<{
    sensorAddress: number;
    value: number;
  }> = new BehaviorSubject({ sensorAddress: 0, value: 0 });

  public sirenChange$: BehaviorSubject<{
    sirenName: string;
    isOn: boolean;
  }> = new BehaviorSubject({ sirenName: '', isOn: Boolean(false) });

  public canAddressChange$: BehaviorSubject<Array<string>> =
    new BehaviorSubject<string[]>([]);

  constructor() {
    this.wsSubscribe();
  }

  socket = io('http://localhost:3000');

  public changeSirenMute(siren: {
    name: string;
    muted?: boolean;
    on?: boolean;
  }) {
    this.socket.emit('changeSiren', JSON.stringify(siren));
  }
  public testModeChange(value) {
    this.socket.emit('testModeChange', `${+value}`);
  }
  public wsSubscribe = () => {
    this.socket.on('connect', () => {
      console.log('Connected to Websockets!');
    });
    this.socket.on(
      'onMessage',
      (message: { sensorAddress: number; value: number }) => {
        this.sensorChange$.next(message);
      }
    );
    this.socket.on('canAddresses', (message: Array<string>) => {
      this.canAddressChange$.next(message);
    });
    this.socket.on(
      'sirenChange',
      (message: { sirenName: string; isOn: boolean }) => {
        this.sirenChange$.next(message);
      }
    );
  };
}
