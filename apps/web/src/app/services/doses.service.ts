import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DoseRecord, DoseWithMedication } from '../models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class DosesService extends ApiService {
  constructor(private http: HttpClient) {
    super();
  }

  getToday(): Observable<DoseWithMedication[]> {
    return this.http.get<DoseWithMedication[]>(
      this.buildUrl('/api/doses/today')
    );
  }

  getAll(params?: {
    medicationId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Observable<DoseWithMedication[]> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.medicationId)
        httpParams = httpParams.set('medicationId', params.medicationId);
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.limit) httpParams = httpParams.set('limit', params.limit);
      if (params.offset) httpParams = httpParams.set('offset', params.offset);
    }
    return this.http.get<DoseWithMedication[]>(
      this.buildUrl('/api/doses'),
      { params: httpParams }
    );
  }

  getByDate(date: string): Observable<DoseWithMedication[]> {
    return this.http.get<DoseWithMedication[]>(
      this.buildUrl(`/api/doses/date/${date}`)
    );
  }

  log(data: {
    medicationId: string;
    scheduleId?: string;
    scheduledTime?: string;
    status?: string;
    notes?: string;
  }): Observable<DoseRecord> {
    return this.http.post<DoseRecord>(
      this.buildUrl('/api/doses/log'),
      data
    );
  }

  update(id: string, data: Partial<DoseRecord>): Observable<DoseRecord> {
    return this.http.patch<DoseRecord>(
      this.buildUrl(`/api/doses/${id}`),
      data
    );
  }
}
