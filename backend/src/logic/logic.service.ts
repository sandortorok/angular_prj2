import { PanelService } from './../panel/panel.service';
import { ErrorMessageService } from './../error-message/error-message.service';
import { Sensor, Siren } from '@prisma/client';
import { TestModeService } from './../test-mode/test-mode.service';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ReplaySubject, Observable, BehaviorSubject } from 'rxjs';
import { SerialService } from 'src/communication/serial/serial.service';
import { SensorDataService } from './sensor-data.service';
import {
  SensorValue,
  WebsocketService,
} from 'src/communication/websocket/websocket.service';
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
    private sensorDataService: SensorDataService,
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

  dataSubject: ReplaySubject<SensorValue & { newCan: number }> =
    new ReplaySubject();
  dataMessage$: Observable<SensorValue & { newCan: number }> =
    this.dataSubject.asObservable();

  onModuleInit() {
    // setInterval(() => {
    //   this.dataSubject.next({
    //     newCan: 1,
    //     address: 1,
    //     panelId: 1,
    //     value: 0.4,
    //     raw: 200,
    //     path: '/dev/ttyUSB0',
    //   });
    //   this.dataSubject.next({
    //     newCan: 2,
    //     address: 1,
    //     panelId: 1,
    //     value: 0.4,
    //     raw: 200,
    //     path: '/dev/ttyUSB0',
    //   });
    //   this.dataSubject.next({
    //     newCan: 3,
    //     address: 1,
    //     panelId: 1,
    //     value: 0.4,
    //     raw: 200,
    //     path: '/dev/ttyUSB0',
    //   });
    //   this.dataSubject.next({
    //     newCan: 4,
    //     address: 1,
    //     panelId: 1,
    //     value: 0.4,
    //     raw: 200,
    //     path: '/dev/ttyUSB0',
    //   });
    //   this.dataSubject.next({
    //     newCan: 5,
    //     address: 1,
    //     panelId: 1,
    //     value: 0.4,
    //     raw: 200,
    //     path: '/dev/ttyUSB0',
    //   });
    //   this.dataSubject.next({
    //     newCan: 6,
    //     address: 1,
    //     panelId: 1,
    //     value: 0.4,
    //     raw: 200,
    //     path: '/dev/ttyUSB0',
    //   });
    //   this.dataSubject.next({
    //     newCan: 7,
    //     address: 1,
    //     panelId: 1,
    //     value: 0.4,
    //     raw: 200,
    //     path: '/dev/ttyUSB0',
    //   });
    //   this.dataSubject.next({
    //     newCan: 8,
    //     address: 1,
    //     panelId: 1,
    //     value: 0.4,
    //     raw: 200,
    //     path: '/dev/ttyUSB0',
    //   });
    //   this.dataSubject.next({
    //     newCan: 9,
    //     address: 1,
    //     panelId: 1,
    //     value: 0.4,
    //     raw: 200,
    //     path: '/dev/ttyUSB0',
    //   });
    //   this.dataSubject.next({
    //     newCan: 10,
    //     address: 2,
    //     panelId: 1,
    //     value: 0.4,
    //     raw: 200,
    //     path: '/dev/ttyUSB0',
    //   });
    //   this.dataSubject.next({
    //     newCan: 11,
    //     address: 2,
    //     panelId: 1,
    //     value: 0.4,
    //     raw: 200,
    //     path: '/dev/ttyUSB0',
    //   });
    //   this.dataSubject.next({
    //     newCan: 12,
    //     address: 2,
    //     panelId: 1,
    //     value: 0.4,
    //     raw: 200,
    //     path: '/dev/ttyUSB0',
    //   });
    //   this.dataSubject.next({
    //     newCan: 13,
    //     address: 2,
    //     panelId: 1,
    //     value: 0.4,
    //     raw: 200,
    //     path: '/dev/ttyUSB0',
    //   });
    //   this.dataSubject.next({
    //     newCan: 14,
    //     address: 2,
    //     panelId: 1,
    //     value: 0.4,
    //     raw: 200,
    //     path: '/dev/ttyUSB0',
    //   });
    //   this.dataSubject.next({
    //     newCan: 1,
    //     address: 1,
    //     panelId: 2,
    //     value: 0.4,
    //     raw: 200,
    //     path: '/dev/ttyUSB0',
    //   });
    // }, 1000);

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
    this.panelService.updatePanels({
      where: {},
      data: { path: '' },
    });
    this.panelService.panels({}).then((res) => {
      this.serialService.connectSerialMultiple(
        res.map((data, idx) => `/dev/ttyUSB${idx}`),
        this.connectionSubject,
        this.dataSubject,
      );
    });
    this.handleConnection();
    this.handleDataIncome();
    this.startPolling();
  }
  handleConnection() {
    this.connectionResponse$.subscribe(async (response) => {
      if (!response.connection) {
        this.connectTries++;
        console.log(`Failed connecting to ${response.path}`);
        await delay(13000);
        this.serialService.connectSerial(
          this.connectionSubject,
          this.dataSubject,
          response.path,
        );
      } else if (response.connection) {
        this.connectTries = 0;
        console.log('Connected to Serial port', response.path);
        this.canAliveCheck();
        this.serialService.queryPanelAddress(response.path);
      }
    });
  }
  handleDataIncome() {
    this.dataMessage$.subscribe((data) => {
      if (this.aliveCanAddresses[data.panelId] == undefined)
        this.aliveCanAddresses[data.panelId] = {};

      this.aliveCanAddresses[data.panelId][data.newCan] = new Date();
      this.latestValues[`${data.address}`] = data.value;
      this.wsService.sendAmmoniaValue(data);
      this.wsService.sendAliveAddresses(
        this.convertAliveAddresses(this.aliveCanAddresses),
      );
      this.sensorDataService.addData(data);
    });
  }
  convertAliveAddresses(obj) {
    let returnObj = {};
    Object.keys(obj).forEach((panelId) => {
      returnObj[panelId] = [...Object.keys(obj[panelId])];
    });
    return JSON.stringify(returnObj);
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
      const ports = this.serialService.ports.map((port) => {
        return { port: port.settings.path, closed: port.closed };
      });
      const hasOpenPort = ports.some((p) => {
        return !p.closed;
      });
      if (hasOpenPort) {
        await this.serialService.pollAddresses(this.sensorSubject.getValue());
        await this.sirenCheck();
      }
    }, 10000);
  }
  canAliveCheck() {
    Object.keys(this.aliveCanAddresses).forEach((panelId) => {
      Object.keys(this.aliveCanAddresses[panelId]).forEach(
        (address: string) => {
          if (isOld(this.aliveCanAddresses[panelId][address])) {
            delete this.aliveCanAddresses[panelId][address];
          }
        },
      );
    });
    this.wsService.sendAliveAddresses(
      this.convertAliveAddresses(this.aliveCanAddresses),
    );
  }
  resetAddresses() {
    Object.keys(this.aliveCanAddresses).forEach((panelId) => {
      Object.keys(this.aliveCanAddresses[panelId]).forEach(
        (address: string) => {
          delete this.aliveCanAddresses[panelId][address];
        },
      );
    });
    this.wsService.sendAliveAddresses(
      this.convertAliveAddresses(this.aliveCanAddresses),
    );
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
