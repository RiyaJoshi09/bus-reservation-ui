import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminProfileResponse, AdminProfileUpdate } from '../models/admin.models';
import { UserProfile, UserProfileUpdate } from '../models/user.models';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);
  private userUrl = `${environment.apiUrl}/user/profile`;
  private adminUrl = `${environment.apiUrl}/admin/profile`;

  getUser(): Observable<UserProfile> {
    return this.http.get<UserProfile>(this.userUrl);
  }
  updateUser(body: UserProfileUpdate): Observable<object> {
    return this.http.patch(this.userUrl, body);
  }
  deleteUser(): Observable<string> {
    return this.http.delete(this.userUrl, { responseType: 'text' });
  }

  getAdmin(): Observable<AdminProfileResponse> {
    return this.http.get<AdminProfileResponse>(this.adminUrl);
  }
  updateAdmin(body: AdminProfileUpdate): Observable<object> {
    return this.http.patch(this.adminUrl, body);
  }
  deleteAdmin(): Observable<string> {
    return this.http.delete(this.adminUrl, { responseType: 'text' });
  }
}