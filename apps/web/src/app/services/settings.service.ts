import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserSettings } from '../models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class SettingsService extends ApiService {
  constructor(private http: HttpClient) {
    super();
  }

  get(): Observable<UserSettings> {
    return this.http.get<UserSettings>(this.buildUrl('/api/settings'));
  }

  update(data: Partial<UserSettings>): Observable<UserSettings> {
    return this.http.patch<UserSettings>(
      this.buildUrl('/api/settings'),
      data
    );
  }
}
