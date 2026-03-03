import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/module-federation';

const localRoutes: Routes = [
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
];

function loadMfeRoutes(): Promise<Routes> {
  // Quick ping to check if MFE is available before attempting to load it
  return fetch('http://localhost:4201/remoteEntry.js', {
    method: 'HEAD',
    mode: 'cors',
    signal: AbortSignal.timeout(500),
  })
    .then(() =>
      loadRemoteModule({
        type: 'module',
        remoteEntry: 'http://localhost:4201/remoteEntry.js',
        exposedModule: './BeneficiosModule',
      }).then((m) => m.beneficioRoutes as Routes)
    )
    .catch(() => {
      console.warn('MFE mfeBeneficios unavailable, using local fallback');
      return localRoutes;
    });
}

export const routes: Routes = [
  {
    path: 'beneficios',
    loadChildren: () => loadMfeRoutes(),
  },
  {
    path: 'transferir',
    loadComponent: () =>
      import('./beneficios/pages/transferencia/transferencia').then(
        (m) => m.TransferenciaComponent
      ),
  },
  { path: '', redirectTo: 'beneficios', pathMatch: 'full' },
  { path: '**', redirectTo: 'beneficios' },
];
