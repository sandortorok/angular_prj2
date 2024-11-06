import { Injectable, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
type customDate = { date: string; hour?: number };
@Injectable()
export class SensorHistoryService {
  private url = environment.backend_url + '/sensor-history';

  constructor(private http: HttpClient) {}
  getYear(date: customDate) {
    return this.http.get<Array<Object>>(this.url + '/year/' + date.date);
  }
  getMonthly(date: customDate) {
    return this.http.get<Array<Object>>(this.url + '/month/' + date.date);
  }
  getWeekly(date: customDate) {
    return this.http.get<Array<Object>>(this.url + '/week/' + date.date);
  }
  getDaily(date: customDate) {
    return this.http.get<Array<Object>>(this.url + '/day/' + date.date);
  }
  getHourly(date: customDate) {
    return this.http.get<Array<Object>>(
      this.url + '/hour/' + date.date + '/' + date.hour!
    );
  }
}
