import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Siren } from './siren.model';

@Injectable()
export class SirenService {
  private url = environment.backend_url + '/siren';
  constructor(private http: HttpClient) {}

  getSirens() {
    return this.http.get<Siren[]>(this.url + '/all');
  }

  updateSirenName(siren: Siren) {
    return this.http.patch(this.url + '/name/' + siren.id, {
      name: siren.name,
    });
  }
  updateMuted(id: number, muted: boolean) {
    return this.http.patch(this.url + '/muted/' + id, {
      muted: muted,
    });
  }
  updateSiren(id: number, siren: Siren) {
    return this.http.put(this.url + '/' + id, {
      siren: siren,
    });
  }
  createSiren(siren: Siren) {
    return this.http.post(this.url, { siren });
  }

  isNameTaken(name: string) {
    return this.http.get(this.url + `/nametaken/${name}`);
  }
  deleteSiren(id: number) {
    return this.http.delete(this.url + `/${id}`);
  }
}
