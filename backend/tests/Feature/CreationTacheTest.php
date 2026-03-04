<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Utilisateur;
use App\Models\Projet;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class CreationTacheTest extends TestCase
{
    public function test_utilisateur_peut_creer_une_tache()
    {
        $utilisateur = Utilisateur::factory()->create();
        $projet = Projet::create(['nom' => 'Test', 'createur_id' => $utilisateur->id]);
        
        $token = JWTAuth::fromUser($utilisateur);

        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->postJson("/api/projets/{$projet->id}/taches", [
                'titre' => 'Nouvelle Tache',
                'priorite' => 'haute'
            ]);

        $response->assertStatus(201)
                 ->assertJsonPath('data.titre', 'Nouvelle Tache');
    }
}