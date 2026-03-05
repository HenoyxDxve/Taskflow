import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-connexion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>🔐 Connexion</h2>
        
        <form [formGroup]="formulaireConnexion" (ngSubmit)="soumettre()">
          
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              id="email" 
              formControlName="email" 
              type="email" 
              placeholder="exemple@email.com"
              [class.error]="formulaireConnexion.get('email')?.invalid && formulaireConnexion.get('email')?.touched"
            />
            <span class="error-message" *ngIf="formulaireConnexion.get('email')?.errors?.['required'] && formulaireConnexion.get('email')?.touched">
              L'email est requis
            </span>
            <span class="error-message" *ngIf="formulaireConnexion.get('email')?.errors?.['email'] && formulaireConnexion.get('email')?.touched">
              Format d'email invalide
            </span>
          </div>

          <div class="form-group">
            <label for="mot_de_passe">Mot de passe</label>
            <input 
              id="mot_de_passe" 
              formControlName="mot_de_passe" 
              type="password" 
              placeholder="••••••••"
              [class.error]="formulaireConnexion.get('mot_de_passe')?.invalid && formulaireConnexion.get('mot_de_passe')?.touched"
            />
            <span class="error-message" *ngIf="formulaireConnexion.get('mot_de_passe')?.invalid && formulaireConnexion.get('mot_de_passe')?.touched">
              Le mot de passe est requis
            </span>
          </div>

          <p class="error-global" *ngIf="erreurSignal()">
            ⚠️ {{ erreurSignal() }}
          </p>

          <button 
            type="submit" 
            [disabled]="formulaireConnexion.invalid || chargementSignal()"
            class="btn-primary"
          >
            {{ chargementSignal() ? 'Connexion...' : 'Se Connecter' }}
          </button>
        </form>

        <p class="auth-switch">
          Pas de compte ? 
          <a routerLink="/inscription" class="link">S'inscrire</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    .auth-card {
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      width: 100%;
      max-width: 400px;
    }
    h2 { text-align: center; color: #333; margin-bottom: 25px; font-size: 1.5rem; }
    .form-group { margin-bottom: 20px; }
    label { display: block; margin-bottom: 6px; font-weight: 500; color: #555; font-size: 0.9rem; }
    input {
      width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px;
      font-size: 1rem; transition: border-color 0.2s; box-sizing: border-box;
    }
    input:focus { outline: none; border-color: #667eea; }
    input.error { border-color: #ef4444; }
    .error-message { color: #ef4444; font-size: 0.8rem; margin-top: 4px; display: block; }
    .error-global {
      background: #fef2f2; color: #dc2626; padding: 10px; border-radius: 6px;
      margin-bottom: 15px; font-size: 0.9rem; border-left: 4px solid #ef4444;
    }
    .btn-primary {
      width: 100%; padding: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white; border: none; border-radius: 8px; font-size: 1rem;
      font-weight: 600; cursor: pointer; transition: transform 0.1s;
    }
    .btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4); }
    .btn-primary:disabled { background: #ccc; cursor: not-allowed; }
    .auth-switch { text-align: center; margin-top: 20px; color: #666; font-size: 0.9rem; }
    .auth-switch .link { color: #667eea; text-decoration: none; font-weight: 600; }
    .auth-switch .link:hover { text-decoration: underline; }
  `]
})
export class ConnexionComponent {
  // ✅ CORRECTION 1: Utiliser inject() pour FormBuilder (Angular 14+)
  private fb = inject(FormBuilder);
  
  // ✅ CORRECTION 2: Initialiser le formulaire après l'injection
  formulaireConnexion = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    mot_de_passe: ['', [Validators.required, Validators.minLength(6)]]
  });

  erreurSignal = signal<string | null>(null);
  chargementSignal = signal<boolean>(false);

  constructor(
    private auth: AuthService, 
    private router: Router
  ) {}

  soumettre(): void {
    if (this.formulaireConnexion.valid) {
      // ✅ CORRECTION 3: Utiliser getRawValue() ou asserion de type
      const valeurs = this.formulaireConnexion.getRawValue();
      
      this.auth.connecter({
        email: valeurs.email,
        mot_de_passe: valeurs.mot_de_passe
      }).subscribe({
        next: (reponse) => {
          console.log('✅ Connexion réussie:', reponse);
          this.router.navigate(['/dashboard']);
        },
        error: (erreur) => {
          console.error('❌ Erreur connexion:', erreur);
          this.erreurSignal.set(erreur.message);
        }
      });
    } else {
      Object.keys(this.formulaireConnexion.controls).forEach(key => {
        this.formulaireConnexion.get(key)?.markAsTouched();
      });
    }
  }
}