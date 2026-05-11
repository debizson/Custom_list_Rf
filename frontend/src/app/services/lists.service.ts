import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  CreateItemRequest,
  CreateListRequest,
  ListDetails,
  ShoppingItem,
  ShoppingList,
  UpdateItemRequest
} from '../models/shopping-list.model';

@Injectable({
  providedIn: 'root'
})
export class ListsService {
  private readonly apiUrl = '/api/lists';

  constructor(private readonly http: HttpClient) {}

  getLists(): Observable<ShoppingList[]> {
    return this.http.get<ShoppingList[]>(this.apiUrl);
  }

  getList(id: string): Observable<ListDetails> {
    return this.http.get<ListDetails>(`${this.apiUrl}/${id}`);
  }

  createList(payload: CreateListRequest): Observable<ShoppingList> {
    return this.http.post<ShoppingList>(this.apiUrl, payload);
  }

  updateList(id: string, payload: CreateListRequest): Observable<ShoppingList> {
    return this.http.put<ShoppingList>(`${this.apiUrl}/${id}`, payload);
  }

  deleteList(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  getItems(listId: string): Observable<ShoppingItem[]> {
    return this.http.get<ShoppingItem[]>(`${this.apiUrl}/${listId}/items`);
  }

  createItem(listId: string, payload: CreateItemRequest): Observable<ShoppingItem> {
    return this.http.post<ShoppingItem>(`${this.apiUrl}/${listId}/items`, payload);
  }

  updateItem(
    listId: string,
    itemId: string,
    payload: UpdateItemRequest
  ): Observable<ShoppingItem> {
    return this.http.put<ShoppingItem>(
      `${this.apiUrl}/${listId}/items/${itemId}`,
      payload
    );
  }

  deleteItem(listId: string, itemId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/${listId}/items/${itemId}`
    );
  }

  reorderItems(listId: string, itemIds: string[]): Observable<ShoppingItem[]> {
    return this.http.put<ShoppingItem[]>(`${this.apiUrl}/${listId}/reorder`, {
      itemIds
    });
  }
}
