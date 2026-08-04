import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Schedule } from '../models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class SchedulesService extends ApiService {
  constructor(private http: HttpClient) {
    super();
  }

  getByMedication(medicationId: string): Observable<Schedule[]> {
    return this.http.get<Schedule[]>(
      this.buildUrl(`/api/medications/${medicationId}/schedules`)
    );
  }

  create(
    medicationId: string,
    data: Partial<Schedule>
  ): Observable<Schedule> {
    return this.http.post<Schedule>(
      this.buildUrl(`/api/medications/${medicationId}/schedules`),
      data
    );
  }

  update(id: string, data: Partial<Schedule>): Observable<Schedule> {
    return this.http.patch<Schedule>(
      this.buildUrl(`/api/schedules/${id}`),
      data
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(this.buildUrl(`/api/schedules/${id}`));
  }
}
