import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Siren } from '../../sirens/siren.model';
import { SirenService } from '../../sirens/siren.service';

@Component({
    selector: 'update-siren-dialog',
    styleUrls: ['update-siren-dialog.component.scss'],
    templateUrl: 'update-siren-dialog.component.html',
    standalone: false
})
export class UpdateSirenDialogComponent implements OnInit {
  sirens: Siren[] = [];
  selectedSiren?: Siren;

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
    public dialogRef: MatDialogRef<UpdateSirenDialogComponent>,
    private sirenService: SirenService
  ) {}
  ngOnInit(): void {
    this.sirenService.getSirens().subscribe((sirens) => {
      this.sirens = sirens;
    });
  }
  newSelected(sName: string) {
    let selectedSiren = this.sirens.find(
      (curSiren) => curSiren.name === sName
    )!;
    this.selectedSiren = { ...selectedSiren };
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
    if (this.newAddress.value && this.newName.value && this.selectedSiren) {
      this.sirenService
        .updateSiren(this.selectedSiren.id!, this.selectedSiren)
        .subscribe({
          next: (siren) => {
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
