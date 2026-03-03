import { Routes } from '@angular/router';
import { beneficioRoutes } from './beneficio.routes';

// Re-export for Module Federation (loaded by the shell at /beneficios)
export { beneficioRoutes as routes } from './beneficio.routes';

// Standalone routes (when running MFE independently)
export const appRoutes: Routes = [
  { path: '', children: beneficioRoutes },
  { path: '**', redirectTo: '' },
];
