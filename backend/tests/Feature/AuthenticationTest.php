<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Utilisateur;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;
    public function test_utilisateur_peut_s_inscrire()
    {
        $email = 'jean'.uniqid().'@example.com';
        $response = $this->postJson('/api/inscrire', [
            'nom' => 'Jean Dupont',
            'email' => $email,
            'mot_de_passe' => 'password123',
            'mot_de_passe_confirmation' => 'password123',
        ]);

        $response->assertStatus(201);
        $response->assertJsonStructure(['token', 'utilisateur']);
        $this->assertDatabaseHas('users', ['email' => $email]);
    }

    public function test_utilisateur_peut_se_connecter()
    {
        $utilisateur = Utilisateur::factory()->create([
            'email' => 'test@example.com',
            'mot_de_passe' => 'password123'
        ]);

        $response = $this->postJson('/api/connecter', [
            'email' => 'test@example.com',
            'mot_de_passe' => 'password123',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure(['token', 'utilisateur']);
    }

    public function test_connexion_echoue_avec_identifiants_invalides()
    {
        $response = $this->postJson('/api/connecter', [
            'email' => 'inexistant@example.com',
            'mot_de_passe' => 'wrongpassword',
        ]);

        $response->assertStatus(401);
        $response->assertJsonPath('erreur', 'Identifiants invalides');
    }

    public function test_utilisateur_peut_obtenir_son_profil()
    {
        $utilisateur = Utilisateur::factory()->create();
        $token = JWTAuth::fromUser($utilisateur);

        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson('/api/profil');

        $response->assertStatus(200);
        $response->assertJsonPath('utilisateur.email', $utilisateur->email);
    }
}
