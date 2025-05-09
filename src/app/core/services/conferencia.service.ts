import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Conferencia } from '../models/conferencia.model';

@Injectable({ providedIn: 'root' })
export class ConferenciaService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  criar(conf: Conferencia): Observable<Conferencia> {
    return this.http.post<Conferencia>(`${this.apiUrl}/conferencias`, conf);
  }

  listarPorNota(notaId: number): Observable<Conferencia[]> {
    return this.http.get<Conferencia[]>(`${this.apiUrl}/conferencias?notaId=${notaId}`);
  }
}

