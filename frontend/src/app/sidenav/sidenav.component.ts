import { AuthService } from 'src/app/pages/login/services/auth.service';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router, NavigationEnd } from '@angular/router';
import { Subject, delay, filter, takeUntil } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BreakpointObserver } from '@angular/cdk/layout';

@UntilDestroy()
@Component({
    selector: 'app-sidenav',
    templateUrl: './sidenav.component.html',
    styleUrls: ['./sidenav.component.scss'],
    standalone: false
})
export class SidenavComponent implements OnInit, OnDestroy {
  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;
  loggedIn = false;
  isAdmin = false;
  private ngUnsubscribe = new Subject<void>();

  constructor(
    private observer: BreakpointObserver,
    private router: Router,
    private _auth: AuthService
  ) {}
  ngOnInit() {
    this._auth.loginChange$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((loggedInChanged) => {
        this.loggedIn = loggedInChanged;
      });
    this._auth.adminChange$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((adminChanged) => {
        this.isAdmin = adminChanged;
      });
  }
  ngAfterViewInit() {
    this.observer
      .observe(['(max-width: 800px)'])
      .pipe(delay(1), untilDestroyed(this))
      .subscribe((res: any) => {
        if (res.matches) {
          this.sidenav.mode = 'over';
          this.sidenav.close();
        } else {
          this.sidenav.mode = 'side';
          this.sidenav.open();
        }
      });

    this.router.events
      .pipe(
        untilDestroyed(this),
        filter((e) => e instanceof NavigationEnd)
      )
      .subscribe(() => {
        if (this.sidenav.mode === 'over') {
          this.sidenav.close();
        }
      });
  }
  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
