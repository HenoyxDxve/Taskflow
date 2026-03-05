# TaskFlow API - Test Technique

## Structure
- `/backend`: API Laravel 11 (Compatibile Spec 12)
- `/frontend`: App Angular 18+ (Standalone, Signals)

## Installation

### Backend
1. `cd backend`
2. `composer install`
3. Copier `.env.example` vers `.env` et configurer la BDD.
4. `php artisan key:generate`
5. `php artisan jwt:secret`
6. `php artisan migrate`
7. `php artisan serve`

### Frontend
1. `cd frontend`
2. `npm install`
3. `ng serve`

## Fonctionnalités
- Authentification JWT
- CRUD Projets & Taches
- Dashboard avec signaux
- Tests Unitaires inclus

## Tests
`cd backend && php artisan test`