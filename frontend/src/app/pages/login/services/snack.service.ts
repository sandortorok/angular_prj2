import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SnackService {
  constructor(private snackBar: MatSnackBar, private router: Router) {}

  authError() {
    this.snackBar.open('Az oldal megjelenítéséhez jelentkezz be!', 'OK', {
      duration: 5000,
    });
    return this.snackBar._openedSnackBarRef
      ?.onAction()
      .pipe(
        tap((_) => {
          this.router.navigate(['/login']);
        })
      )
      .subscribe();
  }
  wrongCredentials() {
    this.snackBar.open('Rossz felhasználónév vagy jelszó!', 'OK', {
      duration: 5000,
    });
    return this.snackBar._openedSnackBarRef
      ?.onAction()
      .pipe(
        tap((_) => {
          this.router.navigate(['/login']);
        })
      )
      .subscribe();
  }
  notAdmin() {
    this.snackBar.open(
      'Az oldal megjelenítéséhez jelentkezz be egy admin fiókba!',
      'OK',
      {
        duration: 5000,
      }
    );
    return this.snackBar._openedSnackBarRef
      ?.onAction()
      .pipe(
        tap((_) => {
          this.router.navigate(['/login']);
        })
      )
      .subscribe();
  }
}
