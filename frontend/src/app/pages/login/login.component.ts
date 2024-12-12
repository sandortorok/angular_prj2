import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { SnackService } from './services/snack.service';
import { Subject, takeUntil } from 'rxjs';
import { WebsocketService } from 'src/app/communication/websocket.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: false
})
export class LoginComponent implements OnInit, OnDestroy {
  loginUserData = { username: '', password: '' };
  invalidCredentials: boolean = false;
  message: string = '';
  authForm!: FormGroup;
  loggedIn = false;
  wsAlive = false;
  private ngUnsubscribe = new Subject<void>();

  constructor(
    private _auth: AuthService,
    private _router: Router,
    private snack: SnackService,
    private wss: WebsocketService
  ) {}

  ngOnInit(): void {
    this.authForm = new FormGroup({
      username: new FormControl(this.loginUserData.username, [
        Validators.required,
        Validators.minLength(4),
      ]),
      password: new FormControl(this.loginUserData.password),
    });
    this._auth.loginChange$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((loggedInChanged) => {
        this.loggedIn = loggedInChanged;
      });
    this.wss.wsConnectionChange$.subscribe((res) => {
      this.wsAlive = res;
    });
  }

  get username() {
    return this.authForm.get('username');
  }

  get password() {
    return this.authForm.get('password');
  }

  loginUser() {
    let res = this._auth.login(this.username?.value, this.password?.value);
    if (res === false) {
      this.snack.wrongCredentials();
    } else {
      this._router.navigate(['sensors']);
    }
    this.username?.reset('');
    this.password?.reset('');
  }
  logout() {
    this._auth.isAdmin.next(false);
    this._auth.loggedIn.next(false);
  }
  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
