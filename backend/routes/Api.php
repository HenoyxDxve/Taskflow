<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProjetController;
use App\Http\Controllers\TacheController;
use App\Http\Controllers\DashboardController;

// 🔓 Routes publiques
Route::post('/inscrire', [AuthController::class, 'inscrire']);
Route::post('/connecter', [AuthController::class, 'connecter']);

// 🔐 Routes protégées - ✅ UTILISER 'auth:api' (PAS 'auth:jwt')
Route::middleware('auth:api')->group(function () {
    
    Route::get('/profil', [AuthController::class, 'obtenirProfil']);
    Route::post('/deconnecter', [AuthController::class, 'deconnecter']);
    
    Route::get('/dashboard', [DashboardController::class, 'obtenirResume']);
    Route::get('/utilisateurs', [AuthController::class, 'lister']);
    
    Route::get('/projets', [ProjetController::class, 'lister']);
    Route::post('/projets', [ProjetController::class, 'creer']);
    Route::put('/projets/{projet}', [ProjetController::class, 'mettreAJour']);
    Route::delete('/projets/{projet}', [ProjetController::class, 'supprimer']);
    
    Route::get('/projets/{projet}/taches', [TacheController::class, 'lister']);
    Route::post('/projets/{projet}/taches', [TacheController::class, 'creer']);
    Route::patch('/taches/{tache}/statut', [TacheController::class, 'mettreAJourStatut']);
    Route::patch('/taches/{tache}/assignees', [TacheController::class, 'mettreAJourAssignees']);
    Route::put('/taches/{tache}', [TacheController::class, 'mettreAJour']);
    Route::delete('/taches/{tache}', [TacheController::class, 'supprimer']);
});