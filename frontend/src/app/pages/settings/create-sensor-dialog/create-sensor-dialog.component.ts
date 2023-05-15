import { SensorService } from 'src/app/pages/sensors/sensor.service';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'create-sensor-dialog',
  styleUrls: ['create-sensor-dialog.component.scss'],
  templateUrl: 'create-sensor-dialog.component.html',
})
export class CreateSensorDialogComponent {
  submitted: boolean = false;
  errorMessage?: string;

  form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(6)]),
    address: new FormControl(
      '',
      [Validators.required, Validators.min(0), Validators.max(255)],
      []
    ),
  });
  constructor(
    public dialogRef: MatDialogRef<CreateSensorDialogComponent>,
    private sensorService: SensorService
  ) {}
  submit() {
    if (!this.form.valid) {
      Object.keys(this.form.controls).forEach((field) => {
        const control = this.form.get(field);
        control!.markAsTouched({ onlySelf: true });
      });
      return;
    }
    this.submitted = true;

    if (this.address.value) {
      this.sensorService.isAddressTaken(+this.address.value).subscribe({
        next: (isTaken) => {
          if (!isTaken) {
            this.sensorService
              .createSensor({
                name: this.name.value!,
                address: +this.address.value!,
                horn: false,
              })
              .subscribe((res) => {
                this.dialogRef.close();
              });
          } else {
            this.address.setErrors({ taken: true });
            this.submitted = false;
          }
        },
        error: (error) => {
          this.errorMessage = error.message;
          this.submitted = false;
        },
      });
    }
  }

  get name() {
    return this.form.get('name')!;
  }

  get address() {
    return this.form.get('address')!;
  }
}
