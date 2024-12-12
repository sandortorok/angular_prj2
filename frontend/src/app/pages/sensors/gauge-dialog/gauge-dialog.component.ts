import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'gauge-dialog',
    templateUrl: 'gauge-dialog.component.html',
    standalone: false
})
export class SensorDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<SensorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: number
  ) {}
}
