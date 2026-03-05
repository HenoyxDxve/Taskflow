import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inscription',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>📝 Créer un compte</h2>
        
        <form [formGroup]="formulaireInscription" (ngSubmit)="soumettre()">
          
          <div class="form-group">
            <label for="nom">Nom complet</label>
            <input 
              id="nom" 
              formControlName="nom" 
              type="text" 
              placeholder="Ex: BLE DAVID"
              [class.error]="formulaireInscription.get('nom')?.invalid && formulaireInscription.get('nom')?.touched"
            />
            <span class="error-message" *ngIf="formulaireInscription.get('nom')?.invalid && formulaireInscription.get('nom')?.touched">
              Le nom est requis (min. 2 caractères)
            </span>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input 
              id="email" 
              formControlName="email" 
              type="email" 
              placeholder="exemple@email.com"
              [class.error]="formulaireInscription.get('email')?.invalid && formulaireInscription.get('email')?.touched"
            />
            <span class="error-message" *ngIf="formulaireInscription.get('email')?.errors?.['required'] && formulaireInscription.get('email')?.touched">
              L'email est requis
            </span>
            <span class="error-message" *ngIf="formulaireInscription.get('email')?.errors?.['email'] && formulaireInscription.get('email')?.touched">
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
              [class.error]="formulaireInscription.get('mot_de_passe')?.invalid && formulaireInscription.get('mot_de_passe')?.touched"
            />
            <span class="error-message" *ngIf="formulaireInscription.get('mot_de_passe')?.errors?.['required'] && formulaireInscription.get('mot_de_passe')?.touched">
              Le mot de passe est requis
            </span>
            <span class="error-message" *ngIf="formulaireInscription.get('mot_de_passe')?.errors?.['minlength'] && formulaireInscription.get('mot_de_passe')?.touched">
              Minimum 6 caractères
            </span>
          </div>

          <div class="form-group">
            <label for="mot_de_passe_confirmation">Confirmer le mot de passe</label>
            <input 
              id="mot_de_passe_confirmation" 
              formControlName="mot_de_passe_confirmation" 
              type="password" 
              placeholder="••••••••"
              [class.error]="formulaireInscription.hasError('mismatch') && formulaireInscription.get('mot_de_passe_confirmation')?.touched"
            />
            <span class="error-message" *ngIf="formulaireInscription.hasError('mismatch') && formulaireInscription.get('mot_de_passe_confirmation')?.touched">
              Les mots de passe ne correspondent pas
            </span>
          </div>

          <p class="error-global" *ngIf="erreurSignal()">
            ⚠️ {{ erreurSignal() }}
          </p>

          <button 
            type="submit" 
            [disabled]="formulaireInscription.invalid || chargementSignal()"
            class="btn-primary"
          >
            {{ chargementSignal() ? 'Création en cours...' : "S'inscrire" }}
          </button>
        </form>

        <p class="auth-switch">
          Déjà un compte ? 
          <a routerLink="/connexion" class="link">Se connecter</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px;
    }
    .auth-card {
      background: white; padding: 30px; border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2); width: 100%; max-width: 450px;
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
    .btn-primary:disabled { background: #ccc; cursor: not-allowed; transform: none; }
    .auth-switch { text-align: center; margin-top: 20px; color: #666; font-size: 0.9rem; }
    .auth-switch .link { color: #667eea; text-decoration: none; font-weight: 600; }
    .auth-switch .link:hover { text-decoration: underline; }
  `]
})
export class InscriptionComponent {
  // ✅ CORRECTION 1: inject() pour FormBuilder
  private fb = inject(FormBuilder);
  
  // ✅ CORRECTION 2: nonNullable.group() pour éviter les null/undefined
  formulaireInscription = this.fb.nonNullable.group({
    nom: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    mot_de_passe: ['', [Validators.required, Validators.minLength(6)]],
    mot_de_passe_confirmation: ['', Validators.required]
  }, { validators: this.motsDePasseCorrespondent });

  erreurSignal = signal<string | null>(null);
  chargementSignal = signal<boolean>(false);

  constructor(
    private auth: AuthService, 
    private router: Router
  ) {}

  private motsDePasseCorrespondent(form: AbstractControl): ValidationErrors | null {
    const pwd = form.get('mot_de_passe')?.value;
    const confirm = form.get('mot_de_passe_confirmation')?.value;
    return pwd && confirm && pwd === confirm ? null : { mismatch: true };
  }

  soumettre(): void {
    if (this.formulaireInscription.valid) {
      // ✅ CORRECTION 3: getRawValue() + extraction explicite
      const valeurs = this.formulaireInscription.getRawValue();
      
      this.chargementSignal.set(true);
      
      this.auth.inscrire({
        nom: valeurs.nom,
        email: valeurs.email,
        mot_de_passe: valeurs.mot_de_passe,
        mot_de_passe_confirmation: valeurs.mot_de_passe_confirmation
      }).subscribe({
        next: (reponse) => {
          console.log('✅ Inscription réussie:', reponse);
          this.chargementSignal.set(false);
          this.router.navigate(['/dashboard']);
        },
        error: (erreur) => {
          console.error('❌ Erreur inscription:', erreur);
          this.chargementSignal.set(false);
          this.erreurSignal.set(erreur.message);
        }
      });
    } else {
      Object.keys(this.formulaireInscription.controls).forEach(key => {
        this.formulaireInscription.get(key)?.markAsTouched();
      });
    }
  }
}