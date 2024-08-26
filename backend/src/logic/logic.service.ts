import { PanelService } from './../panel/panel.service';
import { ErrorMessageService } from './../error-message/error-message.service';
import { Sensor, Siren } from '@prisma/client';
import { TestModeService } from './../test-mode/test-mode.service';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ReplaySubject, Observable, BehaviorSubject } from 'rxjs';
import { SerialService } from 'src/communication/serial/serial.service';
import { WebsocketService } from 'src/communication/websocket/websocket.service';
import { SirenService } from 'src/siren/siren.service';
import { SensorService } from 'src/sensor/sensor.service';

type sensorType = { sensorId: number; value: number };
@Injectable()
export class LogicService implements OnModuleInit {
  constructor(
    private serialService: SerialService,
    private wsService: WebsocketService,
    private testModeService: TestModeService,
    private sirenService: SirenService,
    private errorService: ErrorMessageService,
    private sensorService: SensorService,
    private panelService: PanelService,
  ) {}

  latestValues: sensorType = {} as sensorType;

  aliveCanAddresses = {};

  testModeSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
  testModeUpdate$: Observable<boolean> = this.testModeSubject.asObservable();

  sirenSubject: BehaviorSubject<Array<Siren>> = new BehaviorSubject([]);
  sensorSubject: BehaviorSubject<Array<Sensor>> = new BehaviorSubject([]);

  connectTries = 0;
  connectionSubject: ReplaySubject<{ connection: boolean; path: string }> =
    new ReplaySubject();
  connectionResponse$: Observable<{ connection: boolean; path: string }> =
    this.connectionSubject.asObservable();

  dataSubject: ReplaySubject<{
    raw: number;
    value: number;
    sensorId: number;
    newCan: number;
    path?: string;
  }> = new ReplaySubject();
  dataMessage$: Observable<{
    raw: number;
    value: number;
    sensorId: number;
    newCan: number;
    path?: string;
  }> = this.dataSubject.asObservable();

  onModuleInit() {
    this.testModeService.getMode().then((mode) => {
      this.testModeSubject.next(mode.isOn);
    });
    this.sirenService.sirens({}).then((res) => {
      this.sirenSubject.next(res);
    });
    //this.serialService.connectSerial(this.connectionSubject, this.dataSubject);
    this.sensorService.sensors({}).then((res) => {
      this.sensorSubject.next(res);
    });
    this.panelService.panels({}).then((res) => {
      this.serialService.connectSerialMultiple(
        res.map((data) => data.path),
        this.connectionSubject,
        this.dataSubject,
      );
    });
    //this.handleConnection();
    //this.handleDataIncome();
  }
  handleConnection() {
    this.connectionResponse$.subscribe(async (response) => {
      if (!response.connection && response.path === '/dev/ttyUSB0') {
        this.connectTries++;
        console.log('Failed to connect to serial port. Try', this.connectTries);
        await delay(5000);
        // this.serialService.connectSerial(
        //   this.connectionSubject,
        //   this.dataSubject,
        // );
      } else if (response.connection) {
        this.connectTries = 0;
        console.log('Connected to Serial port', response.path);
        this.aliveCheck();
        this.startPolling();
      }
    });
  }
  handleDataIncome() {
    this.dataMessage$.subscribe((data) => {
      this.aliveCanAddresses[`${data.newCan}`] = new Date();
      this.latestValues[`${data.sensorId}`] = data.value;
      this.wsService.sendAmmoniaValue({
        raw: data.raw,
        sensorAddress: data.sensorId,
        value: data.value,
      });
      this.wsService.sendAliveAddresses(Object.keys(this.aliveCanAddresses));
    });
  }

  async sirenCheck() {
    const sirens = this.sirenSubject.getValue();
    const isTestMode = this.testModeSubject.getValue();
    if (isTestMode) {
      // if in test mode
    } else {
      let turnOn = false;
      Object.values(this.latestValues).forEach((value) => {
        if (value > 20) {
          turnOn = true;
        }
      });
      for (const siren of sirens) {
        if (turnOn) {
          if (siren.on === false && !isTestMode) {
            const msg = siren.name + ': Magas ammónia érték';
            this.errorService.addErrorMessage({
              timestamp: new Date(),
              message: msg,
            });
            this.wsService.sendErrorMessage({
              message: msg,
              timestamp: new Date(),
            });
          }
          siren.on = true;
          await this.updateSiren(siren);
        } else {
          siren.on = false;
          await this.updateSiren(siren);
        }
      }
    }
    for (const siren of sirens) {
      await delay(100);
      await this.serialService.sirenCommand(siren);
    }
  }
  startPolling() {
    setInterval(async () => {
      await this.serialService.pollAddresses(this.sensorSubject.getValue());
      await this.sirenCheck();
    }, 5000);
  }
  aliveCheck() {
    Object.keys(this.aliveCanAddresses).forEach((address: string) => {
      if (isOld(this.aliveCanAddresses[address])) {
        delete this.aliveCanAddresses[address];
      }
    });
    this.wsService.sendAliveAddresses(Object.keys(this.aliveCanAddresses));
  }
  resetAddresses() {
    Object.keys(this.aliveCanAddresses).forEach((address: string) => {
      delete this.aliveCanAddresses[address];
    });
    this.wsService.sendAliveAddresses(Object.keys(this.aliveCanAddresses));
  }
  async updateSiren(siren: Siren) {
    const sirens = this.sirenSubject.getValue();
    sirens.forEach((s) => {
      if (s.name === siren.name) {
        if (siren.muted != undefined) {
          s.muted = siren.muted;
        }
        if (siren.on != undefined) {
          s.on = siren.on;
        }
      }
    });
    await this.sirenService.updateSiren({
      where: {
        nameIdentifier: { name: siren.name, panelId: siren.panelId },
      },
      data: {
        muted: siren.muted,
        on: siren.on,
      },
    });
    this.sirenSubject.next(sirens);
  }
}

async function delay(ms) {
  // return await for better async stack trace support in case of errors.
  return await new Promise((resolve) => setTimeout(resolve, ms));
}
function isOld(date: Date) {
  const TEN_MIN = 10 * 60 * 1000; /* ms */
  if (Math.abs(date.getTime() - new Date().getTime()) < TEN_MIN) {
    return false;
  }
  return true;
}
