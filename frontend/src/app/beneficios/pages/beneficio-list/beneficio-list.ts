import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { 
  Beneficio, 
  BeneficioService, 
  CardComponent, 
  ButtonComponent, 
  ConfirmDialogComponent, 
  LoadingComponent 
} from 'shared';

@Component({
  selector: 'app-beneficio-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    CardComponent,
    ButtonComponent,
    ConfirmDialogComponent,
    LoadingComponent
  ],
  templateUrl: './beneficio-list.html',
  styleUrl: './beneficio-list.css',
})
export class BeneficioListComponent implements OnInit {
  private readonly service = inject(BeneficioService);
  private readonly router = inject(Router);

  beneficios: Beneficio[] = [];
  loading = true;
  erro = '';
  dialogVisivel = false;
  idParaDeletar: number | null = null;

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.loading = true;
    this.erro = '';
    this.service.listar().pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (data) => this.beneficios = data,
      error: () => this.erro = 'Erro ao carregar benefícios'
    });
  }

  onEditar(beneficio: Beneficio): void {
    this.router.navigate(['/beneficios/editar', beneficio.id]);
  }

  onDeletar(id: number): void {
    this.idParaDeletar = id;
    this.dialogVisivel = true;
  }

  confirmarDelete(): void {
    if (this.idParaDeletar) {
      this.loading = true;
      this.service.deletar(this.idParaDeletar).pipe(
        finalize(() => {
          this.dialogVisivel = false;
          this.loading = false;
        })
      ).subscribe({
        next: () => this.carregar(),
        error: () => this.erro = 'Erro ao deletar'
      });
    }
  }

  cancelarDelete(): void {
    this.dialogVisivel = false;
    this.idParaDeletar = null;
  }
}
