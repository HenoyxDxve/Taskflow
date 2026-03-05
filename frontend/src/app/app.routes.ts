import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: 'connexion', 
    loadComponent: () => import('./components/connexion/connexion.component')
      .then(m => m.ConnexionComponent) 
  },
  { 
    path: 'inscription', 
    loadComponent: () => import('./components/inscription/inscription.component')
      .then(m => m.InscriptionComponent)
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
    canActivate: [authGuard] 
  },
  { path: '', redirectTo: 'connexion', pathMatch: 'full' },
  { path: '**', redirectTo: 'connexion' }
];