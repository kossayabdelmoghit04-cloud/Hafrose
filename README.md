# Hafrose - Boutique d'Accessoires Haut de Gamme

Hafrose est une application web e-commerce moderne et responsive, conçue pour une marque d'accessoires haut de gamme (sacs, bijoux, montres, lunettes, ceintures, portefeuilles). 

Le projet est développé selon une architecture découplée professionnelle (API-first), avec un backend robuste en Laravel et un frontend dynamique et interactif en React.

---

## 🛠️ Stack Technique

### Backend
* **Framework** : Laravel 12 (PHP 8.5+)
* **Base de données** : MySQL
* **ORM** : Eloquent
* **Authentification** : Laravel Sanctum
* **Rôles & Permissions** : Spatie Laravel Permission
* **Architecture** : MVC avec couches de Services, Repositories et Form Requests pour une logique métier isolée.

### Frontend
* **Framework** : React 19
* **Outil de Build** : Vite
* **Routing** : React Router DOM
* **Styling** : Tailwind CSS v4
* **Animations** : Framer Motion
* **Notifications** : SweetAlert2
* **Icônes** : React Icons
* **Client HTTP** : Axios

---

## 📁 Structure du Projet

Le dépôt est organisé de la manière suivante :

```text
hafrose/
│
├── backend/            # API REST Laravel 12
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/   # Contrôleurs légers
│   │   │   └── Requests/      # Validation des données (Form Requests)
│   │   ├── Services/          # Logique métier (Business Logic)
│   │   ├── Repositories/      # Requêtes et accès aux données
│   │   └── Models/            # Modèles Eloquent
│   └── ...
│
├── frontend/           # Interface utilisateur React 19 + Vite
│   ├── src/
│   │   ├── components/        # Composants réutilisables
│   │   ├── pages/             # Pages de l'application
│   │   ├── layouts/           # Mises en page (MainLayout, AdminLayout)
│   │   ├── services/          # Services d'appels API (Axios)
│   │   └── ...
│   └── ...
│
├── documentation/      # Documentation officielle et spécifications du projet
└── Idée/               # Espace de travail et notes de conception initiales
```

---

## 🚀 Démarrage Rapide

### Prérequis
* PHP 8.3+ (PHP 8.5.6 recommandé)
* Composer
* Node.js v20+
* MySQL

### 1. Configuration du Backend
1. Rendez-vous dans le dossier backend :
   ```bash
   cd backend
   ```
2. Installez les dépendances PHP :
   ```bash
   composer install
   ```
3. Configurez les variables d'environnement (`.env`) et lancez le serveur :
   ```bash
   php artisan serve
   ```

### 2. Configuration du Frontend
1. Rendez-vous dans le dossier frontend :
   ```bash
   cd frontend
   ```
2. Installez les dépendances npm :
   ```bash
   npm install
   ```
3. Lancez le serveur de développement Vite :
   ```bash
   npm run dev
   ```

---

## 📜 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.
