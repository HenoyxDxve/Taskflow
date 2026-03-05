import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tache } from '../models/tache';

@Injectable({ providedIn: 'root' })
export class TacheService {
  private apiUrl = 'http://localhost:8000/api';
  
  taches = signal<Tache[]>([]);
  chargement = signal<boolean>(false);
  erreur = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  listerTaches(projetId: number, filtres?: { statut?: string; priorite?: string }): Observable<Tache[]> {
    this.chargement.set(true);
    this.erreur.set(null);
    
    return new Observable(subscriber => {
      let params = {};
      if (filtres?.statut) params = { ...params, statut: filtres.statut };
      if (filtres?.priorite) params = { ...params, priorite: filtres.priorite };

      this.http.get<any>(`${this.apiUrl}/projets/${projetId}/taches`, { params }).subscribe(
        (response: any) => {
          const taches = response.data || response;
          this.taches.set(Array.isArray(taches) ? taches : []);
          subscriber.next(this.taches());
          this.chargement.set(false);
        },
        (error) => {
          this.erreur.set('Erreur lors du chargement des tâches');
          subscriber.error(error);
          this.chargement.set(false);
        }
      );
    });
  }

  creerTache(projetId: number, donnees: { 
    titre: string; 
    description?: string; 
    statut?: string; 
    priorite?: string; 
    assigne_ids?: number[] 
  }): Observable<Tache> {
    this.chargement.set(true);
    this.erreur.set(null);

    return new Observable(subscriber => {
      this.http.post<any>(`${this.apiUrl}/projets/${projetId}/taches`, donnees).subscribe(
        (response: any) => {
          const newTache = response.data || response;
          this.taches.update(t => [...t, newTache]);
          subscriber.next(newTache);
          this.chargement.set(false);
        },
        (error) => {
          this.erreur.set('Erreur lors de la création de la tâche');
          subscriber.error(error);
          this.chargement.set(false);
        }
      );
    });
  }

  mettreAJourStatut(tacheId: number, statut: string): Observable<Tache> {
    this.chargement.set(true);
    this.erreur.set(null);

    return new Observable(subscriber => {
      this.http.patch<any>(`${this.apiUrl}/taches/${tacheId}/statut`, { statut }).subscribe(
        (response: any) => {
          const updated = response.data || response;
          this.taches.update(t => t.map(tache => tache.id === tacheId ? updated : tache));
          subscriber.next(updated);
          this.chargement.set(false);
        },
        (error) => {
          this.erreur.set('Erreur lors de la mise à jour du statut');
          subscriber.error(error);
          this.chargement.set(false);
        }
      );
    });
  }

  mettreAJourTache(tacheId: number, donnees: any): Observable<Tache> {
    this.chargement.set(true);
    this.erreur.set(null);

    return new Observable(subscriber => {
      this.http.put<any>(`${this.apiUrl}/taches/${tacheId}`, donnees).subscribe(
        (response: any) => {
          const updated = response.data || response;
          this.taches.update(t => t.map(tache => tache.id === tacheId ? updated : tache));
          subscriber.next(updated);
          this.chargement.set(false);
        },
        (error) => {
          this.erreur.set('Erreur lors de la mise à jour de la tâche');
          subscriber.error(error);
          this.chargement.set(false);
        }
      );
    });
  }

  supprimerTache(tacheId: number): Observable<void> {
    this.chargement.set(true);
    this.erreur.set(null);

    return new Observable(subscriber => {
      this.http.delete<any>(`${this.apiUrl}/taches/${tacheId}`).subscribe(
        () => {
          this.taches.update(t => t.filter(tache => tache.id !== tacheId));
          subscriber.next();
          this.chargement.set(false);
        },
        (error) => {
          this.erreur.set('Erreur lors de la suppression de la tâche');
          subscriber.error(error);
          this.chargement.set(false);
        }
      );
    });
  }
}
