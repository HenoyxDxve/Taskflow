<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        

        // ✅ Table projets
        Schema::create('projets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('createur_id')->constrained('users')->onDelete('cascade');
            $table->string('nom');
            $table->text('description')->nullable();
            $table->string('couleur')->default('#3b82f6');
            $table->timestamps();
        });

        // ✅ Table taches
        Schema::create('taches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('projet_id')->constrained('projets')->onDelete('cascade');
            $table->string('titre');
            $table->text('description')->nullable();
            $table->enum('statut', ['a_faire', 'en_cours', 'termine'])->default('a_faire');
            $table->enum('priorite', ['basse', 'moyenne', 'haute'])->default('moyenne');
            $table->timestamps();
        });

        // ✅ Table pivot tache_utilisateur (Many-to-Many)
        Schema::create('tache_utilisateur', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tache_id')->constrained('taches')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->unique(['tache_id', 'user_id']); // Évite les doublons
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tache_utilisateur');
        Schema::dropIfExists('taches');
        Schema::dropIfExists('projets');
        Schema::dropIfExists('users');
    }
};