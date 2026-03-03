import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Beneficio, TransferRequest } from '../models/beneficio.model';
import { CacheService } from '../cache/cache.service';

const NO_CACHE_HEADERS = {
  headers: new HttpHeaders({ 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }),
};

const CACHE_KEYS = {
  LIST: 'beneficios:list',
  DETAIL: (id: number) => `beneficios:detail:${id}`,
};

@Injectable({ providedIn: 'root' })
export class BeneficioService {
  private readonly apiUrl = 'http://localhost:8085/api/v1/beneficios';
  private readonly http = inject(HttpClient);
  private readonly cache = inject(CacheService);

  // TTL de 60 segundos para a lista
  private readonly listTTL = 60000;

  listar(): Observable<Beneficio[]> {
    return this.cache.get(
      CACHE_KEYS.LIST,
      () => this.http.get<Beneficio[]>(this.apiUrl, NO_CACHE_HEADERS),
      this.listTTL
    );
  }

  buscarPorId(id: number): Observable<Beneficio> {
    return this.cache.get(
      CACHE_KEYS.DETAIL(id),
      () => this.http.get<Beneficio>(`${this.apiUrl}/${id}`, NO_CACHE_HEADERS),
      this.listTTL
    );
  }

  criar(beneficio: Beneficio): Observable<Beneficio> {
    return this.http.post<Beneficio>(this.apiUrl, beneficio).pipe(
      tap(() => this.cache.invalidate(CACHE_KEYS.LIST))
    );
  }

  atualizar(id: number, beneficio: Beneficio): Observable<Beneficio> {
    return this.http.put<Beneficio>(`${this.apiUrl}/${id}`, beneficio).pipe(
      tap(() => {
        this.cache.invalidate(CACHE_KEYS.LIST);
        this.cache.invalidate(CACHE_KEYS.DETAIL(id));
      })
    );
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.cache.invalidate(CACHE_KEYS.LIST);
        this.cache.invalidate(CACHE_KEYS.DETAIL(id));
      })
    );
  }

  transferir(transfer: TransferRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/transferir`, transfer).pipe(
      tap(() => {
        this.cache.invalidate(CACHE_KEYS.LIST);
        this.cache.invalidate(CACHE_KEYS.DETAIL(transfer.fromId));
        this.cache.invalidate(CACHE_KEYS.DETAIL(transfer.toId));
      })
    );
  }

  // Força atualização do cache
  invalidateCache(): void {
    this.cache.invalidateByPrefix('beneficios:');
  }
}
