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
  console.error('❌ Λείπουν τα κλειδιά του Supabase στο .env.local (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Βασικό λεξικό αντιστοίχισης γνωστών παραλιών σε ελληνικά
const COMMON_NAMES_MAP = {
  'preveli': 'Πρέβελη',
  'elafonisi': 'Ελαφονήσι',
  'elafonissi': 'Ελαφονήσι',
  'balos': 'Μπάλος',
  'falasarna': 'Φαλάσαρνα',
  'falassarna': 'Φαλάσαρνα',
  'vai': 'Βάι',
  'matala': 'Μάταλα',
  'plakias': 'Πλακιάς',
  'rethymno': 'Παραλία Ρεθύμνου',
  'rethymnon': 'Παραλία Ρεθύμνου',
  'rethymnon city': 'Παραλία Ρεθύμνου (Πόλη)',
  'bali': 'Μπαλί',
  'agia galini': 'Αγία Γαλήνη',
  'triopetra': 'Τριόπετρα',
  'agios pavlos': 'Άγιος Παύλος',
  'kommos': 'Κομμός',
  'georgioupoli': 'Γεωργιούπολη',
  'seitan limania': 'Σεϊτάν Λιμάνια',
  'stavros': 'Σταυρός',
  'elounda': 'Ελούντα',
  'plaka': 'Πλάκα',
  'frangokastello': 'Φραγκοκάστελλο',
  'damnoni': 'Δαμνόνι',
  'amoudi': 'Αμμούδι',
  'schinaria': 'Σχοινάρια',
  'rodakino': 'Ροδάκινο',
  'souda': 'Σούδα',
};

async function run() {
  const filePath = path.resolve(process.cwd(), 'beaches.json');
  if (!fs.existsSync(filePath)) {
    console.error('❌ Δεν βρέθηκε το αρχείο beaches.json στον κεντρικό φάκελο.');
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const beaches = JSON.parse(raw);

  console.log(`⏳ Έναρξη επεξεργασίας ${beaches.length} παραλιών από το beaches.json...`);

  const records = beaches.map((b) => {
    const isSouth = b.orientation === 'S';

    // 1. Εξαγωγή & Δημιουργία Δίγλωσσου Ονόματος
    let nameObj = { el: '', en: '', fr: '', de: '' };
    if (typeof b.name === 'object' && b.name !== null) {
      nameObj = {
        el: b.name.el || b.name.gr || b.name.en || '',
        en: b.name.en || b.name.el || '',
        fr: b.name.fr || b.name.en || '',
        de: b.name.de || b.name.en || '',
      };
    } else {
      const rawName = String(b.name || '').trim();
      const rawLower = rawName.toLowerCase();

      // Έλεγχος αν υπάρχει ήδη ελληνική γραφή ή αντιστοίχιση
      const explicitGreek = b.name_el || b.nameGr || b.greek_name || b.name_greek;
      let elName = explicitGreek || COMMON_NAMES_MAP[rawLower] || rawName;
      let enName = b.name_en || b.nameEn || rawName;

      // Αν το όνομα είναι ήδη ελληνικό
      const hasGreekChars = /[\u0370-\u03FF]/.test(rawName);
      if (hasGreekChars) {
        elName = rawName;
      }

      nameObj = {
        el: elName,
        en: enName,
        fr: enName,
        de: enName,
      };
    }

    // 2. Εξαγωγή & Δημιουργία Δίγλωσσης Περιγραφής
    let descObj = { el: '', en: '', fr: '', de: '' };
    if (typeof b.description === 'object' && b.description !== null) {
      descObj = {
        el: b.description.el || b.description.gr || b.description.en || '',
        en: b.description.en || b.description.el || '',
        fr: b.description.fr || b.description.en || '',
        de: b.description.de || b.description.en || '',
      };
    } else if (typeof b.description === 'string' && b.description.trim()) {
      descObj = {
        el: b.description,
        en: b.description,
        fr: b.description,
        de: b.description,
      };
    } else {
      const surfaceStr = b.surface ? ` Έδαφος: ${b.surface}.` : '';
      const orgStr = b.organized ? ' Οργανωμένη με παροχές.' : '';
      const surfaceEn = b.surface ? ` Surface: ${b.surface}.` : '';
      const orgEn = b.organized ? ' Organized beach.' : '';

      descObj = {
        el: `Όμορφη παραλία στην περιοχή ${b.region || 'Κρήτη'}.${surfaceStr}${orgStr}`,
        en: `Beautiful beach located in ${b.region || 'Crete'}.${surfaceEn}${orgEn}`,
        fr: `Belle plage située dans la région de ${b.region || 'Crète'}.`,
        de: `Schöner Strand in der Region ${b.region || 'Kreta'}.`,
      };
    }

    // 3. Κανονικοποίηση Νομού / Περιοχής
    let reg = b.region || b.prefecture || 'Κρήτη';
    const regLower = String(reg).toLowerCase();
    if (regLower.includes('chania') || regLower.includes('χανι')) reg = 'Χανιά';
    else if (regLower.includes('reth') || regLower.includes('ρεθυ')) reg = 'Ρέθυμνο';
    else if (regLower.includes('her') || regLower.includes('ηρακλ')) reg = 'Ηράκλειο';
    else if (regLower.includes('las') || regLower.includes('λασι') || regLower.includes('sitia') || regLower.includes('agios')) reg = 'Λασίθι';

    return {
      name: nameObj,
      description: descObj,
      image_url: b.imageUrl || b.image_url || '/images/default-beach.jpg',
      google_rating: b.rating ? parseFloat(b.rating) : 4.5,
      wind_status: isSouth ? 'sheltered' : 'exposed',
      lat: b.lat || (b.coordinates && b.coordinates.lat) || 35.24,
      lng: b.lng || (b.coordinates && b.coordinates.lng) || 24.47,
      region: reg,
    };
  });

  console.log('🧹 Εκκαθάριση προηγούμενων εγγραφών στον πίνακα master_beaches...');
  await supabase.from('master_beaches').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log('🚀 Εισαγωγή παραλιών στο master_beaches...');
  const batchSize = 50;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const { error } = await supabase.from('master_beaches').insert(batch);
    if (error) {
      console.error(`❌ Σφάλμα στην παρτίδα ${i + 1} - ${i + batch.length}:`, error.message);
    } else {
      console.log(`✅ Εισήχθησαν ${Math.min(i + batchSize, records.length)} / ${records.length} παραλίες`);
    }
  }

  console.log('🎉 Η εισαγωγή όλων των παραλιών ολοκληρώθηκε με επιτυχία!');
}

run();