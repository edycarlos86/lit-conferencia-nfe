/* import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UsuarioResponse {
  id: number;
  nome: string;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000'; // endpoint do JSON de teste

  constructor(private http: HttpClient) {}

  login(usuario: string, senha: string): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(`${this.apiUrl}/login`, { usuario, senha });
  }
} */


// src/app/core/services/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// importe o environment no caminho correto:
import { environment } from '../../../environments/environment';

// mantenha a sua interface:
export interface UsuarioResponse {
  id: number;
  nome: string;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // use o API URL do environment:
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // tipamos o retorno como UsuarioResponse
  login(usuario: string, senha: string): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(
      `${this.baseUrl}/login`,
      { usuario, senha }
    );
  }
}
