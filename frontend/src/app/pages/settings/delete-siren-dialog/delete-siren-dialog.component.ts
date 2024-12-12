import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Siren } from '../../sirens/siren.model';
import { SirenService } from '../../sirens/siren.service';

@Component({
    selector: 'delete-siren-dialog',
    styleUrls: ['delete-siren-dialog.component.scss'],
    templateUrl: 'delete-siren-dialog.component.html',
    standalone: false
})
export class DeleteSirenDialogComponent implements OnInit {
  errorMessage?: string;
  sirens: Siren[] = [];
  selectedSiren?: Siren;

  submitted: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<DeleteSirenDialogComponent>,
    private sirenService: SirenService
  ) {}
  ngOnInit(): void {
    this.sirenService.getSirens().subscribe((sirens) => {
      this.sirens = sirens;
    });
  }
  submit() {
    if (!this.selectedSiren || !this.selectedSiren.id) return;
    this.submitted = true;
    this.sirenService.deleteSiren(this.selectedSiren.id).subscribe({
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
