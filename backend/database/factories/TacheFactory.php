<?php

namespace Database\Factories;

use App\Models\Tache;
use App\Models\Projet;
use Illuminate\Database\Eloquent\Factories\Factory;

class TacheFactory extends Factory
{
    protected $model = Tache::class;

    public function definition(): array
    {
        return [
            'titre' => $this->faker->sentence(4),
            'description' => $this->faker->paragraph(),
            'statut' => $this->faker->randomElement(['a_faire', 'en_cours', 'termine']),
            'priorite' => $this->faker->randomElement(['basse', 'moyenne', 'haute']),
            'projet_id' => Projet::factory(),
        ];
    }
}
