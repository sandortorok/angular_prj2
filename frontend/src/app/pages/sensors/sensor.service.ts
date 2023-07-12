import { Sensor, yellowMin } from './sensor.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Injectable, isDevMode } from '@angular/core';
import { WebsocketService } from 'src/app/communication/websocket.service';
import { BehaviorSubject, takeUntil } from 'rxjs';

@Injectable()
export class SensorService {
  private sensors: BehaviorSubject<Sensor[]> = new BehaviorSubject<Sensor[]>(
    []
  );
  sensorChange$ = this.sensors.asObservable();
  alarmAudio = new Audio('assets/audio/alarm.wav');
  alarmRunning = false;

  private url = environment.backend_url + '/sensor';
  constructor(private http: HttpClient, private wss: WebsocketService) {
    this.getSensors().subscribe((res) => {
      this.sensors.next(res);
    });
    this.wss.sensorChange$.subscribe((changedSensor) => {
      let newSensors = this.sensors.getValue();
      newSensors.forEach((sensor) => {
        if (sensor.address === changedSensor.sensorAddress) {
          sensor.value = changedSensor.value;
          sensor.raw = changedSensor.raw;
        }
      });
      this.sensors.next(newSensors);
      this.alarmCheck();
    });
  }
  alarmCheck() {
    let playSound = false;
    this.sensors.getValue().forEach((s) => {
      if (s.value && s.value > yellowMin && s.horn != false) {
        playSound = true;
      }
    });
    if (playSound && this.alarmRunning === false) {
      console.log(this.alarmRunning);
      this.playAudio();
    } else if (!playSound) {
      this.stopAudio();
    }
  }
  playAudio() {
    this.alarmAudio.loop = true;
    this.alarmAudio.load();
    this.alarmAudio.play();
    this.alarmRunning = true;
  }
  stopAudio() {
    this.alarmAudio.pause();
    this.alarmRunning = false;
  }
  getSensors() {
    return this.http.get<Sensor[]>(this.url + '/all');
  }

  updateSensorName(sensor: Sensor) {
    return this.http.patch(this.url + '/name/' + sensor.id, {
      name: sensor.name,
    });
  }
  updateHorn(id: number, horn: boolean) {
    return this.http.patch(this.url + '/horn/' + id, {
      horn: horn,
    });
  }
  updateSensor(id: number, sensor: Sensor) {
    return this.http.put(this.url + '/' + id, {
      sensor: sensor,
    });
  }
  createSensor(sensor: Sensor) {
    return this.http.post(this.url, { sensor });
  }
  isAddressTaken(address: number) {
    return this.http.get(this.url + `/addresstaken/${address}`);
  }
  isNameTaken(name: string) {
    return this.http.get(this.url + `/nametaken/${name}`);
  }
  deleteSensor(id: number) {
    return this.http.delete(this.url + `/${id}`);
  }
}
