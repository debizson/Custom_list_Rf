import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  PriceComparisonResult,
  ProductSuggestion
} from '../models/shopping-list.model';

@Injectable({
  providedIn: 'root'
})
export class PriceCompareService {
  private readonly apiUrl = '/api/public/products';

  constructor(private readonly http: HttpClient) {}

  getSuggestions(query: string): Observable<ProductSuggestion[]> {
    const params = new HttpParams().set('query', query);

    return this.http.get<ProductSuggestion[]>(`${this.apiUrl}/suggestions`, {
      params
    });
  }

  compareProduct(query: string): Observable<PriceComparisonResult> {
    const params = new HttpParams().set('query', query);

    return this.http.get<PriceComparisonResult>(`${this.apiUrl}/compare`, {
      params
    });
  }
}
