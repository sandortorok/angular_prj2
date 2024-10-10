import { Component } from '@angular/core';
import { PanelService } from '../../panels/panel.service';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Panel } from '../../panels/panel.model';

@Component({
  selector: 'app-update-panel-dialog',
  templateUrl: './update-panel-dialog.component.html',
  styleUrls: ['./update-panel-dialog.component.scss'],
})
export class UpdatePanelDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<UpdatePanelDialogComponent>,
    private panelService: PanelService
  ) {}
  panels: Panel[] = [];

  selectedPanel?: Panel;
  form = new FormGroup({
    newAddress: new FormControl('', [
      Validators.required,
      Validators.min(0),
      Validators.max(255),
    ]),
  });
  errorMessage?: string;
  submitted: boolean = false;
  ngOnInit(): void {
    this.panelService.getPanels().subscribe((panels) => {
      this.panels = panels;
    });
  }
  newSelected(pId: Number) {
    let selectedPanel = this.panels.find((curSensor) => curSensor.id === pId)!;
    this.selectedPanel = { ...selectedPanel };
  }
  submit() {
    console.log('submit');
    if (!this.form.valid) {
      Object.keys(this.form.controls).forEach((field) => {
        const control = this.form.get(field);
        control!.markAsTouched({ onlySelf: true });
      });
      return;
    }
    this.submitted = true;
    if (this.newAddress.value && this.selectedPanel) {
      console.log('updating', this.selectedPanel);
      this.panelService
        .updatePanel(this.selectedPanel.id!, this.selectedPanel)
        .subscribe({
          next: (panel) => {
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
  get newAddress() {
    return this.form.get('newAddress')!;
  }
}
