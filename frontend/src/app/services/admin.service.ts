import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AppUser } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly apiUrl = '/api/admin/users';

  constructor(private readonly http: HttpClient) {}

  getUsers(): Observable<AppUser[]> {
    return this.http.get<AppUser[]>(this.apiUrl);
  }

  deleteUser(userId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${userId}`);
  }
}
