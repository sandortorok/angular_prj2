import { Component, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Sensor } from '../sensors/sensor.model';
import { SensorService } from '../sensors/sensor.service';

@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
    standalone: false
})
export class MapComponent implements OnInit {
  sensors: Sensor[] = [];
  private ngUnsubscribe = new Subject<void>();
  sensorColors: { name?: string; color?: string } = {};
  constructor(private sensorService: SensorService) {}

  ngOnInit(): void {
    this.sensorService.sensorChange$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((sensors) => {
        this.sensors = sensors;
      });
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
