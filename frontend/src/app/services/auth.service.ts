import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Utilisateur } from '../models/utilisateur';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8000/api';
  
  // ✅ Signals pour l'état d'authentification
  utilisateurSignal = signal<Utilisateur | null>(null);
  tokenSignal = signal<string | null>(null);
  erreurSignal = signal<string | null>(null);
  chargementSignal = signal<boolean>(false);

  constructor(private http: HttpClient) {
    // Charger le token au démarrage si présent
    const token = localStorage.getItem('token');
    const utilisateur = localStorage.getItem('utilisateur');
    if (token && utilisateur) {
      this.tokenSignal.set(token);
      this.utilisateurSignal.set(JSON.parse(utilisateur));
    }
  }

  inscrire(donnees: { nom: string; email: string; mot_de_passe: string; mot_de_passe_confirmation: string }): Observable<any> {
    this.chargementSignal.set(true);
    this.erreurSignal.set(null);
    
    return this.http.post(`${this.apiUrl}/inscrire`, donnees).pipe(
      tap((reponse: any) => {
        if (reponse.token) {
          this.sauvegarderSession(reponse.token, reponse.utilisateur);
        }
      }),
      catchError(this.gererErreur),
      tap(() => this.chargementSignal.set(false))
    );
  }

  connecter(donnees: { email: string; mot_de_passe: string }): Observable<any> {
    this.chargementSignal.set(true);
    this.erreurSignal.set(null);
    
    return this.http.post(`${this.apiUrl}/connecter`, donnees).pipe(
      tap((reponse: any) => {
        if (reponse.token) {
          this.sauvegarderSession(reponse.token, reponse.utilisateur);
        }
      }),
      catchError(this.gererErreur),
      tap(() => this.chargementSignal.set(false))
    );
  }

  private sauvegarderSession(token: string, utilisateur: Utilisateur): void {
    localStorage.setItem('token', token);
    localStorage.setItem('utilisateur', JSON.stringify(utilisateur));
    this.tokenSignal.set(token);
    this.utilisateurSignal.set(utilisateur);
  }

  deconnecter(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('utilisateur');
    this.tokenSignal.set(null);
    this.utilisateurSignal.set(null);
    this.erreurSignal.set(null);
  }

  estConnecte(): boolean {
    return !!this.tokenSignal();
  }

  obtenirToken(): string | null {
    return this.tokenSignal();
  }

  private gererErreur(erreur: HttpErrorResponse) {
    const message = erreur.error?.erreur || erreur.error?.message || 'Erreur de connexion au serveur';
    return throwError(() => new Error(message));
  }
}