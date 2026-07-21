# Documentation Technique — Administration Avancée (Phase 5.6)

Ce document décrit l'architecture, l'implémentation et l'utilisation des fonctionnalités d'administration avancée du backend Laravel 12 HAFROSE.

---

## 1. Architecture Globale

L'implémentation respecte strictement les principes **SOLID**, la **Clean Architecture** et les conventions du projet :

- **Controller Layer** (`ExportController`, `BulkActionController`, `HistoryController`) : Réceptionne les requêtes, délègue la logique métier aux services.
- **Service Layer** (`ExportService`, `ExcelExportService`, `BulkActionService`, `ResourceHistoryService`) : Contient l'intégralité de la logique métier.
- **Export Classes Layer** (`ProductsExport`, `CategoriesExport`, `OrdersExport`, `ReviewsExport`, `ContactsExport`, `UsersExport`) : Définition des exports Excel stylisés et auto-dimensionnés via `Maatwebsite\Excel`.
- **Form Requests** (`AdminExportRequest`, `AdminBulkActionRequest`, `AdminHistoryRequest`) : Sécurisation et validation des entrées.
- **API Resources** (`HistoryResource`) : Normalisation des réponses JSON.
- **Logging Centralisé** (`AdminLogService`, `ActivityLogService`) : Enregistrement de chaque action et audit trail immuable.

---

## 2. Exports CSV & Excel

### 2.1 Export CSV (Streaming)
Le service `ExportService` génère les fichiers CSV en streaming HTTP direct via `Symfony\Component\HttpFoundation\StreamedResponse` et les curseurs Eloquent (`cursor()`). Cela garantit une empreinte mémoire constante et minimale, supportant des dizaines de milliers de lignes.

- **Nommage des fichiers** : `{resource}_{YYYY-MM-DD}_{HH-mm}.csv` (ex: `products_2026-07-21_14-35.csv`)
- **Séparateur** : Point-virgule `;`
- **Encodage** : UTF-8 avec BOM (`\xEF\xBB\xBF`) inséré au début pour une ouverture parfaite sous Microsoft Excel (gestion des accents français).

### 2.2 Export Excel (XLSX)
Le service `ExcelExportService` exploite le package `Maatwebsite\Excel` avec des classes dédiées par ressource :
- En-têtes stylisés (fond foncé `#1E293B`, texte blanc en gras)
- Ajustement automatique de la largeur des colonnes (`ShouldAutoSize`)
- Formatage des prix (`129.90 €`), booléens lisibles (`Oui`/`Non`, `Lu`/`Non lu`), et dates (`d/m/Y H:i`)
- Nommage explicite des feuilles de calcul (`Produits`, `Catégories`, `Commandes`, `Avis Clients`, `Contacts`, `Utilisateurs`).

---

## 3. Actions Groupées (Bulk Actions)

Le système d'actions groupées (`BulkActionService`) permet d'exécuter des traitements de masse sur plusieurs ressources de façon transactionnelle (`DB::transaction`).

### 3.1 Operations Supportées
- **Produits** : `delete`, `activate` / `publish`, `deactivate` / `unpublish`
- **Catégories** : `delete` (avec sécurité interdisant la suppression de catégories liées à des produits)
- **Avis** : `delete`, `approve`, `reject`
- **Contacts** : `delete`, `mark_read`, `mark_unread`
- **Commandes** : `delete`, `status_update`, `archive`

### 3.2 Structure de la Réponse JSON
```json
{
  "success": true,
  "message": "Action groupée 'activate' exécutée : 3 élément(s) modifié(s), 0 ignoré(s).",
  "errors": [],
  "data": {
    "action": "activate",
    "resource": "products",
    "count_modified": 3,
    "count_ignored": 0,
    "errors": []
  }
}
```

---

## 4. Historique des Modifications (Audit Trail)

L'endpoint `GET /api/admin/history/{resource}/{id}` permet d'inspecter l'historique complet d'une ressource spécifique.

### 4.1 Réutilisation des Composants
Le service `ResourceHistoryService` interroge les tables `admin_logs` et `activity_logs` existantes sans dupliquer de code ni de données.

### 4.2 Exemple de Réponse JSON Historique
```json
{
  "success": true,
  "message": null,
  "errors": null,
  "data": [
    {
      "id": 15,
      "admin": {
        "id": 1,
        "name": "Admin Hafrose",
        "email": "admin@hafrose.com"
      },
      "action": "update",
      "resource": "product",
      "resource_id": 42,
      "description": "Modification du produit : Montre Chrono Or",
      "old_values": {
        "price": "4990.00"
      },
      "new_values": {
        "price": "5290.00"
      },
      "ip_address": "127.0.0.1",
      "user_agent": "Mozilla/5.0 ...",
      "created_at": "2026-07-21T18:00:00+01:00"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 15,
    "total": 1
  }
}
```

---

## 5. Endpoints REST

| Méthode | URL | Description | Protégé par |
|---|---|---|---|
| `GET` | `/api/admin/export/{resource}/csv` | Exportation CSV en streaming | `auth:sanctum`, `admin` |
| `GET` | `/api/admin/export/{resource}/excel` | Exportation Excel stylisée | `auth:sanctum`, `admin` |
| `POST` | `/api/admin/{resource}/bulk` | Exécution d'actions groupées | `auth:sanctum`, `admin` |
| `GET` | `/api/admin/history/{resource}/{id}` | Consultation de l'historique d'une ressource | `auth:sanctum`, `admin` |

---

## 6. Sécurité & Performance

- **Sécurité** :
  - Tous les endpoints sont soumis à l'authentification `auth:sanctum` et au middleware `admin`.
  - Masquage et réjection automatique des champs sensibles (mots de passe, tokens) via `AdminLogService::sanitize()`.
- **Performance** :
  - Absence de requêtes N+1 grâce à l'utilisation systématique de `with()` et `withCount()`.
  - Pas de blocage mémoire en CSV grâce aux curseurs Eloquent (`cursor()`).
  - Utilisation de transactions SQL atomiques pour l'intégrité des opérations en masse.
