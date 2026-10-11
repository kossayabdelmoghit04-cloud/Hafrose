/**
 * HAFROSE — Moroccan Market & Locations Reference Data
 * Official administrative cities and urban centers of the Kingdom of Morocco.
 * Architecture is designed to be easily extensible for future international markets.
 */

export interface MarketCountry {
  code: string;
  name: string;
  currency: string;
  phonePrefix: string;
}

export const ALLOWED_COUNTRIES: readonly MarketCountry[] = [
  {
    code: 'MA',
    name: 'Maroc',
    currency: 'MAD',
    phonePrefix: '+212',
  },
] as const;

export const DEFAULT_COUNTRY = 'Maroc';

/**
 * Priority / High-Volume Moroccan Cities for rapid customer selection
 */
export const POPULAR_MOROCCAN_CITIES = [
  'Casablanca',
  'Rabat',
  'Marrakech',
  'Tanger',
  'Fès',
  'Agadir',
  'Meknès',
  'Oujda',
  'Kénitra',
  'Tétouan',
  'Safi',
  'Mohammédia',
  'El Jadida',
  'Nador',
  'Béni Mellal',
  'Essaouira',
] as const;

/**
 * Comprehensive Moroccan Cities Repository covering all 12 Administrative Regions
 */
export const MOROCCAN_CITIES = [
  'Agadir',
  'Aïn Harrouda',
  'Aït Melloul',
  'Al Hoceïma',
  'Aousserd',
  'Asilah',
  'Azemmour',
  'Azilal',
  'Azrou',
  'Ben Guerir',
  'Béni Mellal',
  'Benslimane',
  'Berkane',
  'Berrechid',
  'Biougra',
  'Bouarfa',
  'Boujdour',
  'Boulemane',
  'Bouznika',
  'Casablanca',
  'Chefchaouen',
  'Chichaoua',
  'Dakhla',
  'Dcheira El Jihadia',
  'Demnate',
  'Driouch',
  'El Hajeb',
  'El Jadida',
  'El Kelaâ des Sraghna',
  'Errachidia',
  'Es-Semara',
  'Essaouira',
  'Fès',
  'Figuig',
  'Fnideq',
  'Fquih Ben Salah',
  'Guelmim',
  'Guercif',
  'Ifrane',
  'Inezgane',
  'Jerada',
  'Kasba Tadla',
  'Kénitra',
  'Khémisset',
  'Khénifra',
  'Khouribga',
  'Ksar El Kebir',
  'Laâyoune',
  'Larache',
  'M\'diq',
  'Marrakech',
  'Martil',
  'Médiouna',
  'Meknès',
  'Midelt',
  'Missour',
  'Mohammédia',
  'Nador',
  'Nouaceur',
  'Ouarzazate',
  'Oued Zem',
  'Oujda',
  'Oulad Teïma',
  'Ouazzane',
  'Rabat',
  'Rissani',
  'Safi',
  'Salé',
  'Sefrou',
  'Settat',
  'Sidi Bennour',
  'Sidi Ifni',
  'Sidi Kacem',
  'Sidi Slimane',
  'Skhirat',
  'Souk El Arbaa',
  'Tahannaout',
  'Tan-Tan',
  'Tanger',
  'Taounate',
  'Taourirt',
  'Tarfaya',
  'Taroudant',
  'Tata',
  'Taza',
  'Témara',
  'Tétouan',
  'Tinghir',
  'Tiznit',
  'Youssoufia',
  'Zagora',
  'Zaïo',
] as const;

export type MoroccanCity = (typeof MOROCCAN_CITIES)[number];

/**
 * Check whether a city is recognized in the Moroccan repository (accent & case insensitive)
 */
export function isMoroccanCity(city: string): boolean {
  if (!city) return false;
  const clean = normalizeCityLookup(city);
  return MOROCCAN_CITIES.some((c) => normalizeCityLookup(c) === clean);
}

/**
 * Normalize city lookup helper for robust comparisons
 */
export function normalizeCityLookup(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Formatted Select options for City dropdowns
 */
export const MOROCCAN_CITY_OPTIONS = MOROCCAN_CITIES.map((city) => ({
  value: city,
  label: city,
}));
