import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item } from '../models/item.model';

@Injectable({ providedIn: 'root' })
export class ItemService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  buscarPorCodigo(codigo: string): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.apiUrl}/items?codigo=${codigo}`);
  }
}
