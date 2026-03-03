import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Beneficio, BeneficioService, LoadingComponent } from 'shared';

@Component({
  selector: 'app-transferencia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingComponent],
  templateUrl: './transferencia.html',
  styleUrl: './transferencia.css',
})
export class TransferenciaComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(BeneficioService);

  form!: FormGroup;
  beneficios: Beneficio[] = [];
  loading = true;
  erro = '';
  sucesso = '';

  ngOnInit(): void {
    this.form = this.fb.group({
      fromId: [null, Validators.required],
      toId: [null, Validators.required],
      valor: [null, [Validators.required, Validators.min(0.01)]],
    });

    this.carregarBeneficios();
  }

  carregarBeneficios(): void {
    this.loading = true;
    this.erro = '';
    
    this.service.listar().pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (data) => this.beneficios = data,
      error: () => this.erro = 'Erro ao carregar benefícios'
    });
  }

  transferir(): void {
    if (this.form.invalid) return;

    const { fromId, toId, valor } = this.form.value;

    if (fromId === toId) {
      this.erro = 'Origem e destino devem ser diferentes';
      return;
    }

    this.loading = true;
    this.erro = '';
    this.sucesso = '';

    this.service.transferir({ fromId, toId, valor })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.sucesso = 'Transferência realizada com sucesso!';
          this.form.reset();
          this.carregarBeneficios();
        },
        error: (err) => {
          const body = err.error;
          this.erro =
            (typeof body === 'object' && body?.erro) ||
            (typeof body === 'string' && body) ||
            err.message ||
            'Erro ao realizar transferência';
        },
      });
  }

  getNome(id: number): string {
    return this.beneficios.find((b) => b.id === id)?.nome || '';
  }

  getValor(id: number): number {
    return this.beneficios.find((b) => b.id === id)?.valor || 0;
  }
}
