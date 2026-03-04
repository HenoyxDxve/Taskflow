#!/bin/bash

# Script de démarrage du projet TaskFlow

echo "🚀 Démarrage de TaskFlow..."
echo ""

# Vérifier si les dossiers existent
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Erreur: Les dossiers backend/ et frontend/ ne sont pas trouvés"
    exit 1
fi

echo "📦 Backend - Installation et démarrage..."
cd backend

# Vérifier si vendor existe
if [ ! -d "vendor" ]; then
    echo "📥 Installation des dépendances Composer..."
    composer install
fi

# Vérifier le fichier .env
if [ ! -f ".env" ]; then
    echo "📝 Création du fichier .env..."
    cp .env.example .env
    php artisan key:generate
fi

# Vérifier la clé JWT
if ! grep -q "JWT_SECRET=" .env; then
    echo "🔑 Génération de la clé JWT..."
    php artisan jwt:secret
fi

# Lancer le serveur Laravel en arrière-plan
echo "🌐 Lancement du serveur Laravel sur http://localhost:8000..."
php artisan serve > laravel.log 2>&1 &
LARAVEL_PID=$!
echo "Laravel PID: $LARAVEL_PID"

cd ..

echo ""
echo "🎨 Frontend - Installation et démarrage..."
cd frontend

# Vérifier si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📥 Installation des dépendances npm..."
    npm install
fi

# Lancer le serveur Angular
echo "🌐 Lancement du serveur Angular sur http://localhost:4200..."
ng serve > angular.log 2>&1 &
ANGULAR_PID=$!
echo "Angular PID: $ANGULAR_PID"

cd ..

echo ""
echo "✅ TaskFlow est en cours de démarrage!"
echo ""
echo "🔗 Accès:"
echo "   - Backend API: http://localhost:8000"
echo "   - Frontend App: http://localhost:4200"
echo ""
echo "📝 Logs:"
echo "   - Backend: backend/laravel.log"
echo "   - Frontend: frontend/angular.log"
echo ""
echo "❌ Pour arrêter le serveur, appuyez sur Ctrl+C"
echo "   ou utilisez: kill $LARAVEL_PID && kill $ANGULAR_PID"

wait
