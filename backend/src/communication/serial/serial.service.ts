import { Injectable } from '@nestjs/common';
import { SerialPort } from 'serialport';
import { ByteLengthParser } from '@serialport/parser-byte-length';
import { ReplaySubject } from 'rxjs';
import { Panel, Sensor, Siren } from '@prisma/client';
import { PanelService } from 'src/panel/panel.service';
import { SensorValue } from '../websocket/websocket.service';

@Injectable()
export class SerialService {
  constructor(private panelService: PanelService) {
    this.updatePanelsPaths();
  }

  aliveCanAddresses = {};
  ports: SerialPort[] = [];
  panelPaths: Panel[] = [];

  updatePanelsPaths() {
    this.panelService.panels({}).then((res) => {
      this.panelPaths = res;
    });
  }
  async connectSerialMultiple(
    paths: string[],
    connectSubject: ReplaySubject<{ connection: boolean; path: string }>,
    dataSubject: ReplaySubject<SensorValue & { newCan: number }>,
  ) {
    for (const path of paths) {
      await delay(1000);
      const newPort = new SerialPort(
        {
          path: path,
          baudRate: 38400,
          dataBits: 8,
          stopBits: 1,
          parity: 'none',
        },
        (err) => {
          if (err) {
            connectSubject.next({ connection: false, path: path });
          }
        },
      );
      newPort.on('open', async () => {
        this.ports.push(newPort);
        connectSubject.next({ connection: true, path: path });

        const parser = newPort.pipe(new ByteLengthParser({ length: 9 }));
        parser.on('data', (data: Buffer) => {
          const fr = data.toString('hex').match(/.{1,2}/g);
          const panelId = parseInt(fr[7], 16);
          let raw = parseInt(fr[2], 16) + parseInt(fr[3], 16) * 256;
          raw = randomIntFromInterval(100, 1000);
          const value = ppmConvert(raw);
          const address = parseInt(fr[0], 16);
          const newCan = fr[6] === 'f0' ? parseInt(fr[5], 16) : 0;

          const sendData = { raw, value, panelId, address, newCan, path };
          const currentPanel = this.panelPaths.find((p) => {
            return p.address === panelId;
          });
          console.log('reading', { raw, address, newCan, panelId });
          if (currentPanel.path != path) {
            this.panelService
              .updatePanel({ where: { address: panelId }, data: { path } })
              .then(() => {
                this.updatePanelsPaths();
              });
          }
          dataSubject.next(sendData);
        });
      });
      newPort.on('close', async () => {
        console.log('Connection closed:', path);
        connectSubject.next({ connection: false, path });
      });
    }
  }
  connectSerial(
    connectSubject: ReplaySubject<{ connection: boolean; path: string }>,
    dataSubject: ReplaySubject<SensorValue & { newCan: number }>,
    path: string,
  ) {
    try {
      const newPort = new SerialPort(
        {
          path: path,
          baudRate: 38400,
          dataBits: 8,
          stopBits: 1,
          parity: 'none',
        },
        (err) => {
          if (err) {
            connectSubject.next({ connection: false, path });
          }
        },
      );
      newPort.on('open', async () => {
        connectSubject.next({ connection: true, path });

        const parser = newPort.pipe(new ByteLengthParser({ length: 9 }));
        parser.on('data', (data: Buffer) => {
          const fr = data.toString('hex').match(/.{1,2}/g);
          const raw = parseInt(fr[2], 16) + parseInt(fr[3], 16) * 256;
          const value = ppmConvert(raw);
          const address = parseInt(fr[0], 16);
          const panelId = parseInt(fr[7], 16);
          const newCan = fr[6] === 'f0' ? parseInt(fr[5], 16) : 0;

          const currentPanel = this.panelPaths.find((p) => {
            return p.address === panelId;
          });
          console.log('reading', { raw, value, address, newCan, panelId });
          if (currentPanel.path != path) {
            this.panelService
              .updatePanel({ where: { address: panelId }, data: { path } })
              .then(() => {
                this.updatePanelsPaths();
              });
          }
          dataSubject.next({ raw, value, address, newCan, panelId, path });
        });
      });
      newPort.on('close', async () => {
        connectSubject.next({ connection: false, path });
      });
    } catch (err) {
      //Actually not used error handling
      //Error handled in constructor
      console.log(err);
      console.log('error');
      connectSubject.next({ connection: false, path });
    }
  }
  async sirenCommand(siren: Siren) {
    let output = siren.address.toString(16);
    if (output.length === 1) {
      output = '0' + output;
    }
    //turn on if not muted
    if (siren.on && !siren.muted) {
      output += 'ff';
    } else {
      output += '00';
    }
    const b1 = Buffer.from('out');
    const b2 = Buffer.from(output, 'hex');
    const b3 = Buffer.from('#');
    const path = this.panelPaths.find((p) => {
      return p.address === siren.panelId;
    }).path;
    const port = this.ports.find((p) => {
      return p.settings.path === path;
    });
    if (port != undefined) {
      console.log('siren writing', {
        path,
        address: siren.address,
        on: siren.on,
      });
      await port.write(Buffer.concat([b1, b2, b3]));
    }
  }
  async pollAddresses(sensors: Sensor[]) {
    for (const sensor of sensors) {
      let hexString = sensor.address.toString(16);
      while (hexString.length < 4) {
        hexString = '0' + hexString;
      }
      const b1 = Buffer.from('get');
      const b2 = Buffer.from(hexString, 'hex');
      const b3 = Buffer.from('#'); //;
      const path = this.panelPaths.find((p) => {
        return p.address === sensor.panelId;
      }).path;
      const port = this.ports.find((p) => {
        return p.settings.path === path;
      });
      if (port != undefined) {
        console.log('writing', { path, address: sensor.address });
        await port.write(Buffer.concat([b1, b2, b3]));
      }
      await delay(100);
    }
  }
  async queryPanelAddress(path: string) {
    const port = this.ports.find((p) => {
      return p.settings.path === path;
    });
    if (port != undefined) {
      console.log('queryAddress', path);
      const b1 = Buffer.from('get');
      const b2 = Buffer.from('0001', 'hex');
      const b3 = Buffer.from('#'); //;
      await port.write(Buffer.concat([b1, b2, b3]));
    }
  }
}

async function delay(ms) {
  // return await for better async stack trace support in case of errors.
  return await new Promise((resolve) => setTimeout(resolve, ms));
}
function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
function ppmConvert(val) {
  if (val != 0) {
    let ppm_val = (val * 5) / 1024;
    ppm_val = Math.pow(10, ppm_val - 2.99) - 0.2;
    ppm_val = Math.round(ppm_val * 100) / 100; //2 digit;
    if (ppm_val <= 0) {
      ppm_val = 0.01;
    }
    return ppm_val;
  } else {
    return 0;
  }
}
