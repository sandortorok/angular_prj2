import { SensorService } from 'src/app/pages/sensors/sensor.service';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Sensor } from '../../sensors/sensor.model';

@Component({
    selector: 'delete-sensor-dialog',
    styleUrls: ['delete-sensor-dialog.component.scss'],
    templateUrl: 'delete-sensor-dialog.component.html',
    standalone: false
})
export class DeleteSensorDialogComponent implements OnInit {
  errorMessage?: string;
  sensors: Sensor[] = [];
  selectedSensor?: Sensor;

  submitted: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<DeleteSensorDialogComponent>,
    private sensorService: SensorService
  ) {}
  ngOnInit(): void {
    this.sensorService.getSensors().subscribe((sensors) => {
      this.sensors = sensors;
    });
  }
  submit() {
    if (!this.selectedSensor || !this.selectedSensor.id) return;
    this.submitted = true;
    this.sensorService.deleteSensor(this.selectedSensor.id).subscribe({
      next: (sensor) => {
        this.dialogRef.close();
      },
      error: (error) => {
        if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = error.message;
        }
        this.submitted = false;
      },
    });
  }
}
