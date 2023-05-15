import { Injectable, OnModuleInit } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { RedisClientType, createClient } from 'redis';

// const redFg = '\x1b[31m';
// const whiteBg = '\x1b[47m';
const resetBg = '\x1b[0m';
const yellowFg = '\x1b[33m';
@Injectable()
export class RedisService implements OnModuleInit {
  // client?: RedisClientType; //Ha hozzárakjuk a típust akkor lelassul
  client?: any;
  async onModuleInit() {
    this.client = createClient();
    this.client.on('error', (err) => console.log('Redis Client Error', err));
    this.client.on('connect', () =>
      console.log(`${yellowFg}Connected to Redis${resetBg}`),
    );
    await this.client.connect();
  }
  async addSensorValue(sensorId: number, value: number) {
    if (!this.client) return;
    await this.client.zAdd(`sensor:${sensorId}`, {
      score: new Date().getTime(),
      value: JSON.stringify({ value: value, date: new Date().getTime() }),
    });
  }
  async removeSensorValue(
    sensorId: number,
    member: { date: number; value: number },
  ) {
    if (!this.client) return;
    await this.client.zRem(`sensor:${sensorId}`, JSON.stringify(member));
  }
  listHistory(
    sensorId: number,
  ): Promise<Array<{ score: number; value: string }>> {
    if (!this.client) return;
    return this.client.zRangeWithScores(`sensor:${sensorId}`, 0, -1);
  }
  async removeHistory(sensorId: number) {
    await this.client.del(`sensor:${sensorId}`);
  }
  async removeHistoryMultiple(sensorIds: number[]) {
    for (const id of sensorIds) {
      await this.removeHistory(id);
    }
  }
}
