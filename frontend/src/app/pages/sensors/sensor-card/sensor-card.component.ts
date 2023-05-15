import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
} from '@angular/core';
import { SensorService } from '../sensor.service';
import { Sensor } from '../sensor.model';
import { SensorDialogComponent } from '../gauge-dialog/gauge-dialog.component';

@Component({
  selector: 'app-sensor',
  templateUrl: './sensor-card.component.html',
  styleUrls: ['./sensor-card.component.scss'],
})
export class SensorCardComponent {
  dialogRef: MatDialogRef<SensorDialogComponent, number> | undefined;
  constructor(private dialog: MatDialog) {}
  @Input() sensor: Sensor = {
    id: 0,
    name: '',
    address: 0,
    horn: false,
  };
  @Input() value: number | undefined;
  @Output() hornChanged = new EventEmitter<boolean>();
  changeHorn() {
    this.sensor.horn = !this.sensor.horn;
    this.hornChanged.emit(this.sensor.horn);
  }
  openDialog() {
    this.dialogRef = this.dialog.open(SensorDialogComponent, {
      data: this.sensor.value,
    });
    this.dialogRef.afterClosed().subscribe(() => {
      this.dialogRef = undefined;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.dialogRef && this.dialogRef.componentInstance !== null) {
      this.dialogRef.componentInstance.data = changes['value'].currentValue;
    }
  }
}
