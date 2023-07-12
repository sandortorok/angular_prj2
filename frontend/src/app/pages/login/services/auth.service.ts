import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor() {}
  loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  loginChange$: Observable<boolean> = this.loggedIn.asObservable();
  isAdmin: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  adminChange$: Observable<boolean> = this.isAdmin.asObservable();

  login(name: string, password: string): boolean {
    console.log(name, password);
    if (name === 'sanyi' && password === 'sakkiraly11') {
      console.log('logging in');
      this.loggedIn.next(true);
      this.isAdmin.next(true);
      return true;
    }
    if (name === 'kwstop' && password === 'kwstop08') {
      this.loggedIn.next(true);
      this.isAdmin.next(false);

      return true;
    }
    if (name === '' && password === '') {
      this.loggedIn.next(true);
      this.isAdmin.next(false);
      return true;
    }
    this.loggedIn.next(false);
    this.isAdmin.next(false);
    return false;
  }
}
