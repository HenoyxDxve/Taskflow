<?php

namespace App\Http\Controllers;

use App\Models\Tache;
use App\Models\Projet;
use App\Http\Resources\TacheResource;
use Illuminate\Http\Request;

class TacheController extends Controller
{
    public function lister(Request $requete, Projet $projet)
    {
        $query = $projet->taches()->with('assignes');

        if ($requete->has('statut')) {
            $query->where('statut', $requete->statut);
        }
        if ($requete->has('priorite')) {
            $query->where('priorite', $requete->priorite);
        }

        return TacheResource::collection($query->get());
    }

    public function creer(Request $requete, Projet $projet)
    {
        $requete->validate([
        'titre' => 'required|string|max:255',              // ← Requis
        'description' => 'nullable|string|max:1000',
        'statut' => 'nullable|in:a_faire,en_cours,termine', // ← Enum valide
        'priorite' => 'nullable|in:basse,moyenne,haute',    // ← Enum valide
        'assigne_ids' => 'nullable|array|exists:users,id',
    ]);

        $tache = $projet->taches()->create($requete->except('assigne_ids'));
        
        if ($requete->has('assigne_ids')) {
            $tache->assignes()->sync($requete->assigne_ids);
        }

        return new TacheResource($tache->load('assignes'));
    }

    public function mettreAJourStatut(Request $requete, Tache $tache)
    {
        $requete->validate(['statut' => 'required|in:a_faire,en_cours,termine']);
        $tache->update(['statut' => $requete->statut]);
        return new TacheResource($tache->load('assignes'));
    }

    public function mettreAJourAssignees(Request $requete, Tache $tache)
    {
        $requete->validate(['assigne_ids' => 'required|array|exists:users,id']);
        $tache->assignes()->sync($requete->assigne_ids);
        return new TacheResource($tache->load('assignes'));
    }
}