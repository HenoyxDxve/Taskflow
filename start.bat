@echo off
REM Script de démarrage du projet TaskFlow pour Windows

echo.
echo ====================================
echo   TaskFlow - Démarrage 🚀
echo ====================================
echo.

REM Vérifier si les dossiers existent
if not exist "backend" (
    echo ❌ Erreur: Le dossier 'backend' n'existe pas
    pause
    exit /b 1
)

if not exist "frontend" (
    echo ❌ Erreur: Le dossier 'frontend' n'existe pas
    pause
    exit /b 1
)

REM Backend Setup
echo 📦 Configuration Backend...
cd backend

if not exist "vendor" (
    echo 📥 Installation des dépendances Composer...
    call composer install
)

if not exist ".env" (
    echo 📝 Création du fichier .env...
    copy .env.example .env
    call php artisan key:generate
)

REM Vérifier JWT_SECRET
findstr /M "JWT_SECRET" .env > nul
if errorlevel 1 (
    echo 🔑 Génération de la clé JWT...
    call php artisan jwt:secret
)

echo 🌐 Lancement du serveur Laravel sur http://localhost:8000...
start "Laravel Server" php artisan serve

cd ..

REM Frontend Setup
echo.
echo 🎨 Configuration Frontend...
cd frontend

if not exist "node_modules" (
    echo 📥 Installation des dépendances npm...
    call npm install
)

echo 🌐 Lancement du serveur Angular sur http://localhost:4200...
start "Angular Server" ng serve

cd ..

echo.
echo ✅ TaskFlow est en cours de démarrage!
echo.
echo 🔗 Accès:
echo    - Backend API: http://localhost:8000
echo    - Frontend App: http://localhost:4200
echo.
echo 📝 Logs:
echo    - Vérifiez les fenêtres de commande ouvertes
echo.
echo Appuyez sur une touche pour continuer...
pause
