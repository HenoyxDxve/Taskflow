import { Component, OnInit, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ProjetService } from '../../services/projet.service';
import { TacheService } from '../../services/tache.service';
import { Router } from '@angular/router';

interface Resume {
  total: number;
  terminees: number;
  en_retard: number;
  en_cours?: number;
}

interface Projet {
  id: number;
  nom: string;
  description?: string;
  couleur?: string;
  createur_id: number;
}

interface Tache {
  id: number;
  titre: string;
  description?: string;
  statut: string;
  priorite: string;
  couleur?: string;
  projet_id: number;
  assignes?: { id: number; nom: string; email: string }[];
}

interface Utilisateur {
  id: number;
  nom: string;
  email: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>📊 TableauDe Bord</h1>
        <div class="header-actions">
          <span class="user-name">{{ authService.utilisateurSignal()?.nom }}</span>
          <button class="btn-secondary" (click)="deconnecter()">Déconnecter</button>
        </div>
      </header>

      <div class="dashboard-content">
        <!-- Résumé -->
        <section class="resume-section">
          <h2>Résumé</h2>
          <div class="cartes-resume">
            <div class="carte-resume total">
              <span class="nombre">{{ resume().total }}</span>
              <span class="label">Tâches Totales</span>
            </div>
            <div class="carte-resume en-cours-card">
              <span class="nombre">{{ (resume().total - resume().terminees - resume().en_retard) }}</span>
              <span class="label">En Cours</span>
            </div>
            <div class="carte-resume completed">
              <span class="nombre">{{ resume().terminees }}</span>
              <span class="label">Terminées</span>
            </div>
            <div class="carte-resume delayed">
              <span class="nombre">{{ resume().en_retard }}</span>
              <span class="label">En Retard</span>
            </div>
          </div>
        </section>

        <!-- Projets -->
        <section class="projets-section">
          <h2>Mes Projets</h2>
          
          <div class="add-projet">
            <button class="btn-primary" *ngIf="!afficherFormulaireProjet()" 
              (click)="afficherFormulaireProjet.set(true)">
              ➕ Nouveau Projet
            </button>
            
            <form *ngIf="afficherFormulaireProjet()" [formGroup]="formulaireProjet" 
              (ngSubmit)="creerProjet()" class="form-nouveau-projet">
              <input type="text" formControlName="nom" placeholder="Nom du projet" required />
              <textarea formControlName="description" placeholder="Description (optionnel)"></textarea>
              <input type="color" formControlName="couleur" />
              <div class="form-actions">
                <button type="submit" class="btn-primary" [disabled]="formulaireProjet.invalid">Créer</button>
                <button type="button" class="btn-secondary" 
                  (click)="afficherFormulaireProjet.set(false)">Annuler</button>
              </div>
            </form>
          </div>

          <div class="projets-grid" *ngIf="projetService.projets().length > 0">
            <div *ngFor="let projet of projetService.projets()" 
              class="projet-card" 
              [style.border-left]="'5px solid ' + (projet.couleur || '#3b82f6')"
              (click)="selectionnerProjet(projet)">
              <h3>{{ projet.nom }}</h3>
              <p>{{ projet.description || 'Pas de description' }}</p>
              <small>Créé par: Vous</small>
            </div>
          </div>
          <p *ngIf="projetService.projets().length === 0" class="no-data">
            Aucun projet créé. Commencez par en créer un !
          </p>
        </section>

        <!-- Tâches du Projet Sélectionné -->
        <section class="taches-section" *ngIf="projetSelectionne()">
          <h2>Tâches - {{ projetSelectionne()?.nom }}</h2>
          
          <div class="add-tache">
            <button class="btn-primary" *ngIf="!afficherFormulaireTache()" 
              (click)="afficherFormulaireTache.set(true)">
              ➕ Nouvelle Tâche
            </button>
            <p class="section-help">Après avoir cliqué sur "Nouvelle Tâche", remplissez le formulaire. Pour assigner, cochez les utilisateurs ci-dessous.</p>
            
            <form *ngIf="afficherFormulaireTache()" [formGroup]="formulaireTache" 
              (ngSubmit)="creerTache()" class="form-nouvelle-tache">
              <input type="text" formControlName="titre" placeholder="Titre de la tâche" required />
              <textarea formControlName="description" placeholder="Description (optionnel)"></textarea>
              <select formControlName="priorite">
                <option value="">-- Priorité --</option>
                <option value="basse">Basse</option>
                <option value="moyenne">Moyenne</option>
                <option value="haute">Haute</option>
              </select>
              <div class="couleur-groupe">
                <label for="couleur">🎨 Couleur de la tâche</label>
                <input type="color" id="couleur" formControlName="couleur" />
              </div>
              <div class="assignees-section">
                <label>Assigner à (optionnel)</label>
                <p class="help-text">Cochez un ou plusieurs noms pour attribuer la tâche à ces utilisateurs.</p>
                <div class="utilisateurs-grid" *ngIf="utilisateurs().length > 0">
                  <label *ngFor="let user of utilisateurs()" class="checkbox-label">
                    <input type="checkbox" [value]="user.id" 
                      (change)="toggleAssignee($event, user.id)" />
                    {{ user.nom }}
                  </label>
                </div>
                <p *ngIf="utilisateurs().length === 0" class="no-users">Aucun autre utilisateur</p>
              </div>
              <div class="form-actions">
                <button type="submit" class="btn-primary" [disabled]="formulaireTache.invalid">Créer</button>
                <button type="button" class="btn-secondary" 
                  (click)="afficherFormulaireTache.set(false)">Annuler</button>
              </div>
            </form>
          </div>

          <!-- Modal d'édition de tâche -->
          <div *ngIf="afficherFormulaireEdition()" class="modal-overlay" (click)="annulerEdition()">
            <div class="modal-content" (click)="$event.stopPropagation()">
              <h3>Éditer la tâche</h3>
              <form [formGroup]="formulaireEdition" (ngSubmit)="mettreAJourTache()" class="form-edition-tache">
                <input type="text" formControlName="titre" placeholder="Titre de la tâche" required />
                <textarea formControlName="description" placeholder="Description (optionnel)"></textarea>
                <select formControlName="priorite">
                  <option value="basse">Basse</option>
                  <option value="moyenne">Moyenne</option>
                  <option value="haute">Haute</option>
                </select>
                <div class="couleur-groupe">
                  <label for="couleur-edit">🎨 Couleur de la tâche</label>
                  <input type="color" id="couleur-edit" formControlName="couleur" />
                </div>
                <div class="form-actions">
                  <button type="submit" class="btn-primary" [disabled]="formulaireEdition.invalid">Mettre à jour</button>
                  <button type="button" class="btn-secondary" (click)="annulerEdition()">Annuler</button>
                </div>
              </form>
            </div>
          </div>

          <div class="taches-list" *ngIf="tacheService.taches().length > 0">
            <div *ngFor="let tache of tacheService.taches()" 
              class="tache-item" 
              [class.termine]="tache.statut === 'termine'">
              <div class="tache-header">
                <div class="tache-title-section">
                  <h4>{{ tache.titre }}</h4>
                  <span class="priorite" [class]="'priorite-' + tache.priorite">
                    {{ tache.priorite }}
                  </span>
                </div>
                <div class="tache-actions">
                  <select [(ngModel)]="tache.statut" 
                    (change)="mettreAJourStatus(tache.id, tache.statut)" 
                    class="statut-select">
                    <option value="a_faire">À faire</option>
                    <option value="en_cours">En cours</option>
                    <option value="termine">Terminée</option>
                  </select>
                  <button class="btn-icon btn-edit" (click)="editerTache(tache)" title="Éditer">✏️</button>
                  <button class="btn-icon btn-delete" (click)="supprimerTache(tache.id)" title="Supprimer">🗑️</button>
                </div>
              </div>
              <p>{{ tache.description || 'Pas de description' }}</p>
              <div class="tache-assignes" *ngIf="tache.assignes && tache.assignes.length > 0">
                <span class="assignes-label">👤 Assignée à:</span>
                <span *ngFor="let user of tache.assignes" class="assignee-tag">
                  {{ user.nom }}
                </span>
              </div>
            </div>
          </div>
          <p *ngIf="tacheService.taches().length === 0" class="no-data">
            Aucune tâche. Commencez par créer une !
          </p>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background: #f5f5f5;
    }

    .dashboard-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .dashboard-header h1 {
      margin: 0;
      font-size: 1.8rem;
    }

    .header-actions {
      display: flex;
      gap: 15px;
      align-items: center;
    }

    .user-name {
      font-weight: 500;
    }

    .dashboard-content {
      padding: 30px;
      max-width: 1200px;
      margin: 0 auto;
    }

    section {
      margin-bottom: 40px;
      background: white;
      padding: 25px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    h2 {
      color: #333;
      margin-top: 0;
      margin-bottom: 20px;
      font-size: 1.3rem;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
    }

    .cartes-resume {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .carte-resume {
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      color: white;
      font-weight: 500;
    }

    .carte-resume.total { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .carte-resume.en-cours-card { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
    .carte-resume.completed { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
    .carte-resume.delayed { background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%); }

    .nombre { font-size: 2.5rem; display: block; margin-bottom: 5px; }
    .label { font-size: 0.9rem; opacity: 0.9; }

    .projets-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 15px;
    }

    .projet-card {
      padding: 20px;
      background: #f9f9f9;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .projet-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transform: translateY(-2px);
    }

    .projet-card h3 {
      margin: 0 0 10px 0;
      color: #333;
    }

    .projet-card p {
      margin: 10px 0;
      color: #666;
      font-size: 0.9rem;
    }

    .taches-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .tache-item {
      padding: 15px;
      background: #f9f9f9;
      border-left: 4px solid #667eea;
      border-radius: 6px;
      transition: all 0.3s ease;
    }

    .couleur-groupe {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .couleur-groupe label {
      margin: 0;
      font-weight: 500;
      color: #555;
      white-space: nowrap;
    }

    .couleur-groupe input[type="color"] {
      width: 50px;
      height: 40px;
      border: 2px solid #ddd;
      border-radius: 6px;
      cursor: pointer;
      padding: 2px;
    }

    .couleur-groupe input[type="color"]:hover {
      border-color: #667eea;
    }

    .tache-item.termine {
      opacity: 0.6;
      background: #f0f0f0;
    }

    .tache-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      gap: 12px;
    }

    .tache-title-section {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
    }

    .tache-header h4 {
      margin: 0;
      color: #333;
      flex: 1;
    }

    .priorite {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
      color: white;
    }

    .priorite-basse { background: #10b981; }
    .priorite-moyenne { background: #f59e0b; }
    .priorite-haute { background: #ef4444; }

    .statut-select {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .add-projet, .add-tache {
      margin-bottom: 20px;
    }

    .form-nouveau-projet, .form-nouvelle-tache {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    input, textarea, select {
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
      font-family: inherit;
    }

    input:focus, textarea:focus, select:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
    }

    textarea {
      min-height: 80px;
      resize: vertical;
    }

    .form-actions {
      display: flex;
      gap: 10px;
    }

    .btn-primary, .btn-secondary {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #e0e0e0;
      color: #333;
    }

    .btn-secondary:hover {
      background: #d0d0d0;
    }

    .no-data {
      text-align: center;
      color: #999;
      padding: 20px;
      font-style: italic;
    }

    .tache-assignes {
      margin-top: 10px;
      padding: 8px;
      background: #f0f0f0;
      border-radius: 4px;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
    }

    .assignes-label {
      font-weight: 500;
      color: #666;
      font-size: 0.85rem;
    }

    .assignee-tag {
      background: #667eea;
      color: white;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 0.8rem;
      white-space: nowrap;
    }

    .assignees-section {
      margin-top: 12px;
    }

    .assignees-section label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #555;
    }

    .help-text {
      font-size: 0.85rem;
      color: #666;
      margin: 4px 0 8px 0;
    }

    .utilisateurs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 8px;
      margin-top: 8px;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px;
      background: #f9f9f9;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .checkbox-label input[type="checkbox"] {
      width: auto;
      cursor: pointer;
    }

    .no-users {
      color: #999;
      font-size: 0.9rem;
      font-style: italic;
    }

    .section-help {
      font-size: 0.9rem;
      color: #555;
      margin-top: 8px;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    }

    .modal-content h3 {
      margin-top: 0;
      color: #333;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
    }

    .form-edition-tache {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 4px;
      font-size: 1.2rem;
      transition: all 0.3s ease;
      margin-left: 5px;
    }

    .btn-edit:hover {
      background: #e3f2fd;
      color: #1976d2;
    }

    .btn-delete:hover {
      background: #ffebee;
      color: #d32f2f;
    }

    @media (max-width: 768px) {
      .dashboard-header {
        flex-direction: column;
        gap: 15px;
        text-align: center;
      }

      .dashboard-content {
        padding: 15px;
      }

      .cartes-resume {
        grid-template-columns: 1fr;
      }

      .projets-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  authService = inject(AuthService);
  projetService = inject(ProjetService);
  tacheService = inject(TacheService);

  resume = signal<Resume>({ total: 0, terminees: 0, en_retard: 0 });
  projetSelectionne = signal<Projet | null>(null);
  afficherFormulaireProjet = signal<boolean>(false);
  afficherFormulaireTache = signal<boolean>(false);
  afficherFormulaireEdition = signal<boolean>(false);
  utilisateurs = signal<Utilisateur[]>([]);
  tachesEnCoursDAssignation = signal<number[]>([]);
  tacheEnEdition = signal<Tache | null>(null);

  formulaireProjet = this.fb.group({
    nom: ['', Validators.required],
    description: [''],
    couleur: ['#3b82f6']
  });

  formulaireTache = this.fb.group({
    titre: ['', Validators.required],
    description: [''],
    priorite: ['moyenne'],
    couleur: ['#667eea']
  });

  formulaireEdition = this.fb.group({
    titre: ['', Validators.required],
    description: [''],
    priorite: ['moyenne'],
    couleur: ['#667eea']
  });

  ngOnInit() {
    this.chargerResume();
    this.chargerProjets();
    this.chargerUtilisateurs();
  }

  chargerUtilisateurs() {
    this.http.get<any>('http://localhost:8000/api/utilisateurs').subscribe(
      (response: any) => {
        const users = response.data || response;
        // Filter out current user
        const currentUserId = this.authService.utilisateurSignal()?.id;
        this.utilisateurs.set(Array.isArray(users) ? users.filter(u => u.id !== currentUserId) : []);
      },
      error => console.error('Erreur chargement utilisateurs:', error)
    );
  }

  chargerResume() {
    this.http.get<Resume>('http://localhost:8000/api/dashboard').subscribe(
      data => this.resume.set(data),
      error => console.error('Erreur dashboard:', error)
    );
  }

  chargerProjets() {
    this.projetService.listerProjets().subscribe(
      () => {
        if (this.projetService.projets().length > 0) {
          this.selectionnerProjet(this.projetService.projets()[0]);
        }
      },
      error => console.error('Erreur chargement projets:', error)
    );
  }

  creerProjet() {
    if (this.formulaireProjet.invalid) return;

    this.projetService.creerProjet(this.formulaireProjet.value as any).subscribe(
      (newProjet) => {
        this.formulaireProjet.reset({ couleur: '#3b82f6' });
        this.afficherFormulaireProjet.set(false);
        this.chargerResume();
      },
      error => console.error('Erreur création projet:', error)
    );
  }

  selectionnerProjet(projet: Projet) {
    this.projetSelectionne.set(projet);
    this.tacheService.listerTaches(projet.id).subscribe(
      () => {},
      error => console.error('Erreur chargement tâches:', error)
    );
  }

  creerTache() {
    if (!this.projetSelectionne() || this.formulaireTache.invalid) return;

    const donnees = {
      ...this.formulaireTache.value,
      assigne_ids: this.tachesEnCoursDAssignation()
    };

    this.tacheService.creerTache(this.projetSelectionne()!.id, donnees as any).subscribe(
      () => {
        this.formulaireTache.reset({ priorite: 'moyenne' });
        this.tachesEnCoursDAssignation.set([]);
        this.afficherFormulaireTache.set(false);
        this.chargerResume();
      },
      error => console.error('Erreur création tâche:', error)
    );
  }

  toggleAssignee(event: any, userId: number) {
    const isChecked = event.target.checked;
    if (isChecked) {
      this.tachesEnCoursDAssignation.update(ids => [...ids, userId]);
    } else {
      this.tachesEnCoursDAssignation.update(ids => ids.filter(id => id !== userId));
    }
  }

  mettreAJourStatus(tacheId: number, statut: string) {
    this.tacheService.mettreAJourStatut(tacheId, statut).subscribe(
      () => this.chargerResume(),
      error => console.error('Erreur mise à jour statut:', error)
    );
  }

  editerTache(tache: Tache) {
    this.tacheEnEdition.set(tache);
    this.formulaireEdition.patchValue({
      titre: tache.titre,
      description: tache.description || '',
      priorite: tache.priorite
    });
    this.afficherFormulaireEdition.set(true);
  }

  mettreAJourTache() {
    if (this.formulaireEdition.invalid || !this.tacheEnEdition()) return;

    const donnees = this.formulaireEdition.value;
    this.tacheService.mettreAJourTache(this.tacheEnEdition()!.id, donnees).subscribe(
      () => {
        this.annulerEdition();
        this.chargerResume();
      },
      error => console.error('Erreur mise à jour tâche:', error)
    );
  }

  annulerEdition() {
    this.afficherFormulaireEdition.set(false);
    this.tacheEnEdition.set(null);
    this.formulaireEdition.reset();
  }

  supprimerTache(tacheId: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      this.tacheService.supprimerTache(tacheId).subscribe(
        () => this.chargerResume(),
        error => console.error('Erreur suppression tâche:', error)
      );
    }
  }

  deconnecter() {
    this.authService.deconnecter();
    this.router.navigate(['/connexion']);
  }
}