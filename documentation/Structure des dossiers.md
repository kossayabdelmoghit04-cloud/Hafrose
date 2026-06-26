# Structure des Dossiers – Projet Hafrose

# 1. Objectif

Ce document décrit l'organisation complète des dossiers et des fichiers du projet Hafrose.

L'objectif est de garantir :

* Une architecture claire.
* Une maintenance facilitée.
* Une séparation des responsabilités.
* Une évolution simple du projet.
* Le respect des bonnes pratiques Laravel et React.

---

# 2. Architecture Générale

Le projet est divisé en deux applications :

```text
hafrose/
│
├── backend/
│      Laravel 12
│
├── frontend/
│      React + Vite
│
└── documentation/
```

---

# 3. Structure du Backend (Laravel)

```text
backend/
│
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │      Auth/
│   │   │      ProductController.php
│   │   │      CategoryController.php
│   │   │      OrderController.php
│   │   │      ContactController.php
│   │   │      ReviewController.php
│   │   │      DashboardController.php
│   │   │
│   │   ├── Middleware/
│   │   └── Requests/
│   │
│   ├── Models/
│   │      User.php
│   │      Product.php
│   │      Category.php
│   │      Order.php
│   │      OrderItem.php
│   │      Review.php
│   │      Gallery.php
│   │      Contact.php
│   │
│   ├── Services/
│   ├── Policies/
│   └── Providers/
│
├── database/
│   ├── migrations/
│   ├── seeders/
│   └── factories/
│
├── routes/
│      api.php
│      web.php
│
├── storage/
│
├── public/
│
└── tests/
```

---

# 4. Structure du Frontend (React)

```text
frontend/
│
├── public/
│
├── src/
│
│   ├── assets/
│   │      images/
│   │      icons/
│   │
│   ├── components/
│   │      Navbar/
│   │      Footer/
│   │      Hero/
│   │      ProductCard/
│   │      ProductGrid/
│   │      CategoryFilter/
│   │      SearchBar/
│   │      ReviewCard/
│   │      ContactForm/
│   │      OrderForm/
│   │      Button/
│   │      Loader/
│   │
│   ├── layouts/
│   │      MainLayout.jsx
│   │      AdminLayout.jsx
│   │
│   ├── pages/
│   │      Home/
│   │      Shop/
│   │      ProductDetails/
│   │      About/
│   │      Contact/
│   │      Login/
│   │      Dashboard/
│   │
│   ├── services/
│   │      api.js
│   │      authService.js
│   │      productService.js
│   │      orderService.js
│   │
│   ├── hooks/
│   │
│   ├── context/
│   │
│   ├── utils/
│   │
│   ├── routes/
│   │      AppRoutes.jsx
│   │
│   ├── styles/
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── package.json
└── vite.config.js
```

---

# 5. Structure de la Documentation

```text
documentation/
│
├── Prompt Master Gemini.md
├── Cahier des charges.md
├── Contexte du projet.md
├── Architecture technique.md
├── Base de données.md
├── Backend.md
├── Frontend.md
├── API REST.md
├── Dashboard.md
├── Guide UI UX.md
├── Structure des dossiers.md
├── Roadmap.md
└── README.md
```

---

# 6. Convention de Nommage

Le projet doit respecter les conventions suivantes :

Backend :

* Controllers → PascalCase
* Models → PascalCase
* Services → PascalCase
* Migrations → snake_case
* Tables → snake_case

Frontend :

* Components → PascalCase
* Pages → PascalCase
* Hooks → camelCase
* Services → camelCase

API :

* URLs en minuscules.
* Ressources au pluriel.

Exemple :

/api/products

/api/categories

/api/orders

---

# 7. Bonnes Pratiques

* Un composant = une responsabilité.
* Un contrôleur = une ressource principale.
* Aucun code dupliqué.
* Utiliser les Services pour la logique métier.
* Organiser les imports.
* Respecter l'architecture MVC.
* Utiliser Git avec des commits réguliers.
