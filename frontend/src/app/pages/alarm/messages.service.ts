import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  private url = environment.backend_url + '/errormessage';

  constructor(private http: HttpClient) {}
  getMessages() {
    return this.http.get<
      Array<{ id: number; message: string; timestamp: Date }>
    >(this.url + '/all');
  }
}
