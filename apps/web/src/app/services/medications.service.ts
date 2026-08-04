import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medication } from '../models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class MedicationsService extends ApiService {
  constructor(private http: HttpClient) {
    super();
  }

  getAll(): Observable<Medication[]> {
    return this.http.get<Medication[]>(this.buildUrl('/api/medications'));
  }

  getArchived(): Observable<Medication[]> {
    return this.http.get<Medication[]>(
      this.buildUrl('/api/medications/archived')
    );
  }

  getById(id: string): Observable<Medication> {
    return this.http.get<Medication>(
      this.buildUrl(`/api/medications/${id}`)
    );
  }

  create(data: Partial<Medication>): Observable<Medication> {
    return this.http.post<Medication>(
      this.buildUrl('/api/medications'),
      data
    );
  }

  update(id: string, data: Partial<Medication>): Observable<Medication> {
    return this.http.patch<Medication>(
      this.buildUrl(`/api/medications/${id}`),
      data
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(
      this.buildUrl(`/api/medications/${id}`)
    );
  }

  unarchive(id: string): Observable<Medication> {
    return this.http.patch<Medication>(
      this.buildUrl(`/api/medications/${id}/unarchive`),
      {}
    );
  }

  getStats(id: string): Observable<{
    adherence: number;
    streak: number;
    totalDoses: number;
    takenDoses: number;
  }> {
    return this.http.get<{
      adherence: number;
      streak: number;
      totalDoses: number;
      takenDoses: number;
    }>(this.buildUrl(`/api/medications/${id}/stats`));
  }
}
