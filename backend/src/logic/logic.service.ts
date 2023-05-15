import { Siren } from '@prisma/client';
import { TestModeService } from './../test-mode/test-mode.service';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ReplaySubject, Observable, BehaviorSubject } from 'rxjs';
import { SerialService } from 'src/communication/serial/serial.service';
import { WebsocketService } from 'src/communication/websocket/websocket.service';
import { SirenService } from 'src/siren/siren.service';

type sensorType = { sensorId: number; value: number };
@Injectable()
export class LogicService implements OnModuleInit {
  constructor(
    private serialService: SerialService,
    private wsService: WebsocketService,
    private testModeService: TestModeService,
    private sirenService: SirenService,
  ) {}

  latestValues: sensorType = {} as sensorType;

  aliveCanAddresses = {};

  testModeSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
  testModeUpdate$: Observable<boolean> = this.testModeSubject.asObservable();

  sirenSubject: BehaviorSubject<Array<Siren>> = new BehaviorSubject([]);
  connectTries = 0;
  connectionSubject: ReplaySubject<boolean> = new ReplaySubject();
  connectionResponse$: Observable<boolean> =
    this.connectionSubject.asObservable();

  dataSubject: ReplaySubject<{
    value: number;
    sensorId: number;
    newCan: number;
  }> = new ReplaySubject();
  dataMessage$: Observable<{
    value: number;
    sensorId: number;
    newCan: number;
  }> = this.dataSubject.asObservable();

  onModuleInit() {
    this.testModeService.getMode().then((mode) => {
      this.testModeSubject.next(mode.isOn);
    });
    this.sirenService.sirens({}).then((res) => {
      this.sirenSubject.next(res);
    });
    this.serialService.connectSerial(this.connectionSubject, this.dataSubject);
    this.handleConnection();
    this.handleDataIncome();
  }
  handleConnection() {
    this.connectionResponse$.subscribe(async (response) => {
      if (response === false) {
        this.connectTries++;
        console.log('Failed to connect to serial port. Try', this.connectTries);
        await delay(5000);
        this.serialService.connectSerial(
          this.connectionSubject,
          this.dataSubject,
        );
      } else {
        this.connectTries = 0;
        console.log('Connected to Serial port');
        this.aliveCheck();
        this.startPolling();
      }
    });
  }
  handleDataIncome() {
    this.dataMessage$.subscribe((data) => {
      this.aliveCanAddresses[`${data.newCan}`] = new Date();
      this.latestValues[`${data.sensorId}`] = data.value;
      this.wsService.sendMessage({
        sensorAddress: data.sensorId,
        value: data.value,
      });
      this.wsService.sendAliveAddresses(Object.keys(this.aliveCanAddresses));
    });
  }

  async sirenCheck() {
    const sirens = this.sirenSubject.getValue();

    if (this.testModeSubject.getValue()) {
      // if in test mode
    } else {
      let turnOn = false;
      Object.values(this.latestValues).forEach((value) => {
        if (value > 40) {
          turnOn = true;
        }
      });
      for (const siren of sirens) {
        if (turnOn) {
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
      await this.serialService.sirenCommand(
        siren.address,
        siren.on && !siren.muted,
      );
    }
  }
  startPolling() {
    setInterval(async () => {
      await this.serialService.pollAddresses([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
      ]);
      await this.sirenCheck();
    }, 5000);
  }
  aliveCheck() {
    Object.keys(this.aliveCanAddresses).forEach((address: string) => {
      if (isOld(this.aliveCanAddresses[address])) {
        delete this.aliveCanAddresses[address];
      }
    });
  }
  async updateSiren(siren: { name: string; muted?: boolean; on?: boolean }) {
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
        name: siren.name,
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
