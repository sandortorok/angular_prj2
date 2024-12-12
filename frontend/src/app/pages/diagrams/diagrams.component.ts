import { Component } from '@angular/core';
import { SensorService } from '../sensors/sensor.service';
import { BehaviorSubject, ReplaySubject, Subject, takeUntil } from 'rxjs';
import { Sensor } from '../sensors/sensor.model';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'YYYY-MM-DD',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY',
  },
};

export type scale = 'hour' | 'day' | 'week' | 'month' | 'year';
@Component({
    selector: 'app-diagrams',
    providers: [provideMomentDateAdapter(MY_FORMATS)],
    templateUrl: './diagrams.component.html',
    styleUrls: ['./diagrams.component.scss'],
    standalone: false
})
export class DiagramsComponent {
  private ngUnsubscribe = new Subject<void>();
  sensors: Sensor[] = [];
  timeScale: scale = 'hour';
  date = new Date();
  hour: number = new Date().getHours();

  selectedSensorId: BehaviorSubject<number> = new BehaviorSubject(0);
  selectedScale: BehaviorSubject<scale> = new BehaviorSubject(this.timeScale);
  selectedDate: BehaviorSubject<string> = new BehaviorSubject(
    formatDate(this.date)
  );
  selectedHour: BehaviorSubject<number> = new BehaviorSubject(this.hour);

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
    this.selectedSensorId.next(event);
  }
  dateChanged(event) {
    this.selectedDate.next(event.targetElement.value);
  }
  hourChanged(event) {
    let value = event.valueAsNumber;
    if (value > 23 || value < 0) {
      this.hour = 0;
      this.selectedHour.next(0);
    } else {
      this.selectedHour.next(value);
    }
  }
  changeTimeScale(event) {
    this.timeScale = event;
    this.selectedScale.next(event);
  }
}
function formatDate(d: Date) {
  return [d.getFullYear(), d.getMonth() + 1, d.getDate()].join('-');
}
