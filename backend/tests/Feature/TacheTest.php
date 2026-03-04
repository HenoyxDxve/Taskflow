<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Utilisateur;
use App\Models\Projet;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class TacheTest extends TestCase
{
    use RefreshDatabase;
    private $utilisateur;
    private $token;
    private $projet;

    protected function setUp(): void
    {
        parent::setUp();
        $this->utilisateur = Utilisateur::factory()->create();
        $this->token = JWTAuth::fromUser($this->utilisateur);
        $this->projet = Projet::factory()->create(['createur_id' => $this->utilisateur->id]);
    }

    public function test_utilisateur_peut_creer_une_tache_dans_son_projet()
    {
        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $this->token])
            ->postJson("/api/projets/{$this->projet->id}/taches", [
                'titre' => 'Nouvelle Tâche',
                'description' => 'Description de la tâche',
                'priorite' => 'haute'
            ]);

        $response->assertStatus(201);
        $response->assertJsonPath('data.titre', 'Nouvelle Tâche');
        $response->assertJsonPath('data.priorite', 'haute');
    }

    public function test_utilisateur_peut_lister_les_taches_d_un_projet()
    {
        $tache = $this->projet->taches()->create([
            'titre' => 'Test Tâche',
            'priorite' => 'moyenne'
        ]);

        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $this->token])
            ->getJson("/api/projets/{$this->projet->id}/taches");

        $response->assertStatus(200);
        $response->assertJsonPath('data.0.titre', 'Test Tâche');
    }

    public function test_utilisateur_peut_filtrer_les_taches_par_statut()
    {
        $this->projet->taches()->create([
            'titre' => 'Tâche À Faire',
            'statut' => 'a_faire'
        ]);
        $this->projet->taches()->create([
            'titre' => 'Tâche Terminée',
            'statut' => 'termine'
        ]);

        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $this->token])
            ->getJson("/api/projets/{$this->projet->id}/taches?statut=termine");

        $response->assertStatus(200);
        $this->assertCount(1, $response['data']);
        $response->assertJsonPath('data.0.statut', 'termine');
    }

    public function test_utilisateur_peut_changer_le_statut_d_une_tache()
    {
        $tache = $this->projet->taches()->create([
            'titre' => 'Tâche',
            'statut' => 'a_faire'
        ]);

        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $this->token])
            ->patchJson("/api/taches/{$tache->id}/statut", [
                'statut' => 'termine'
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('taches', ['id' => $tache->id, 'statut' => 'termine']);
    }

    public function test_utilisateur_peut_assigner_une_tache_a_d_autres_utilisateurs()
    {
        $autre_utilisateur = Utilisateur::factory()->create();
        
        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $this->token])
            ->postJson("/api/projets/{$this->projet->id}/taches", [
                'titre' => 'Tâche Assignée',
                'assigne_ids' => [$autre_utilisateur->id]
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('tache_utilisateur', [
            'utilisateur_id' => $autre_utilisateur->id
        ]);
    }
}
