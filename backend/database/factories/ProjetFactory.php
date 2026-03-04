<?php

namespace Database\Factories;

use App\Models\Projet;
use App\Models\Utilisateur;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProjetFactory extends Factory
{
    protected $model = Projet::class;

    public function definition(): array
    {
        return [
            'nom' => $this->faker->sentence(3),
            'description' => $this->faker->paragraph(),
            'couleur' => $this->faker->hexColor(),
            'createur_id' => Utilisateur::factory(),
        ];
    }
}
