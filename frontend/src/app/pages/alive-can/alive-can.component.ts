import { WebsocketService } from 'src/app/communication/websocket.service';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-alive-can',
    templateUrl: './alive-can.component.html',
    styleUrls: ['./alive-can.component.scss'],
    standalone: false
})
export class AliveCanComponent implements OnInit {
  constructor(private wss: WebsocketService) {}
  addresses: string[] = [];
  ngOnInit() {
    this.wss.canAddressChange$.subscribe((addresses) => {
      this.addresses = addresses;
    });
  }
  reset() {
    this.wss.resetAddresses();
  }
}
