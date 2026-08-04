import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdherenceDay, Overview } from '../models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class StatsService extends ApiService {
  constructor(private http: HttpClient) {
    super();
  }

  getWeek(): Observable<AdherenceDay[]> {
    return this.http.get<AdherenceDay[]>(this.buildUrl('/api/stats/week'));
  }

  getMonth(
    year: number,
    month: number
  ): Observable<AdherenceDay[]> {
    return this.http.get<AdherenceDay[]>(
      this.buildUrl(`/api/stats/month/${year}/${month}`)
    );
  }

  getTrends(params?: {
    days?: number;
  }): Observable<AdherenceDay[]> {
    let httpParams = new HttpParams();
    if (params?.days) httpParams = httpParams.set('days', params.days);
    return this.http.get<AdherenceDay[]>(
      this.buildUrl('/api/stats/trends'),
      { params: httpParams }
    );
  }

  getStreak(): Observable<{ currentStreak: number; longestStreak: number }> {
    return this.http.get<{ currentStreak: number; longestStreak: number }>(
      this.buildUrl('/api/stats/streak')
    );
  }

  getOverview(): Observable<Overview> {
    return this.http.get<Overview>(this.buildUrl('/api/stats/overview'));
  }
}
