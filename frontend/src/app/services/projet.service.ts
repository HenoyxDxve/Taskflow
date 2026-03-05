import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Projet } from '../models/projet';

@Injectable({ providedIn: 'root' })
export class ProjetService {
  private apiUrl = 'http://localhost:8000/api/projets';
  
  projets = signal<Projet[]>([]);
  chargement = signal<boolean>(false);
  erreur = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  listerProjets(): Observable<Projet[]> {
    this.chargement.set(true);
    this.erreur.set(null);
    
    return new Observable(subscriber => {
      this.http.get<any>(this.apiUrl, { params: {} }).subscribe(
        (response: any) => {
          const projets = response.data || response;
          this.projets.set(Array.isArray(projets) ? projets : []);
          subscriber.next(this.projets());
          this.chargement.set(false);
        },
        (error) => {
          this.erreur.set('Erreur lors du chargement des projets');
          subscriber.error(error);
          this.chargement.set(false);
        }
      );
    });
  }

  creerProjet(donnees: { nom: string; description?: string; couleur?: string }): Observable<Projet> {
    this.chargement.set(true);
    this.erreur.set(null);

    return new Observable(subscriber => {
      this.http.post<any>(this.apiUrl, donnees).subscribe(
        (response: any) => {
          const newProjet = response.data || response;
          this.projets.update(p => [...p, newProjet]);
          subscriber.next(newProjet);
          this.chargement.set(false);
        },
        (error) => {
          this.erreur.set('Erreur lors de la création du projet');
          subscriber.error(error);
          this.chargement.set(false);
        }
      );
    });
  }

  mettreAJourProjet(id: number, donnees: Partial<Projet>): Observable<Projet> {
    this.chargement.set(true);
    this.erreur.set(null);

    return new Observable(subscriber => {
      this.http.put<any>(`${this.apiUrl}/${id}`, donnees).subscribe(
        (response: any) => {
          const updated = response.data || response;
          this.projets.update(p => p.map(proj => proj.id === id ? updated : proj));
          subscriber.next(updated);
          this.chargement.set(false);
        },
        (error) => {
          this.erreur.set('Erreur lors de la mise à jour du projet');
          subscriber.error(error);
          this.chargement.set(false);
        }
      );
    });
  }

  supprimerProjet(id: number): Observable<void> {
    this.chargement.set(true);
    this.erreur.set(null);

    return new Observable(subscriber => {
      this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe(
        () => {
          this.projets.update(p => p.filter(proj => proj.id !== id));
          subscriber.next();
          this.chargement.set(false);
        },
        (error) => {
          this.erreur.set('Erreur lors de la suppression du projet');
          subscriber.error(error);
          this.chargement.set(false);
        }
      );
    });
  }
}
