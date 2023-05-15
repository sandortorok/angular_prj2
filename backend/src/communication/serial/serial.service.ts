import { Injectable } from '@nestjs/common';
import { SerialPort } from 'serialport';
import { ByteLengthParser } from '@serialport/parser-byte-length';
import { ReplaySubject } from 'rxjs';

@Injectable()
export class SerialService {
  aliveCanAddresses = {};
  port?: SerialPort;

  connectSerial(
    connectSubject: ReplaySubject<boolean>,
    dataSubject: ReplaySubject<{
      value: number;
      sensorId: number;
      newCan: number;
    }>,
  ) {
    try {
      this.port = new SerialPort(
        {
          path: '/dev/ttyUSB0',
          baudRate: 38400,
          dataBits: 8,
          stopBits: 1,
          parity: 'none',
        },
        (err) => {
          if (err) {
            connectSubject.next(false);
          }
        },
      );
      this.port.on('open', async () => {
        connectSubject.next(true);

        const parser = this.port.pipe(new ByteLengthParser({ length: 8 }));
        parser.on('data', (data: Buffer) => {
          const fr = data.toString('hex').match(/.{1,2}/g);
          const rawValue = parseInt(fr[2], 16) + parseInt(fr[3], 16) * 256;
          const value = ppmConvert(rawValue);
          const sensorId = parseInt(fr[0], 16);
          const newCan = parseInt(fr[5], 16);
          dataSubject.next({ value, sensorId, newCan });
        });
      });
    } catch (err) {
      //Actually not used error handling
      //Error handled in constructor
      console.log(err.message);
      console.log('error');
      connectSubject.next(false);
    }
  }
  async sirenCommand(address: number, on: boolean) {
    let output = address.toString(16);
    if (output.length === 1) {
      output = '0' + output;
    }
    if (on) {
      output += 'ff';
    } else {
      output += '00';
    }
    const b1 = Buffer.from('out');
    const b2 = Buffer.from(output, 'hex');
    const b3 = Buffer.from('#');
    await this.port.write(Buffer.concat([b1, b2, b3]));
  }
  async pollAddresses(addresses: number[]) {
    for (const address of addresses) {
      let hexString = address.toString(16);
      while (hexString.length < 4) {
        hexString = '0' + hexString;
      }
      const b1 = Buffer.from('get');
      const b2 = Buffer.from(hexString, 'hex');
      const b3 = Buffer.from('#'); //
      await this.port.write(Buffer.concat([b1, b2, b3]));
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
