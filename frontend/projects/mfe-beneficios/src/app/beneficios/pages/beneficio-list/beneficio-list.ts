import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Beneficio } from '../../models/beneficio.model';
import { BeneficioService } from '../../services/beneficio.service';
import { CardComponent } from 'shared';
import { ButtonComponent } from 'shared';
import { ConfirmDialogComponent } from 'shared';
import { LoadingComponent } from 'shared';

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
  styleUrl: './beneficio-list.css'
})
export class BeneficioListComponent implements OnInit {
  beneficios: Beneficio[] = [];
  loading = false;
  erro = '';
  dialogVisivel = false;
  idParaDeletar: number | null = null;

  constructor(
    private service: BeneficioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.loading = true;
    this.erro = '';
    this.service.listar().subscribe({
      next: (data) => { this.beneficios = data; this.loading = false; },
      error: () => { this.erro = 'Erro ao carregar benefícios'; this.loading = false; }
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
      this.service.deletar(this.idParaDeletar).subscribe({
        next: () => { this.dialogVisivel = false; this.carregar(); },
        error: () => { this.erro = 'Erro ao deletar'; this.dialogVisivel = false; }
      });
    }
  }

  cancelarDelete(): void {
    this.dialogVisivel = false;
    this.idParaDeletar = null;
  }
}
