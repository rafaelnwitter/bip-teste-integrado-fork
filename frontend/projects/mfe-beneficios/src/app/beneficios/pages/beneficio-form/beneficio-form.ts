import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { BeneficioService } from '../../services/beneficio.service';
import { ButtonComponent } from 'shared';
import { LoadingComponent } from 'shared';

@Component({
  selector: 'app-beneficio-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonComponent,
    LoadingComponent
  ],
  templateUrl: './beneficio-form.html',
  styleUrl: './beneficio-form.css'
})
export class BeneficioFormComponent implements OnInit {
  form!: FormGroup;
  isEdicao = false;
  id: number | null = null;
  loading = false;
  erro = '';
  sucesso = '';

  constructor(
    private fb: FormBuilder,
    private service: BeneficioService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(100)]],
      descricao: ['', Validators.maxLength(255)],
      valor: [null, [Validators.required, Validators.min(0.01)]],
      ativo: [true]
    });

    this.id = this.route.snapshot.params['id'] ?? null;
    if (this.id) {
      this.isEdicao = true;
      this.loading = true;
      this.service.buscarPorId(this.id).subscribe({
        next: (b) => { this.form.patchValue(b); this.loading = false; },
        error: () => { this.erro = 'Erro ao carregar benefício'; this.loading = false; }
      });
    }
  }

  salvar(): void {
    if (this.form.invalid) return;
    this.loading = true;

    const operacao = this.isEdicao
      ? this.service.atualizar(this.id!, this.form.value)
      : this.service.criar(this.form.value);

    operacao
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.sucesso = 'Salvo com sucesso!';
          setTimeout(() => this.router.navigate(['/beneficios']), 1000);
        },
        error: (err) => {
          const body = err.error;
          this.erro =
            (typeof body === 'object' && body?.erro) ||
            (typeof body === 'string' && body) ||
            'Erro ao salvar';
        },
      });
  }

  cancelar(): void {
    this.router.navigate(['/beneficios']);
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && control?.touched);
  }
}
