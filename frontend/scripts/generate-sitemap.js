#!/usr/bin/env node
/**
 * generate-sitemap.js — Hafrose SEO
 *
 * Génère public/sitemap.xml dynamiquement en récupérant les produits
 * et catégories depuis l'API Laravel.
 *
 * Usage :
 *   node scripts/generate-sitemap.js
 *
 * Variables d'environnement (optionnelles) :
 *   SITEMAP_API_URL  : URL de base de l'API  (défaut: http://localhost:8000)
 *   SITEMAP_SITE_URL : URL du site en production (défaut: https://hafrose.com)
 *
 * Ajouter dans package.json:
 *   "scripts": { "sitemap": "node scripts/generate-sitemap.js" }
 */

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const API_URL  = process.env.SITEMAP_API_URL  || 'http://localhost:8000';
const SITE_URL = process.env.SITEMAP_SITE_URL || 'https://hafrose.com';

const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

// ── Pages statiques ────────────────────────────────────────────────────────
const STATIC_PAGES = [
  { loc: `${SITE_URL}/`,        changefreq: 'daily',   priority: '1.0', lastmod: now },
  { loc: `${SITE_URL}/shop`,    changefreq: 'daily',   priority: '0.9', lastmod: now },
  { loc: `${SITE_URL}/about`,   changefreq: 'monthly', priority: '0.7', lastmod: now },
  { loc: `${SITE_URL}/contact`, changefreq: 'monthly', priority: '0.7', lastmod: now },
];

// ── Catégories statiques (filtre URL) ─────────────────────────────────────
const STATIC_CATEGORIES = [
  'sacs-a-main', 'maroquinerie', 'bijoux', 'montres', 'lunettes', 'ceintures',
].map(slug => ({
  loc: `${SITE_URL}/shop?category=${slug}`,
  changefreq: 'weekly',
  priority: '0.8',
  lastmod: now,
}));

// ── Fetch helper (Node.js native fetch, dispo depuis Node 18) ─────────────
async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

// ── Récupérer tous les produits (pagination gérée) ────────────────────────
async function fetchAllProducts() {
  const products = [];
  let page = 1;
  let lastPage = 1;

  do {
    const data = await fetchJson(
      `${API_URL}/api/products?page=${page}&per_page=100&is_active=1`
    );
    if (data?.success && Array.isArray(data?.data)) {
      products.push(...data.data);
      lastPage = data?.meta?.last_page || 1;
    } else {
      break;
    }
    page++;
  } while (page <= lastPage);

  return products;
}

// ── Récupérer toutes les catégories ───────────────────────────────────────
async function fetchCategories() {
  const data = await fetchJson(`${API_URL}/api/categories`);
  return data?.success && Array.isArray(data?.data) ? data.data : [];
}

// ── Générer le XML d'une entrée <url> ─────────────────────────────────────
function urlEntry({ loc, changefreq, priority, lastmod }) {
  return [
    '  <url>',
    `    <loc>${escapeXml(loc)}</loc>`,
    lastmod   ? `    <lastmod>${lastmod}</lastmod>` : '',
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : '',
    priority   ? `    <priority>${priority}</priority>` : '',
    '  </url>',
  ].filter(Boolean).join('\n');
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ── Générer le sitemap complet ─────────────────────────────────────────────
async function generateSitemap() {
  console.log('🗺  Hafrose — Génération du sitemap...');

  let productEntries = [];
  let categoryEntries = [...STATIC_CATEGORIES];

  try {
    // Produits dynamiques
    const products = await fetchAllProducts();
    console.log(`   ✓ ${products.length} produits récupérés`);

    productEntries = products.map(p => ({
      loc: `${SITE_URL}/products/${p.slug}`,
      changefreq: 'weekly',
      priority: '0.8',
      lastmod: (p.updated_at || now).split('T')[0],
    }));

    // Catégories dynamiques (enrichit les catégories statiques)
    const categories = await fetchCategories();
    console.log(`   ✓ ${categories.length} catégories récupérées`);

    const dynamicCatSlugs = new Set(STATIC_CATEGORIES.map(c =>
      new URL(c.loc).searchParams.get('category')
    ));

    categories.forEach(cat => {
      const slug = cat.slug;
      if (slug && !dynamicCatSlugs.has(slug)) {
        categoryEntries.push({
          loc: `${SITE_URL}/shop?category=${encodeURIComponent(slug)}`,
          changefreq: 'weekly',
          priority: '0.8',
          lastmod: now,
        });
      }
    });
  } catch (err) {
    console.warn(`   ⚠ API inaccessible (${err.message}) — sitemap statique généré`);
  }

  const allEntries = [
    ...STATIC_PAGES,
    ...categoryEntries,
    ...productEntries,
  ];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    '',
    '  <!-- ── Pages statiques ─────────────────────────────────────────── -->',
    ...STATIC_PAGES.map(urlEntry),
    '',
    '  <!-- ── Catégories ──────────────────────────────────────────────── -->',
    ...categoryEntries.map(urlEntry),
    '',
    productEntries.length > 0
      ? `  <!-- ── Produits (${productEntries.length} entrées) ───────────────────────────── -->`
      : '  <!-- ── Produits (aucune entrée dynamique disponible) ──────────── -->',
    ...productEntries.map(urlEntry),
    '',
    '</urlset>',
    '',
  ].join('\n');

  const outputPath = resolve(__dirname, '../public/sitemap.xml');
  writeFileSync(outputPath, xml, 'utf-8');

  console.log(`   ✓ sitemap.xml généré — ${allEntries.length} URLs`);
  console.log(`   📄 ${outputPath}`);
}

generateSitemap().catch(err => {
  console.error('❌ Erreur lors de la génération du sitemap :', err.message);
  process.exit(1);
});
