export interface Tache {
  id: number;
  titre: string;
  description?: string;
  statut: 'a_faire' | 'en_cours' | 'termine';
  priorite: 'basse' | 'moyenne' | 'haute';
  projet_id: number;
  assignes?: { id: number; nom: string; email: string }[];
}