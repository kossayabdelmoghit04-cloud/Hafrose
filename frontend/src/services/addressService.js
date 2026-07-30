import api from './api';

/**
 * addressService — Service de gestion des adresses de livraison HAFROSE.
 * Connecté à l'API Laravel /api/auth/addresses avec persistance localStorage comme cache hors-ligne.
 * Aucune donnée mockée pré-remplie.
 */

const LOCAL_KEY = 'hafrose_user_addresses';

/**
 * Helpers cache localStorage
 */
function cacheGet() {
  try {
    const stored = localStorage.getItem(LOCAL_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function cacheSet(list) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  } catch {
    // ignore storage errors
  }
}

function cacheClear() {
  localStorage.removeItem(LOCAL_KEY);
}

export const addressService = {
  /**
   * Récupérer toutes les adresses de l'utilisateur connecté
   * GET /api/auth/addresses
   */
  async getAll() {
    try {
      const res = await api.get('/auth/addresses');
      const list = res?.data ?? res ?? [];
      cacheSet(list);
      return list;
    } catch {
      // Fallback sur le cache local (offline)
      return cacheGet() ?? [];
    }
  },

  /**
   * Ajouter une adresse
   * POST /api/auth/addresses
   */
  async add(newAddr) {
    const res = await api.post('/auth/addresses', newAddr);
    cacheClear();
    return res?.data ?? res;
  },

  /**
   * Modifier une adresse
   * PUT /api/auth/addresses/{id}
   */
  async update(id, addrData) {
    const res = await api.put(`/auth/addresses/${id}`, addrData);
    cacheClear();
    return res?.data ?? res;
  },

  /**
   * Supprimer une adresse
   * DELETE /api/auth/addresses/{id}
   */
  async delete(id) {
    await api.delete(`/auth/addresses/${id}`);
    cacheClear();
    return true;
  },

  /**
   * Définir une adresse comme adresse par défaut
   * PATCH /api/auth/addresses/{id}/default
   */
  async setDefault(id) {
    const res = await api.patch(`/auth/addresses/${id}/default`);
    cacheClear();
    return res?.data ?? res;
  },
};

export default addressService;
