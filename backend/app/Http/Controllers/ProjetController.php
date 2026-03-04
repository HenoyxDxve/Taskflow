<?php

namespace App\Http\Controllers;

use App\Models\Projet;
use App\Http\Resources\ProjetResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProjetController extends Controller
{
    public function lister()
    {
        $projets = Projet::where('createur_id', auth()->id())->get();
        return ProjetResource::collection($projets);
    }

    public function creer(Request $requete)
    {
        // Validation explicite
        $validation = Validator::make($requete->all(), [
            'nom' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'couleur' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
        ]);

        if ($validation->fails()) {
            return response()->json([
                'erreur' => 'Données invalides',
                'details' => $validation->errors()
            ], 422);
        }

        try {
            // ✅ Création avec createur_id de l'utilisateur authentifié
            $projet = auth()->user()->projets()->create([
                'nom' => $requete->nom,
                'description' => $requete->description,
                'couleur' => $requete->couleur ?? '#3b82f6',
            ]);

            return response()->json([
                'message' => 'Projet créé avec succès',
                'data' => new ProjetResource($projet)
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Erreur création projet', [
                'message' => $e->getMessage(),
                'user_id' => auth()->id(),
                'data' => $requete->all()
            ]);
            
            return response()->json([
                'erreur' => 'Erreur lors de la création du projet',
                'debug' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function mettreAJour(Request $requete, Projet $projet)
    {
        if ($projet->createur_id !== auth()->id()) {
            return response()->json(['erreur' => 'Non autorisé'], 403);
        }

        $projet->update($requete->only(['nom', 'description', 'couleur']));
        return response()->json(['data' => new ProjetResource($projet)]);
    }

    public function supprimer(Projet $projet)
    {
        if ($projet->createur_id !== auth()->id()) {
            return response()->json(['erreur' => 'Non autorisé'], 403);
        }

        $projet->delete();
        return response()->noContent();
    }
}