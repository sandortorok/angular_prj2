import { SensorService } from 'src/app/pages/sensors/sensor.service';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Sensor } from '../../sensors/sensor.model';

@Component({
    selector: 'update-sensor-dialog',
    styleUrls: ['update-sensor-dialog.component.scss'],
    templateUrl: 'update-sensor-dialog.component.html',
    standalone: false
})
export class UpdateSensorDialogComponent implements OnInit {
  sensors: Sensor[] = [];
  selectedSensor?: Sensor;

  submitted: boolean = false;
  errorMessage?: string;

  form = new FormGroup({
    newName: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
    newAddress: new FormControl('', [
      Validators.required,
      Validators.min(0),
      Validators.max(255),
    ]),
  });
  constructor(
    public dialogRef: MatDialogRef<UpdateSensorDialogComponent>,
    private sensorService: SensorService
  ) {}
  ngOnInit(): void {
    this.sensorService.getSensors().subscribe((sensors) => {
      this.sensors = sensors;
    });
  }
  newSelected(sName: string) {
    let selectedSensor = this.sensors.find(
      (curSensor) => curSensor.name === sName
    )!;
    this.selectedSensor = { ...selectedSensor };
  }
  submit() {
    if (!this.form.valid) {
      Object.keys(this.form.controls).forEach((field) => {
        const control = this.form.get(field);
        control!.markAsTouched({ onlySelf: true });
      });
      return;
    }
    this.submitted = true;
    if (this.newAddress.value && this.newName.value && this.selectedSensor) {
      console.log(this.newAddress.value);
      console.log(this.selectedSensor);
      this.sensorService
        .updateSensor(this.selectedSensor.id!, this.selectedSensor)
        .subscribe({
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

  get newName() {
    return this.form.get('newName')!;
  }

  get newAddress() {
    return this.form.get('newAddress')!;
  }
}
