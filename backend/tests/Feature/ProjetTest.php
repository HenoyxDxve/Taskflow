<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Utilisateur;
use App\Models\Projet;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class ProjetTest extends TestCase
{
    use RefreshDatabase;
    private $utilisateur;
    private $token;

    protected function setUp(): void
    {
        parent::setUp();
        $this->utilisateur = Utilisateur::factory()->create();
        $this->token = JWTAuth::fromUser($this->utilisateur);
    }

    public function test_utilisateur_peut_creer_un_projet()
    {
        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $this->token])
            ->postJson('/api/projets', [
                'nom' => 'Projet Test',
                'description' => 'Un projet de test',
                'couleur' => '#ff0000'
            ]);

        $response->assertStatus(201);
        $response->assertJsonPath('data.nom', 'Projet Test');
        $this->assertDatabaseHas('projets', ['nom' => 'Projet Test']);
    }

    public function test_utilisateur_peut_lister_ses_projets()
    {
        Projet::factory()->create(['createur_id' => $this->utilisateur->id]);
        
        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $this->token])
            ->getJson('/api/projets');

        $response->assertStatus(200);
        $response->assertJsonPath('data.0.nom', $this->utilisateur->projets()->first()->nom);
    }

    public function test_utilisateur_peut_mettre_a_jour_un_projet()
    {
        $projet = Projet::factory()->create(['createur_id' => $this->utilisateur->id]);

        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $this->token])
            ->putJson("/api/projets/{$projet->id}", [
                'nom' => 'Nouveau Nom'
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('projets', ['id' => $projet->id, 'nom' => 'Nouveau Nom']);
    }

    public function test_utilisateur_peut_supprimer_un_projet()
    {
        $projet = Projet::factory()->create(['createur_id' => $this->utilisateur->id]);

        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $this->token])
            ->deleteJson("/api/projets/{$projet->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('projets', ['id' => $projet->id]);
    }

    public function test_utilisateur_ne_peut_pas_supprimer_projet_d_un_autre()
    {
        $autre_utilisateur = Utilisateur::factory()->create();
        $projet = Projet::factory()->create(['createur_id' => $autre_utilisateur->id]);

        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $this->token])
            ->deleteJson("/api/projets/{$projet->id}");

        $response->assertStatus(403);
        $this->assertDatabaseHas('projets', ['id' => $projet->id]);
    }
}
