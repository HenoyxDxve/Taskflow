# TaskFlow - Système de Gestion de Tâches Collaboratif 🚀

[![Laravel](https://img.shields.io/badge/Laravel-12-orange)](https://laravel.com)
[![Angular](https://img.shields.io/badge/Angular-20%2B-red)](https://angular.io)
[![PHP](https://img.shields.io/badge/PHP-8.2%2B-blue)](https://php.net)

## 📋 Table des Matières
- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Tests](#tests)
- [Déploiement](#déploiement)

---

## 🎯 Aperçu

TaskFlow est une application web de gestion collaborative de tâches et projets. Elle permet aux utilisateurs de :
- Créer et gérer des projets
- Créer et organiser des tâches au sein de projets
- Assigner des tâches à d'autres utilisateurs
- Suivre la progression avec un dashboard intuitif
- Filtrer et catégoriser les tâches par statut et priorité

---

## ✨ Fonctionnalités

### 🔐 Authentification
- ✅ Inscription et connexion sécurisées
- ✅ Authentification JWT (JSON Web Tokens)
- ✅ Protection des routes frontend avec Guards
- ✅ Protection des endpoints backend avec Middleware

### 📁 Gestion des Projets
- ✅ Création, lecture, mise à jour, suppression (CRUD)
- ✅ Projets personnalisés avec couleur et description
- ✅ Organisation par créateur
- ✅ Gestion des tâches au sein du projet

### 📝 Gestion des Tâches
- ✅ **Titre, Description, Statut, Priorité**
  - Statuts: À faire, En cours, Terminée
  - Priorités: Basse, Moyenne, Haute
- ✅ **Assignment Multiple** (Many-to-Many avec utilisateurs)
- ✅ Filtrage avancé par statut et priorité
- ✅ Mise à jour de statut en temps réel

### 📊 Dashboard
- ✅ **Résumé rapide** : Total, Terminées, En retard
- ✅ **Liste des projets** avec gestion
- ✅ **Liste des tâches** du projet sélectionné
- ✅ **Interface réactive** et responsive

### 🎨 Interface Utilisateur
- ✅ Design moderne et responsive
- ✅ Thème sombre/clair
- ✅ Formulaires Reactive (Angular)
- ✅ Notifications d'erreur élégantes

---

## 🏗️ Architecture

### Backend (Laravel 12)
```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/     # Contrôleurs API
│   │   ├── Requests/        # Form Requests (validation)
│   │   └── Resources/       # API Resources (transformation)
│   ├── Models/              # Modèles Eloquent
│   └── Policies/            # Autorisations
├── database/
│   ├── factories/           # Test factories
│   ├── migrations/          # Schéma DB
│   └── seeders/             # Données initiales
├── routes/
│   └── api.php              # Routes API
└── tests/                   # Tests automatisés
```

### Frontend (Angular 20+)
```
frontend/
└── src/
    └── app/
        ├── components/      # Composants métier
        ├── services/        # Services API / État
        ├── guards/          # Route Guards
        ├── interceptors/    # HTTP Interceptors
        └── models/          # Models TypeScript
```

---

## 🚀 Installation

### Prérequis
- **Backend** : PHP 8.2+, MySQL/PostgreSQL, Composer
- **Frontend** : Node.js 18+, npm 10+
- **Docker** (optionnel pour déploiement)
- **Git** pour la gestion de version

### 🔧 Étape 0 : Cloner le projet avec les submodules

```bash
# Cloner le projet avec tous les submodules (frontend)
git clone --recursive https://github.com/HenoyxDxve/Taskflow.git
cd taskflow

# Si vous avez oublié le --recursive, exécutez:
git submodule update --init --recursive
```

### Backend Setup

#### 1. Installer les dépendances PHP
```bash
cd backend
composer install
```

#### 2. Configurer l'environnement
```bash
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
```

#### 3. Configurer la base de données
Modifiez le fichier `.env` :
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=taskflow_db
DB_USERNAME=root
DB_PASSWORD=
```

#### 4. Exécuter les migrations
```bash
php artisan migrate
# Optionnel: Charger les données de test
php artisan migrate:fresh --seed
```

#### 5. Démarrer le serveur backend
```bash
# Mode développement avec rechargement auto
php artisan serve

# Sera accessible à http://localhost:8000
```

### Frontend Setup

#### 1. Installer les dépendances Node.js
```bash
cd ../frontend
npm install
```

#### 2. Configurer l'environnement (optionnel)
L'API URL est automatiquement configurée à `http://localhost:8000/api` dans les fichiers d'environnement.

#### 3. Démarrer le serveur de développement
```bash
ng serve
# ou
npm start

# Sera accessible à http://localhost:4200
```

### 🐳 Démarrage avec Docker Compose

Pour un démarrage simplifié, utilisez Docker Compose :

```bash
# Depuis la racine du projet
docker-compose up -d

# Le frontend sera accessible à http://localhost:4200
# L'API backend à http://localhost:8000
```

---

## ⚙️ Configuration

### Variables d'Environnement Backend

```env
# Application
APP_NAME=TaskFlow
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=taskflow_db
DB_USERNAME=root
DB_PASSWORD=

# JWT
JWT_SECRET=votre_cle_secrete_ici
JWT_ALGO=HS256

# CORS
FRONTEND_URL=http://localhost:4200
```

### CORS Configuration
Le CORS est automatiquement configuré pour autoriser :
- `http://localhost:4200` (Angular dev)
- `http://127.0.0.1:4200`
- Patterns: `localhost:*`

Modifiable dans `config/cors.php`

---

## 📚 API Documentation

### Authentification

#### Inscription
```http
POST /api/inscrire
Content-Type: application/json

{
  "nom": "Ble gayé",
  "email": "ble@example.com",
  "mot_de_passe": "password123",
  "mot_de_passe_confirmation": "password123"
}
```

#### Connexion
```http
POST /api/connecter
{
  "email": "ble@example.com",
  "mot_de_passe": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "utilisateur": { "id": 1, "nom": "Jean", "email": "..." }
}
```

### Projets

#### Lister les projets
```http
GET /api/projets
Authorization: Bearer {token}
```

#### Créer un projet
```http
POST /api/projets
Authorization: Bearer {token}

{
  "nom": "Nouveau Projet",
  "description": "Description optionnelle",
  "couleur": "#ff0000"
}
```

#### Mettre à jour un projet
```http
PUT /api/projets/{id}
Authorization: Bearer {token}
```

#### Supprimer un projet
```http
DELETE /api/projets/{id}
Authorization: Bearer {token}
```

### Tâches

#### Lister les tâches d'un projet
```http
GET /api/projets/{project_id}/taches?statut=a_faire&priorite=haute
Authorization: Bearer {token}
```

#### Créer une tâche
```http
POST /api/projets/{project_id}/taches
Authorization: Bearer {token}

{
  "titre": "Titre de la tâche",
  "description": "...",
  "statut": "a_faire",
  "priorite": "haute",
  "assigne_ids": [2, 3]
}
```

#### Changer le statut d'une tâche
```http
PATCH /api/taches/{id}/statut
Authorization: Bearer {token}

{
  "statut": "termine"
}
```

### Dashboard

#### Obtenir le résumé
```http
GET /api/dashboard
Authorization: Bearer {token}

Response:
{
  "total": 15,
  "terminees": 8,
  "en_retard": 2
}
```
---

### 🧭 Utilisation de l'interface

1. **Connexion / Inscription** – après avoir créé votre compte, vous arrivez sur le dashboard.
2. **Créer un projet** : cliquez sur « ➕ Nouveau Projet » puis renseignez un nom, une couleur et une description.
3. **Sélectionner un projet** : les tâches affichées et le résumé correspondent au projet actif.
4. **Créer une tâche** : cliquez sur « ➕ Nouvelle Tâche » puis remplissez le formulaire. 
   - *Assigner* : une section d'utilisateurs apparaît. **Cochez un ou plusieurs noms** pour attribuer la tâche. 
   - Les noms des utilisateurs sont générés en français (ex. Jean Dupont, Marie Curie) lors de l'initialisation via le seeder.
   - Un message d'aide (« Cochez un ou plusieurs noms… ») guide l'action.
5. **Modifier le statut** : utilisez la liste déroulante de chaque tâche pour passer d'« À faire » à « En cours » ou « Terminée ». 
6. **Résumé** : les cartes en haut indiquent le total, le nombre en cours, terminé et en retard.

Le texte d'aide est présent directement sur le dashboard pour rappeler les interactions (cliquez sur le bouton, cochez un utilisateur, etc.).


---

## 🧪 Tests

### Backend - Tests Unitaires et Feature

```bash
# Exécuter tous les tests
php artisan test

# Exécuter un test spécifique
php artisan test tests/Feature/AuthenticationTest.php

# Avec couverture de code
php artisan test --coverage

# Tests disponibles:
- AuthenticationTest         # Inscription, connexion, profil
- ProjetTest                 # CRUD projets, permissions
- TacheTest                  # CRUD tâches, assignements
- CreationTacheTest          # Test basique creation
```

### Résultats attendus
✅ Tous les tests doivent passer :
- 12+ tests de feature
- Couverture: 80%+ des contrôleurs

---

## 🐳 Déploiement (Optionnel - Docker)

### Docker Compose Setup
```bash
# Démarrer les services
docker-compose up -d

# Services:
# - Backend: Laravel (port 8000)
# - Frontend: Angular (port 4200)
# - Database: MySQL (port 3306)
```

### Déploiement Production

#### Backend
```bash
cd backend
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

#### Frontend
```bash
cd frontend
npm run build
# Servir le dossier dist/ avec un serveur web
```

---

## 📞 Support et Contribution

### Bugs et Suggestions
- Créer une issue GitHub
- Décrire le problème en détail
- Inclure les logs d'erreur

### Pour contribuer
1. Forker le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📄 Licences

### Dépendances Principales
- **Laravel 12** - [MIT](https://opensource.org/licenses/MIT)
- **Angular 20** - [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
- **PHP-JWT** - [MIT](https://opensource.org/licenses/MIT)

---

## 🎓 Auteur

Test Technique - Stage Développement d'Application
**Date** : Mars 2026

---

## ⏱️ Délai de Réalisation
- **Durée totale** : 72 heures
- **Status** : ✅ Complété

---

## ✅ Checklist des Fonctionnalités

- [x] Authentification JWT
- [x] CRUD Projets
- [x] CRUD Tâches
- [x] Relation Many-to-Many (Users-Tasks)
- [x] Filtrage tâches
- [x] Dashboard avec résumé
- [x] API Resources
- [x] Form Requests
- [x] Guards Angular
- [x] Interceptors Auth
- [x] Tests unitaires
- [x] Feature tests
- [x] CORS configuration
- [x] Reactive Forms
- [x] UI responsive
- [x] README complet

---

## 🔗 Liens Utiles

- [Documentation Laravel](https://laravel.com/docs)
- [Documentation Angular](https://angular.io/docs)
- [JWT.io](https://jwt.io)
- [REST API Best Practices](https://restfulapi.net/)

