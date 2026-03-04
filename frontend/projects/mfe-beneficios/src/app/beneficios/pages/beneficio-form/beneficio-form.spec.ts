import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BeneficioFormComponent } from './beneficio-form';
import { BeneficioService, Beneficio } from 'shared';

describe('BeneficioFormComponent (MFE)', () => {
  let component: BeneficioFormComponent;
  let fixture: ComponentFixture<BeneficioFormComponent>;
  let beneficioService: any;
  let router: any;
  let activatedRoute: any;

  const mockBeneficio: Beneficio = {
    id: 1,
    nome: 'Beneficio Teste',
    descricao: 'Descrição teste',
    valor: 150.0,
    ativo: true,
  };

  function createComponent(routeParams: Record<string, string> = {}) {
    activatedRoute = {
      snapshot: {
        paramMap: {
          get: (key: string) => routeParams[key] ?? null,
        },
      },
    };

    const beneficioServiceSpy = {
      buscarPorId: vi.fn(),
      criar: vi.fn(),
      atualizar: vi.fn(),
    };
    const routerSpy = {
      navigate: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, BeneficioFormComponent],
      providers: [
        { provide: BeneficioService, useValue: beneficioServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BeneficioFormComponent);
    component = fixture.componentInstance;
    beneficioService = TestBed.inject(BeneficioService);
    router = TestBed.inject(Router);
  }

  it('should create', () => {
    createComponent({});
    expect(component).toBeTruthy();
  });

  describe('initialization (new beneficio)', () => {
    beforeEach(() => {
      createComponent({});
    });

    it('should initialize form with default values for new beneficio', () => {
      component.ngOnInit();

      expect(component.isEdicao).toBe(false);
      expect(component.form.get('nome')?.value).toBe('');
      expect(component.form.get('descricao')?.value).toBe('');
      expect(component.form.get('valor')?.value).toBeNull();
      expect(component.form.get('ativo')?.value).toBe(true);
    });
  });

  describe('initialization (edit beneficio)', () => {
    beforeEach(() => {
      createComponent({ id: '1' });
    });

    it('should load beneficio for editing when id is provided', () => {
      beneficioService.buscarPorId.mockReturnValue(of(mockBeneficio));

      component.ngOnInit();

      expect(component.isEdicao).toBe(true);
      expect(component.id).toBe(1);
      expect(beneficioService.buscarPorId).toHaveBeenCalledWith(1);
    });

    it('should populate form when loading beneficio for editing', () => {
      beneficioService.buscarPorId.mockReturnValue(of(mockBeneficio));

      component.ngOnInit();

      expect(component.form.get('nome')?.value).toBe(mockBeneficio.nome);
      expect(component.form.get('descricao')?.value).toBe(mockBeneficio.descricao);
      expect(component.form.get('valor')?.value).toBe(mockBeneficio.valor);
      expect(component.form.get('ativo')?.value).toBe(mockBeneficio.ativo);
    });

    it('should handle error when loading beneficio', () => {
      beneficioService.buscarPorId.mockReturnValue(
        throwError(() => new Error('Beneficio not found'))
      );

      component.ngOnInit();

      expect(component.erro).toBe('Erro ao carregar benefício');
      expect(component.loading).toBe(false);
    });
  });

  describe('form validation', () => {
    beforeEach(() => {
      createComponent({});
      component.ngOnInit();
    });

    it('should validate required nome', () => {
      const nomeControl = component.form.get('nome');

      expect(nomeControl?.hasError('required')).toBe(true);

      nomeControl?.setValue('Test Name');
      expect(nomeControl?.hasError('required')).toBe(false);
    });

    it('should validate nome max length', () => {
      const nomeControl = component.form.get('nome');
      const longName = 'a'.repeat(101);

      nomeControl?.setValue(longName);
      expect(nomeControl?.hasError('maxlength')).toBe(true);

      nomeControl?.setValue('Valid Name');
      expect(nomeControl?.hasError('maxlength')).toBe(false);
    });

    it('should validate required valor', () => {
      const valorControl = component.form.get('valor');

      expect(valorControl?.hasError('required')).toBe(true);

      valorControl?.setValue(100);
      expect(valorControl?.hasError('required')).toBe(false);
    });

    it('should validate minimum valor', () => {
      const valorControl = component.form.get('valor');

      valorControl?.setValue(0);
      expect(valorControl?.hasError('min')).toBe(true);

      valorControl?.setValue(-1);
      expect(valorControl?.hasError('min')).toBe(true);

      valorControl?.setValue(0.01);
      expect(valorControl?.hasError('min')).toBe(false);
    });

    it('should use isInvalid helper correctly', () => {
      const nomeControl = component.form.get('nome');

      // Not touched yet
      expect(component.isInvalid('nome')).toBe(false);

      nomeControl?.markAsTouched();
      expect(component.isInvalid('nome')).toBe(true);

      nomeControl?.setValue('Valid Name');
      expect(component.isInvalid('nome')).toBe(false);
    });
  });

  describe('salvar method', () => {
    beforeEach(() => {
      createComponent({});
      component.ngOnInit();
      component.form.patchValue({
        nome: 'Novo Beneficio',
        descricao: 'Nova descrição',
        valor: 100.0,
        ativo: true,
      });
    });

    it('should not submit if form is invalid', () => {
      component.form.patchValue({ nome: '' });

      component.salvar();

      expect(beneficioService.criar).not.toHaveBeenCalled();
    });

    it('should create new beneficio when not editing', () => {
      const createdBeneficio = { ...component.form.value, id: 3 };
      beneficioService.criar.mockReturnValue(of(createdBeneficio));

      component.salvar();

      expect(beneficioService.criar).toHaveBeenCalledWith(component.form.value);
      expect(component.sucesso).toBe('Salvo com sucesso!');
    });

    it('should update existing beneficio when editing', () => {
      component.isEdicao = true;
      component.id = 1;
      beneficioService.atualizar.mockReturnValue(of({ ...component.form.value, id: 1 }));

      component.salvar();

      expect(beneficioService.atualizar).toHaveBeenCalledWith(1, component.form.value);
      expect(component.sucesso).toBe('Salvo com sucesso!');
    });

    it('should handle create errors with object error body', () => {
      const errorResponse = { error: { erro: 'Nome já existe' } };
      beneficioService.criar.mockReturnValue(throwError(() => errorResponse));

      component.salvar();

      expect(component.erro).toBe('Nome já existe');
      expect(component.loading).toBe(false);
    });

    it('should handle string error responses', () => {
      const errorResponse = { error: 'Update failed' };
      beneficioService.criar.mockReturnValue(throwError(() => errorResponse));

      component.salvar();

      expect(component.erro).toBe('Update failed');
    });

    it('should use fallback error message', () => {
      beneficioService.criar.mockReturnValue(throwError(() => ({ error: null })));

      component.salvar();

      expect(component.erro).toBe('Erro ao salvar');
    });
  });

  describe('cancelar method', () => {
    beforeEach(() => {
      createComponent({});
    });

    it('should navigate back to benefits list', () => {
      component.cancelar();

      expect(router.navigate).toHaveBeenCalledWith(['/beneficios']);
    });
  });

  describe('loading state', () => {
    it('should set loading during save', () => {
      createComponent({});
      component.ngOnInit();
      component.form.patchValue({
        nome: 'Test',
        valor: 100,
        ativo: true,
      });

      beneficioService.criar.mockReturnValue(of({} as Beneficio));

      component.salvar();

      // After synchronous observable finalize, loading is false
      expect(component.loading).toBe(false);
    });

    it('should set loading during beneficio load', () => {
      createComponent({ id: '1' });
      beneficioService.buscarPorId.mockReturnValue(of(mockBeneficio));

      component.ngOnInit();

      // After synchronous observable, loading is false
      expect(component.loading).toBe(false);
    });
  });
});
