import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Nota } from '../models/nota.model';

@Injectable({ providedIn: 'root' })
export class NotaService {
  private apiUrl = 'http://localhost:3000'; // JSON Server

  constructor(private http: HttpClient) {}

  listarNotas(): Observable<Nota[]> {
    return this.http.get<Nota[]>(`${this.apiUrl}/notas`);
  }
}
