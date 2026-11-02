import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AgreementStatus, ProviderApproval, ProviderRegisterRequest, ProviderResponse,
} from '../models/provider.models';

@Injectable({ providedIn: 'root' })
export class ProviderService {
  private http = inject(HttpClient);

  // ASSUMED paths. Fix them here, nowhere else.
  private publicUrl = `${environment.apiUrl}/providers`;
  private adminUrl = `${environment.apiUrl}/admin/providers`;

  register(request: ProviderRegisterRequest): Observable<unknown> {
    return this.http.post(`${this.publicUrl}/register`, request);
  }

  getAll(): Observable<ProviderResponse[]> {
    return this.http.get<ProviderResponse[]>(this.adminUrl);
  }

  updateAgreement(id: string, status: AgreementStatus): Observable<unknown> {
    const body: ProviderApproval = { agreementStatus: status };
    return this.http.patch(`${this.adminUrl}/${id}/agreement`, body);
  }
}