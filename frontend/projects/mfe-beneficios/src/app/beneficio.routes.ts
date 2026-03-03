import { Routes } from '@angular/router';

export const beneficioRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./beneficios/pages/beneficio-list/beneficio-list').then(
        (m) => m.BeneficioListComponent
      ),
  },
  {
    path: 'novo',
    loadComponent: () =>
      import('./beneficios/pages/beneficio-form/beneficio-form').then(
        (m) => m.BeneficioFormComponent
      ),
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./beneficios/pages/beneficio-form/beneficio-form').then(
        (m) => m.BeneficioFormComponent
      ),
  },
  {
    path: 'transferir',
    loadComponent: () =>
      import('./beneficios/pages/transferencia/transferencia').then(
        (m) => m.TransferenciaComponent
      ),
  },
];
