<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    // database/seeders/DatabaseSeeder.php
public function run(): void {
    // utilisateur de test
    \App\Models\Utilisateur::factory()->create([
        'nom' => 'Test User',
        'email' => 'test@taskflow.com',
        'mot_de_passe' => \Illuminate\Support\Facades\Hash::make('password123'),
    ]);

    // quelques utilisateurs francophones pour l'assignation
    $noms = [
        'Jean Dupont',
        'Marie Curie',
        'Luc Martin',
        'Sophie Bernard',
        'Éric Dubois'
    ];

    foreach ($noms as $index => $nom) {
        \App\Models\Utilisateur::factory()->create([
            'nom' => $nom,
            'email' => 'user'.($index+1).'@taskflow.local',
        ]);
    }
}
}
