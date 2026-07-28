import api from './api';

const LOCAL_KEY = 'hafrose_user_addresses';

const INITIAL_ADDRESSES = [
  {
    id: 1,
    title: 'Domicile Paris',
    name: 'Mme Marie Dupont',
    address: '12, Avenue Montaigne',
    city: 'Paris',
    postal_code: '75008',
    country: 'France',
    phone: '+33 6 12 34 56 78',
    is_default: true,
  },
];

export const addressService = {
  getAll() {
    try {
      const stored = localStorage.getItem(LOCAL_KEY);
      return stored ? JSON.parse(stored) : INITIAL_ADDRESSES;
    } catch {
      return INITIAL_ADDRESSES;
    }
  },

  saveAll(list) {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Erreur sauvegarde adresses :', e);
    }
  },

  async add(newAddr) {
    const list = this.getAll();
    const created = {
      id: Date.now(),
      ...newAddr,
      is_default: list.length === 0 ? true : !!newAddr.is_default,
    };
    let updated = [...list];
    if (created.is_default) {
      updated = updated.map((a) => ({ ...a, is_default: false }));
    }
    updated.push(created);
    this.saveAll(updated);
    return created;
  },

  async update(id, addrData) {
    let list = this.getAll();
    if (addrData.is_default) {
      list = list.map((a) => ({ ...a, is_default: false }));
    }
    const updated = list.map((a) => (a.id === id ? { ...a, ...addrData } : a));
    this.saveAll(updated);
    return updated.find((a) => a.id === id);
  },

  async delete(id) {
    const list = this.getAll();
    const filtered = list.filter((a) => a.id !== id);
    if (filtered.length > 0 && !filtered.some((a) => a.is_default)) {
      filtered[0].is_default = true;
    }
    this.saveAll(filtered);
    return true;
  },

  async setDefault(id) {
    const list = this.getAll();
    const updated = list.map((a) => ({
      ...a,
      is_default: a.id === id,
    }));
    this.saveAll(updated);
    return updated;
  },
};

export default addressService;
