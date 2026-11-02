import { Injectable, computed, inject, signal } from '@angular/core';
import { UserRegisterRequest } from '../models/user.models';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class UserService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/user`;

    register(request: UserRegisterRequest): Observable<unknown> {
        return this.http.post(`${this.baseUrl}/register`, request);
    }
}