import { Component, OnDestroy, OnInit } from '@angular/core';
import { swingAnimation } from 'angular-animations';
import { SirenService } from './siren.service';
import { WebsocketService } from 'src/app/communication/websocket.service';
import { Subject, takeUntil } from 'rxjs';
import { Siren } from './siren.model';
import { AuthService } from '../login/services/auth.service';

@Component({
    selector: 'app-sirens',
    templateUrl: './sirens.component.html',
    styleUrls: ['./sirens.component.scss'],
    animations: [swingAnimation()],
    standalone: false
})
export class SirensComponent implements OnInit, OnDestroy {
  constructor(
    private sirenService: SirenService,
    private wss: WebsocketService,
    private _auth: AuthService
  ) {}

  isAdmin = false;
  isTest = false;
  private ngUnsubscribe = new Subject<void>();
  sirens: Siren[] = [];
  changeSiren(event, siren) {
    siren.muted = event.source._checked;
    if (siren.id > 2) {
      this.sirens.map((sirenElement) => {
        if (sirenElement.address === siren.address)
          sirenElement.muted = siren.muted;
        return sirenElement;
      });
    }
    this.wss.changeSirenMute({
      name: siren.name,
      muted: siren.muted,
      panelId: siren.panelId,
    });
  }

  animationState = false;
  ngOnInit() {
    this._auth.adminChange$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((adminChanged) => {
        this.isAdmin = adminChanged;
      });
    this.wss.testModeChange(false);
    this.sirenService.getSirens().subscribe((res) => {
      this.sirens = res;
    });
    this.wss.sirenChange$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((changedSiren) => {
        this.sirens.forEach((siren) => {
          if (siren.name === changedSiren.sirenName) {
            siren.isOn = changedSiren.isOn;
          }
        });
      });
    this.animate();
  }
  animate() {
    setInterval(() => {
      this.animationState = false;
      setTimeout(() => {
        this.animationState = true;
      }, 10);
    }, 2000);
  }
  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  changed(event) {
    console.log(event);
  }
  testModeChanged(value) {
    this.isTest = value;
    this.wss.testModeChange(value);
  }
  testSirenChanged(e, siren: Siren) {
    this.wss.changeSirenMute({
      name: siren.name,
      on: !!e.value,
      muted: siren.muted,
      panelId: siren.panelId,
    });
  }
}
