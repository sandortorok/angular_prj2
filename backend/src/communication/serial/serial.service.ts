import { Injectable, Patch } from '@nestjs/common';
import { SerialPort } from 'serialport';
import { ByteLengthParser } from '@serialport/parser-byte-length';
import { ReplaySubject } from 'rxjs';
import { Sensor, Siren, Panel } from '@prisma/client';

@Injectable()
export class SerialService {
  aliveCanAddresses = {};
  port?: SerialPort;
  ports: SerialPort[] = [];
  connectSerialMultiple(
    paths: string[],
    connectSubject: ReplaySubject<{ connection: boolean; path: string }>,
    dataSubject: ReplaySubject<{
      raw: number;
      value: number;
      sensorId: number;
      newCan: number;
      path?: string;
    }>,
  ) {
    paths.forEach((path) => {
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
            console.log(err);
          }
        },
      );
      newPort.on('open', async () => {
        this.ports.push(newPort);
        connectSubject.next({ connection: true, path: path });

        const parser = newPort.pipe(new ByteLengthParser({ length: 8 }));
        parser.on('data', (data: Buffer) => {
          const fr = data.toString('hex').match(/.{1,2}/g);
          const rawValue = parseInt(fr[2], 16) + parseInt(fr[3], 16) * 256;
          const value = ppmConvert(rawValue);
          const sensorId = parseInt(fr[0], 16);
          const newCan = parseInt(fr[5], 16);
          dataSubject.next({ raw: rawValue, value, sensorId, newCan, path });
        });
      });
    });
    return;
  }
  connectSerial(
    connectSubject: ReplaySubject<{ connection: boolean; path: string }>,
    dataSubject: ReplaySubject<{
      raw: number;
      value: number;
      sensorId: number;
      newCan: number;
    }>,
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
            console.log(err);
            connectSubject.next({ connection: false, path });
          }
        },
      );
      newPort.on('open', async () => {
        connectSubject.next({ connection: true, path });

        const parser = newPort.pipe(new ByteLengthParser({ length: 8 }));
        parser.on('data', (data: Buffer) => {
          const fr = data.toString('hex').match(/.{1,2}/g);
          const rawValue = parseInt(fr[2], 16) + parseInt(fr[3], 16) * 256;
          const value = ppmConvert(rawValue);
          const sensorId = parseInt(fr[0], 16);
          const newCan = parseInt(fr[5], 16);
          dataSubject.next({ raw: rawValue, value, sensorId, newCan });
        });
      });
    } catch (err) {
      //Actually not used error handling
      //Error handled in constructor
      console.log(err);
      console.log('error');
      connectSubject.next({ connection: false, path: '/dev/ttyUSB0' });
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

    await this.ports
      .find((p) => p.settings.path === `/dev/ttyUSB${siren.panelId - 1}`)
      .write(Buffer.concat([b1, b2, b3]));
  }
  async pollAddresses(sensors: Sensor[]) {
    for (const sensor of sensors) {
      let hexString = sensor.address.toString(16);
      while (hexString.length < 4) {
        hexString = '0' + hexString;
      }
      const b1 = Buffer.from('get');
      const b2 = Buffer.from(hexString, 'hex');
      const b3 = Buffer.from('#'); //
      this.ports
        .find((p) => p.settings.path === `/dev/ttyUSB${sensor.panelId - 1}`)
        .write(Buffer.concat([b1, b2, b3]));
      await delay(100);
    }
  }
}
async function delay(ms) {
  // return await for better async stack trace support in case of errors.
  return await new Promise((resolve) => setTimeout(resolve, ms));
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
