import { Component } from '@angular/core';
import { SensorService } from '../sensors/sensor.service';
import { Subject, takeUntil } from 'rxjs';
import { Sensor } from '../sensors/sensor.model';

@Component({
  selector: 'app-diagrams',
  templateUrl: './diagrams.component.html',
  styleUrls: ['./diagrams.component.scss'],
})
export class DiagramsComponent {
  private ngUnsubscribe = new Subject<void>();
  sensors: Sensor[] = [];
  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  ngOnInit() {
    this.sensorService.sensorChange$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((sensors) => {
        this.sensors = sensors;
      });
  }
  constructor(private sensorService: SensorService) {}
  newSelected(event) {
    console.log(event);
  }
}
