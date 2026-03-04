import { Injectable } from '@angular/core';
import { Observable, of, tap, shareReplay, finalize } from 'rxjs';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class CacheService {
  private cache = new Map<string, CacheEntry<unknown>>();
  private inFlightRequests = new Map<string, Observable<unknown>>();
  
  // Tempo padrão de expiração: 30 segundos
  private defaultTTL = 30000;

  /**
   * Wrapper para requisições com cache
   * @param key Chave única para o cache
   * @param request Observable da requisição HTTP
   * @param ttl Tempo de vida do cache em ms (padrão: 30s)
   */
  get<T>(key: string, request: () => Observable<T>, ttl: number = this.defaultTTL): Observable<T> {
    // Verificar se há dados em cache válidos
    const cached = this.cache.get(key) as CacheEntry<T> | undefined;
    if (cached && Date.now() - cached.timestamp < ttl) {
      console.log(`[Cache] Hit: ${key}`);
      return of(cached.data);
    }

    // Verificar se já há uma requisição em andamento para esta chave
    const inFlight = this.inFlightRequests.get(key) as Observable<T> | undefined;
    if (inFlight) {
      console.log(`[Cache] Reusing in-flight request: ${key}`);
      return inFlight;
    }

    // Fazer nova requisição e cachear
    console.log(`[Cache] Miss: ${key} - Fetching from server`);
    const observable = request().pipe(
      tap((data) => {
        this.cache.set(key, { data, timestamp: Date.now() });
      }),
      finalize(() => {
        this.inFlightRequests.delete(key);
      }),
      shareReplay(1)
    );

    this.inFlightRequests.set(key, observable);
    return observable;
  }

  /**
   * Invalida uma entrada específica do cache
   */
  invalidate(key: string): void {
    console.log(`[Cache] Invalidate: ${key}`);
    this.cache.delete(key);
  }

  /**
   * Invalida todas as entradas que começam com um prefixo
   */
  invalidateByPrefix(prefix: string): void {
    console.log(`[Cache] Invalidate by prefix: ${prefix}`);
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    console.log('[Cache] Clear all');
    this.cache.clear();
    this.inFlightRequests.clear();
  }
}
