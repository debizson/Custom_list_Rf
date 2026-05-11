import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  ShoppingCategory,
  ShoppingStore
} from '../models/shopping-list.model';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  constructor(private readonly http: HttpClient) {}

  getCategories(): Observable<ShoppingCategory[]> {
    return this.http.get<ShoppingCategory[]>('/api/categories');
  }

  createCategory(name: string): Observable<ShoppingCategory> {
    return this.http.post<ShoppingCategory>('/api/categories', { name });
  }

  deleteCategory(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`/api/categories/${id}`);
  }

  getStores(): Observable<ShoppingStore[]> {
    return this.http.get<ShoppingStore[]>('/api/stores');
  }

  createStore(name: string): Observable<ShoppingStore> {
    return this.http.post<ShoppingStore>('/api/stores', { name });
  }

  deleteStore(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`/api/stores/${id}`);
  }
}
