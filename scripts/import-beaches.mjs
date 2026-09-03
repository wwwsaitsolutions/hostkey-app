import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

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

// 1. Επίσημο πλήρες λεξικό ονομάτων στα Ελληνικά για τις παραλίες
const EXACT_GREEK_NAMES = {
  'matala': 'Μάταλα',
  'agia pelagia': 'Αγία Πελαγία',
  'zakros': 'Ζάκρος',
  'elafonissi': 'Ελαφονήσι',
  'elafonisi': 'Ελαφονήσι',
  'balos': 'Μπάλος',
  'falassarna': 'Φαλάσαρνα',
  'falasarna': 'Φαλάσαρνα',
  'paleohora': 'Παλαιόχωρα',
  'fragokastelo': 'Φραγκοκάστελλο',
  'fragkokastelo': 'Φραγκοκάστελλο',
  'gavdos': 'Γαύδος',
  'loutro': 'Λουτρό',
  'agia roumeli': 'Αγία Ρουμέλη',
  'platanias': 'Πλατανιάς',
  'sougia': 'Σούγια',
  'georgioupolis': 'Γεωργιούπολη',
  'kedrodasos': 'Κεδρόδασος',
  'aspri limni': 'Άσπρη Λίμνη',
  'lakki': 'Λακκί',
  'orthi ammos': 'Ορθή Άμμος',
  'koutelos': 'Κούτελος',
  'filaki': 'Φυλακή',
  'agios haralabos': 'Άγιος Χαράλαμπος',
  'vrissi': 'Βρύση (Χώρα Σφακίων)',
  'iligas': 'Ίλιγγας',
  'glika nera': 'Γλυκά Νερά',
  'finikas': 'Φοίνικας',
  'marmara': 'Μάρμαρα',
  'agios pavlos': 'Άγιος Παύλος',
  'kalogeros': 'Καλόγερος',
  'fournoti': 'Φουρνωτή',
  'domata': 'Δώματα',
  'tripiti': 'Τρυπητή',
  'lissos': 'Λισσός',
  'anydri': 'Ανύδροι (Γιαλισκάρι)',
  'gialiskari': 'Γιαλισκάρι',
  'keratides': 'Κερατίδες',
  'karavopetra': 'Καραβόπετρα',
  'grammeno': 'Γραμμένο',
  'koundoura': 'Κουνδούρα',
  'krios': 'Κριός',
  'viena': 'Βιένα',
  'voulolimni': 'Βουλολίμνη',
  'stomio': 'Στόμιο',
  'livadia': 'Λιβάδια',
  'keramoti': 'Κεραμωτή',
  'gylisma': 'Γύλισμα',
  'platanakia': 'Πλατανάκια',
  'sfinari': 'Σφηνάρι',
  'kokkina gkremna': 'Κόκκινα Γκρεμνά',
  'gramvousa': 'Γραμβούσα',
  'meri pigadi': 'Μέρι Πηγάδι',
  'kaliviani': 'Καλυβιανή',
  'vigglia': 'Βίγλια',
  'damialis': 'Νταμιalias',
  'mavros molos': 'Μαύρος Μώλος',
  'korfalonas': 'Κορφαλώνας',
  'drapanias': 'Δραπανιάς',
  'nopigia': 'Νωπήγεια',
  'ravdoucha': 'Ραβδούχα',
  'menies': 'Μένιες (Δίκτυννα)',
  'afrata': 'Αφράτα',
  'kolimbari': 'Κολυμβάρι',
  'rapaniana': 'Ραπανιανά',
  'tavronitis': 'Ταυρωνίτης',
  'maleme': 'Μάλεμε',
  'gerani': 'Γεράνι',
  'agia marina': 'Αγία Μαρίνα',
  'stalos': 'Σταλός',
  'kalamaki': 'Καλαμάκι',
  'agii apostoli': 'Άγιοι Απόστολοι',
  'chrissi akti': 'Χρυσή Ακτή',
  'nea chora': 'Νέα Χώρα',
  'chania': 'Κουμ Καπί',
  'agios onoufrios': 'Άγιος Ονούφριος',
  'kalathas': 'Καλαθάς',
  'tersanas': 'Τερσανάς',
  'maherida': 'Μαχαιρίδα',
  'stavros': 'Σταυρός',
  'stefanou': 'Σεϊτάν Λιμάνια (Στεφάνου)',
  'marathi': 'Μαράθι',
  'loutraki': 'Λουτράκι',
  'kalami': 'Καλάμι',
  'kalives': 'Καλύβες',
  'almyrida': 'Αλμυρίδα',
  'koutalis': 'Κούταλης',
  'ombrosgialos': 'Ομπρόσγιαλος',
  'lake kournas': 'Λίμνη Κουρνά',
  'preveli': 'Πρέβελη',
  'agia galini': 'Αγία Γαλήνη',
  'plakias': 'Πλακιάς',
  'korakas': 'Κόρακας (Ροδάκινο)',
  'rethymnon city': 'Παραλία Ρεθύμνου (Πόλη)',
  'rethymno city': 'Παραλία Ρεθύμνου (Πόλη)',
  'panormo': 'Πάνορμος',
  'panormos': 'Πάνορμος',
  'bali': 'Μπαλί',
  'triopetra': 'Τριόπετρα',
  'sandhills': 'Αμμόλοφοι Αγίου Παύλου (Sandhills)',
  'ligres': 'Λίγκρες',
  'kerames': 'Κεραμές',
  'skinaria': 'Σχοινάρια',
  'ammoudi': 'Αμμούδι',
  'damnoni': 'Δαμνόνι',
  'paximadia': 'Παξιμάδια',
  'lihnistis': 'Λιχνιστής',
  'louros (prasonisi)': 'Λούρος (Πρασονήσι)',
  'agia fotini': 'Αγία Φωτεινή',
  'pirgos': 'Πύργος',
  'gialopotama': 'Γιαλοπόταμα',
  'drymiskos': 'Δρύμισκος',
  'fotinari': 'Φωτεινάρι',
  'souda': 'Σούδα Πλακιά',
  'pefkias': 'Πευκιάς',
  'klimata': 'Κλήματα',
  'peristeres': 'Περιστερές',
  'episkopi': 'Επισκοπή',
  'koumbes': 'Κουμπές',
  'pervolia': 'Περιβόλια',
  'misiria': 'Μισίρια',
  'platanes': 'Πλατανές',
  'adelianos': 'Αδελιανός Κάμπος',
  'pigianos kambos': 'Πηγιανός Κάμπος',
  'skaleta': 'Σκαλέτα',
  'spilies': 'Σπηλιές',
  'geropotamos': 'Γεροπόταμος',
  'skepasti': 'Σκεπαστή',
  'glaros': 'Γλάρος',
  'kalo horafi': 'Καλό Χωράφι',
  'alyki': 'Αλυκή',
  'pera galini': 'Πέρα Γαλήνη',
  'hersonissos': 'Χερσόνησος',
  'malia': 'Μάλια',
  'stalida': 'Σταλίδα',
  'gouves': 'Γούβες',
  'ammoudara': 'Αμμουδάρα',
  'kokkini hani': 'Κοκκίνη Χάνι',
  'tsoutsouras': 'Τσούτσουρας',
  'agiofarago': 'Αγιοφάραγγο',
  'aspes': 'Άσπες (Μαύρη Παραλία)',
  'vathy': 'Βαθύ',
  'trafoulas': 'Τράφουλας',
  'lendas': 'Λέντας',
  'agios nikitas': 'Άγιος Νικήτας',
  'listis': 'Ληστής',
  'komos': 'Κομμός',
  'sarandaris': 'Σαραντάρης (Λιμανάκια)',
  'potamos': 'Ποταμός Μαλίων',
  'agios georgios': 'Άγιος Γεώργιος (Νήσος Ντία)',
  'tertsa': 'Τέρτσα',
  'sidonia': 'Σιδωνία (Ψαρή Φοράδα)',
  'faflagos': 'Φάφλαγκος',
  'arvi': 'Άρβη',
  'armenopetra': 'Αρμενόπετρα',
  'keratokambos': 'Κερατόκαμπος',
  'kastri': 'Καστρί',
  'dermatos': 'Δέρματος',
  'krassas': 'Κρασσάς',
  'maridaki': 'Μαριδάκι',
  'skiadaki': 'Σκιαδάκι',
  'kaminaki': 'Καμινάκι',
  'voidomatis': 'Βοϊδομάτης',
  'tris ekklissies': 'Τρεις Εκκλησιές',
  'ornios': 'Όρνιος',
  'koudoumas': 'Κουδουμάς',
  'agios antonios': 'Άγιος Αντώνιος',
  'agios ioannis': 'Άγιος Ιωάννης',
  'salamias': 'Σαλαμιάς',
  'katarti': 'Κατάρτι',
  'loutra': 'Λουτρά',
  'dyskos': 'Δυσκός (Δυτικό)',
  'tsigounas': 'Τσίγκουνας',
  'psili ammos': 'Ψιλή Άμμος',
  'platia peramata': 'Πλατιά Περάματα',
  'krigi': 'Κρίγη',
  'chrysostomos': 'Χρυσόστομος (Λασαία)',
  'kali limenes': 'Καλοί Λιμένες',
  'martsalo': 'Μάρτσαλο',
  'red beach (kokkini ammos)': 'Κόκκινη Άμμος (Red Beach)',
  'kokkinos pirgos': 'Κόκκινος Πύργος',
  'korakia': 'Κορακιά',
  'fodele': 'Φόδελε',
  'mononaftis': 'Μονοναύτης',
  'psaromoura': 'Ψαρομούρα',
  'ligaria': 'Λυγαριά',
  'madés': 'Μαδέ',
  'fraskia': 'Φρασκιά',
  'paliokastro': 'Παλαιόκαστρο',
  'pantanassa': 'Παντάνασσα',
  'ellinoperamata': 'Ελληνοπεράματα',
  'karteros': 'Καρτερός',
  'vathianos kambos': 'Βαθειανός Κάμπος',
  'gournes': 'Γούρνες',
  'aposelemis': 'Αποσελέμης',
  'analipsis': 'Ανάληψη',
  'anissaras': 'Ανισσαράς',
  'drapanos': 'Δράπανος',
  'agia varvara': 'Αγία Βαρβάρα',
  'panagia': 'Παναγιά (Νήσος Ντία)',
  'sitia': 'Σητεία',
  'ierapetra central': 'Ιεράπετρα (Αποβάθρα)',
  'vai': 'Βάι (Φοινικόδασος)',
  'chrissi': 'Χρυσή (Γαϊδουρονήσι)',
  'makrigialos': 'Μακρύς Γιαλός',
  'myrtos': 'Μύρτος',
  'sissi': 'Σίσι',
  'itanos': 'Ίτανος (Ερημούπολη)',
  'karoumes': 'Καρούμες',
  'xerokambos': 'Ξερόκαμπος',
  'gargadoros': 'Γαργαδόρος',
  'voulisma': 'Βούλισμα',
  'vatos': 'Βάτος',
  'sarikambos': 'Σαρικόκαμπος',
  'nea anatoli': 'Νέα Ανατολή',
  'gra ligia': 'Γρα Λυγιά',
  'ierapetra long beach': 'Μεγάλη Παραλία Ιεράπετρας',
  'katharades': 'Καθαράδες',
  'koutsounari': 'Κουτσουνάρι (Μεγάλη Παραλία)',
  'kakia skala': 'Κακιά Σκάλα',
  'ferma': 'Φέρμα',
  'agia fotia': 'Αγία Φωτιά',
  'ahlia': 'Αχλιά',
  'mavros kolimbos': 'Μαύρος Κόλυμπος',
  'maheridia': 'Μαχαιρίδια',
  'koutsouras': 'Κουτσουράς',
  'kalamokanias': 'Καλαμοκανιάς',
  'diaskari': 'Διασκάρι',
  'lagada': 'Λαγκάδα',
  'psalidia': 'Ψαλίδια',
  'kalo nero': 'Καλό Νερό',
  'votsalaki': 'Βοτσαλάκι',
  'goudouras': 'Γούδουρας',
  'livari': 'Λιβάρι',
  'tihida': 'Τιχίδα',
  'agia irini': 'Αγία Ειρήνη',
  'mazida ammos': 'Μάζιδα Άμμος',
  'alona (krinakia)': 'Άλωνα (Κρινάκια)',
  'skinias': 'Σκινιάς',
  'skaria': 'Σκαριά',
  'hiona': 'Χιώνα',
  'kouremenos': 'Κουρεμένος',
  'maridati': 'Μαριδάτι',
  'kedromouri': 'Κεδρόμουρι',
  'tenda': 'Τέντα',
  'cape sidero': 'Κάβο Σίδερο',
  'platani': 'Πλατάνι',
  'papadiokambos': 'Παπαδιόκαμπος',
  'charkomatas': 'Χαρκωματάς',
  'richtis': 'Ρίχτης',
  'kalavros': 'Κάλαβρος',
  'mochlos': 'Μόχλος',
  'tholos': 'Θόλος Καβουσίου',
  'agriomandra': 'Αγριομάντρα',
  'pahia ammos': 'Παχεία Άμμος',
  'gournia': 'Γουρνιά',
  'pilos': 'Πήλος',
  'ag. panteleimon': 'Άγιος Παντελεήμων (Ίστρον)',
  'almiros': 'Αλμυρός',
  'ammos': 'Άμμος',
  'kitroplatia': 'Κιτροπλατεία',
  'havania': 'Χαβάνια',
  'katsikia': 'Κατσίκια',
  'pigaidakia': 'Πηγαϊδάκια (Πόρτο Ελούντα)',
  'kolokytha': 'Κολοκύθα',
  'elounda (shisma)': 'Ελούντα (Σχίσμα)',
  'tsifliki': 'Τσιφλίκι',
  'plaka': 'Πλάκα Ελούντας',
  'chomatistra': 'Χωματίστρα',
  'kato selles': 'Κάτω Σέλλες',
  'vlyhadia': 'Βλυχάδια',
  'skotini': 'Σκοτεινή',
  'anogia': 'Ανώγεια Μιραμπέλου',
  'milatos': 'Μίλατος',
};

// Ειδικές πλούσιες περιγραφές για γνωστές παραλίες
const HIGHLIGHT_DESCRIPTIONS = {
  'vai': {
    el: 'Το μοναδικό αυτοφυές φοινικόδασος της Ευρώπης που καταλήγει σε μια πανέμορφη χρυσή αμμουδιά με ήρεμα καταγάλανα νερά.',
    en: 'Europe’s only natural palm forest opening onto a gorgeous golden sand beach with calm azure waters.',
    fr: 'La seule palmeraie naturelle d’Europe s’ouvrant sur une magnifique plage de sable doré et des eaux calmes.',
    de: 'Europas einziger natürlicher Palmenwald, der an einen wunderschönen Sandstrand mit ruhigem Meer grenzt.',
  },
  'elafonissi': {
    el: 'Διάσημη εξωτική παραλία με ροζ κοραλλιογενή άμμο, ρηχά τιρκουάζ νερά και προστατευόμενο φυσικό τοπίο Natura.',
    en: 'World-famous exotic beach with pink coral sand, shallow turquoise waters, and protected Natura scenery.',
    fr: 'Plage exotique mondialement connue avec son sable corallien rose et ses eaux turquoises peu profondes.',
    de: 'Weltberühmter Traumstrand mit rosafarbenem Korallensand, seichtem Wasser und geschützter Natur.',
  },
  'balos': {
    el: 'Εξωτική λιμνοθάλασσα απαράμιλλης ομορφιάς με λευκή και ροζ άμμο, ζεστά ρηχά νερά και εντυπωσιακό άγριο τοπίο.',
    en: 'Breathtaking exotic lagoon with white and pink sand, warm shallow waters, and majestic wild scenery.',
    fr: 'Lagune paradisiaque spectaculaire avec sable blanc-rosé, eaux tièdes et paysage sauvage.',
    de: 'Atemberaubende Lagune mit weiß-rosa Sand, seichtem warmem Wasser und spektakulärer Landschaft.',
  },
  'falassarna': {
    el: 'Απέραντη παραλία με ψιλή άμμο, κρυστάλλινα νερά, εξαιρετική οργάνωση και ένα από τα πιο φημισμένα ηλιοβασιλέματα.',
    en: 'Vast golden sand beach with crystal waters, excellent beach bars, and one of the finest sunsets in the Mediterranean.',
    fr: 'Immense plage de sable doré avec des eaux cristallines et l’un des plus beaux couchers de soleil de Crète.',
    de: 'Riesiger Sandstrand mit glasklarem Wasser und einem der schönsten Sonnenuntergänge des Mittelmeers.',
  },
  'preveli': {
    el: 'Μοναδική παραλία στο τέλος του Κουρταλιώτικου φαραγγιού, όπου το ποτάμι και το φοινικόδασος συναντούν το Λιβυκό Πέλαγος.',
    en: 'Unique beach at the mouth of Kourtaliotiko gorge, where a freshwater river and palm forest meet the Libyan Sea.',
    fr: 'Plage unique au débouché des gorges de Kourtaliotiko, où rivière et palmeraie se jettent dans la mer.',
    de: 'Einzigartiger Strand an der Kourtaliotiko-Schlucht, wo ein Fluss und Palmenhain das Meer erreichen.',
  },
  'matala': {
    el: 'Ιστορικός κολπίσκος με τις διάσημες ρωμαϊκές σπηλιές των χίπις, βαθιά καταγάλανα νερά και ζωντανή ατμόσφαιρα.',
    en: 'Historic bay famous for its carved Roman caves, lively 1960s hippie heritage, and deep azure waters.',
    fr: 'Baie historique réputée pour ses grottes romaines des hippies et ses eaux profondes et limpides.',
    de: 'Historische Bucht, berühmt für ihre römischen Höhlen aus der Hippie-Ära und klares tiefblaues Wasser.',
  },
  'rethymnon city': {
    el: 'Μεγάλη αμμώδης παραλία κατά μήκος της πόλης του Ρεθύμνου, πλήρως οργανωμένη με ναυαγοσώστες, beach bars και θαλάσσια σπορ.',
    en: 'Wide sandy town beach stretching along Rethymno, fully organized with lifeguards, beach bars, and watersports.',
    fr: 'Grande plage de sable le long de la ville de Réthymnon, aménagée avec maîtres-nageurs et bars de plage.',
    de: 'Breiter Sandstrand entlang der Stadt Rethymno, bestens organisiert mit Rettungsschwimmern und Strandbars.',
  },
  'sandhills': {
    el: 'Εντυπωσιακή παραλία με τεράστιους αμμόλοφους, βαθιά κρυστάλλινα νερά και μαγευτική θέα στο ηλιοβασίλεμα.',
    en: 'Impressive beach with huge towering sand dunes and deep crystal waters, ideal for quiet relaxation.',
    fr: 'Plage impressionnante bordée de gigantesques dunes de sable et d’eaux cristallines profondes.',
    de: 'Spektakulärer Strand mit riesigen Sanddünen und tiefblauem Wasser, ideal für Ruhe und Entspannung.',
  },
};

const REGIONS = {
  chania: { el: 'Χανίων', en: 'Chania', fr: 'La Canée', de: 'Chania', base: 'Χανιά' },
  rethymno: { el: 'Ρεθύμνου', en: 'Rethymno', fr: 'Réthymnon', de: 'Rethymno', base: 'Ρέθυμνο' },
  heraklion: { el: 'Ηρακλείου', en: 'Heraklion', fr: 'Héraklion', de: 'Heraklion', base: 'Ηράκλειο' },
  lasithi: { el: 'Λασιθίου', en: 'Lasithi', fr: 'Lassithi', de: 'Lasithi', base: 'Λασίθι' },
};

function getRegion(raw) {
  const s = String(raw || '').toLowerCase();
  if (s.includes('chan') || s.includes('χαν')) return REGIONS.chania;
  if (s.includes('reth') || s.includes('ρεθ')) return REGIONS.rethymno;
  if (s.includes('her') || s.includes('ηρακ')) return REGIONS.heraklion;
  if (s.includes('las') || s.includes('λασι') || s.includes('sit') || s.includes('agios')) return REGIONS.lasithi;
  return { el: 'Κρήτης', en: 'Crete', fr: 'Crète', de: 'Kreta', base: 'Κρήτη' };
}

function getGreekName(rawName) {
  const clean = String(rawName || '').trim();
  const lower = clean.toLowerCase();

  if (EXACT_GREEK_NAMES[lower]) return EXACT_GREEK_NAMES[lower];
  if (/[\u0370-\u03FF]/.test(clean)) return clean;

  // Μετατροπή των λέξεων
  const words = lower.split(' ').map((w) => {
    if (EXACT_GREEK_NAMES[w]) return EXACT_GREEK_NAMES[w];
    if (w === 'beach' || w === 'beaches') return '';
    if (w === 'lake') return 'Λίμνη';
    if (w === 'city') return '(Πόλη)';
    if (w === 'cove' || w === 'coves') return 'Όρμος';
    return w;
  }).filter(Boolean);

  let reconstructed = words.join(' ');
  if (EXACT_GREEK_NAMES[reconstructed.toLowerCase()]) {
    return EXACT_GREEK_NAMES[reconstructed.toLowerCase()];
  }

  return clean;
}

function buildDescriptions(b, greekName, enName, reg) {
  const lower = enName.toLowerCase();
  for (const [key, val] of Object.entries(HIGHLIGHT_DESCRIPTIONS)) {
    if (lower === key || lower.includes(key)) {
      return val;
    }
  }

  const isSand = String(b.surface || '').toLowerCase().includes('sand');
  const isFineSand = String(b.surface || '').toLowerCase().includes('fine sand');
  const isPebble = String(b.surface || '').toLowerCase().includes('pebble');

  // Ελληνικά
  let groundEl = isFineSand ? 'ψιλή άμμο' : isSand ? 'χρυσή άμμο' : isPebble ? 'βότσαλο' : 'πεντακάθαρα νερά';
  let groundEn = isFineSand ? 'fine sand' : isSand ? 'golden sand' : isPebble ? 'pebbles' : 'crystal waters';
  let groundFr = isFineSand ? 'sable fin' : isSand ? 'sable doré' : isPebble ? 'galets' : 'eaux limpides';
  let groundDe = isFineSand ? 'feinem Sand' : isSand ? 'Goldsand' : isPebble ? 'Kieseln' : 'kristallklarem Wasser';

  let featuresEl = [];
  if (b.shallow) featuresEl.push('ρηχά ασφαλή νερά');
  if (b.beachBar) featuresEl.push('beach bars');
  if (b.organized) featuresEl.push('ομπρέλες και ξαπλώστρες');
  if (b.lifeguard) featuresEl.push('ναυαγοσώστη');

  let descEl = '';
  if (featuresEl.length > 0) {
    descEl = `Δημοφιλής παραλία στην περιοχή ${reg.el} με ${groundEl}, ${featuresEl.join(', ')}.`;
  } else if (!b.organized) {
    descEl = `Πανέμορφη φυσική παραλία στην περιοχή ${reg.el} με ${groundEl}, ιδανική για ηρεμία και χαλάρωση.`;
  } else {
    descEl = `Οργανωμένη παραλία στην περιοχή ${reg.el} με ${groundEl} και καθαρά νερά.`;
  }

  // Αγγλικά
  let featuresEn = [];
  if (b.shallow) featuresEn.push('shallow waters');
  if (b.beachBar) featuresEn.push('beach bars');
  if (b.organized) featuresEn.push('sunbeds');
  if (b.lifeguard) featuresEn.push('lifeguard on duty');

  let descEn = featuresEn.length > 0
    ? `Scenic beach in ${reg.en} with ${groundEn}, featuring ${featuresEn.join(', ')}.`
    : `Peaceful natural beach in ${reg.en} with ${groundEn}, ideal for relaxed swimming.`;

  // Γαλλικά
  let descFr = b.organized
    ? `Plage aménagée dans la région de ${reg.fr} avec ${groundFr}, idéale pour la baignade.`
    : `Plage naturelle et préservée dans la région de ${reg.fr} avec ${groundFr}, parfaite pour la détente.`;

  // Γερμανικά
  let descDe = b.organized
    ? `Organisierter Strand in der Region ${reg.de} mit ${groundDe}, Liegen und klarem Meer.`
    : `Ruhiger Naturstrand in der Region ${reg.de} mit ${groundDe}, ideal zum Entspannen.`;

  return {
    el: descEl,
    en: descEn,
    fr: descFr,
    de: descDe,
  };
}

async function run() {
  const filePath = path.resolve(process.cwd(), 'beaches.json');
  const beaches = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  console.log(`⏳ Επεξεργασία ${beaches.length} παραλιών με το νέο λεξικό...`);

  const records = beaches.map((b) => {
    const rawName = String(b.name || '').trim();
    const greekName = getGreekName(rawName);
    const reg = getRegion(b.region);
    const descObj = buildDescriptions(b, greekName, rawName, reg);

    return {
      name: {
        el: greekName,
        en: rawName,
        fr: rawName,
        de: rawName,
      },
      description: descObj,
      image_url: b.imageUrl || '/images/default-beach.jpg',
      google_rating: b.rating ? parseFloat(b.rating) : 4.5,
      wind_status: b.orientation === 'S' ? 'sheltered' : 'exposed',
      lat: b.lat || 35.24,
      lng: b.lng || 24.47,
      region: reg.base,
    };
  });

  console.log('🧹 Εκκαθάριση πίνακα master_beaches...');
  await supabase.from('master_beaches').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log('🚀 Εισαγωγή παραλιών με σωστά ελληνικά ονόματα...');
  const batchSize = 50;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const { error } = await supabase.from('master_beaches').insert(batch);
    if (error) {
      console.error('Σφάλμα:', error.message);
    }
  }

  console.log('✅ Ολοκληρώθηκε! Όλα τα ονόματα και οι περιγραφές ενημερώθηκαν.');
}

run();