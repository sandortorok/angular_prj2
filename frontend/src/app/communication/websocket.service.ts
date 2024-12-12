import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private wsConnected: BehaviorSubject<boolean> = new BehaviorSubject(false);
  wsConnectionChange$ = this.wsConnected.asObservable();

  public sensorChange$: BehaviorSubject<{
    raw: number;
    address: number;
    value: number;
    panelId: number;
  }> = new BehaviorSubject({ address: 0, value: 0, raw: 0, panelId: 1 });
  public errorMessage$: BehaviorSubject<{ timestamp: Date; message: string }> =
    new BehaviorSubject({ timestamp: new Date(), message: '' });

  incomingMessages = this.errorMessage$.asObservable();
  public sirenChange$: BehaviorSubject<{
    sirenName: string;
    isOn: boolean;
  }> = new BehaviorSubject({ sirenName: '', isOn: Boolean(false) });

  public canAddressChange$: BehaviorSubject<{ [key: string]: Array<string> }> =
    new BehaviorSubject({});

  constructor() {
    this.wsSubscribe();
  }

  socket = io(environment.backend_url);

  public changeSirenMute(siren: {
    name: string;
    panelId: number;
    muted?: boolean;
    on?: boolean;
  }) {
    this.socket.emit('changeSiren', JSON.stringify(siren));
  }
  public testModeChange(value) {
    this.socket.emit('testModeChange', `${+value}`);
  }
  public resetAddresses() {
    this.socket.emit('resetAddresses', 1);
  }
  public wsSubscribe = () => {
    this.socket.on('connect', () => {
      this.wsConnected.next(true);
      console.log('Connected to Websockets!');
    });
    this.socket.on('disconnect', () => {
      this.wsConnected.next(false);
      console.log('Disconnected from Websockets!');
    });
    this.socket.on(
      'onMessage',
      (message: {
        address: number;
        value: number;
        raw: number;
        panelId: number;
      }) => {
        this.sensorChange$.next(message);
      }
    );
    this.socket.on('canAddresses', (message: string) => {
      this.canAddressChange$.next(JSON.parse(message));
    });
    this.socket.on(
      'errorMessage',
      (message: { timestamp: Date; message: string }) => {
        this.errorMessage$.next(message);
      }
    );
    this.socket.on(
      'sirenChange',
      (message: { sirenName: string; isOn: boolean }) => {
        this.sirenChange$.next(message);
      }
    );
  };
}
