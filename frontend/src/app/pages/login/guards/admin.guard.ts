import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { SnackService } from '../services/snack.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard  {
  constructor(
    private _auth: AuthService,
    private router: Router,
    private snack: SnackService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (!this._auth.isAdmin.getValue()) {
      this.snack.notAdmin();
      this.router.navigate(['login']);
    }
    return this._auth.isAdmin.getValue();
  }
}
