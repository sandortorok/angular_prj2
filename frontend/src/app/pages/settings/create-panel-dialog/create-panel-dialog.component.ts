import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Panel } from '../../panels/panel.model';
import { PanelService } from '../../panels/panel.service';

@Component({
    selector: 'app-create-panel-dialog',
    templateUrl: './create-panel-dialog.component.html',
    styleUrls: ['./create-panel-dialog.component.scss'],
    standalone: false
})
export class CreatePanelDialogComponent {
  panels: Panel[] = [];
  selectedPanel?: Panel;
  submitted: boolean = false;
  errorMessage?: string;

  form = new FormGroup({
    address: new FormControl(
      '',
      [Validators.required, Validators.min(0), Validators.max(255)],
      []
    ),
  });
  constructor(
    public dialogRef: MatDialogRef<CreatePanelDialogComponent>,
    private panelService: PanelService
  ) {}
  ngOnInit(): void {
    this.panelService.getPanels().subscribe((panels) => {
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

    if (this.address.value && this.selectedPanel) {
      this.panelService
        .isAddressTaken(+this.address.value, this.selectedPanel.id)
        .subscribe({
          next: (addressTaken) => {
            if (addressTaken) {
              this.address.setErrors({ taken: true });
              this.submitted = false;
            }
            if (!addressTaken) {
              this.panelService
                .createPanel({ address: +this.address.value!, path: 'xd' })
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
  get address() {
    return this.form.get('address')!;
  }
}
