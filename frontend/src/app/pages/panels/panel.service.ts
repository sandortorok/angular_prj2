import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Panel } from './panel.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PanelService {
  constructor(private http: HttpClient) {}
  private url = environment.backend_url + '/panel';

  getPanels() {
    return this.http.get<Panel[]>(this.url + '/all');
  }
}
