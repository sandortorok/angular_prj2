import { DeleteSensorDialogComponent } from './delete-sensor-dialog/delete-sensor-dialog.component';
import { UpdateSensorDialogComponent } from './update-sensor-dialog/update-sensor-dialog.component';
import { CreateSensorDialogComponent } from './create-sensor-dialog/create-sensor-dialog.component';
import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CreateSirenDialogComponent } from './create-siren-dialog/create-siren-dialog.component';
import { UpdateSirenDialogComponent } from './update-siren-dialog/update-siren-dialog.component';
import { DeleteSirenDialogComponent } from './delete-siren-dialog/delete-siren-dialog.component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  constructor(private dialog: MatDialog) {}
  openCreateSensorDialog() {
    let dialogRef = this.dialog.open(CreateSensorDialogComponent);
  }
  openUpdateSensorDialog() {
    let dialogRef = this.dialog.open(UpdateSensorDialogComponent);
  }
  openDeleteSensorDialog() {
    let dialogRef = this.dialog.open(DeleteSensorDialogComponent);
  }
  openCreateSirenDialog() {
    let dialogRef = this.dialog.open(CreateSirenDialogComponent);
  }
  openUpdateSirenDialog() {
    let dialogRef = this.dialog.open(UpdateSirenDialogComponent);
  }
  openDeleteSirenDialog() {
    let dialogRef = this.dialog.open(DeleteSirenDialogComponent);
  }
}
