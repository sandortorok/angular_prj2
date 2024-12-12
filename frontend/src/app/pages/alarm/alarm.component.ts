import { MessagesService } from './messages.service';
import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { WebsocketService } from 'src/app/communication/websocket.service';

@Component({
    selector: 'app-alarm',
    templateUrl: './alarm.component.html',
    styleUrls: ['./alarm.component.scss'],
    standalone: false
})
export class AlarmComponent {
  // MatPaginator Output
  //pageEvent: PageEvent;
  items: Array<{ message: string; timestamp: Date }> = [];
  activePageDataChunk: Array<{ message: string; timestamp: Date }> = [];

  pageSize = 25;
  pageSizeOptions: number[] = [5, 10, 25, 100];

  constructor(
    private messageService: MessagesService,
    private wss: WebsocketService
  ) {
    this.messageService.getMessages().subscribe((res) => {
      this.items = res.map((item) => {
        item.timestamp = new Date(item.timestamp);
        return item;
      });
      this.activePageDataChunk = this.items.slice(0, this.pageSize);
    });
    this.wss.incomingMessages.subscribe((msg) => {
      if (msg.message != '') {
        this.items.push(msg);
        this.activePageDataChunk = this.items.slice(0, this.pageSize);
      }
    });
  }

  setPageSizeOptions(setPageSizeOptionsInput: string) {
    this.pageSizeOptions = setPageSizeOptionsInput
      .split(',')
      .map((str) => +str);
  }

  onPageChanged(e: PageEvent) {
    let firstCut = e.pageIndex * e.pageSize;
    let secondCut = firstCut + e.pageSize;
    this.activePageDataChunk = this.items.slice(firstCut, secondCut);
  }
}
