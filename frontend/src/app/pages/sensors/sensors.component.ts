import { MatDialog } from '@angular/material/dialog';
import { WebsocketService } from './../../communication/websocket.service';
import { Sensor } from './sensor.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { SensorService } from 'src/app/pages/sensors/sensor.service';
import { SensorDialogComponent } from './gauge-dialog/gauge-dialog.component';
import { Subject, takeUntil } from 'rxjs';

type OrderBy = 'name' | 'value' | 'address' | 'panelId';
type AscDesc = 'asc' | 'desc';
@Component({
    selector: 'app-sensors',
    templateUrl: './sensors.component.html',
    styleUrls: ['./sensors.component.scss'],
    standalone: false
})
export class SensorsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  loaded: boolean = false;
  sensors: Sensor[] = [];
  hasUnmuted = false;

  orderOptions: Array<{ name: string; type: OrderBy }> = [
    { name: 'Név szerint', type: 'name' },
    { name: 'Ammónia szint szerint', type: 'value' },
    { name: 'Can cím szerint', type: 'address' },
    { name: 'Panel ID alapján', type: 'panelId' },
  ];
  chosenOrder: OrderBy = 'address';
  chosenAscDesc: AscDesc = 'asc';

  showRaw = false;
  constructor(private sensorService: SensorService) {}
  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  orderChange(order) {
    console.log(order);
  }
  ngOnInit(): void {
    this.sensorService.sensorChange$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((sensors) => {
        this.sensors = sensors;
        this.hasUnmuted = this.sensors.some((sensor) => {
          return sensor.horn;
        });
      });
  }
  updateHorn(id: number, newHornValue: boolean) {
    this.hasUnmuted = this.sensors.some((sensor) => {
      return sensor.horn;
    });
    this.sensorService.updateHorn(id, newHornValue).subscribe();
  }
}
