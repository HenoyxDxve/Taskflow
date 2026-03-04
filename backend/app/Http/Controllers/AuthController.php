<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use App\Http\Requests\InscriptionRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Illuminate\Auth\Events\Registered;

class AuthController extends Controller
{
    /**
     * Inscription d'un nouvel utilisateur
     */
    public function inscrire(InscriptionRequest $requete)
    {
        $utilisateur = Utilisateur::create([
            'nom' => $requete->nom,
            'email' => $requete->email,
            'mot_de_passe' => Hash::make($requete->mot_de_passe),
        ]);

        event(new Registered($utilisateur));

        $token = JWTAuth::fromUser($utilisateur);

        return response()->json([
            'message' => 'Inscription réussie',
            'utilisateur' => [
                'id' => $utilisateur->id,
                'nom' => $utilisateur->nom,
                'email' => $utilisateur->email,
            ],
            'token' => $token,
            'token_type' => 'bearer',
        ], 201);
    }

    /**
     * Connexion d'un utilisateur existant
     */
    public function connecter(Request $requete)
    {
        // Validation
        $validation = Validator::make($requete->all(), [
            'email' => 'required|email',
            'mot_de_passe' => 'required|string|min:6',
        ]);

        if ($validation->fails()) {
            return response()->json([
                'erreur' => 'Données invalides',
                'details' => $validation->errors()
            ], 422);
        }

        // ✅ APPROCHE MANUELLE FIABLE
        $email = $requete->input('email');
        $password = $requete->input('mot_de_passe');

        // Trouver l'utilisateur par email
        $utilisateur = Utilisateur::where('email', $email)->first();

        // Vérifier l'utilisateur ET le mot de passe manuellement
        if (!$utilisateur || !Hash::check($password, $utilisateur->getAuthPassword())) {
            return response()->json(['erreur' => 'Identifiants invalides'], 401);
        }

        // ✅ Générer le token MANUELLEMENT (contourne JWTAuth::attempt)
        $token = JWTAuth::fromUser($utilisateur);

        return response()->json([
            'message' => 'Connexion réussie',
            'utilisateur' => [
                'id' => $utilisateur->id,
                'nom' => $utilisateur->nom,
                'email' => $utilisateur->email,
            ],
            'token' => $token,
            'token_type' => 'bearer',
        ]);
    }

    /**
     * Récupérer le profil de l'utilisateur connecté
     */
    public function obtenirProfil()
    {
        return response()->json(['utilisateur' => auth()->user()]);
    }

    /**
     * Déconnexion
     */
    public function deconnecter()
    {
        JWTAuth::invalidate(JWTAuth::getToken());
        return response()->json(['message' => 'Déconnexion réussie']);
    }
}