import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Beneficio, TransferRequest } from '../models/beneficio.model';

const NO_CACHE = {
  headers: new HttpHeaders({ 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }),
};

@Injectable({ providedIn: 'root' })
export class BeneficioService {
  private readonly apiUrl = 'http://localhost:8085/api/v1/beneficios';

  constructor(private http: HttpClient) {}

  listar(): Observable<Beneficio[]> {
    return this.http.get<Beneficio[]>(this.apiUrl, NO_CACHE);
  }

  buscarPorId(id: number): Observable<Beneficio> {
    return this.http.get<Beneficio>(`${this.apiUrl}/${id}`, NO_CACHE);
  }

  criar(beneficio: Beneficio): Observable<Beneficio> {
    return this.http.post<Beneficio>(this.apiUrl, beneficio);
  }

  atualizar(id: number, beneficio: Beneficio): Observable<Beneficio> {
    return this.http.put<Beneficio>(`${this.apiUrl}/${id}`, beneficio);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  transferir(transfer: TransferRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/transferir`, transfer);
  }
}
