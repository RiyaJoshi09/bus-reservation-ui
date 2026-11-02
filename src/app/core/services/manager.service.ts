import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminCreate } from '../models/admin.models';

@Injectable({ providedIn: 'root' })
export class ManagerService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/admin`;

  create(request: AdminCreate): Observable<object> {
    return this.http.post(`${this.url}/create-admin`, request);
  }
}