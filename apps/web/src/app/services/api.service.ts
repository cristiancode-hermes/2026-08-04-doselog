import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiService {
  readonly apiUrl = '';

  protected buildUrl(path: string): string {
    return `${this.apiUrl}${path}`;
  }
}
