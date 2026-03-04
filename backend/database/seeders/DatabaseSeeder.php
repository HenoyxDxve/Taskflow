<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    // database/seeders/DatabaseSeeder.php
public function run(): void {
    \App\Models\Utilisateur::factory()->create([
        'nom' => 'Test User',
        'email' => 'test@taskflow.com',
        'mot_de_passe' => Hash::make('password123'),
    ]);
}
}
