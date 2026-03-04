<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Projet extends Model
{
    protected $fillable = [
        'nom', 
        'description', 
        'couleur', 
        'createur_id'  // ← IMPORTANT : doit être dans fillable
    ];

    protected $casts = [
        'createur_id' => 'integer',
    ];

    public function createur(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'createur_id');
    }

    public function taches(): HasMany
    {
        return $this->hasMany(Tache::class);
    }
}