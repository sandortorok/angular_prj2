import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SirenService } from '../../sirens/siren.service';

@Component({
  selector: 'create-siren-dialog',
  styleUrls: ['create-siren-dialog.component.scss'],
  templateUrl: 'create-siren-dialog.component.html',
})
export class CreateSirenDialogComponent {
  submitted: boolean = false;
  errorMessage?: string;

  form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    address: new FormControl('', [Validators.required], []),
  });
  constructor(
    public dialogRef: MatDialogRef<CreateSirenDialogComponent>,
    private sirenService: SirenService
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

    if (this.name.value && this.address.value) {
      this.sirenService.isNameTaken(this.name.value).subscribe({
        next: (isTaken) => {
          if (!isTaken) {
            this.sirenService
              .createSiren({
                name: this.name.value!,
                address: this.address.value!,
                muted: false,
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
