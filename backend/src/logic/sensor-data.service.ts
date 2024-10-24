import { Injectable, OnModuleInit } from '@nestjs/common';
import { SensorValue } from 'src/communication/websocket/websocket.service';
import { SensorHistoryService } from 'src/sensor-history/sensor-history.service';

@Injectable()
export class SensorDataService implements OnModuleInit {
  constructor(private sensorHistoryService: SensorHistoryService) {}
  SensorHistory: SensorValue[] = [];
  onModuleInit() {
    this.saveToHistory();
  }
  saveToHistory() {
    setInterval(
      () => {
        let grouped = this.groupList();
        Object.keys(grouped).forEach((panelId) => {
          Object.keys(grouped[panelId]).forEach((address) => {
            const length = grouped[panelId][address].length;
            const sum = grouped[panelId][address].reduce(
              (n, { value }) => n + value,
              0,
            );
            const sumTime = grouped[panelId][address].reduce(
              (n, { date }) => n + date.getTime(),
              0,
            );
            const averageValue = sum / length;
            const averageDate = new Date(sumTime / length);
            this.sensorHistoryService.create({
              sensor: {
                connect: {
                  addressIdentifier: {
                    address: Number(address),
                    panelId: Number(panelId),
                  },
                },
              },
              timestamp: averageDate,
              value: averageValue,
            });
          });
        });
        this.SensorHistory = [];
      },
      1000 * 60 * 10, //every 10 min
    );
  }
  addData(data) {
    this.SensorHistory.push({ ...data, date: new Date() });
  }
  groupList() {
    const groups = ['panelId', 'address'];
    let grouped = {};

    this.SensorHistory.forEach((a) => {
      groups
        .reduce((o, g, i) => {
          // take existing object,
          o[a[g]] = o[a[g]] || (i + 1 === groups.length ? [] : {}); // or generate new obj, or
          return o[a[g]]; // at last, then an array
        }, grouped)
        .push(a);
    });
    return grouped;
  }
}
