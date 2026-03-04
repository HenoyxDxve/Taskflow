<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class Utilisateur extends Authenticatable implements JWTSubject
{
    use Notifiable;

    protected $table = 'users';
    
    protected $fillable = ['nom', 'email', 'mot_de_passe'];
    protected $hidden = ['mot_de_passe', 'remember_token'];
    protected $casts = ['mot_de_passe' => 'hashed'];

    // ✅ MÉTHODE CRITIQUE : Dit à Laravel/JWT quel champ contient le mot de passe
    public function getAuthPassword()
    {
        return $this->mot_de_passe;
    }

    // ✅ Méthodes requises par JWTSubject
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [
            'nom' => $this->nom,
            'email' => $this->email,
        ];
    }

    // Relations
    public function projets()
    {
        return $this->hasMany(Projet::class, 'createur_id');
    }

    public function tachesAssignees()
    {
        return $this->belongsToMany(Tache::class, 'tache_utilisateur');
    }
}