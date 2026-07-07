HAFROSE — Roadmap de Transformation Frontend Luxury
Phase 0 — Audit & Baseline ✅ (Terminée)

Objectif : comprendre totalement l'état actuel du projet.

Tâches
✅ Audit Architecture
✅ Audit UI
✅ Audit UX
✅ Audit Responsive
✅ Audit Accessibilité
✅ Audit Performance
✅ Audit Technique
✅ Audit Design System
✅ Rapport global
Phase 1 — UI Foundation (Design System)

Objectif : créer le socle visuel qui sera utilisé par tout le projet.

Aucune page métier ne doit être modifiée.

1.1 Typography Foundation

Fichier

src/index.css

Tâches

Importer Cormorant Garamond
Importer Playfair Display
Vérifier Plus Jakarta Sans
Définir les familles de polices
Définir les tailles
Définir les classes typographiques
Vérifier le rendu

Validation

npm run build
1.2 Design Tokens

Toujours dans

src/index.css

Créer

Rose Gold
Rose
Blush
Beige
Warm
Text
Border
Success
Error
Warning
Info

Créer les alias

luxury-gold
↓

rose-gold
1.3 Global CSS

Toujours

src/index.css

Créer

Scrollbar
Selection
Focus
Hover
Disabled
Shadows
Radius
Container
Section spacing
1.4 Motion System

Toujours

src/index.css

Créer

fade-up
fade-in
shimmer
pulse
slow zoom
transitions
1.5 Button

Modifier uniquement

Button.jsx

Créer

Primary
Secondary
Rose
Warm
Text

Vérifier

Loading
Disabled
Hover
Focus
1.6 Navbar

Modifier uniquement

Navbar.jsx

Objectifs

Corriger l'espace blanc entre Navbar et contenu
Corriger les liens invisibles au chargement
Uniformiser le header
Corriger le Drawer
Corriger les couleurs
Corriger les transitions
Corriger le menu mobile
1.7 Footer

Modifier

Footer.jsx

Objectifs

Couleurs
Newsletter
Hover
Icônes
Séparateurs
1.8 Validation Phase 1

Faire

npm run lint

npm run build

php artisan test

Puis

Validation visuelle

Desktop

Tablet

Mobile

Phase 2 — Homepage Luxury

Objectif :

Transformer totalement la Home.

Hero
plein écran
overlay
storytelling
CTA
animation lente
Maison Presentation
storytelling
luxe
espaces blancs
Categories
nouvelles cards
hover premium
Featured Products
cards premium
badges
prix
image
Why Choose Us
iconographie
alignements
Testimonials
nouveau layout
Newsletter
version premium
Phase 3 — Catalogue

Transformer

Shop

Tâches

filtres
sidebar
tri
pagination
responsive
Phase 4 — Product Experience

Transformer

Product

Créer

galerie premium
zoom
sticky infos
storytelling
recommandations
Phase 5 — Shopping Experience

Transformer

Cart

Checkout

Order Confirmation

Objectif

Créer un tunnel d'achat haut de gamme.

Phase 6 — Corporate Pages

Transformer

About

Contact

FAQ

Créer une identité éditoriale.

Phase 7 — Administration UI

Uniformiser

Dashboard

Products

Orders

Categories

Customers

Sans modifier la logique.

Phase 8 — Final Polish

Dernière passe.

Checklist

animations
responsive
accessibilité
performance
SEO visuel
cohérence
suppression complète des anciennes couleurs
validation finale