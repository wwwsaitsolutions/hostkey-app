import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Φόρτωση περιβαλλοντικών μεταβλητών από το .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...rest] = trimmed.split('=');
      const val = rest.join('=').replace(/^['"]|['"]$/g, '');
      process.env[key.trim()] = val.trim();
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Λείπουν τα κλειδιά του Supabase στο .env.local.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Μεταφράσεις εδάφους
const SURFACE_TRANSLATIONS = {
  'fine sand': { el: 'Ψιλή άμμος', en: 'Fine sand', fr: 'Sable fin', de: 'Feiner Sand' },
  'sand': { el: 'Άμμος', en: 'Sand', fr: 'Sable', de: 'Sand' },
  'pebble': { el: 'Βότσαλο', en: 'Pebble', fr: 'Galets', de: 'Kiesel' },
  'sand and pebble': { el: 'Άμμος & βότσαλο', en: 'Sand & pebble', fr: 'Sable et galets', de: 'Sand und Kiesel' },
  'sand/pebble': { el: 'Άμμος & βότσαλο', en: 'Sand & pebble', fr: 'Sable et galets', de: 'Sand und Kiesel' },
  'coarse sand': { el: 'Χοντρή άμμος', en: 'Coarse sand', fr: 'Gros sable', de: 'Grober Sand' },
  'rocky': { el: 'Βράχια', en: 'Rocks', fr: 'Rochers', de: 'Felsen' },
  'rocks': { el: 'Βράχια', en: 'Rocks', fr: 'Rochers', de: 'Felsen' },
};

// Μεταφράσεις περιοχών/νομών
const REGION_MAP = {
  chania: { el: 'Χανιά', en: 'Chania', fr: 'La Canée', de: 'Chania' },
  rethymno: { el: 'Ρέθυμνο', en: 'Rethymno', fr: 'Réthymnon', de: 'Rethymno' },
  heraklion: { el: 'Ηράκλειο', en: 'Heraklion', fr: 'Héraklion', de: 'Heraklion' },
  lasithi: { el: 'Λασίθι', en: 'Lasithi', fr: 'Lassithi', de: 'Lasithi' },
};

function getSurfaceText(rawSurface) {
  if (!rawSurface) return null;
  const key = String(rawSurface).toLowerCase().trim();
  return SURFACE_TRANSLATIONS[key] || {
    el: rawSurface,
    en: rawSurface,
    fr: rawSurface,
    de: rawSurface,
  };
}

function getRegionInfo(rawRegion) {
  const rLower = String(rawRegion || '').toLowerCase();
  if (rLower.includes('chan') || rLower.includes('χαν')) return REGION_MAP.chania;
  if (rLower.includes('reth') || rLower.includes('ρεθ')) return REGION_MAP.rethymno;
  if (rLower.includes('her') || rLower.includes('ηρακ')) return REGION_MAP.heraklion;
  if (rLower.includes('las') || rLower.includes('λασι') || rLower.includes('sit') || rLower.includes('agios')) return REGION_MAP.lasithi;
  return { el: 'Κρήτη', en: 'Crete', fr: 'Crète', de: 'Kreta' };
}

// Βασική μετατροπή Greeklish σε Ελληνικά για τα ονόματα παραλιών
function transliterateToGreek(latin) {
  if (!latin) return '';
  if (/[\u0370-\u03FF]/.test(latin)) return latin; // Ήδη ελληνικά

  const map = {
    'th': 'θ', 'ch': 'χ', 'ps': 'ψ', 'ks': 'ξ',
    'a': 'α', 'b': 'β', 'c': 'κ', 'd': 'δ', 'e': 'ε', 'f': 'φ',
    'g': 'γ', 'h': 'χ', 'i': 'ι', 'j': 'τζ', 'k': 'κ', 'l': 'λ',
    'm': 'μ', 'n': 'ν', 'o': 'ο', 'p': 'π', 'q': 'κ', 'r': 'ρ',
    's': 'σ', 't': 'τ', 'u': 'υ', 'v': 'β', 'w': 'γου', 'x': 'ξ',
    'y': 'υ', 'z': 'ζ'
  };

  let str = latin.toLowerCase();
  for (const [k, v] of Object.entries(map)) {
    str = str.replaceAll(k, v);
  }
  // Κεφαλαίο το πρώτο γράμμα
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function run() {
  const filePath = path.resolve(process.cwd(), 'beaches.json');
  if (!fs.existsSync(filePath)) {
    console.error('❌ Δεν βρέθηκε το αρχείο beaches.json.');
    process.exit(1);
  }

  const beaches = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log(`⏳ Επεξεργασία ${beaches.length} παραλιών με πλήρη πολυγλωσσική υποστήριξη...`);

  const records = beaches.map((b) => {
    const isSouth = b.orientation === 'S';
    const reg = getRegionInfo(b.region || b.prefecture);
    const surf = getSurfaceText(b.surface);

    // Ονόματα
    let elName = '';
    let enName = '';
    if (typeof b.name === 'object' && b.name !== null) {
      elName = b.name.el || b.name.gr || transliterateToGreek(b.name.en || '');
      enName = b.name.en || b.name.el || '';
    } else {
      const raw = String(b.name || '').trim();
      elName = /[\u0370-\u03FF]/.test(raw) ? raw : transliterateToGreek(raw);
      enName = raw;
    }

    // Περιγραφές σε 4 γλώσσες
    const surfEl = surf ? ` Έδαφος: ${surf.el}.` : '';
    const surfEn = surf ? ` Surface: ${surf.en}.` : '';
    const surfFr = surf ? ` Type: ${surf.fr}.` : '';
    const surfDe = surf ? ` Strand: ${surf.de}.` : '';

    const orgEl = b.organized ? ' Οργανωμένη με παροχές.' : ' Μη οργανωμένη / φυσικό τοπίο.';
    const orgEn = b.organized ? ' Organized with beach facilities.' : ' Natural / unorganized beach.';
    const orgFr = b.organized ? ' Aménagée avec équipements.' : ' Plage naturelle non aménagée.';
    const orgDe = b.organized ? ' Bewirtschafteter Strand mit Liegen.' : ' Naturbelassener Strand.';

    const descObj = {
      el: `Όμορφη παραλία στην περιοχή ${reg.el}.${surfEl}${orgEl}`,
      en: `Beautiful beach located in the ${reg.en} region.${surfEn}${orgEn}`,
      fr: `Magnifique plage située dans la région de ${reg.fr}.${surfFr}${orgFr}`,
      de: `Wunderschöner Strand in der Region ${reg.de}.${surfDe}${orgDe}`,
    };

    return {
      name: {
        el: elName,
        en: enName,
        fr: enName,
        de: enName,
      },
      description: descObj,
      image_url: b.imageUrl || b.image_url || '/images/default-beach.jpg',
      google_rating: b.rating ? parseFloat(b.rating) : 4.5,
      wind_status: isSouth ? 'sheltered' : 'exposed',
      lat: b.lat || (b.coordinates && b.coordinates.lat) || 35.24,
      lng: b.lng || (b.coordinates && b.coordinates.lng) || 24.47,
      region: reg.el,
    };
  });

  console.log('🧹 Εκκαθάριση πίνακα master_beaches...');
  await supabase.from('master_beaches').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log('🚀 Εισαγωγή νέων πολυγλωσσικών δεδομένων...');
  const batchSize = 50;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const { error } = await supabase.from('master_beaches').insert(batch);
    if (error) {
      console.error(`❌ Σφάλμα στο batch ${i}:`, error.message);
    } else {
      console.log(`✅ Εισήχθησαν ${Math.min(i + batchSize, records.length)} / ${records.length} παραλίες`);
    }
  }

  console.log('🎉 Η εισαγωγή ολοκληρώθηκε επιτυχώς με σωστές μεταφράσεις σε EL, EN, FR, DE!');
}

run();