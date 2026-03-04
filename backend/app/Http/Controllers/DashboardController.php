<?php

namespace App\Http\Controllers;

use App\Models\Tache;
use App\Models\Projet;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function obtenirResume(): JsonResponse
    {
        try {
            $utilisateurId = auth()->id();
            
            // Récupérer les IDs des projets de l'utilisateur
            $projetIds = Projet::where('createur_id', $utilisateurId)->pluck('id');

            // Si aucun projet, retourner des zéros
            if ($projetIds->isEmpty()) {
                return response()->json([
                    'total' => 0,
                    'terminees' => 0,
                    'en_retard' => 0
                ]);
            }

            // Comptages de base
            $tachesTotales = Tache::whereIn('projet_id', $projetIds)->count();
            $tachesTerminees = Tache::whereIn('projet_id', $projetIds)
                ->where('statut', 'termine')
                ->count();

            // ✅ Version simplifiée pour "en retard" : tâches non terminées créées il y a +7 jours
            // On utilise whereDate pour éviter les problèmes de format de date
            $tachesEnRetard = Tache::whereIn('projet_id', $projetIds)
                ->where('statut', '!=', 'termine')
                ->whereDate('created_at', '<', now()->subDays(7))
                ->count();

            return response()->json([
                'total' => (int) $tachesTotales,
                'terminees' => (int) $tachesTerminees,
                'en_retard' => (int) $tachesEnRetard
            ]);

        } catch (\Exception $e) {
            // ✅ Log l'erreur pour debug
            \Log::error('Erreur dashboard', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // ✅ Retourner une réponse sécurisée en cas d'erreur
            return response()->json([
                'total' => 0,
                'terminees' => 0,
                'en_retard' => 0,
                'debug' => config('app.debug') ? $e->getMessage() : null
            ], 200);
        }
    }
}