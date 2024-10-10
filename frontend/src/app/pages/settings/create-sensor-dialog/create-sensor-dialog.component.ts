import { MessagesService } from './../../alarm/messages.service';
import { SensorService } from 'src/app/pages/sensors/sensor.service';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { combineLatest } from 'rxjs';
import { PanelService } from '../../panels/panel.service';
import { Panel } from '../../panels/panel.model';

@Component({
  selector: 'create-sensor-dialog',
  styleUrls: ['create-sensor-dialog.component.scss'],
  templateUrl: 'create-sensor-dialog.component.html',
})
export class CreateSensorDialogComponent {
  panels: Panel[] = [];
  selectedPanel?: Panel;
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
    private sensorService: SensorService,
    private panelSerive: PanelService
  ) {}
  ngOnInit(): void {
    this.panelSerive.getPanels().subscribe((panels) => {
      console.log(panels);
      this.panels = panels;
    });
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

    if (this.address.value && this.selectedPanel && this.name.value) {
      combineLatest([
        this.sensorService.isNameTaken(this.name.value, this.selectedPanel.id!),
        this.sensorService.isAddressTaken(
          +this.address.value,
          this.selectedPanel.id
        ),
      ]).subscribe({
        next: ([nameTaken, addressTaken]) => {
          if (nameTaken) {
            this.name.setErrors({ taken: true });
            this.submitted = false;
          }
          if (addressTaken) {
            this.address.setErrors({ taken: true });
            this.submitted = false;
          }
          if (!nameTaken && !addressTaken) {
            this.sensorService
              .createSensor({
                name: this.name.value!,
                address: +this.address.value!,
                horn: false,
                panelId: this.selectedPanel!.id!,
              })
              .subscribe((res) => {
                this.dialogRef.close();
              });
          }
        },
        error: (error) => {
          this.errorMessage = error.message;
          this.submitted = false;
        },
      });
    }
  }
  newSelected(sId) {
    let selectedPanel = this.panels.find((curSensor) => curSensor.id === sId)!;
    this.selectedPanel = { ...selectedPanel };
  }
  get name() {
    return this.form.get('name')!;
  }

  get address() {
    return this.form.get('address')!;
  }
}
