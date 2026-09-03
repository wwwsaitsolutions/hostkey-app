import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Φόρτωση περιβαλλοντικών μεταβλητών αν υπάρχουν
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Λείπουν τα κλειδιά του Supabase (SUPABASE_URL / SUPABASE_KEY).');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const filePath = path.resolve(process.cwd(), 'beaches.json');
  if (!fs.existsSync(filePath)) {
    console.error('❌ Δεν βρέθηκε το αρχείο beaches.json στον κεντρικό φάκελο.');
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const beaches = JSON.parse(raw);

  console.log(`⏳ Έναρξη μεταφοράς ${beaches.length} παραλιών στο Hostkey...`);

  const records = beaches.map((b) => {
    const isSouth = b.orientation === 'S';
    return {
      category: 'beaches',
      name: b.name,
      description: {
        el: `Όμορφη παραλία στην περιοχή ${b.region || 'Κρήτη'}. Έδαφος: ${b.surface || 'Άμμος/Βότσαλο'}.${b.organized ? ' Οργανωμένη.' : ''}`,
        en: `Beautiful beach in ${b.region || 'Crete'}. Surface: ${b.surface || 'Sand/Pebble'}.${b.organized ? ' Organized.' : ''}`
      },
      image_url: b.imageUrl || null,
      google_rating: b.rating || null,
      wind_status: isSouth ? 'sheltered' : 'exposed',
      wind_note: isSouth ? 'Νότιος προσανατολισμός - απάνεμη στους βοριάδες' : 'Βόρειος προσανατολισμός - εκτίθεται σε βοριάδες/μελτέμια',
      lat: b.lat,
      lng: b.lng
    };
  });

  const { data, error } = await supabase.from('places').insert(records);

  if (error) {
    console.error('❌ Σφάλμα κατά την εισαγωγή στο Supabase:', error.message);
  } else {
    console.log(`✅ Επιτυχής εισαγωγή ${records.length} παραλιών στον πίνακα places!`);
  }
}

run();