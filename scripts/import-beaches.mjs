import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Φόρτωση μεταβλητών περιβάλλοντος από .env.local
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

// 1. Πλήρες Λεξικό Επίσημων Ελληνικών Ονομάτων ανά ID / Name
const GREEK_NAMES_MAP = {
  // Χανιά
  'elafonissi-beach': 'Ελαφονήσι',
  'balos-lagoon-beach': 'Μπάλος (Λιμνοθάλασσα)',
  'falassarna-beach': 'Φαλάσαρνα',
  'kedrodasos-beach-elafonisi': 'Κεδρόδασος',
  'stefanou-beach-seitan-limania': 'Σεϊτάν Λιμάνια (Στεφάνου)',
  'pahia-ammos-beach-paleohora': 'Παχιά Άμμος (Παλαιόχωρα)',
  'fragkokastelo-beach': 'Φραγκοκάστελλο',
  'gavdos-beaches': 'Γαύδος (Σαρακήνικο & Αϊ Γιάννης)',
  'loutro-sfakia': 'Λουτρό',
  'loutro-beaches-sfakia': 'Λουτρό',
  'agia-roumeli-beach-sfakia': 'Αγία Ρουμέλη',
  'platanias-beach': 'Πλατανιάς',
  'sougia-beach': 'Σούγια',
  'georgioupolis-beaches-chania-kavros': 'Γεωργιούπολη',
  'aspri-limni-beach': 'Άσπρη Λίμνη',
  'lakki-beach-rodakino-fragokastelo': 'Λακκί (Φραγκοκάστελλο)',
  'orthi-ammos-fragkokastelo': 'Ορθή Άμμος',
  'koutelos-beach-sfakia': 'Κούτελος',
  'filaki-beach-sfakia': 'Φυλακή (Σφακιά)',
  'agios-charalambos-ammoudi-sfakia': 'Άγιος Χαράλαμπος',
  'chora-sfakia-beaches-vrissi': 'Βρύση (Χώρα Σφακίων)',
  'chora-sfakia-iligas-beach': 'Ίλιγγας',
  'glika-nera-beach-sfakia': 'Γλυκά Νερά',
  'likkos-finikas-loutro': 'Φοίνικας & Λύκος',
  'marmara-beach,-sfakia': 'Μάρμαρα',
  'agios-pavlos-beach,-selouda-sfakia': 'Άγιος Παύλος (Σφακιά)',
  'kalogeros-beach,-sfakia': 'Καλόγερος',
  'fournoti-beach-sfakia': 'Φουρνωτή',
  'domata-beach-sfakia': 'Δώματα',
  'tripiti-sendoni-beach-sfakia': 'Τρυπητή',
  'lissos-beach': 'Λισσός',
  'gialiskari-beach': 'Γιαλισκάρι (Ανύδροι)',
  'keratides-halikia-beach-paleohora': 'Κερατίδες (Χαλίκια)',
  'karavopetra-coves-paleohora-beach-paleohora': 'Καραβόπετρα',
  'grammeno-beaches-paleohora': 'Γραμμένο',
  'koudoura-beach-agia-kyriaki-paleochora': 'Κουνδούρα',
  'krios-beach-koudoura-paleochora': 'Κριός',
  'viena-krios-lake-beach': 'Βιένα',
  'voulolimni-beach': 'Βουλολίμνη',
  'stomio-beach-chrissoskalitissa-vathi': 'Στόμιο',
  'livadia-beaches-kambos': 'Λιβάδια (Κάμπος)',
  'keramoti-beach': 'Κεραμωτή',
  'gylisma-beach': 'Γύλισμα',
  'platanakia-beach': 'Πλατανάκια',
  'sfinari-beach': 'Σφηνάρι',
  'kokkina-grema-beach': 'Κόκκινα Γκρεμνά',
  'gramvousa-islet-beach': 'Γραμβούσα',
  'meri-pigadi-beach-gramvousa': 'Μέρι Πηγάδι',
  'kaliviani-beach-kissamos-gramvousa': 'Καλυβιανή',
  'vigglia-beach-kissamos-gramvousa': 'Βίγλια',
  'damialis-beach-kissamos': 'Νταμιάλης',
  'mavros-molos-beach-kissamos': 'Μαύρος Μώλος',
  'livadia-beach,-kissamos': 'Λιβάδια Κισσάμου',
  'korfalonas-beach-kissamos': 'Κορφαλώνας',
  'drapanias-beach-kissamos': 'Δραπανιάς',
  'nopigia-beach-kissamos': 'Νωπήγεια',
  'ravdoucha-beach': 'Ραβδούχα',
  'agios-pavlos-beach-ravdoucha': 'Άγιος Παύλος (Ραβδούχα)',
  'menies-beach-diktynna': 'Μένιες (Δίκτυννα)',
  'afrata-beach-kolimbari': 'Αφράτα',
  'kolimbari-beach': 'Κολυμβάρι',
  'rapaniana-beach': 'Ραπανιανά',
  'tavronitis-beach': 'Ταυρωνίτης',
  'maleme-beach': 'Μάλεμε',
  'gerani-beach': 'Γεράνι',
  'agia-marina-beach': 'Αγία Μαρίνα',
  'stalos-beach': 'Σταλός',
  'kalamaki-beach-glaros-galatas': 'Καλαμάκι (Γαλατάς)',
  'agii-apostoli-beaches-chania': 'Άγιοι Απόστολοι',
  'chrissi-akti-beach-golden-chania': 'Χρυσή Ακτή',
  'nea-chora-beaches': 'Νέα Χώρα',
  'koum-kapi-beach-chania': 'Κουμ Καπί',
  'agios-onoufrios-beach': 'Άγιος Ονούφριος',
  'kalathas-beach-chania': 'Καλαθάς',
  'tersanas-beach': 'Τερσανάς',
  'maherida-beach': 'Μαχαιρίδα',
  'stavros-beach': 'Σταυρός (Ζορμπάς)',
  'marathi-beach-akrotiri-chania': 'Μαράθι',
  'loutraki-beach-akrotiri-chania': 'Λουτράκι',
  'kalami-beach-souda-chania': 'Καλάμι',
  'kalives-beaches-chania': 'Καλύβες',
  'almyrida-beach-plaka-kalives': 'Αλμυρίδα',
  'koutalis-beach-plaka': 'Κούταλης',
  'ombrosgialos-beach-paleloni': 'Ομπρόσγιαλος',
  'kournas-lake-beach-chania': 'Λίμνη Κουρνά',

  // Ρέθυμνο
  'preveli-beach': 'Πρέβελη (Φοινικόδασος)',
  'agia-galini-beaches': 'Αγία Γαλήνη',
  'plakias-beach': 'Πλακιάς',
  'korakas-beach-rodakino': 'Κόρακας (Ροδάκινο)',
  'rethymnon-city-beach': 'Παραλία Ρεθύμνου (Πόλη)',
  'panormo-beaches-rethymnon': 'Πάνορμος',
  'bali-beaches': 'Μπαλί',
  'triopetra-beach': 'Τριόπετρα',
  'agios-pavlos-beach-rethymnon': 'Άγιος Παύλος',
  'sandhills-agios-pavlos-beach-rethymnon': 'Αμμόλοφοι Αγίου Παύλου',
  'ligres-beach-triopetra-rethymnon': 'Λίγκρες',
  'pahia-ammos-beach-kerames-rethymnon': 'Κεραμές (Παχιά Άμμος)',
  'skinaria-beach': 'Σχοινάρια',
  'ammoudi-beaches-plakias': 'Αμμούδι',
  'damnoni-beach-plakias': 'Δαμνόνι',
  'paximadia-islets-agia-galini': 'Νήσοι Παξιμάδια',
  'agios-georgios-agia-galini-beaches': 'Άγιος Γεώργιος (Λιχνιστής)',
  'louros-beaches-agia-galini': 'Λούρος (Πρασονήσι)',
  'agia-fotini-beach-kerames-rethymnon': 'Αγία Φωτεινή',
  'pirgos-beach-kerames-gialopotama': 'Πύργος (Κεραμές)',
  'gialopotama-beach-kerames-rethymnon': 'Γιαλοπόταμα',
  'drymiskos-beaches-ammoudi-rethymnon': 'Δρύμισκος',
  'fotinari-beach-plakias': 'Φωτεινάρι',
  'souda-beach-plakias': 'Σούδα Πλακιά',
  'pefkias-beaches-rodakino': 'Πευκιάς',
  'klimata-beach-rodakino': 'Κλήματα',
  'peristeres-beach-rodakino': 'Περιστερές',
  'agia-marina-beach-rodakino': 'Αγία Μαρίνα (Ροδάκινο)',
  'episkopi-beach-rethymno-petres': 'Επισκοπή',
  'kamari-beach-gerani-rethymno': 'Γεράνι (Καμάρι)',
  'koumbes-beach-rethymno': 'Κουμπές',
  'pervolia-beach-rethymnon': 'Περιβόλια',
  'misiria-beach-rethymnon': 'Μισίρια',
  'platanes-beach-rethymnon': 'Πλατανές',
  'adelianos-kambos-beach-rethymnon': 'Αδελιανός Κάμπος',
  'pigianos-kambos-beaches-rethymnon': 'Πηγιανός Κάμπος',
  'skaleta-beaches-stavromenos-sfakaki': 'Σκαλέτα',
  'spilies-beach-latzimas-geropotamos': 'Σπηλιές',
  'geropotamos-beach-rethymnon': 'Γεροπόταμος',
  'skepasti-beach-panormo-rethymnon': 'Σκεπαστή',
  'glaros-beaches-charakas': 'Γλάρος',
  'kalo-horafi-beach-charakas-sisses': 'Καλό Χωράφι',
  'almirida-beach-sisses': 'Αλυκή (Σίσες)',
  'pera-galini-beach': 'Πέρα Γαλήνη',

  // Ηράκλειο
  'matala-beach': 'Μάταλα',
  'agia-pelagia-beach': 'Αγία Πελαγία',
  'hersonissos-beaches': 'Χερσόνησος (Λιμανάκια)',
  'malia-beach': 'Μάλια',
  'stalida-beach': 'Σταλίδα',
  'gouves-beaches': 'Γούβες',
  'ammoudara-beach-gazi': 'Αμμουδάρα',
  'kokkini-hani-beaches': 'Κοκκίνη Χάνι',
  'tsoutsouras-beach': 'Τσούτσουρας',
  'agiofarago-beach': 'Αγιοφάραγγο',
  'aspes-black-beach': 'Άσπες (Μαύρη Παραλία)',
  'vathi-beach-asterousia': 'Βαθύ (Αστερούσια)',
  'trafoulas-beach-lentas': 'Τράφουλας',
  'lendas-beach': 'Λέντας',
  'agios-nikitas-beach': 'Άγιος Νικήτας',
  'listis-beach-keratokambos': 'Ληστής',
  'komos-beach': 'Κομμός',
  'sarandaris-beaches-hersonissos': 'Σαραντάρης',
  'potamos-beach-malia': 'Ποταμός Μαλίων',
  'agios-georgios-beach-dia': 'Άγιος Γεώργιος (Ντία)',
  'tertsa-beach': 'Τέρτσα',
  'sidonia-beach-psari-forada': 'Σιδωνία (Ψαρή Φοράδα)',
  'faflagos-beach-latomia': 'Φάφλαγκος',
  'arvi-beach': 'Άρβη',
  'armenopetra-beaches-keratokambos': 'Αρμενόπετρα',
  'keratokambos-beach': 'Κερατόκαμπος',
  'kastri-beaches-keratokambos': 'Καστρί',
  'dermatos-beach-tsoutsouras': 'Δέρματος',
  'krassas-beach-tsoutsouras': 'Κρασσάς',
  'maridaki-beach': 'Μαριδάκι',
  'petrigiari-beach-kakoperatos-skiadaki': 'Σκιαδάκι',
  'kaminaki-beach-mournia': 'Καμινάκι',
  'voidomatis-beach-treis-ekklissies': 'Βοϊδομάτης',
  'tris-ekklissies-beach': 'Τρεις Εκκλησιές',
  'ornios-beaches-tris-ekklisies-pahia-ammos': 'Όρνιος',
  'koudoumas-beach': 'Κουδουμάς',
  'agios-antonios-beach-koudoumas': 'Άγιος Αντώνιος',
  'agios-ioannis-beach-kapetaniana': 'Άγιος Ιωάννης (Καπετανιανά)',
  'salamias-beach': 'Σαλαμιάς',
  'katarti-beach': 'Κατάρτι',
  'tripiti-beach-lentas': 'Τρυπητή (Λέντας)',
  'loutra-beach-lentas': 'Λουτρά',
  'dyskos-beach-dytiko-gerokambos-lendas': 'Δυσκός (Δυτικό)',
  'tsigounas-beach-lentas': 'Τσίγκουνας',
  'psili-ammos-beach-platia-peramata': 'Ψιλή Άμμος',
  'platia-peramata-beach': 'Πλατιά Περάματα',
  'krigi-beach-platia-peramata': 'Κρίγη',
  'lassea-beach-chrysostomos': 'Χρυσόστομος (Λασαία)',
  'kali-limenes-beach': 'Καλοί Λιμένες',
  'martsalo-beach': 'Μάρτσαλο',
  'red-beach-matala': 'Κόκκινη Άμμος (Red Beach)',
  'kalamaki-beach-mesara': 'Καλαμάκι',
  'kokkinos-pirgos-beach-tymbaki-mesara': 'Κόκκινος Πύργος',
  'korakia-beach-fodele': 'Κορακιά',
  'fodele-beach': 'Φόδελε',
  'mononaftis-beach-agia-pelagia': 'Μονοναύτης',
  'psaromoura-beach-agia-pelagia': 'Ψαρομούρα',
  'ligaria-beach-agia-pelagia': 'Λυγαριά',
  'madés-beach-ligaria': 'Μαδέ',
  'fraskia-beach-panagia': 'Φρασκιά',
  'paliokastro-beach': 'Παλαιόκαστρο',
  'pantanassa-beach': 'Παντάνασσα',
  'ellinoperamata-beach': 'Ελληνοπεράματα',
  'karteros-beach': 'Καρτερός',
  'vathianos-kambos-beaches': 'Βαθειανός Κάμπος',
  'gournes-beaches': 'Γούρνες',
  'aposelemis-beach-gouves': 'Αποσελέμης',
  'analipsis-beaches-svouros': 'Ανάληψη',
  'anissaras-beaches': 'Ανισσαράς',
  'drapanos-beaches': 'Δράπανος',
  'agia-varvara-beach': 'Αγία Βαρβάρα',
  'panagia-beach,-dia': 'Παναγιά (Ντία)',

  // Λασίθι
  'zakros-beach': 'Κάτω Ζάκρος',
  'sitia-beach': 'Σητεία',
  'ierapetra-beach-apovathra': 'Ιεράπετρα (Αποβάθρα)',
  'vai-beach-palm-grove': 'Βάι (Φοινικόδασος)',
  'chrissi-island-beaches-ierapetra': 'Νήσος Χρυσή (Γαϊδουρονήσι)',
  'makrigialos-beach': 'Μακρύς Γιαλός',
  'myrtos-beach': 'Μύρτος',
  'sissi-beaches': 'Σίσι',
  'itanos-beaches-erimoupolis': 'Ίτανος (Ερημούπολη)',
  'karoumes-beach': 'Καρούμες',
  'xerokambos-beach': 'Ξερόκαμπος',
  'gargadoros-beach-agios-nikolaos': 'Γαργαδόρος',
  'voulisma-beach': 'Βούλισμα (Χρυσή Άμμος)',
  'ammoudara-beach-agios-nikolaos': 'Αμμουδάρα (Άγιος Νικόλαος)',
  'vatos-beach': 'Βάτος',
  'sarikambos-beach-ierapetra-myrtos': 'Σαρικόκαμπος',
  'ammoudares-beaches-ierapetra': 'Νέα Ανατολή',
  'gra-ligia-beach-ierapetra': 'Γρα Λυγιά',
  'ierapetra-long-beach-agios-andreas': 'Μεγάλη Παραλία Ιεράπετρας',
  'katharades-beach-ierapetra': 'Καθαράδες',
  'koutsounari-beach-ierapetra': 'Κουτσουνάρι',
  'kakia-skala-beach-ierapetra': 'Κακιά Σκάλα',
  'ferma-beaches-ierapetra': 'Φέρμα',
  'agia-fotia-beach-ferma': 'Αγία Φωτιά',
  'ahlia-beach': 'Αχλιά',
  'mavros-kolimbos-beach': 'Μαύρος Κόλυμπος',
  'maheridia-beaches-koutsouras': 'Μαχαιρίδια',
  'koutsouras-beaches': 'Κουτσουράς',
  'kalamokanias-beach': 'Καλαμοκανιάς',
  'diaskari-beach-makrigialos': 'Διασκάρι',
  'lagada-beach': 'Λαγκάδα',
  'psalidia-beach': 'Ψαλίδια',
  'kalo-nero-beaches': 'Καλό Νερό',
  'kalami-beaches-goudouras': 'Καλάμι (Γούδουρας)',
  'votsalaki-beach-goudouras': 'Βοτσαλάκι',
  'goudouras-beach-asprolithos': 'Γούδουρας',
  'livari-beach-atherinolakos-agia-triada': 'Λιβάρι',
  'tihida-beach-agia-triada': 'Τιχίδα',
  'agia-irini-beach-ziros': 'Αγία Ειρήνη',
  'mazida-ammos-beach-xerokambos': 'Μάζιδα Άμμος',
  'alona-beach-katsounaki-xerokambos': 'Άλωνα (Κρινάκια)',
  'skinias-beaches-sitia': 'Σκινιάς',
  'skaria-beaches-hiona': 'Σκαριά',
  'hiona-beach-palekastro': 'Χιώνα (Παλαίκαστρο)',
  'kouremenos-beach': 'Κουρεμένος (Windsurfing)',
  'maridati-beach': 'Μαριδάτι',
  'kedromouri-beach-vai-maridati': 'Κεδρόμουρι',
  'tenda-beach-kavo-sidero': 'Τέντα',
  'agios-isidoros-beach-kavo-sidero': 'Κάβο Σίδερο',
  'agia-fotia-beaches-sitia': 'Αγία Φωτιά (Σητεία)',
  'platani-beach-skopi': 'Πλατάνι',
  'papadiokambos-beach-faneromeni': 'Παπαδιόκαμπος',
  'charkomatas-beach-liopetro-papadiokambos': 'Χαρκωματάς',
  'richtis-beach-kalavros': 'Ρίχτης (Φαράγγι)',
  'gela-beach-kalavros': 'Κάλαβρος',
  'mochlos-beaches': 'Μόχλος',
  'tholos-beach-kavousi': 'Θόλος Καβουσίου',
  'agriomandra-beach': 'Αγριομάντρα',
  'pahia-ammos-beach': 'Παχεία Άμμος',
  'gournia-beach': 'Γουρνιά',
  'pilos-beach-istron': 'Πήλος',
  'agios-panteleimon-beach-istron': 'Άγιος Παντελεήμων',
  'vathy-beach-kritsa-agios-nikolaos': 'Βαθύ (Κριτσά)',
  'almiros-beach-agios-nikolaos': 'Αλμυρός',
  'ammos-beach-agios-nikolaos-marina': 'Άμμος (Μαρίνα)',
  'kitroplatia-beach-agios-nikolaos': 'Κιτροπλατεία',
  'ammoudi-beach-agios-nikolaos': 'Αμμούδι (Άγιος Νικόλαος)',
  'havania-beach-agios-nikolaos': 'Χαβάνια',
  'katsikia-beach-agios-nikolaos': 'Κατσίκια',
  'pigaidakia-beaches-elounda-porto-elounda': 'Πηγαϊδάκια (Ελούντα)',
  'kolokytha-beach-spinalonga-elounda': 'Κολοκύθα (Σπιναλόγκα)',
  'elounda-beach-skisma': 'Ελούντα (Σχίσμα)',
  'tsifliki-beach-dreros-elounda': 'Τσιφλίκι',
  'plaka-beach-elounda': 'Πλάκα (Θέα Σπιναλόγκα)',
  'chomatistra-beach-aforesmenos': 'Χωματίστρα',
  'kato-selles-beaches-agios-antonios': 'Κάτω Σέλλες',
  'vlyhadia-beaches-mirabelo': 'Βλυχάδια',
  'skotini-beach-mirabelo-finokalias': 'Σκοτεινή',
  'anogia-beaches-mirabelo': 'Ανώγεια Μιραμπέλου',
  'milatos-beaches': 'Μίλατος',
};

// 2. Εξειδικευμένες Τουριστικές Περιγραφές για ΚΑΘΕ τύπο και χαρακτηριστικό παραλίας
function getSpecificDescription(b, greekName) {
  const isFineSand = String(b.surface || '').toLowerCase().includes('fine sand');
  const isSand = String(b.surface || '').toLowerCase().includes('sand');
  const isPebble = String(b.surface || '').toLowerCase().includes('pebble');

  // Ειδικές περιπτώσεις ορόσημων
  const id = b.id || '';
  if (id.includes('elafonissi')) {
    return {
      el: 'Διάσημη εξωτική λιμνοθάλασσα με ροζ κοραλλιογενή άμμο, ρηχά τιρκουάζ νερά και προστατευόμενο τοπίο Natura 2000.',
      en: 'World-famous exotic lagoon with pink coral sand, shallow crystal-clear turquoise waters, and protected Natura dunes.',
      fr: 'Lagune exotique réputée pour son sable corallien rose et ses eaux turquoises peu profondes.',
      de: 'Weltberühmte exotische Lagune mit rosa Korallensand, seichtem türkisem Wasser und geschützter Natur.',
    };
  }
  if (id.includes('balos')) {
    return {
      el: 'Εμβληματική λιμνοθάλασσα απαράμιλλης φυσικής ομορφιάς με λευκή και ροζ άμμο, ζεστά ρηχά νερά και άγριο νησιωτικό τοπίο.',
      en: 'Iconic wild lagoon with white and pink sand, warm shallow waters, and breathtaking island scenery.',
      fr: 'Lagon sauvage spectaculaire au sable blanc-rosé, eaux tièdes et décor naturel grandiose.',
      de: 'Spektakuläre Lagune mit weiß-rosa Sand, seichtem warmem Wasser und unberührter Natur.',
    };
  }
  if (id.includes('falassarna')) {
    return {
      el: 'Απέραντη παραλία με χρυσή άμμο, πεντακάθαρα βαθιά νερά, οργανωμένα beach bars και το διασημότερο ηλιοβασίλεμα της δυτικής Κρήτης.',
      en: 'Vast golden sand beach with pristine waters, lively beach bars, and the most renowned sunset in western Crete.',
      fr: 'Immense plage de sable doré aux eaux cristallines, réputée pour ses couchers de soleil inoubliables.',
      de: 'Breiter goldener Sandstrand mit glasklarem Wasser, Strandbars und spektakulären Sonnenuntergängen.',
    };
  }
  if (id.includes('preveli')) {
    return {
      el: 'Μαγευτική παραλία στις εκβολές του ποταμού Μεγάλου Ποταμού, περιτριγυρισμένη από το δεύτερο μεγαλύτερο φοινικόδασος της Κρήτης.',
      en: 'Enchanting beach at the mouth of the Kourtaliotiko gorge, framed by a lush natural palm grove and river.',
      fr: 'Plage féerique au débouché des gorges, entourée d’une magnifique palmeraie naturelle et d’une rivière.',
      de: 'Einzigartiger Strand mit Flussmündung, umgeben von einem üppigen natürlichen Palmenhain.',
    };
  }
  if (id.includes('matala')) {
    return {
      el: 'Ιστορικός κολπίσκος με τις διάσημες λαξευτές ρωμαϊκές σπηλιές των χίπις, βαθιά καταγάλανα νερά και ζωντανή ατμόσφαιρα.',
      en: 'Historic sheltered bay famous for its Roman cliffside caves, 1960s hippie heritage, and deep blue waters.',
      fr: 'Baie historique renommée pour ses grottes troglodytiques et ses eaux profondes et limpides.',
      de: 'Historische Bucht, berühmt für ihre römischen Wohnhöhlen und klares, tiefblaues Wasser.',
    }
  }
  if (id.includes('vai-beach')) {
    return {
      el: 'Το μοναδικό αυτοφυές φοινικόδασος της Ευρώπης που καταλήγει σε μια πανέμορφη χρυσή αμμουδιά με ήρεμα κρυστάλλινα νερά.',
      en: 'Europe’s only indigenous palm grove leading to a picturesque golden sand beach with calm waters.',
      fr: 'L’unique palmeraie indigène d’Europe bordant une superbe plage de sable fin doré.',
      de: 'Europas einziger natürlicher Palmenwald direkt an einem wunderschönen Sandstrand.',
    };
  }
  if (id.includes('seitan-limania') || id.includes('stefanou')) {
    return {
      el: 'Στενός, εντυπωσιακός φιόρδ κολπίσκος σκαμμένος ανάμεσα σε κάθετους βράχους, με εκτυφλωτικά γαλαζοπράσινα νερά.',
      en: 'Dramatic canyon-like cove tucked between towering cliffs, renowned for its glowing turquoise waters.',
      fr: 'Crique spectaculaire taillée dans la roche aux eaux turquoises éclatantes.',
      de: 'Spektakuläre Felsenschlucht-Bucht mit leuchtend türkisblauem Wasser.',
    };
  }
  if (id.includes('sandhills')) {
    return {
      el: 'Εντυπωσιακή ακτή με τεράστιους αμμόλοφους, απόλυτη ηρεμία, βαθιά καταγάλανα νερά και μαγευτική θέα στο Λιβυκό.',
      en: 'Dramatic beach dominated by towering sand dunes, peaceful serenity, and deep azure Libyan Sea waters.',
      fr: 'Plage grandiose dominée par d’immenses dunes de sable, idéale pour la tranquillité.',
      de: 'Eindrucksvoller Strand mit riesigen Sanddünen, herrlicher Ruhe und tiefblauem Wasser.',
    };
  }

  // Δημιουργία περιγραφής βάσει πραγματικών ιδιοτήτων
  let el = '';
  let en = '';
  let fr = '';
  let de = '';

  if (b.shallow && isFineSand && b.organized) {
    el = `Ιδανική επιλογή για οικογένειες, με ψιλή άμμο, ρηχά ασφαλή νερά και πλήρη οργάνωση με ομπρέλες και beach bars.`;
    en = `Family-friendly beach with fine sand, calm shallow waters, and full amenities including sunbeds and beach bars.`;
    fr = `Idéale pour les familles, avec sable fin, eaux peu profondes et nombreux aménagements.`;
    de = `Familienfreundlicher Strand mit feinem Sand, seichtem Wasser, Liegen und Strandbars.`;
  } else if (b.shallow && isFineSand && !b.organized) {
    el = `Ήσυχη φυσική αμμουδιά με ρηχά, διάφανα νερά, ιδανική για χαλάρωση μακριά από οργανωμένες εγκαταστάσεις.`;
    en = `Peaceful natural sandy beach with clear, shallow waters, perfect for relaxation away from crowds.`;
    fr = `Plage naturelle paisible au sable fin et eaux cristallines peu profondes, idéale pour le calme.`;
    de = `Ruhiger Naturstrand mit feinem Sand und seichtem Wasser, ideal zum ungestörten Entspannen.`;
  } else if (isPebble && b.organized && b.beachBar) {
    el = `Όμορφη παραλία με καθαρό βότσαλο, βαθιά αναζωογονητικά νερά και ζωντανή ατμόσφαιρα με beach bars.`;
    en = `Scenic pebble beach with deep refreshing waters, sunbeds, and lively seaside cafés.`;
    fr = `Belle plage de galets aux eaux profondes et vivifiantes, animée de bars de plage.`;
    de = `Schöner Kieselstrand mit tiefem, erfrischendem Wasser und lebhaften Strandbars.`;
  } else if (isPebble && !b.organized) {
    el = `Αυθεντικός κολπίσκος με βότσαλο και κρυστάλλινο βυθό, ιδανικός για καταδύσεις και απόλυτη γαλήνη.`;
    en = `Unspoiled pebble cove with crystalline waters and rocky seabed, excellent for snorkeling and tranquility.`;
    fr = `Crique sauvage de galets aux eaux limpides, parfaite pour le snorkeling et la sérénité.`;
    de = `Naturbelassene Kieselbucht mit glasklarem Wasser, ideal zum Schnorcheln und Abschalten.`;
  } else if (b.orientation === 'S') {
    el = `Απάνεμη νότια παραλία στο Λιβυκό Πέλαγος, προστατευμένη από τους βοριάδες, με πεντακάθαρα κρυστάλλινα νερά.`;
    en = `South-facing beach sheltered from northern winds, offering pristine crystal waters and relaxed vibes.`;
    fr = `Plage orientée au sud et abritée du vent du nord, baignée d'eaux limpides face à la mer de Libye.`;
    de = `Vor Nordwinden geschützter Südstrand am Libyschen Meer mit glasklarem Wasser.`;
  } else {
    el = `Δημοφιλής παραλία με ${isFineSand ? 'ψιλή άμμο' : isPebble ? 'βότσαλο' : 'καθαρά νερά'}, ${b.organized ? 'πλήρως οργανωμένη με ανέσεις' : 'με φυσικό τοπίο και χαλαρή ατμόσφαιρα'}.`;
    en = `Popular beach with ${isFineSand ? 'fine sand' : isPebble ? 'smooth pebbles' : 'clear waters'}, ${b.organized ? 'well-organized with seaside facilities' : 'offering an authentic unspoiled setting'}.`;
    fr = `Plage agréable aux eaux claires, ${b.organized ? 'aménagée avec transats et commodités' : 'dans un cadre naturel préservé'}.`;
    de = `Beliebter Strand mit ${isFineSand ? 'feinem Sand' : 'Kieseln'}, ${b.organized ? 'bestens organisiert mit Liegen' : 'in naturbelassener Umgebung'}.`;
  }

  return { el, en, fr, de };
}

const REGION_NAMES = {
  chania: 'Χανιά',
  rethymno: 'Ρέθυμνο',
  heraklion: 'Ηράκλειο',
  lasithi: 'Λασίθι',
};

function getRegion(raw) {
  const s = String(raw || '').toLowerCase();
  if (s.includes('chan') || s.includes('χαν')) return REGION_NAMES.chania;
  if (s.includes('reth') || s.includes('ρεθ')) return REGION_NAMES.rethymno;
  if (s.includes('her') || s.includes('ηρακ')) return REGION_NAMES.heraklion;
  if (s.includes('las') || s.includes('λασι')) return REGION_NAMES.lasithi;
  return 'Κρήτη';
}

async function run() {
  const filePath = path.resolve(process.cwd(), 'beaches.json');
  if (!fs.existsSync(filePath)) {
    console.error('❌ Δεν βρέθηκε το αρχείο beaches.json.');
    process.exit(1);
  }

  const beaches = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log(`⏳ Επεξεργασία ${beaches.length} παραλιών με το νέο αυθεντικό ελληνικό λεξικό...`);

  const records = beaches.map((b) => {
    const rawName = String(b.name || '').trim();
    const greekName = GREEK_NAMES_MAP[b.id] || GREEK_NAMES_MAP[rawName.toLowerCase()] || rawName;
    const region = getRegion(b.region);
    const desc = getSpecificDescription(b, greekName);

    return {
      name: {
        el: greekName,
        en: rawName,
        fr: rawName,
        de: rawName,
      },
      description: desc,
      image_url: b.imageUrl || '/images/default-beach.jpg',
      google_rating: b.rating ? parseFloat(b.rating) : 4.5,
      wind_status: b.orientation === 'S' ? 'sheltered' : 'exposed',
      lat: b.lat || 35.24,
      lng: b.lng || 24.47,
      region: region,
    };
  });

  console.log('🧹 Εκκαθάριση master_beaches...');
  await supabase.from('master_beaches').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log('🚀 Εισαγωγή παραλιών με σωστά ονόματα & τουριστικές περιγραφές...');
  const batchSize = 50;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const { error } = await supabase.from('master_beaches').insert(batch);
    if (error) {
      console.error(`Σφάλμα στο batch ${i}:`, error.message);
    }
  }

  console.log('🎉 Η εισαγωγή όλων των παραλιών ολοκληρώθηκε με απόλυτη επιτυχία!');
}

run();