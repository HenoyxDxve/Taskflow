<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tache extends Model
{
    protected $fillable = ['titre', 'description', 'statut', 'priorite', 'projet_id'];

    public function projet()
    {
        return $this->belongsTo(Projet::class);
    }

    public function assignes()
    {
        // pivot column "utilisateur_id" matches model naming
        return $this->belongsToMany(Utilisateur::class, 'tache_utilisateur', 'tache_id', 'utilisateur_id');
    }
}