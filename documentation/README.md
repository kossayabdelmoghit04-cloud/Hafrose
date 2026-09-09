# HAFROSE — Index de la Documentation

Bienvenue dans le centre de documentation officiel du projet **HAFROSE**, plateforme e-commerce Haute Couture & Prêt-à-Porter.

L'ensemble des documents ci-dessous reflète l'architecture, les spécifications et les procédures opérationnelles de l'environnement **100% Local Windows**.

---

## 🧭 Guide Opérationnel Principal (Source de Vérité)

> [!IMPORTANT]
> Pour toute opération quotidienne, installation, démarrage, maintenance, diagnostic, sauvegarde, restauration ou incident local, consultez en priorité :
> 
> 👉 [**LOCAL_OPERATIONS_GUIDE.md**](file:///documentation/LOCAL_OPERATIONS_GUIDE.md) — **Guide des Opérations & Procédures Locales**  
> *Le document central unifié contenant les 28 procédures opérationnelles indispensables à l'exploitation du projet.*

---

## 📚 Cartographie Documentaire

```text
documentation/
│
├── 📖 Guides Opérationnels Locaux
│   ├── LOCAL_OPERATIONS_GUIDE.md            # Guide central complet unifié (Phase 5.5)
│   ├── LOCAL_ENVIRONMENT_GUIDE.md           # Guide d'installation et de stabilisation (Phase 5.1)
│   ├── LOCAL_BACKUP_RESTORE_GUIDE.md        # Guide de sauvegarde et restauration locale (Phase 5.2)
│   ├── LOCAL_MONITORING_LOGS_GUIDE.md       # Guide de journalisation Monolog et monitoring (Phase 5.3)
│   └── LOCAL_MAINTENANCE_SECURITY_GUIDE.md  # Guide de maintenance préventive et sécurité (Phase 5.4)
│
├── 📋 Rapports de Validation des Phases (Cycle 5)
│   ├── PHASE_5_1_LOCAL_STABILIZATION_REPORT.md    # Clôture Phase 5.1 — Environnement local
│   ├── PHASE_5_2_BACKUP_RESTORE_REPORT.md        # Clôture Phase 5.2 — Backup & Restore
│   ├── PHASE_5_3_MONITORING_LOGS_REPORT.md        # Clôture Phase 5.3 — Logs & Monitoring
│   ├── PHASE_5_4_MAINTENANCE_SECURITY_REPORT.md   # Clôture Phase 5.4 — Maintenance & Sécurité
│   └── PHASE_5_5_DOCUMENTATION_OPERATIONS_REPORT.md # Clôture Phase 5.5 — Documentation & Opérations
│
└── 📐 Spécifications Fonctionnelles & Conception Initiale
    ├── Cahier des charges.md          # Besoins métier & univers Haute Couture
    ├── Base de données.md             # Modèle de données & relations Eloquent
    ├── API REST.md                    # Spécifications initiales des endpoints
    ├── backend logique.md             # Organisation des contrôleurs, services et repositories
    ├── frontend vue.md                # Architecture des composants React et layouts
    ├── Structure des dossiers.md      # Conventions d'organisation du monorepo
    └── Roadmap de développement.md    # Historique de planification
```

---

## 🔍 Synthèse des Guides par Domaine Opérationnel

### 1. Installation & Démarrage
- [LOCAL_OPERATIONS_GUIDE.md (Sections 1 à 6)](file:///documentation/LOCAL_OPERATIONS_GUIDE.md#1-présentation-hafrose--architecture-locale) : Prérequis réels, installation depuis zéro, configuration des fichiers `.env` et lancement quotidien des deux terminaux (Frontend `:3000`, Backend `:8000`).
- [LOCAL_ENVIRONMENT_GUIDE.md](file:///documentation/LOCAL_ENVIRONMENT_GUIDE.md) : Guide initial de mise en place de l'environnement Windows.

### 2. Diagnostic & Contrôle de Santé
- [LOCAL_OPERATIONS_GUIDE.md (Sections 7, 8, 13, 14)](file:///documentation/LOCAL_OPERATIONS_GUIDE.md#8-health-check-automatisé) : Utilisation du script `scripts/health-check.ps1`, grille de décodage PASS/WARN/FAIL et arbre de décision de diagnostic en 7 étapes.
- [LOCAL_MONITORING_LOGS_GUIDE.md](file:///documentation/LOCAL_MONITORING_LOGS_GUIDE.md) : Détail des sondes de santé de l'API `/api/health`.

### 3. Sauvegardes & Restauration
- [LOCAL_OPERATIONS_GUIDE.md (Sections 10 et 11)](file:///documentation/LOCAL_OPERATIONS_GUIDE.md#10-sauvegarde-locale-automatisée) : Sauvegarde autonome, intégrité SHA-256 du manifeste, modes de restauration ciblés et script `scripts/restore.ps1`.
- [LOCAL_BACKUP_RESTORE_GUIDE.md](file:///documentation/LOCAL_BACKUP_RESTORE_GUIDE.md) : Anatomie complète des archives ZIP et protocoles détaillés.

### 4. Journalisation & Traçabilité
- [LOCAL_OPERATIONS_GUIDE.md (Section 12)](file:///documentation/LOCAL_OPERATIONS_GUIDE.md#12-gestion-des-logs--rétention) : Canal Monolog `daily`, rétention de 14 jours, masquage `SanitizeContextProcessor` et commande `php artisan hafrose:logs:clean`.
- [LOCAL_MONITORING_LOGS_GUIDE.md](file:///documentation/LOCAL_MONITORING_LOGS_GUIDE.md) : Niveaux RFC 5424 et règles de caviardage des secrets.

### 5. Maintenance, Sécurité & Mises à Jour
- [LOCAL_OPERATIONS_GUIDE.md (Sections 15, 16, 24)](file:///documentation/LOCAL_OPERATIONS_GUIDE.md#15-maintenance-préventive--mises-à-jour) : Audits de vulnérabilités (`composer audit`, `npm audit`), règles d'hygiène Git (aucun secret, aucun log, aucun backup) et politique conservatrice de mise à jour.
- [LOCAL_MAINTENANCE_SECURITY_GUIDE.md](file:///documentation/LOCAL_MAINTENANCE_SECURITY_GUIDE.md) : Détails sur la protection CSRF, Sanctum, CORS restreint et tests de sécurité.

### 6. Tests & Validation
- [LOCAL_OPERATIONS_GUIDE.md (Section 9)](file:///documentation/LOCAL_OPERATIONS_GUIDE.md#9-exécution-des-tests) : Exécution des 432 tests PHPUnit, test d'audit de sécurité, vérifications TypeScript/ESLint/Build et 28 tests E2E Playwright.

### 7. Résolution d'Incidents & Rollback
- [LOCAL_OPERATIONS_GUIDE.md (Sections 18, 19, 20, 21)](file:///documentation/LOCAL_OPERATIONS_GUIDE.md#18-arrêt-du-projet--libération-des-ressources) : Arrêt propre des processus, réinitialisation contrôlée (`⚠️ DESTRUCTIF`), rollback en 10 étapes et solutions aux incidents courants.

---

*HAFROSE — Index Documentaire Officiel — Septembre 2026*
