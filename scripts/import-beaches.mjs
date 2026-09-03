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

// Ειδικό λεξικό για γνωστές παραλίες και ειδικές ονομασίες με πλούσιες αρχικές περιγραφές
const SPECIAL_BEACHES = {
  'rethymnon city': {
    name: { el: 'Παραλία Ρεθύμνου (Πόλη)', en: 'Rethymno City Beach', fr: 'Plage de Réthymnon (Ville)', de: 'Stadtstrand Rethymno' },
    desc: {
      el: 'Μεγάλη αμμώδης παραλία κατά μήκος της πόλης του Ρεθύμνου, πλήρως οργανωμένη με ναυαγοσώστες, beach bars και θαλάσσια σπορ.',
      en: 'Wide sandy town beach stretching along Rethymno, fully organized with lifeguards, beach bars, and watersports.',
      fr: 'Grande plage de sable le long de la ville de Réthymnon, aménagée avec maîtres-nageurs et bars de plage.',
      de: 'Breiter Sandstrand entlang der Stadt Rethymno, bestens organisiert mit Rettungsschwimmern und Strandbars.',
    }
  },
  'rethymno city': {
    name: { el: 'Παραλία Ρεθύμνου (Πόλη)', en: 'Rethymno City Beach', fr: 'Plage de Réthymnon (Ville)', de: 'Stadtstrand Rethymno' },
    desc: {
      el: 'Μεγάλη αμμώδης παραλία κατά μήκος της πόλης του Ρεθύμνου, πλήρως οργανωμένη με ναυαγοσώστες, beach bars και θαλάσσια σπορ.',
      en: 'Wide sandy town beach stretching along Rethymno, fully organized with lifeguards, beach bars, and watersports.',
      fr: 'Grande plage de sable le long de la ville de Réthymnon, aménagée avec maîtres-nageurs et bars de plage.',
      de: 'Breiter Sandstrand entlang der Stadt Rethymno, bestens organisiert mit Rettungsschwimmern und Strandbars.',
    }
  },
  'sandhills': {
    name: { el: 'Αμμόλοφοι Αγίου Παύλου (Sandhills)', en: 'Agios Pavlos Sandhills Beach', fr: 'Dunes d’Agios Pavlos (Sandhills)', de: 'Sandhills Strand Agios Pavlos' },
    desc: {
      el: 'Εντυπωσιακή παραλία με τεράστιους αμμόλοφους και βαθιά καταγάλανα νερά, ιδανική για απομόνωση και μοναδικό ηλιοβασίλεμα.',
      en: 'Impressive beach with huge sand dunes and deep azure waters, ideal for relaxation and sunset views.',
      fr: 'Plage spectaculaire bordée d’immenses dunes de sable et d’eaux cristallines.',
      de: 'Spektakulärer Strand mit riesigen Sanddünen und tiefblauem Wasser, ideal für Ruhe und Sonnenuntergänge.',
    }
  },
  'preveli': {
    name: { el: 'Πρέβελη', en: 'Preveli Beach', fr: 'Plage de Préveli', de: 'Preveli Strand' },
    desc: {
      el: 'Μαγευτική παραλία στο τέλος του Κουρταλιώτικου φαραγγιού με το διάσημο φοινικόδασος και το ποτάμι που εκβάλλει στη θάλασσα.',
      en: 'Iconic beach at the mouth of Kourtaliotiko gorge featuring a famous natural palm forest and a freshwater river.',
      fr: 'Plage emblématique au débouché des gorges de Kourtaliotiko avec rivière d’eau douce et palmeraie.',
      de: 'Einzigartiger Strand an der Kourtaliotiko-Schlucht mit Palmenwald und ins Meer fließendem Fluss.',
    }
  },
  'elafonisi': {
    name: { el: 'Ελαφονήσι', en: 'Elafonissi Beach', fr: 'Plage d\'Elafonissi', de: 'Elafonissi Strand' },
    desc: {
      el: 'Διάσημη παραλία με ροζ κοραλλιογενή άμμο, ρηχά τιρκουάζ νερά και προστατευόμενο εξωτικό φυσικό τοπίο Natura.',
      en: 'World-famous exotic lagoon with pink coral sand and shallow turquoise crystal waters.',
      fr: 'Lagune mondialement connue pour son sable rose et ses eaux turquoises peu profondes.',
      de: 'Weltberühmter Traumstrand mit rosafarbenem Korallensand und seichtem, türkisblauem Wasser.',
    }
  },
  'elafonissi': {
    name: { el: 'Ελαφονήσι', en: 'Elafonissi Beach', fr: 'Plage d\'Elafonissi', de: 'Elafonissi Strand' },
    desc: {
      el: 'Διάσημη παραλία με ροζ κοραλλιογενή άμμο, ρηχά τιρκουάζ νερά και προστατευόμενο εξωτικό φυσικό τοπίο Natura.',
      en: 'World-famous exotic lagoon with pink coral sand and shallow turquoise crystal waters.',
      fr: 'Lagune mondialement connue pour son sable rose et ses eaux turquoises peu profondes.',
      de: 'Weltberühmter Traumstrand mit rosafarbenem Korallensand und seichtem, türkisblauem Wasser.',
    }
  },
  'balos': {
    name: { el: 'Μπάλος (Λιμνοθάλασσα)', en: 'Balos Lagoon', fr: 'Lagune de Balos', de: 'Lagune von Balos' },
    desc: {
      el: 'Εξωτική λιμνοθάλασσα με λευκή και ροζ άμμο, άγρια φυσική ομορφιά και τιρκουάζ ζεστά νερά.',
      en: 'Exotic lagoon with white-pink sand, wild island landscapes, and warm crystal-clear turquoise waters.',
      fr: 'Lagon sauvage paradisiaque avec sable blanc-rosé et eaux tièdes turquoises.',
      de: 'Paradiesische Lagune mit weiß-rosa Sand und warmem, kristallklarem Wasser.',
    }
  },
  'falassarna': {
    name: { el: 'Φαλάσαρνα', en: 'Falassarna Beach', fr: 'Plage de Falassarna', de: 'Falassarna Strand' },
    desc: {
      el: 'Απέραντη αμμώδης παραλία με πεντακάθαρα νερά, οργανωμένα beach bars και ένα από τα πιο διάσημα ηλιοβασιλέματα της Μεσογείου.',
      en: 'Vast golden sand beach with crystal waters, well-organized beach bars, and one of the finest sunsets in Crete.',
      fr: 'Vaste plage de sable doré réputée pour ses couchers de soleil spectaculaires.',
      de: 'Riesiger Sandstrand mit glasklarem Wasser und atemberaubenden Sonnenuntergängen.',
    }
  },
  'falasarna': {
    name: { el: 'Φαλάσαρνα', en: 'Falassarna Beach', fr: 'Plage de Falassarna', de: 'Falassarna Strand' },
    desc: {
      el: 'Απέραντη αμμώδης παραλία με πεντακάθαρα νερά, οργανωμένα beach bars και ένα από τα πιο διάσημα ηλιοβασιλέματα της Μεσογείου.',
      en: 'Vast golden sand beach with crystal waters, well-organized beach bars, and one of the finest sunsets in Crete.',
      fr: 'Vaste plage de sable doré réputée pour ses couchers de soleil spectaculaires.',
      de: 'Riesiger Sandstrand mit glasklarem Wasser und atemberaubenden Sonnenuntergängen.',
    }
  },
  'matala': {
    name: { el: 'Μάταλα', en: 'Matala Beach', fr: 'Plage de Matala', de: 'Matala Strand' },
    desc: {
      el: 'Ιστορικός κολπίσκος με τις περίφημες λαξευτές ρωμαϊκές σπηλιές των χίπις, οργανωμένη παραλία και βαθιά γαλάζια νερά.',
      en: 'Historic bay famous for its carved Roman caves, vibrant 60s hippie heritage, and azure waters.',
      fr: 'Baie historique célèbre pour ses grottes hippies creusées dans la falaise et ses eaux profondes.',
      de: 'Historische Bucht mit berühmten Hippie-Höhlen und tiefblauem Wasser.',
    }
  },
  'vai': {
    name: { el: 'Βάι (Φοινικόδασος)', en: 'Vai Palm Beach', fr: 'Plage de Vaï', de: 'Palmenstrand von Vai' },
    desc: {
      el: 'Το μοναδικό αυτοφυές φοινικόδασος της Ευρώπης που καταλήγει σε μια πανέμορφη χρυσή αμμουδιά με ήρεμα νερά.',
      en: 'Europe’s only natural palm grove meeting a scenic golden sandy beach with calm azure waters.',
      fr: 'L’unique palmeraie naturelle d’Europe s’ouvrant sur une superbe plage de sable doré.',
      de: 'Europas einziger natürlicher Palmenhain an einem wunderschönen Sandstrand.',
    }
  },
  'geropotamos': {
    name: { el: 'Γεροπόταμος', en: 'Geropotamos Beach', fr: 'Plage de Geropotamos', de: 'Geropotamos Strand' },
    desc: {
      el: 'Γραφικός κολπίσκος με άμμο, βότσαλο και μια εντυπωσιακή φυσική βραχώδη καμάρα, οργανωμένος με ομπρέλες και καντίνα.',
      en: 'Scenic sandy-pebble bay featuring an impressive natural rock arch, organized with sunbeds and a snack bar.',
      fr: 'Crique pittoresque de sable et galets avec une arche rocheuse naturelle, aménagée de transats.',
      de: 'Malerische Sand- und Kieselbucht mit einem beeindruckenden Felsenbogen und Strandliegen.',
    }
  },
  'korakas': {
    name: { el: 'Κόρακας (Ροδάκινο)', en: 'Korakas Beach', fr: 'Plage de Korakas', de: 'Korakas Strand' },
    desc: {
      el: 'Όμορφη παραλία με ψιλό γκρι βότσαλο, πεντακάθαρα νερά και παραδοσιακές ταβέρνες ακριβώς δίπλα στο κύμα.',
      en: 'Lovely grey-pebble beach with pristine waters and traditional tavernas right by the shore.',
      fr: 'Belle plage de galets aux eaux limpides avec d’authentiques tavernes en bord de mer.',
      de: 'Schöner Kieselstrand mit glasklarem Wasser und traditionellen Tavernen direkt am Meer.',
    }
  },
  'panormo': {
    name: { el: 'Πάνορμος', en: 'Panormos Beach', fr: 'Plage de Panormo', de: 'Panormos Strand' },
    desc: {
      el: 'Απάνεμη αμμώδης παραλία στον παραδοσιακό οικισμό του Πανόρμου, ιδανική για οικογένειες και χαλαρό κολύμπι.',
      en: 'Sheltered sandy bay in the traditional village of Panormo, perfectly suited for families and relaxed swimming.',
      fr: 'Plage de sable abritée dans le charmant village de Panormo, idéale pour les familles.',
      de: 'Geschützte Sandbucht im malerischen Dorf Panormos, ideal für Familien.',
    }
  },
  'panormos': {
    name: { el: 'Πάνορμος', en: 'Panormos Beach', fr: 'Plage de Panormo', de: 'Panormos Strand' },
    desc: {
      el: 'Απάνεμη αμμώδης παραλία στον παραδοσιακό οικισμό του Πανόρμου, ιδανική για οικογένειες και χαλαρό κολύμπι.',
      en: 'Sheltered sandy bay in the traditional village of Panormo, perfectly suited for families and relaxed swimming.',
      fr: 'Plage de sable abritée dans le charmant village de Panormo, idéale pour les familles.',
      de: 'Geschützte Sandbucht im malerischen Dorf Panormos, ideal für Familien.',
    }
  },
  'episkopi': {
    name: { el: 'Επισκοπή', en: 'Episkopi Beach', fr: 'Plage d’Episkopi', de: 'Episkopi Strand' },
    desc: {
      el: 'Τεράστια αμμώδης παραλία με ρηχά κρυστάλλινα νερά, beach bars, ναυαγοσώστη και εύκολη πρόσβαση από την εθνική οδό.',
      en: 'Vast sandy beach with shallow crystal waters, beach bars, lifeguards, and easy access from the highway.',
      fr: 'Immense plage de sable aux eaux claires, dotée de bars de plage et de maîtres-nageurs.',
      de: 'Weitläufiger Sandstrand mit seichtem Wasser, Strandbars und Rettungsschwimmern.',
    }
  },
  'peristeres': {
    name: { el: 'Περιστερές', en: 'Peristeres Beach', fr: 'Plage de Peristeres', de: 'Peristeres Strand' },
    desc: {
      el: 'Ήσυχο τμήμα της μεγάλης παραλίας της Επισκοπής με ψιλή άμμο και βότσαλο, ιδανικό για όσους αναζητούν ηρεμία μακριά από πολυκοσμία.',
      en: 'Quiet, secluded stretch of the Episkopi coastline with fine sand and pebbles, perfect for uncrowded swimming.',
      fr: 'Partie tranquille et préservée de la grande plage d’Episkopi, idéale pour le calme.',
      de: 'Ruhiger, unberührter Abschnitt des Strandes von Episkopi, perfekt zur Entspannung.',
    }
  }
};

const COMMON_NAMES = {
  'bali': 'Μπαλί',
  'triopetra': 'Τριόπετρα',
  'plakias': 'Πλακιάς',
  'damnoni': 'Δαμνόνι',
  'amoudi': 'Αμμούδι',
  'schinaria': 'Σχοινάρια',
  'agios pavlos': 'Άγιος Παύλος',
  'agia galini': 'Αγία Γαλήνη',
  'ligres': 'Λίγκρες',
  'kerames': 'Κεραμές',
  'drapanos': 'Δράπανος',
  'anissaras': 'Ανισσαράς',
  'analipsis': 'Ανάληψη',
  'aposelemis': 'Αποσελέμης',
  'gournes': 'Γούρνες',
  'vathianos kambos': 'Βαθειανός Κάμπος',
  'kokkini chani': 'Κοκκίνη Χάνι',
  'amoudara': 'Αμμουδάρα',
  'karteros': 'Καρτερός',
  'amnisos': 'Αμνισός',
  'agia pelagia': 'Αγία Πελαγία',
  'ligaria': 'Λυγαριά',
  'mononaftis': 'Μονοναύτης',
  'fodele': 'Φόδελε',
  'malia': 'Μάλια',
  'stalida': 'Σταλίδα',
  'hersonissos': 'Χερσόνησος',
  'kommos': 'Κομμός',
  'kalamaki': 'Καλαμάκι',
  'lendas': 'Λέντας',
  'tsoutsouras': 'Τσούτσουρας',
  'keratokambos': 'Κερατόκαμπος',
  'georgioupoli': 'Γεωργιούπολη',
  'kavros': 'Καβρός',
  'kedrodasos': 'Κεδρόδασος',
  'seitan limania': 'Σεϊτάν Λιμάνια',
  'stavros': 'Σταυρός',
  'marathi': 'Μαράθι',
  'loutraki': 'Λουτράκι',
  'platanias': 'Πλατανιάς',
  'agia marina': 'Αγία Μαρίνα',
  'frangokastello': 'Φραγκοκάστελλο',
  'sougia': 'Σούγια',
  'paleochora': 'Παλαιόχωρα',
  'elounda': 'Ελούντα',
  'plaka': 'Πλάκα',
  'kolokytha': 'Κολοκύθα',
  'itanos': 'Ίτανος',
  'kouremenos': 'Κουρεμένος',
  'chiona': 'Χιώνα',
  'xerokambos': 'Ξερόκαμπος',
  'agios nikolaos': 'Άγιος Νικόλαος',
  'istron': 'Ίστρον',
  'voulisma': 'Βούλισμα',
  'makrigialos': 'Μακρύς Γιαλός',
  'ierapetra': 'Ιεράπετρα',
  'agia fotia': 'Αγία Φωτιά',
  'myrtos': 'Μύρτος',
};

const REGION_MAP = {
  chania: { el: 'Χανίων', en: 'Chania', fr: 'La Canée', de: 'Chania', baseEl: 'Χανιά' },
  rethymno: { el: 'Ρεθύμνου', en: 'Rethymno', fr: 'Réthymnon', de: 'Rethymno', baseEl: 'Ρέθυμνο' },
  heraklion: { el: 'Ηρακλείου', en: 'Heraklion', fr: 'Héraklion', de: 'Heraklion', baseEl: 'Ηράκλειο' },
  lasithi: { el: 'Λασιθίου', en: 'Lasithi', fr: 'Lassithi', de: 'Lasithi', baseEl: 'Λασίθι' },
};

function getRegion(raw) {
  const s = String(raw || '').toLowerCase();
  if (s.includes('chan') || s.includes('χαν')) return REGION_MAP.chania;
  if (s.includes('reth') || s.includes('ρεθ')) return REGION_MAP.rethymno;
  if (s.includes('her') || s.includes('ηρακ')) return REGION_MAP.heraklion;
  if (s.includes('las') || s.includes('λασι') || s.includes('sit') || s.includes('agios')) return REGION_MAP.lasithi;
  return { el: 'Κρήτης', en: 'Crete', fr: 'Crète', de: 'Kreta', baseEl: 'Κρήτη' };
}

function cleanName(raw) {
  const trimmed = String(raw || '').trim();
  const lower = trimmed.toLowerCase();
  if (SPECIAL_BEACHES[lower]) return SPECIAL_BEACHES[lower].name.el;
  if (COMMON_NAMES[lower]) return COMMON_NAMES[lower];
  if (/[\u0370-\u03FF]/.test(trimmed)) return trimmed;

  let s = lower
    .replaceAll('mp', 'μπ').replaceAll('nt', 'ντ').replaceAll('th', 'θ')
    .replaceAll('ch', 'χ').replaceAll('ps', 'ψ').replaceAll('ks', 'ξ')
    .replaceAll('ou', 'ου').replaceAll('ai', 'αι').replaceAll('ei', 'ει');

  const map = {
    a: 'α', b: 'β', c: 'κ', d: 'δ', e: 'ε', f: 'φ', g: 'γ', h: 'χ', i: 'ι',
    j: 'τζ', k: 'κ', l: 'λ', m: 'μ', n: 'ν', o: 'ο', p: 'π', q: 'κ', r: 'ρ',
    s: 'σ', t: 'τ', u: 'υ', v: 'β', w: 'β', x: 'ξ', y: 'υ', z: 'ζ'
  };

  s = s.split('').map(c => map[c] || c).join('');
  s = s.replace(/σ(?=[^\p{L}]|$)/gu, 'ς');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

async function run() {
  const filePath = path.resolve(process.cwd(), 'beaches.json');
  const beaches = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  console.log(`⏳ Επεξεργασία ${beaches.length} παραλιών με πλούσιες περιγραφές...`);

  const records = beaches.map((b) => {
    const rawName = String(b.name && typeof b.name === 'object' ? (b.name.en || b.name.el || '') : (b.name || '')).trim();
    const lowerName = rawName.toLowerCase();
    const reg = getRegion(b.region || b.prefecture);

    let nameObj;
    let descObj;

    if (SPECIAL_BEACHES[lowerName]) {
      nameObj = SPECIAL_BEACHES[lowerName].name;
      descObj = SPECIAL_BEACHES[lowerName].desc;
    } else {
      const elName = cleanName(rawName);
      nameObj = { el: elName, en: rawName, fr: rawName, de: rawName };

      const isOrg = Boolean(b.organized);
      const hasBar = Boolean(b.beachBar);
      const hasLife = Boolean(b.lifeguard);
      const isFineSand = String(b.surface || '').toLowerCase().includes('fine sand');
      const isPebble = String(b.surface || '').toLowerCase().includes('pebble');

      let groundEl = isFineSand ? 'ψιλή άμμο' : isPebble ? 'βότσαλο' : 'άμμο και καθαρά νερά';
      let groundEn = isFineSand ? 'fine sand' : isPebble ? 'pebbles' : 'sand and clear waters';
      let groundFr = isFineSand ? 'sable fin' : isPebble ? 'galets' : 'sable et eaux claires';
      let groundDe = isFineSand ? 'feinem Sand' : isPebble ? 'Kieseln' : 'Sand und klarem Wasser';

      let equipEl = [];
      if (hasBar) equipEl.push('beach bar');
      if (isOrg) equipEl.push('ομπρέλες και ξαπλώστρες');
      if (hasLife) equipEl.push('ναυαγοσώστη');

      let detailsEl = equipEl.length > 0 ? `οργανωμένη με ${equipEl.join(', ')}` : 'ιδανική για ηρεμία και κολύμπι στο φυσικό τοπίο';
      let detailsEn = equipEl.length > 0 ? `organized with ${equipEl.length > 1 ? 'beach bars and sunbeds' : 'facilities'}` : 'ideal for swimming and relaxation';
      let detailsFr = isOrg ? 'bien aménagée avec transats et commodités' : 'parfaite pour se détendre dans un cadre naturel';
      let detailsDe = isOrg ? 'bestens organisiert mit Liegen und Sonnenschirmen' : 'ideal für Ruhe und ein naturbelassenes Badeerlebnis';

      descObj = {
        el: `Όμορφη παραλία στην περιοχή ${reg.el} με ${groundEl}, ${detailsEl}.`,
        en: `Scenic beach in the ${reg.en} area featuring ${groundEn}, ${detailsEn}.`,
        fr: `Belle plage dans la région de ${reg.fr} avec ${groundFr}, ${detailsFr}.`,
        de: `Wunderschöner Strand in der Region ${reg.de} mit ${groundDe}, ${detailsDe}.`,
      };
    }

    return {
      name: nameObj,
      description: descObj,
      image_url: b.imageUrl || b.image_url || '/images/default-beach.jpg',
      google_rating: b.rating ? parseFloat(b.rating) : 4.5,
      wind_status: b.orientation === 'S' ? 'sheltered' : 'exposed',
      lat: b.lat || (b.coordinates && b.coordinates.lat) || 35.24,
      lng: b.lng || (b.coordinates && b.coordinates.lng) || 24.47,
      region: reg.baseEl,
    };
  });

  console.log('🧹 Εκκαθάριση master_beaches...');
  await supabase.from('master_beaches').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log('🚀 Εισαγωγή 250+ παραλιών με πλούσιες περιγραφές & σωστή ορθογραφία...');
  const batchSize = 50;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    await supabase.from('master_beaches').insert(batch);
  }

  console.log('✅ Ολοκληρώθηκε επιτυχώς!');
}

run();