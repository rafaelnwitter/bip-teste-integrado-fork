import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize, timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Beneficio } from '../../models/beneficio.model';
import { BeneficioService } from '../../services/beneficio.service';

@Component({
  selector: 'app-beneficio-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './beneficio-list.html',
  styleUrl: './beneficio-list.css',
})
export class BeneficioListComponent implements OnInit {
  beneficios: Beneficio[] = [];
  loading = false;
  erro = '';
  dialogVisivel = false;
  idParaDeletar: number | null = null;

  constructor(private service: BeneficioService) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.loading = true;
    this.erro = '';
    this.service.listar()
      .pipe(
        timeout(5000),
        catchError((err) => {
          this.erro = 'Erro ao carregar benefícios';
          console.error('Erro ao carregar:', err);
          return of([] as Beneficio[]);
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe({
        next: (data) => {
          this.beneficios = data;
        },
      });
  }

  onDeletar(id: number): void {
    this.idParaDeletar = id;
    this.dialogVisivel = true;
  }

  confirmarDelete(): void {
    if (this.idParaDeletar) {
      this.service.deletar(this.idParaDeletar).subscribe({
        next: () => {
          this.dialogVisivel = false;
          this.carregar();
        },
        error: () => {
          this.erro = 'Erro ao deletar';
          this.dialogVisivel = false;
        },
      });
    }
  }

  cancelarDelete(): void {
    this.dialogVisivel = false;
    this.idParaDeletar = null;
  }
}
