import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Refill, SupplyStatus } from '../models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class RefillsService extends ApiService {
  constructor(private http: HttpClient) {
    super();
  }

  getByMedication(medicationId: string): Observable<Refill[]> {
    return this.http.get<Refill[]>(
      this.buildUrl(`/api/medications/${medicationId}/refills`)
    );
  }

  getSupply(medicationId: string): Observable<SupplyStatus> {
    return this.http.get<SupplyStatus>(
      this.buildUrl(`/api/medications/${medicationId}/supply`)
    );
  }

  create(
    medicationId: string,
    data: Partial<Refill>
  ): Observable<Refill> {
    return this.http.post<Refill>(
      this.buildUrl(`/api/medications/${medicationId}/refills`),
      data
    );
  }

  update(id: string, data: Partial<Refill>): Observable<Refill> {
    return this.http.patch<Refill>(
      this.buildUrl(`/api/refills/${id}`),
      data
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(this.buildUrl(`/api/refills/${id}`));
  }
}
