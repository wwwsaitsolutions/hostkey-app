'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState, type MouseEvent, type ReactElement, type ReactNode } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { Drawer } from 'vaul';
import {
  Home as HomeIcon,
  BookOpen,
  Compass,
  LifeBuoy,
  Wifi,
  MessageCircle,
  MapPin,
  Navigation,
  Phone,
  PhoneCall,
  Mail,
  Send,
  Star,
  Shield,
  Wind,
  Droplets,
  Trash2,
  ScrollText,
  Info,
  Clock,
  KeyRound,
  DoorOpen,
  Copy,
  Check,
  QrCode,
  X,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Globe,
  ImageOff,
  ExternalLink,
  Headset,
  Tv,
  Coffee,
  ChefHat,
  WashingMachine,
  Utensils,
  AirVent,
  BedDouble,
  Building2,
  ParkingCircle,
  Moon,
  Eye,
  EyeOff,
  Sun,
  CloudSun,
  CloudRain,
  GlassWater,
  Toilet,
  Plug,
  Smartphone,
  Share2,
  Car,
  ListChecks,
  Bus,
  BadgePercent,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useBeachWeather } from '@/lib/useBeachWeather';

export type LocalizedText = string | Partial<Record<string, string>> | null | undefined;

function localize(field: LocalizedText, language: string): string {
  if (field == null) return '';
  if (typeof field === 'object' && !Array.isArray(field)) {
    return field[language] || '';
  }
  return language === 'en' ? String(field) : '';
}

function useT(): (key: string, fallback: string) => string {
  const { t } = useLanguage();
  return useCallback(
    (key: string, fallback: string) => {
      const value = t?.(key);
      return value && value !== key ? value : fallback;
    },
    [t],
  );
}

export type EmergencyIconKey = 'siren' | 'police' | 'ambulance' | 'fire';

export interface EmergencyContact {
  label: string;
  phone: string;
  icon?: EmergencyIconKey;
  maps_query?: string | null;
}

export type ManualIconKey =
  | 'wifi'
  | 'tv'
  | 'coffee'
  | 'kitchen'
  | 'laundry'
  | 'dishwasher'
  | 'water'
  | 'ac'
  | 'linens'
  | 'trash'
  | 'rules'
  | 'info'
  | 'tapwater'
  | 'plumbing'
  | 'sockets';

export interface ManualItem {
  key: string;
  title: string;
  icon: ManualIconKey;
  body: string | string[];
  images?: string[];
}

export interface Property {
  id: string;
  name: string;
  cover_image?: string | null;
  hero_image_url?: string | null;
  logo_url?: string | null;
  host_name?: string | null;
  host_avatar_url?: string | null;
  host_phone?: string | null;
  host_email?: string | null;
  reception_phone?: string | null;
  whatsapp_number?: string | null;
  host_whatsapp?: string | null;
  check_in_time?: string | null;
  check_out_time?: string | null;
  checkout_time?: string | null;
  wifi_ssid?: string | null;
  wifi_password?: string | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  checkin_steps?: string[] | null;
  checkout_steps?: string[] | null;
  manual_items?: ManualItem[] | null;
  emergency_contacts?: EmergencyContact[] | null;
  pharmacy_finder_url?: string | null;
  pharmacy_phone?: string | null;
  trash_maps_url?: string | null;

  // --- Home & Arrival ---
  keysafe_code?: string | null;
  building_access?: LocalizedText;
  elevator_info?: LocalizedText;
  parking_info?: LocalizedText;
  parking_maps_url?: string | null;
  late_arrival_info?: LocalizedText;

  // --- Apartment manual ---
  tv_streaming_info?: LocalizedText;
  coffee_supplies_info?: LocalizedText;
  kitchen_appliances_info?: LocalizedText;
  laundry_info?: LocalizedText;
  dishwasher_info?: LocalizedText;
  hot_water_info?: LocalizedText;
  amenities_info?: LocalizedText;
  linens_towels_info?: LocalizedText;

  // --- Appliance Photos ---
  tv_images?: string[] | null;
  laundry_images?: string[] | null;
  dishwasher_images?: string[] | null;
  hot_water_images?: string[] | null;
  ac_images?: string[] | null;

  trash_info?: LocalizedText;
  house_rules?: LocalizedText;
  tap_water_info?: LocalizedText;
  plumbing_rules?: LocalizedText;
  sockets_appliances_info?: LocalizedText;

  // --- Explore ---
  luggage_storage_info?: LocalizedText;
  bus_transport_info?: LocalizedText;
  taxi_station_info?: LocalizedText;
  taxi_phone?: string | null;
  rentals_booking_url?: string | null;
  car_rentals_info?: LocalizedText;
  car_rentals_booking_url?: string | null;
  transfers_info?: LocalizedText;

  first_aid_location?: LocalizedText;
  google_review_url?: string | null;
}

export type PlaceCategory = 'beaches' | 'groceries' | 'food' | 'nightlife' | 'gyms' | 'culture' | 'activities' | 'rentals' | 'excursions';

export interface Place {
  id: string;
  category: PlaceCategory;
  name: string;
  description?: LocalizedText;
  image_url?: string | null;
  google_rating?: number | null;
  google_review_count?: number | null;
  tripadvisor_rating?: number | null;
  wind_status?: 'sheltered' | 'exposed' | null;
  wind_note?: string | null;
  lat?: number | null;
  lng?: number | null;
  address?: string | null;
  phone?: string | null;
  is_featured?: boolean | null;
}

interface DashboardGridProps {
  property: Property;
  places: Place[];
  onOpenAIChat?: () => void;
}

const TURQUOISE = '#00A896';
const TURQUOISE_DARK = '#028090';
const DIRECTIONS_GRADIENT = 'from-[#00B4D8] to-[#0077B6]';
const DIRECTIONS_SHADOW = 'shadow-[#0077B6]/30';

const TAP_SPRING = { type: 'spring' as const, stiffness: 420, damping: 18 };

type Tab = 'home' | 'manual' | 'explore' | 'support';
const TAB_ORDER: Tab[] = ['home', 'manual', 'explore', 'support'];

const TABS: { key: Tab; labelKey: string; fallback: string; icon: typeof HomeIcon }[] = [
  { key: 'home', labelKey: 'tabs.home', fallback: 'Home', icon: HomeIcon },
  { key: 'manual', labelKey: 'tabs.manual', fallback: 'Manual', icon: BookOpen },
  { key: 'explore', labelKey: 'tabs.explore', fallback: 'Explore', icon: Compass },
  { key: 'support', labelKey: 'tabs.support', fallback: 'Support', icon: LifeBuoy },
];

type SceneComponent = (props: { className?: string }) => ReactElement;

interface CategoryConfig {
  kind: 'places';
  key: PlaceCategory;
  label: string;
  subtitle: string;
  Scene: SceneComponent;
  gradient: string;
  shadow: string;
}

const EXPLORE_CATEGORIES: CategoryConfig[] = [
  { kind: 'places', key: 'beaches', label: 'Beaches & Weather', subtitle: 'Beaches & Wind Forecast', Scene: BeachesScene, gradient: 'from-[#00C0FF] to-[#0070BA]', shadow: 'shadow-[#00C0FF]/30' },
  { kind: 'places', key: 'groceries', label: 'Bakery & Supermarkets', subtitle: 'Breakfast, Coffee & Groceries', Scene: GroceriesScene, gradient: 'from-[#FFD54F] to-[#C9820A]', shadow: 'shadow-[#FFD54F]/30' },
  { kind: 'places', key: 'food', label: 'Food & Taverns', subtitle: 'Traditional Taverns & Dining', Scene: FoodScene, gradient: 'from-[#FF6B00] to-[#E04400]', shadow: 'shadow-[#FF6B00]/30' },
  { kind: 'places', key: 'nightlife', label: 'Bars & Nightlife', subtitle: 'Cocktails & Nightspots', Scene: NightlifeScene, gradient: 'from-[#FF2D55] to-[#AF52DE]', shadow: 'shadow-[#FF2D55]/30' },
  { kind: 'places', key: 'gyms', label: 'Gyms & Pools', subtitle: 'Fitness & Day Passes', Scene: GymScene, gradient: 'from-[#34D9B0] to-[#0E8F72]', shadow: 'shadow-[#34D9B0]/30' },
  { kind: 'places', key: 'culture', label: 'Sights & Culture', subtitle: 'Fortress & Museums', Scene: CultureScene, gradient: 'from-[#FFB300] to-[#F57C00]', shadow: 'shadow-[#FFB300]/30' },
  { kind: 'places', key: 'activities', label: 'Activities & Cruises', subtitle: 'Hiking, Trails & Boat Trips', Scene: ActivitiesScene, gradient: 'from-[#34C759] to-[#009688]', shadow: 'shadow-[#34C759]/30' },
  { kind: 'places', key: 'rentals', label: 'Rentals & Transfers', subtitle: 'Cars, Motos & Airport Transfers', Scene: RentalsScene, gradient: 'from-[#5E5CE6] to-[#3634A3]', shadow: 'shadow-[#5E5CE6]/30' },
  { kind: 'places', key: 'excursions', label: 'Excursions & Day Trips', subtitle: 'Day Tours & Island Escapes', Scene: ExcursionsScene, gradient: 'from-[#FFB74D] to-[#E67E22]', shadow: 'shadow-[#FFB74D]/30' },
];

type InfoCategoryKey = 'luggage' | 'buses' | 'taxi';

interface InfoCategoryConfig {
  kind: 'info';
  key: InfoCategoryKey;
  label: string;
  subtitle: string;
  Scene: SceneComponent;
  gradient: string;
  shadow: string;
  field: (property: Property) => LocalizedText;
  fallback: string;
  mapsQuery: string;
}

const INFO_CATEGORIES: InfoCategoryConfig[] = [
  {
    kind: 'info',
    key: 'luggage',
    label: 'Luggage Storage',
    subtitle: 'Lockers & Baggage Drop-off',
    Scene: LuggageScene,
    gradient: 'from-[#AF7AC5] to-[#6C3483]',
    shadow: 'shadow-[#AF7AC5]/30',
    field: (p) => p.luggage_storage_info,
    fallback: 'Ask our team about nearby luggage storage lockers if you arrive before check-in or need to store bags after checkout.',
    mapsQuery: 'Luggage Storage',
  },
  {
    kind: 'info',
    key: 'buses',
    label: 'Public Buses',
    subtitle: 'KTEL Routes & Timetables',
    Scene: BusScene,
    gradient: 'from-[#2E86DE] to-[#154273]',
    shadow: 'shadow-[#2E86DE]/30',
    field: (p) => p.bus_transport_info,
    fallback: 'The nearest KTEL bus stop is a short walk away — check the local timetable for routes into town and along the coast.',
    mapsQuery: 'KTEL Bus Stop',
  },
  {
    kind: 'info',
    key: 'taxi',
    label: 'Taxi Ranks',
    subtitle: 'Radiotaxi & Taxi Stands',
    Scene: TaxiScene,
    gradient: 'from-[#F5B041] to-[#B9770E]',
    shadow: 'shadow-[#F5B041]/30',
    field: (p) => p.taxi_station_info,
    fallback: 'The closest taxi rank is nearby, or call the local radiotaxi service for pickup directly from the property.',
    mapsQuery: 'Taxi Rank',
  },
];

type ExploreTile = CategoryConfig | InfoCategoryConfig;
const EXPLORE_TILES: ExploreTile[] = [...EXPLORE_CATEGORIES, ...INFO_CATEGORIES];

const MANUAL_ICONS: Record<ManualIconKey, typeof Wifi> = {
  wifi: Wifi,
  tv: Tv,
  coffee: Coffee,
  kitchen: ChefHat,
  laundry: WashingMachine,
  dishwasher: Utensils,
  water: Droplets,
  ac: AirVent,
  linens: BedDouble,
  trash: Trash2,
  rules: ScrollText,
  info: Info,
  tapwater: GlassWater,
  plumbing: Toilet,
  sockets: Plug,
};

interface SquircleTone {
  gradient: string;
  shadow: string;
}

const MANUAL_TONES: Record<ManualIconKey, SquircleTone> = {
  wifi: { gradient: 'from-[#0A84FF] to-[#0055D4]', shadow: 'shadow-[#0A84FF]/25' },
  tv: { gradient: 'from-[#6366F1] to-[#4338CA]', shadow: 'shadow-[#6366F1]/25' },
  coffee: { gradient: 'from-[#B45309] to-[#7C2D12]', shadow: 'shadow-[#B45309]/25' },
  kitchen: { gradient: 'from-[#FF6B35] to-[#C1440E]', shadow: 'shadow-[#FF6B35]/25' },
  laundry: { gradient: 'from-[#38BDF8] to-[#0369A1]', shadow: 'shadow-[#38BDF8]/25' },
  dishwasher: { gradient: 'from-[#2DD4BF] to-[#0F766E]', shadow: 'shadow-[#2DD4BF]/25' },
  water: { gradient: 'from-[#FF9F0A] to-[#D97706]', shadow: 'shadow-[#FF9F0A]/25' },
  ac: { gradient: 'from-[#30B0C7] to-[#007A8D]', shadow: 'shadow-[#30B0C7]/25' },
  linens: { gradient: 'from-[#FB7185] to-[#BE123C]', shadow: 'shadow-[#FB7185]/25' },
  trash: { gradient: 'from-[#34C759] to-[#248A3D]', shadow: 'shadow-[#34C759]/25' },
  rules: { gradient: 'from-[#AF52DE] to-[#5856D6]', shadow: 'shadow-[#AF52DE]/25' },
  info: { gradient: 'from-[#8E8E93] to-[#636366]', shadow: 'shadow-[#8E8E93]/25' },
  tapwater: { gradient: 'from-[#3B82F6] to-[#1D4ED8]', shadow: 'shadow-[#3B82F6]/25' },
  plumbing: { gradient: 'from-[#64748B] to-[#334155]', shadow: 'shadow-[#64748B]/25' },
  sockets: { gradient: 'from-[#FBBF24] to-[#B45309]', shadow: 'shadow-[#FBBF24]/25' },
};

const AI_CHAT_TONE: SquircleTone = { gradient: 'from-[#00A896] to-[#028090]', shadow: 'shadow-[#00A896]/25' };
const CONTACT_TONE: SquircleTone = { gradient: 'from-[#FF9F0A] to-[#D97706]', shadow: 'shadow-[#FF9F0A]/25' };
const QR_TONE: SquircleTone = { gradient: 'from-[#00A896] to-[#028090]', shadow: 'shadow-[#00A896]/25' };
const HOST_TONE: SquircleTone = { gradient: 'from-[#00A896] to-[#028090]', shadow: 'shadow-[#00A896]/25' };
const KEYSAFE_TONE: SquircleTone = { gradient: 'from-[#FFD60A] to-[#D4972B]', shadow: 'shadow-[#FFD60A]/25' };
const BUILDING_TONE: SquircleTone = { gradient: 'from-[#8E8E93] to-[#48484A]', shadow: 'shadow-[#8E8E93]/25' };
const PARKING_TONE: SquircleTone = { gradient: 'from-[#5E5CE6] to-[#3634A3]', shadow: 'shadow-[#5E5CE6]/25' };
const LATE_ARRIVAL_TONE: SquircleTone = { gradient: 'from-[#5856D6] to-[#2E2A80]', shadow: 'shadow-[#5856D6]/25' };
const WEATHER_TONE: SquircleTone = { gradient: 'from-[#5AC8FA] to-[#0A84FF]', shadow: 'shadow-[#5AC8FA]/25' };
const FIRST_AID_TONE: SquircleTone = { gradient: 'from-[#FF3B30] to-[#C41C14]', shadow: 'shadow-[#FF3B30]/25' };

const EMERGENCY_SCENES: Record<EmergencyIconKey, SceneComponent> = {
  siren: SirenScene,
  police: PoliceScene,
  ambulance: AmbulanceScene,
  fire: FireScene,
};

const EMERGENCY_TONES: Record<EmergencyIconKey, SquircleTone> = {
  siren: { gradient: 'from-[#FF3B30] to-[#C41C14]', shadow: 'shadow-[#FF3B30]/25' },
  police: { gradient: 'from-[#1D4ED8] to-[#1E3A8A]', shadow: 'shadow-[#1D4ED8]/25' },
  ambulance: { gradient: 'from-[#FF2D55] to-[#E11D48]', shadow: 'shadow-[#FF2D55]/25' },
  fire: { gradient: 'from-[#FF5722] to-[#D84315]', shadow: 'shadow-[#FF5722]/25' },
};

const PHARMACY_TONE: SquircleTone = { gradient: 'from-[#10B981] to-[#047857]', shadow: 'shadow-[#10B981]/25' };

const DEFAULT_EMERGENCY_CONTACTS: EmergencyContact[] = [
  { label: 'European Emergency', phone: '112', icon: 'siren' },
  { label: 'Police Department', phone: '100', icon: 'police', maps_query: 'Police Station' },
  { label: 'Ambulance / Hospital', phone: '166', icon: 'ambulance', maps_query: 'Rethymno General Hospital' },
  { label: 'Fire Department', phone: '199', icon: 'fire', maps_query: 'Fire Station' },
];

const DEFAULT_CHECKIN_STEPS = [
  'Arrive any time after 15:00 — text us your ETA and we’ll have everything ready.',
  'The lockbox is beside the front door; the code is sent to you the morning of arrival.',
  'Inside you’ll find a welcome folder with local tips and your Wi-Fi details.',
];

const DEFAULT_CHECKOUT_STEPS = [
  'Checkout is by 11:00 — no need to strip the beds, just gather any towels used.',
  'Please switch off the AC and lock all windows before you leave.',
  'Drop the keys back in the lockbox and set the code back to 0000.',
];

const DEFAULT_DEPARTURE_CHECKLIST: { key: string; fallback: string }[] = [
  { key: 'home.task_ac', fallback: 'Switch off the AC & lights' },
  { key: 'home.task_trash', fallback: 'Take out the trash' },
  { key: 'home.task_windows', fallback: 'Close & lock all windows' },
  { key: 'home.task_keys', fallback: 'Return keys to the lockbox' },
];

const tabVariants: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction >= 0 ? 18 : -18 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction >= 0 ? -18 : 18 }),
};

const drillVariants: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction >= 0 ? 24 : -24 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction >= 0 ? -24 : 24 }),
};

const listStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

const listItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

function digitsOnly(value: string): string {
  return value.replace(/[^\d+]/g, '');
}

function telHref(phone?: string | null): string | undefined {
  return phone ? `tel:${digitsOnly(phone)}` : undefined;
}

function mailHref(email?: string | null, subject = 'Question about my stay'): string | undefined {
  return email ? `mailto:${email}?subject=${encodeURIComponent(subject)}` : undefined;
}

function waHref(phone?: string | null, message = 'Hi! I have a question about my stay.'): string | undefined {
  if (!phone) return undefined;
  return `https://wa.me/${digitsOnly(phone).replace('+', '')}?text=${encodeURIComponent(message)}`;
}

function mapsHref(target: { lat?: number | null; lng?: number | null; name?: string | null; address?: string | null }): string {
  if (target.lat != null && target.lng != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${target.lat},${target.lng}`;
  }
  const query = encodeURIComponent([target.name, target.address].filter(Boolean).join(', '));
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

function nearbyMapsHref(query: string, property: Property): string {
  const search = encodeURIComponent(`${query} near ${property.address ?? property.name}`);
  return `https://www.google.com/maps/search/?api=1&query=${search}`;
}

function normalizeExternalUrl(url: string): string {
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function pharmacyFinderHref(property: Property): string {
  if (property.pharmacy_finder_url) return property.pharmacy_finder_url;
  const search = encodeURIComponent(`on-duty pharmacy near ${property.address ?? property.name}`);
  return `https://www.google.com/search?q=${search}`;
}

function trashMapsHref(property: Property): string {
  return (
    property.trash_maps_url ||
    'https://maps.google.com/?q=' + encodeURIComponent((property.address ?? property.name) + ' Trash Bins')
  );
}

function parkingMapsHref(property: Property): string {
  return property.parking_maps_url || nearbyMapsHref('Parking', property);
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function IconSquircle({
  icon: Icon,
  tone,
  size = 44,
  rounded,
}: {
  icon: typeof Wifi;
  tone: SquircleTone;
  size?: number;
  rounded?: string;
}) {
  const roundedClass = rounded ?? (size >= 52 ? 'rounded-[22px]' : 'rounded-[18px]');
  const iconSize = Math.round(size * 0.44);

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden ${roundedClass} bg-gradient-to-br ${tone.gradient} border-t border-white/30 shadow-lg ${tone.shadow}`}
      style={{ width: size, height: size }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent" />
      <Icon className="relative text-white" width={iconSize} height={iconSize} strokeWidth={2.2} />
    </div>
  );
}

function WifiPulse({ children }: { children: ReactNode }) {
  return (
    <div className="relative inline-flex shrink-0">
      {[0, 1].map((i) => (
        <motion.span
          key={i}
          aria-hidden
          className="absolute inset-0 rounded-[18px] border-2"
          style={{ borderColor: '#0A84FF' }}
          initial={{ opacity: 0.5, scale: 1 }}
          animate={{ opacity: [0.5, 0], scale: [1, 1.55] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.6, ease: 'easeOut' }}
        />
      ))}
      {children}
    </div>
  );
}

function CheckInScene({ className = 'h-16 w-full' }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 120 60" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id={`${id}-bag`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3FBF9F" />
          <stop offset="100%" stopColor="#028090" />
        </linearGradient>
        <linearGradient id={`${id}-key`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFE29A" />
          <stop offset="55%" stopColor="#F4B942" />
          <stop offset="100%" stopColor="#B8791E" />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD873" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#FFD873" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="42" cy="54" rx="26" ry="4" fill="#0C4A3E" opacity="0.14" />
      <rect x="20" y="22" width="44" height="30" rx="7" fill={`url(#${id}-bag)`} stroke="#01585F" strokeWidth="1.2" />
      <rect x="20" y="22" width="44" height="11" rx="6" fill="white" opacity="0.14" />
      <path d="M34 22 V15 Q34 10 40 10 H44 Q50 10 50 15 V22" stroke="#01585F" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <rect x="20" y="34" width="44" height="3.4" fill="#01585F" opacity="0.32" />
      <rect x="39" y="22" width="6" height="30" fill="#01585F" opacity="0.22" />
      <circle cx="28" cy="53" r="2.6" fill="#0C2B2E" />
      <circle cx="56" cy="53" r="2.6" fill="#0C2B2E" />

      <g transform="rotate(20 62 26)">
        <path d="M62 24 L70 24 L73 28 L70 32 L62 32 Z" fill="#FFD873" stroke="#B8791E" strokeWidth="1" />
        <circle cx="65" cy="28" r="1.1" fill="#B8791E" />
      </g>

      <motion.circle
        cx="90"
        cy="24"
        r="15"
        fill={`url(#${id}-glow)`}
        animate={{ opacity: [0.55, 1, 0.55] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <circle cx="85" cy="22" r="6" fill="none" stroke={`url(#${id}-key)`} strokeWidth="3" />
      <line x1="90" y1="24" x2="101" y2="35" stroke={`url(#${id}-key)`} strokeWidth="3" strokeLinecap="round" />
      <line x1="96" y1="30" x2="99.5" y2="26.5" stroke={`url(#${id}-key)`} strokeWidth="2.4" strokeLinecap="round" />
      <line x1="99.5" y1="33.5" x2="103" y2="30" stroke={`url(#${id}-key)`} strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function CheckOutScene({ className = 'h-16 w-full' }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 120 60" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id={`${id}-clock`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFB37A" />
          <stop offset="100%" stopColor="#E0523A" />
        </linearGradient>
        <linearGradient id={`${id}-bag`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFC59A" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>

      <ellipse cx="70" cy="54" rx="28" ry="4" fill="#7C2D12" opacity="0.12" />
      <circle cx="30" cy="26" r="18" fill={`url(#${id}-clock)`} stroke="#B93E2A" strokeWidth="1.2" />
      <circle cx="30" cy="26" r="14" fill="white" opacity="0.16" />
      <circle cx="30" cy="26" r="1.6" fill="white" />
      <line x1="30" y1="26" x2="30" y2="16" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="30" y1="26" x2="22" y2="24" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="30" cy="8" r="1.4" fill="#B93E2A" />

      <rect x="72" y="26" width="38" height="26" rx="6" fill={`url(#${id}-bag)`} stroke="#8A4A0A" strokeWidth="1.1" />
      <rect x="72" y="26" width="38" height="9" rx="5" fill="white" opacity="0.14" />
      <path d="M84 26 V20 Q84 16 89 16 H93 Q98 16 98 20 V26" stroke="#8A4A0A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <rect x="72" y="36" width="38" height="3" fill="#8A4A0A" opacity="0.3" />
      <circle cx="79" cy="53" r="2.4" fill="#5C3A22" />
      <circle cx="103" cy="53" r="2.4" fill="#5C3A22" />
      <g transform="rotate(-16 76 30)">
        <path d="M76 28 L82 28 L84 31 L82 34 L76 34 Z" fill="#FFE29A" stroke="#8A4A0A" strokeWidth="1" />
      </g>
    </svg>
  );
}

function ApartmentHeroScene({ className = 'h-full w-full' }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 480 320" className={className} preserveAspectRatio="xMidYMax slice" fill="none" aria-hidden>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF9E6D" />
          <stop offset="45%" stopColor="#F76E8B" />
          <stop offset="100%" stopColor="#5B4B8A" />
        </linearGradient>
        <linearGradient id={`${id}-sea`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0E7C86" />
          <stop offset="100%" stopColor="#053B4A" />
        </linearGradient>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFDF7" />
          <stop offset="100%" stopColor="#EDE4D3" />
        </linearGradient>
        <linearGradient id={`${id}-wall2`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F7F1E4" />
          <stop offset="100%" stopColor="#DED2B8" />
        </linearGradient>
        <linearGradient id={`${id}-dome`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3FA9D8" />
          <stop offset="100%" stopColor="#0A5C8A" />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FFE6A8" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FFB347" stopOpacity="0.15" />
        </radialGradient>
        <linearGradient id={`${id}-shutter`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4FC3D9" />
          <stop offset="100%" stopColor="#1E7A94" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="480" height="320" fill={`url(#${id}-sky)`} />
      <circle cx="360" cy="90" r="46" fill="#FFE6A8" opacity="0.85" />
      <circle cx="360" cy="90" r="70" fill="#FFD37A" opacity="0.18" />

      <rect x="0" y="196" width="480" height="124" fill={`url(#${id}-sea)`} />
      <path d="M0 196 Q120 188 240 196 T480 196 V206 Q360 198 240 206 T0 206 Z" fill="#0E7C86" opacity="0.5" />
      <path d="M0 214 Q120 206 240 214 T480 214" stroke="#EAF6FF" strokeOpacity="0.18" strokeWidth="3" fill="none" />
      <path d="M0 232 Q120 224 240 232 T480 232" stroke="#EAF6FF" strokeOpacity="0.14" strokeWidth="3" fill="none" />

      <path d="M0 210 Q90 178 200 200 Q300 220 480 188 V210 H0 Z" fill="#3D2F63" opacity="0.55" />

      <path d="M46 260 Q42 210 52 176" stroke="#3B2A22" strokeWidth="5" strokeLinecap="round" fill="none" />
      <g stroke="#0F7B5C" strokeWidth="7" strokeLinecap="round">
        <path d="M52 176 Q28 160 12 168" />
        <path d="M52 176 Q30 186 18 202" />
        <path d="M52 176 Q74 158 92 162" />
        <path d="M52 176 Q78 182 90 198" />
        <path d="M52 176 Q52 152 46 138" />
      </g>

      <rect x="252" y="150" width="120" height="110" rx="6" fill={`url(#${id}-wall2)`} stroke="#C9BB9C" strokeWidth="1.5" />
      <path d="M252 150 Q312 118 372 150 Z" fill={`url(#${id}-dome)`} stroke="#0A5C8A" strokeWidth="1.5" />
      <circle cx="312" cy="128" r="4" fill="#FFE6A8" />
      <rect x="270" y="176" width="20" height="28" rx="10" fill={`url(#${id}-shutter)`} stroke="#0A5C8A" strokeWidth="1.4" />
      <rect x="272" y="178" width="16" height="24" rx="8" fill={`url(#${id}-glow)`} opacity="0.9" />
      <rect x="334" y="176" width="20" height="28" rx="10" fill={`url(#${id}-shutter)`} stroke="#0A5C8A" strokeWidth="1.4" />
      <rect x="336" y="178" width="16" height="24" rx="8" fill={`url(#${id}-glow)`} opacity="0.9" />
      <rect x="298" y="214" width="28" height="46" rx="4" fill="#1E7A94" opacity="0.9" />
      <rect x="300" y="216" width="24" height="20" rx="3" fill={`url(#${id}-glow)`} opacity="0.85" />

      <rect x="84" y="128" width="196" height="132" rx="8" fill={`url(#${id}-wall)`} stroke="#D8CBAE" strokeWidth="1.5" />
      <rect x="84" y="120" width="196" height="14" rx="4" fill="#F0E6D2" stroke="#D8CBAE" strokeWidth="1.2" />

      <path d="M106 176 V158 Q106 148 116 148 Q126 148 126 158 V176 Z" fill={`url(#${id}-shutter)`} stroke="#0A5C8A" strokeWidth="1.4" />
      <path d="M109 176 V159 Q109 151 116 151 Q123 151 123 159 V176 Z" fill={`url(#${id}-glow)`} />
      <path d="M150 176 V158 Q150 148 160 148 Q170 148 170 158 V176 Z" fill={`url(#${id}-shutter)`} stroke="#0A5C8A" strokeWidth="1.4" />
      <path d="M153 176 V159 Q153 151 160 151 Q167 151 167 159 V176 Z" fill={`url(#${id}-glow)`} />
      <path d="M194 176 V158 Q194 148 204 148 Q214 148 214 158 V176 Z" fill={`url(#${id}-shutter)`} stroke="#0A5C8A" strokeWidth="1.4" />
      <path d="M197 176 V159 Q197 151 204 151 Q211 151 211 159 V176 Z" fill={`url(#${id}-glow)`} />
      <path d="M238 176 V158 Q238 148 248 148 Q258 148 258 158 V176 Z" fill={`url(#${id}-shutter)`} stroke="#0A5C8A" strokeWidth="1.4" />
      <path d="M241 176 V159 Q241 151 248 151 Q255 151 255 159 V176 Z" fill={`url(#${id}-glow)`} />

      <rect x="96" y="192" width="172" height="4" fill="#0A5C8A" opacity="0.6" />
      {Array.from({ length: 15 }).map((_, i) => (
        <rect key={i} x={100 + i * 11} y={192} width="3" height="16" fill="#0A5C8A" opacity="0.5" />
      ))}
      <rect x="160" y="208" width="40" height="52" rx="4" fill="#0F4C4C" />
      <rect x="164" y="212" width="32" height="44" rx="3" fill="#1E7A94" opacity="0.85" />
      <circle cx="192" cy="234" r="1.8" fill="#FFE6A8" />

      <path d="M90 210 Q84 196 92 184 Q100 196 96 210" fill="#E0527A" opacity="0.9" />
      <path d="M96 210 Q102 198 96 186 Q108 196 104 210" fill="#F0759A" opacity="0.85" />
      <path d="M88 258 L96 210 H108 L112 258 Z" fill="#B45309" opacity="0.9" />
      <path d="M262 210 Q256 196 264 184 Q272 196 268 210" fill="#E0527A" opacity="0.9" />
      <path d="M252 258 L260 210 H272 L276 258 Z" fill="#B45309" opacity="0.9" />

      <path d="M84 132 Q182 108 280 132" stroke="#3B2A22" strokeWidth="1.4" fill="none" opacity="0.4" />
      {[110, 138, 166, 194, 222, 250].map((x, i) => (
        <circle key={x} cx={x} cy={130 - Math.abs(3 - i) * 2} r="2.6" fill="#FFE6A8" opacity="0.95" />
      ))}
    </svg>
  );
}

function BeachesScene({ className = 'h-14 w-14' }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8FE3FF" />
          <stop offset="100%" stopColor="#BFF0FF" />
        </linearGradient>
        <linearGradient id={`${id}-sea`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00E0D3" />
          <stop offset="100%" stopColor="#0077B6" />
        </linearGradient>
        <linearGradient id={`${id}-sand`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE29A" />
          <stop offset="100%" stopColor="#F2B94C" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill={`url(#${id}-sky)`} />
      <path d="M2 40 Q16 32 32 40 T62 40 V60 Q62 62 60 62 H4 Q2 62 2 60 Z" fill={`url(#${id}-sea)`} />
      <motion.path
        d="M2 40 Q16 34 32 40 T62 40"
        stroke="white"
        strokeOpacity="0.55"
        strokeWidth="1.6"
        fill="none"
        animate={{ x: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <path d="M2 50 Q16 44 32 50 T62 50 V60 Q62 62 60 62 H4 Q2 62 2 60 Z" fill={`url(#${id}-sand)`} />
      <line x1="46" y1="30" x2="46" y2="50" stroke="#8B5A2B" strokeWidth="2" strokeLinecap="round" />
      <path d="M34 30 Q46 16 58 30 Z" fill="#FF5A5F" />
      <path d="M34 30 Q40 24 46 30 Z" fill="#FF8A8F" />
      <path d="M46 30 Q52 24 58 30 Z" fill="#FF8A8F" />
      <circle cx="46" cy="29" r="1.6" fill="#8B5A2B" />
    </svg>
  );
}

function GroceriesScene({ className = 'h-14 w-14' }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE9B8" />
          <stop offset="100%" stopColor="#F0AE3C" />
        </linearGradient>
        <linearGradient id={`${id}-bag`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E4B978" />
          <stop offset="100%" stopColor="#B4854A" />
        </linearGradient>
        <linearGradient id={`${id}-bread`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F4D190" />
          <stop offset="100%" stopColor="#C6862F" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill={`url(#${id}-bg)`} />
      <path d="M16 30 L18 54 Q18 56 20 56 H44 Q46 56 46 54 L48 30 Z" fill={`url(#${id}-bag)`} stroke="#8A6432" strokeWidth="1" />
      <path d="M16 30 H48 L47 24 H17 Z" fill="#D6A868" stroke="#8A6432" strokeWidth="1" />
      <line x1="20" y1="36" x2="44" y2="36" stroke="#8A6432" strokeWidth="0.6" opacity="0.5" />
      <line x1="20" y1="44" x2="44" y2="44" stroke="#8A6432" strokeWidth="0.6" opacity="0.5" />
      <g transform="rotate(-18 34 18)">
        <rect x="26" y="10" width="8" height="26" rx="4" fill={`url(#${id}-bread)`} stroke="#8A5A1E" strokeWidth="1" />
        <line x1="30" y1="14" x2="30" y2="18" stroke="#8A5A1E" strokeWidth="1" strokeLinecap="round" />
        <line x1="30" y1="20" x2="30" y2="24" stroke="#8A5A1E" strokeWidth="1" strokeLinecap="round" />
        <line x1="30" y1="26" x2="30" y2="30" stroke="#8A5A1E" strokeWidth="1" strokeLinecap="round" />
      </g>
      <circle cx="41" cy="27" r="5" fill="#E23B3B" stroke="#8E1E1E" strokeWidth="0.8" />
      <path d="M41 22 Q42 19 44 19" stroke="#4C7A34" strokeWidth="1.4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function FoodScene({ className = 'h-14 w-14' }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD9A8" />
          <stop offset="100%" stopColor="#FF9B54" />
        </linearGradient>
        <linearGradient id={`${id}-plate`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFDF7" />
          <stop offset="100%" stopColor="#F0E4D0" />
        </linearGradient>
        <linearGradient id={`${id}-dome`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F4F4F5" />
          <stop offset="100%" stopColor="#C6C8CC" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill={`url(#${id}-bg)`} />
      <ellipse cx="30" cy="46" rx="22" ry="8" fill={`url(#${id}-plate)`} stroke="#D8C8AC" strokeWidth="1" />
      <ellipse cx="30" cy="44" rx="14" ry="4.5" fill="#E8D9BC" opacity="0.6" />
      <path d="M18 34 Q18 20 34 20 Q50 20 50 34 Z" fill={`url(#${id}-dome)`} />
      <rect x="16" y="33" width="36" height="4" rx="2" fill="#B7B9BE" />
      <circle cx="34" cy="16" r="2.4" fill="#B7B9BE" />
      <line x1="10" y1="14" x2="10" y2="30" stroke="#8B8F98" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="7" y1="14" x2="7" y2="20" stroke="#8B8F98" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="10" y1="14" x2="10" y2="20" stroke="#8B8F98" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="13" y1="14" x2="13" y2="20" stroke="#8B8F98" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M54 14 L54 22 Q54 26 51 28 L51 30" stroke="#8B8F98" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function NightlifeScene({ className = 'h-14 w-14' }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4A2A6B" />
          <stop offset="100%" stopColor="#1F1147" />
        </linearGradient>
        <linearGradient id={`${id}-liq`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF6FB0" />
          <stop offset="100%" stopColor="#B4257A" />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#FF6FB0" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FF6FB0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill={`url(#${id}-bg)`} />
      <motion.circle
        cx="32"
        cy="34"
        r="20"
        fill={`url(#${id}-glow)`}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <path d="M18 20 H44 L32 36 Z" fill={`url(#${id}-liq)`} stroke="#FFD9EC" strokeWidth="1" />
      <line x1="32" y1="36" x2="32" y2="50" stroke="#E8D9F0" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="32" cy="51" rx="8" ry="2" fill="#E8D9F0" />
      <circle cx="42" cy="18" r="6" fill="#FFC94A" stroke="#E0A82E" strokeWidth="1" />
      <g stroke="#E0A82E" strokeWidth="0.8">
        <line x1="42" y1="12" x2="42" y2="24" />
        <line x1="36.8" y1="15" x2="47.2" y2="21" />
        <line x1="36.8" y1="21" x2="47.2" y2="15" />
      </g>
      <circle cx="26" cy="26" r="1" fill="white" opacity="0.8" />
      <circle cx="36" cy="24" r="0.8" fill="white" opacity="0.6" />
    </svg>
  );
}

function GymScene({ className = 'h-14 w-14' }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B6F3E6" />
          <stop offset="100%" stopColor="#38C3AE" />
        </linearGradient>
        <linearGradient id={`${id}-pool`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4FD3E8" />
          <stop offset="100%" stopColor="#0E8F9E" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill={`url(#${id}-bg)`} />
      <circle cx="47" cy="14" r="7" fill="#FFE79A" opacity="0.9" />
      <path d="M4 48 Q10 42 16 48 T28 48 T40 48 T52 48 T60 48 V60 Q60 62 58 62 H6 Q4 62 4 60 Z" fill={`url(#${id}-pool)`} />
      <motion.path
        d="M4 44 Q10 40 16 44 T28 44 T40 44 T52 44 T60 44"
        stroke="white"
        strokeOpacity="0.5"
        strokeWidth="1.4"
        fill="none"
        animate={{ x: [0, -5, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <g transform="rotate(-20 24 26)">
        <rect x="14" y="23" width="20" height="5" rx="2" fill="#2B2B2E" />
        <rect x="10" y="19" width="6" height="13" rx="2" fill="#3A3A3E" />
        <rect x="32" y="19" width="6" height="13" rx="2" fill="#3A3A3E" />
      </g>
    </svg>
  );
}

function CultureScene({ className = 'h-14 w-14' }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFDD8A" />
          <stop offset="100%" stopColor="#F2A93C" />
        </linearGradient>
        <linearGradient id={`${id}-stone`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E7D8BE" />
          <stop offset="100%" stopColor="#C2A97C" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill={`url(#${id}-bg)`} />
      <rect x="22" y="24" width="20" height="30" fill={`url(#${id}-stone)`} stroke="#8B7248" strokeWidth="1" />
      <path d="M20 24 h4 v-4 h4 v4 h4 v-4 h4 v4 h4 v-4 h4 v4" stroke="#8B7248" strokeWidth="1" fill={`url(#${id}-stone)`} />
      <g stroke="#8B7248" strokeWidth="0.6" opacity="0.5">
        <line x1="22" y1="32" x2="42" y2="32" />
        <line x1="22" y1="40" x2="42" y2="40" />
        <line x1="22" y1="48" x2="42" y2="48" />
      </g>
      <path d="M29 54 V44 Q29 40 32 40 Q35 40 35 44 V54" fill="#5C4324" />
      <line x1="32" y1="20" x2="32" y2="8" stroke="#8B7248" strokeWidth="1.4" />
      <path d="M32 8 L44 12 L32 16 Z" fill="#E23B3B" />
      <rect x="14" y="54" width="36" height="4" rx="1.5" fill="#B99862" />
    </svg>
  );
}

function ActivitiesScene({ className = 'h-14 w-14' }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#BFF0D0" />
          <stop offset="100%" stopColor="#6FCF97" />
        </linearGradient>
        <linearGradient id={`${id}-mtn`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4C9A6B" />
          <stop offset="100%" stopColor="#2F7A4E" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill={`url(#${id}-bg)`} />
      <path d="M6 48 L20 26 L28 38 L36 22 L58 48 Z" fill={`url(#${id}-mtn)`} />
      <path d="M20 26 L24 32 L16 32 Z" fill="white" opacity="0.85" />
      <path d="M36 22 L40 28 L32 28 Z" fill="white" opacity="0.85" />
      <g fill="#1E5B3A">
        <path d="M12 48 L15 40 L18 48 Z" />
        <path d="M12 44 L15 37 L18 44 Z" />
        <line x1="15" y1="48" x2="15" y2="50" stroke="#5C3A22" strokeWidth="1" />
      </g>
      <path d="M46 52 Q42 44 48 38 T44 26" stroke="#FFFDF7" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="2 3" fill="none" />
      <circle cx="48" cy="16" r="7" fill="#FFFDF7" stroke="#2F7A4E" strokeWidth="1.4" />
      <path d="M48 11 L50 16 L48 21 L46 16 Z" fill="#E23B3B" />
    </svg>
  );
}

function RentalsScene({ className = 'h-14 w-14' }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C9C6FF" />
          <stop offset="100%" stopColor="#6A63E8" />
        </linearGradient>
        <linearGradient id={`${id}-car`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5B67FF" />
          <stop offset="100%" stopColor="#3634A3" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill={`url(#${id}-bg)`} />
      <circle cx="46" cy="14" r="8" fill="#FFE79A" opacity="0.9" />
      <rect x="6" y="46" width="52" height="3" rx="1.5" fill="#2A2860" opacity="0.5" />
      <path
        d="M10 44 Q10 36 18 36 L22 30 Q24 28 28 28 H38 Q42 28 44 30 L48 36 Q56 36 56 44 V46 H10 Z"
        fill={`url(#${id}-car)`}
        stroke="#232066"
        strokeWidth="1"
      />
      <path d="M25 30 L29 36 H40 L44 30" fill="#BFE3FF" opacity="0.85" />
      <circle cx="20" cy="46" r="5" fill="#1B1A3A" />
      <circle cx="20" cy="46" r="2" fill="#8C89C9" />
      <circle cx="46" cy="46" r="5" fill="#1B1A3A" />
      <circle cx="46" cy="46" r="2" fill="#8C89C9" />
      <rect x="12" y="40" width="6" height="2" rx="1" fill="white" opacity="0.85" />
    </svg>
  );
}

function ExcursionsScene({ className = 'h-14 w-14' }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD9A0" />
          <stop offset="100%" stopColor="#E67E22" />
        </linearGradient>
        <linearGradient id={`${id}-hills`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F4A742" />
          <stop offset="100%" stopColor="#B9601F" />
        </linearGradient>
        <linearGradient id={`${id}-compass`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF6E5" />
          <stop offset="100%" stopColor="#F0DCB0" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill={`url(#${id}-bg)`} />
      <circle cx="35" cy="13" r="7" fill="#FFEFC2" opacity="0.9" />
      <path d="M4 44 L18 28 L28 38 L40 22 L60 44 Z" fill={`url(#${id}-hills)`} />
      <path d="M18 28 L22 33 L14 33 Z" fill="white" opacity="0.75" />
      <path d="M40 22 L44 27 L36 27 Z" fill="white" opacity="0.75" />
      <circle cx="32" cy="42" r="15" fill={`url(#${id}-compass)`} stroke="#8A5A1E" strokeWidth="1.6" />
      <circle cx="32" cy="42" r="11.5" fill="none" stroke="#C9A567" strokeWidth="1" />
      <path d="M32 33 L36 42 L32 51 L28 42 Z" fill="#E23B3B" />
      <path d="M32 33 L34 42 L32 42 Z" fill="#B21F1F" />
      <circle cx="32" cy="42" r="1.6" fill="#5C3A22" />
      <g stroke="#8A5A1E" strokeWidth="1" strokeLinecap="round">
        <line x1="32" y1="29" x2="32" y2="32" />
        <line x1="32" y1="52" x2="32" y2="55" />
        <line x1="19" y1="42" x2="22" y2="42" />
        <line x1="42" y1="42" x2="45" y2="42" />
      </g>
    </svg>
  );
}

function LuggageScene({ className = 'h-14 w-14' }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D7BEEF" />
          <stop offset="100%" stopColor="#7D3C98" />
        </linearGradient>
        <linearGradient id={`${id}-case`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B279D6" />
          <stop offset="100%" stopColor="#6C3483" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill={`url(#${id}-bg)`} />
      <rect x="15" y="22" width="30" height="30" rx="4" fill={`url(#${id}-case)`} stroke="#4A235A" strokeWidth="1" />
      <path d="M25 22 V17 Q25 14 28 14 H32 Q35 14 35 17 V22" stroke="#4A235A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <rect x="15" y="34" width="30" height="4" fill="#4A235A" opacity="0.35" />
      <rect x="21" y="27" width="4" height="20" rx="1.5" fill="white" opacity="0.25" />
      <rect x="35" y="27" width="4" height="20" rx="1.5" fill="white" opacity="0.25" />
      <circle cx="47" cy="45" r="12" fill="#FFD966" stroke="#B9770E" strokeWidth="1.5" />
      <rect x="42" y="44" width="10" height="8" rx="2" fill="#4A235A" />
      <path d="M44 44 V41 Q44 37 47 37 Q50 37 50 41 V44" stroke="#4A235A" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="47" cy="47.5" r="1.6" fill="#FFD966" />
    </svg>
  );
}

function BusScene({ className = 'h-14 w-14' }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A9CCE3" />
          <stop offset="100%" stopColor="#1B4F72" />
        </linearGradient>
        <linearGradient id={`${id}-bus`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5DADE2" />
          <stop offset="100%" stopColor="#154273" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill={`url(#${id}-bg)`} />
      <rect x="8" y="44" width="48" height="3" rx="1.5" fill="#0B2545" opacity="0.4" />
      <rect x="12" y="16" width="40" height="28" rx="6" fill={`url(#${id}-bus)`} stroke="#0B2545" strokeWidth="1" />
      <rect x="16" y="20" width="9" height="9" rx="2" fill="#EAF6FF" opacity="0.9" />
      <rect x="27.5" y="20" width="9" height="9" rx="2" fill="#EAF6FF" opacity="0.9" />
      <rect x="39" y="20" width="9" height="9" rx="2" fill="#EAF6FF" opacity="0.9" />
      <rect x="16" y="33" width="32" height="5" rx="1.5" fill="#FFD966" />
      <circle cx="20" cy="46" r="5" fill="#0B2545" />
      <circle cx="20" cy="46" r="2" fill="#8FB6D9" />
      <circle cx="44" cy="46" r="5" fill="#0B2545" />
      <circle cx="44" cy="46" r="2" fill="#8FB6D9" />
      <rect x="6" y="52" width="6" height="2" rx="1" fill="#0B2545" opacity="0.3" />
      <rect x="17" y="52" width="6" height="2" rx="1" fill="#0B2545" opacity="0.3" />
      <rect x="28" y="52" width="6" height="2" rx="1" fill="#0B2545" opacity="0.3" />
    </svg>
  );
}

function TaxiScene({ className = 'h-14 w-14' }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FDE9B6" />
          <stop offset="100%" stopColor="#B9770E" />
        </linearGradient>
        <linearGradient id={`${id}-cab`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD966" />
          <stop offset="100%" stopColor="#D68910" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill={`url(#${id}-bg)`} />
      <rect x="6" y="46" width="52" height="3" rx="1.5" fill="#7A4B0A" opacity="0.5" />
      <path
        d="M10 44 Q10 36 18 36 L21 29 Q23 27 27 27 H39 Q43 27 45 29 L48 36 Q56 36 56 44 V46 H10 Z"
        fill={`url(#${id}-cab)`}
        stroke="#7A4B0A"
        strokeWidth="1"
      />
      <path d="M23 29 L26 36 H40 L43 29" fill="#EAF6FF" opacity="0.85" />
      <rect x="26" y="20" width="12" height="7" rx="2" fill="#1B1A3A" />
      <rect x="26" y="20" width="4" height="7" fill="white" opacity="0.85" />
      <rect x="34" y="20" width="4" height="7" fill="white" opacity="0.85" />
      <circle cx="20" cy="46" r="5" fill="#1B1A3A" />
      <circle cx="20" cy="46" r="2" fill="#8C7A4A" />
      <circle cx="46" cy="46" r="5" fill="#1B1A3A" />
      <circle cx="46" cy="46" r="2" fill="#8C7A4A" />
      <rect x="12" y="40" width="6" height="2" rx="1" fill="white" opacity="0.85" />
    </svg>
  );
}

function ConciergeScene({ className = 'h-14 w-14' }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5EEAD4" />
          <stop offset="100%" stopColor="#028090" />
        </linearGradient>
        <linearGradient id={`${id}-skin`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD8AE" />
          <stop offset="100%" stopColor="#F0B27A" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill={`url(#${id}-bg)`} />
      <path d="M14 52 Q14 38 32 38 Q50 38 50 52 V54 H14 Z" fill="#0F4C4C" />
      <circle cx="32" cy="26" r="13" fill={`url(#${id}-skin)`} />
      <path d="M19 22 Q19 11 32 11 Q45 11 45 22 V20 Q38 16 32 16 Q26 16 19 20 Z" fill="#3B2A22" />
      <circle cx="27" cy="27" r="1.6" fill="#3B2A22" />
      <circle cx="37" cy="27" r="1.6" fill="#3B2A22" />
      <path d="M27 33 Q32 36 37 33" stroke="#3B2A22" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M16 24 Q13 24 13 29 Q13 34 17 34" stroke="#1B1A3A" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M48 24 Q51 24 51 29 Q51 34 47 34" stroke="#1B1A3A" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <circle cx="14" cy="30" r="3.4" fill="#FFD966" stroke="#B9770E" strokeWidth="1" />
      <path d="M12 30 L16 30 M14 28 L14 32" stroke="#7A4B0A" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M12 15 Q32 4 52 15" stroke="#1B1A3A" strokeWidth="2.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function SirenScene({ className = 'h-6 w-6' }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" aria-hidden>
      <defs>
        <radialGradient id={`${id}-red`} cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FF8A80" />
          <stop offset="100%" stopColor="#D32F2F" />
        </radialGradient>
        <radialGradient id={`${id}-blue`} cx="65%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#82B1FF" />
          <stop offset="100%" stopColor="#1565C0" />
        </radialGradient>
      </defs>
      <motion.circle
        cx="20"
        cy="20"
        r="17"
        fill="#FF3B30"
        animate={{ opacity: [0.12, 0.4, 0.12], scale: [1, 1.25, 1] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
      />
      <path d="M12 24 Q12 12 20 12 Q28 12 28 24 Z" fill={`url(#${id}-red)`} />
      <path d="M20 12 Q28 12 28 24 H20 Z" fill={`url(#${id}-blue)`} opacity="0.9" />
      <rect x="9" y="24" width="22" height="4" rx="2" fill="#2B2B2E" />
      <rect x="14" y="28" width="12" height="3" rx="1.4" fill="#3A3A3E" />
      <motion.circle
        cx="20"
        cy="10"
        r="1.6"
        fill="#FFF176"
        animate={{ opacity: [1, 0.25, 1] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      />
    </svg>
  );
}

function PoliceScene({ className = 'h-6 w-6' }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE29A" />
          <stop offset="100%" stopColor="#D4972B" />
        </linearGradient>
        <linearGradient id={`${id}-blue`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5B8DEF" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>
      </defs>
      <path d="M20 6 L32 10 V19 Q32 30 20 35 Q8 30 8 19 V10 Z" fill={`url(#${id}-gold)`} stroke="#8A6416" strokeWidth="1" />
      <path d="M20 10 L28 13 V19 Q28 27 20 31 Q12 27 12 19 V13 Z" fill={`url(#${id}-blue)`} />
      <path d="M20 15 L22 19 H26 L23 22 L24 26 L20 23.5 L16 26 L17 22 L14 19 H18 Z" fill="#FFE29A" />
    </svg>
  );
}

function AmbulanceScene({ className = 'h-6 w-6' }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E5E7EB" />
        </linearGradient>
      </defs>
      <rect x="4" y="16" width="24" height="12" rx="2.4" fill={`url(#${id}-body)`} stroke="#C7CBD1" strokeWidth="1" />
      <path d="M28 18 H34 L37 22 V28 H28 Z" fill="#FF6B5E" stroke="#C7CBD1" strokeWidth="1" />
      <rect x="10" y="19" width="10" height="6" fill="#FFFFFF" />
      <rect x="13.5" y="19" width="3" height="6" fill="#E23B3B" />
      <rect x="10" y="21.5" width="10" height="1.6" fill="#E23B3B" />
      <circle cx="11" cy="29" r="3" fill="#2B2B2E" />
      <circle cx="11" cy="29" r="1.2" fill="#9CA3AF" />
      <circle cx="30" cy="29" r="3" fill="#2B2B2E" />
      <circle cx="30" cy="29" r="1.2" fill="#9CA3AF" />
      <motion.rect
        x="30"
        y="14"
        width="4"
        height="2.4"
        rx="1"
        fill="#FF3B30"
        animate={{ opacity: [1, 0.25, 1] }}
        transition={{ duration: 0.7, repeat: Infinity }}
      />
    </svg>
  );
}

function FireScene({ className = 'h-6 w-6' }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF7A5C" />
          <stop offset="100%" stopColor="#C62828" />
        </linearGradient>
      </defs>
      <rect x="4" y="16" width="28" height="12" rx="2.4" fill={`url(#${id}-body)`} stroke="#8E1E1E" strokeWidth="1" />
      <rect x="8" y="19" width="8" height="5" fill="#FFE29A" opacity="0.9" />
      <line x1="4" y1="21" x2="32" y2="21" stroke="#FFE29A" strokeWidth="1.4" />
      <line x1="10" y1="12" x2="30" y2="16" stroke="#8E1E1E" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="10" cy="29" r="3" fill="#2B2B2E" />
      <circle cx="10" cy="29" r="1.2" fill="#9CA3AF" />
      <circle cx="27" cy="29" r="3" fill="#2B2B2E" />
      <circle cx="27" cy="29" r="1.2" fill="#9CA3AF" />
      <g fill="#4FC3F7">
        <circle cx="34" cy="24" r="1.4" />
        <circle cx="37" cy="27" r="1" />
        <circle cx="35" cy="30" r="0.8" />
      </g>
    </svg>
  );
}

function PharmacyScene({ className = 'h-6 w-6' }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id={`${id}-cross`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5EEAD4" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#5EEAD4" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#5EEAD4" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="18" cy="18" r="15" fill={`url(#${id}-glow)`} />
      <path d="M13 8 H23 V13 H28 V23 H23 V28 H13 V23 H8 V13 H13 Z" fill={`url(#${id}-cross)`} stroke="#02543C" strokeWidth="1" />
      <g transform="rotate(45 30 30)">
        <rect x="24" y="27" width="14" height="7" rx="3.5" fill="#FFFFFF" />
        <rect x="24" y="27" width="7" height="7" rx="3.5" fill="#F97066" />
      </g>
    </svg>
  );
}

function FirstAidScene({ className = 'h-6 w-6' }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id={`${id}-box`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E5E7EB" />
        </linearGradient>
      </defs>
      <rect x="6" y="12" width="28" height="20" rx="3" fill={`url(#${id}-box)`} stroke="#C7CBD1" strokeWidth="1.2" />
      <rect x="14" y="8" width="12" height="6" rx="2" fill="#C7CBD1" />
      <rect x="14" y="19.2" width="12" height="3.6" fill="#E23B3B" />
      <rect x="18.2" y="15" width="3.6" height="12" fill="#E23B3B" />
    </svg>
  );
}

function IllustratedSquircle({
  scene: Scene,
  tone,
  size = 44,
  rounded,
}: {
  scene: SceneComponent;
  tone: SquircleTone;
  size?: number;
  rounded?: string;
}) {
  const roundedClass = rounded ?? (size >= 52 ? 'rounded-[22px]' : 'rounded-[18px]');
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden ${roundedClass} bg-gradient-to-br ${tone.gradient} border-t border-white/30 shadow-lg ${tone.shadow}`}
      style={{ width: size, height: size }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent" />
      <Scene className="relative h-[68%] w-[68%]" />
    </div>
  );
}

interface ToastMessage {
  id: number;
  text: string;
}

function ToastStack({ toasts }: { toasts: ToastMessage[] }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-6">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="flex items-center gap-2 rounded-full border border-stone-200/60 bg-white px-4 py-2.5 shadow-lg shadow-stone-900/10"
          >
            <Check className="h-3.5 w-3.5" style={{ color: TURQUOISE }} />
            <span className="text-xs font-medium text-stone-900">{toast.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function RatingBadge({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-1 rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-stone-900 shadow-sm backdrop-blur-md">
      <Star className="h-3 w-3 fill-current" style={{ color: '#FFB300' }} />
      {value.toFixed(1)}
    </span>
  );
}

function WindBadge({ status, note, compact = false }: { status: 'sheltered' | 'exposed'; note?: string | null; compact?: boolean }) {
  if (status === 'sheltered') {
    return (
      <span
        className={`flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50/95 font-semibold text-sky-700 shadow-sm backdrop-blur-md ${
          compact ? 'px-2 py-1 text-[10px]' : 'px-3 py-1.5 text-[11px]'
        }`}
      >
        <Shield className="h-3 w-3" />
        {compact ? 'Sheltered' : (note ?? 'Best Choice Today · Sheltered from the wind')}
      </span>
    );
  }
  return (
    <span
      className={`flex items-center gap-1.5 rounded-full border border-stone-200 bg-white/90 font-medium text-stone-500 shadow-sm backdrop-blur-md ${
        compact ? 'px-2 py-1 text-[10px]' : 'px-3 py-1.5 text-[11px]'
      }`}
    >
      <Wind className="h-3 w-3" />
      {compact ? 'Exposed' : (note ?? 'Exposed today')}
    </span>
  );
}

interface ForecastDay {
  day?: string;
  high?: number;
  low?: number;
  condition?: string;
}

interface BeachWeatherShape {
  tempC?: number;
  condition?: string;
  windSpeedKts?: number;
  windDirectionLabel?: string;
  isLoading?: boolean;
  forecast?: ForecastDay[];
}

function conditionIcon(condition?: string) {
  const c = (condition ?? '').toLowerCase();
  if (c.includes('rain') || c.includes('storm')) return CloudRain;
  if (c.includes('cloud')) return CloudSun;
  return Sun;
}

function WeatherWidget() {
  const weather = (useBeachWeather?.() ?? {}) as BeachWeatherShape;

  if (weather.isLoading) {
    return (
      <div className="mb-4 flex items-center gap-2 rounded-2xl border border-stone-200/60 bg-white px-4 py-3 text-stone-400 shadow-sm shadow-stone-900/5">
        <Sun className="h-4 w-4 animate-pulse" />
        <span className="text-xs font-medium">Checking local weather…</span>
      </div>
    );
  }

  const hasCurrent = weather.tempC != null || weather.windSpeedKts != null;
  const hasForecast = Boolean(weather.forecast && weather.forecast.length > 0);
  if (!hasCurrent && !hasForecast) return null;

  const CurrentIcon = conditionIcon(weather.condition);

  return (
    <div className="mb-4 rounded-2xl border border-sky-100 bg-sky-50/70 p-4 shadow-sm shadow-stone-900/5">
      <div className="flex items-center gap-3">
        <IconSquircle icon={CurrentIcon} tone={WEATHER_TONE} />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-700/70">Local Weather</p>
          <p className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-stone-900">{weather.tempC != null ? `${Math.round(weather.tempC)}°C` : '—'}</span>
            {weather.condition && <span className="text-sm font-medium text-stone-500">{weather.condition}</span>}
          </p>
          {weather.windSpeedKts != null && (
            <p className="mt-0.5 text-xs text-sky-800">
              Wind {weather.windSpeedKts} kt{weather.windDirectionLabel ? ` · ${weather.windDirectionLabel}` : ''}
            </p>
          )}
        </div>
      </div>

      {hasForecast && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-0.5">
          {weather.forecast!.slice(0, 5).map((day, i) => {
            const DayIcon = conditionIcon(day.condition);
            return (
              <div key={i} className="flex min-w-[52px] flex-col items-center gap-1 rounded-xl bg-white/70 px-2 py-2">
                <span className="text-[10px] font-semibold uppercase text-stone-500">{day.day ?? `+${i + 1}d`}</span>
                <DayIcon className="h-4 w-4 text-sky-600" />
                <span className="text-[11px] font-semibold text-stone-800">{day.high != null ? `${Math.round(day.high)}°` : '–'}</span>
                <span className="text-[10px] text-stone-400">{day.low != null ? `${Math.round(day.low)}°` : '–'}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LiveWindStrip() {
  const weather = (useBeachWeather?.() ?? {}) as BeachWeatherShape;

  if (weather.isLoading) {
    return (
      <div className="mb-4 flex items-center gap-2 rounded-2xl border border-stone-200/60 bg-white px-4 py-3 text-stone-400 shadow-sm shadow-stone-900/5">
        <Wind className="h-4 w-4 animate-pulse" />
        <span className="text-xs font-medium">Checking live wind conditions…</span>
      </div>
    );
  }

  if (weather.windSpeedKts == null) return null;

  return (
    <div className="mb-4 flex items-center gap-2.5 rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-3 text-sky-800 shadow-sm shadow-stone-900/5">
      <IconSquircle icon={Wind} tone={{ gradient: 'from-[#00C0FF] to-[#0070BA]', shadow: 'shadow-[#00C0FF]/25' }} size={32} rounded="rounded-xl" />
      <p className="text-xs font-medium">
        Live wind check: <span className="font-semibold">{weather.windSpeedKts} kt</span>
        {weather.windDirectionLabel ? ` from ${weather.windDirectionLabel}` : ''} — beaches below are marked sheltered or exposed accordingly.
      </p>
    </div>
  );
}

function PlaceCard({ place, language, onOpenDetails }: { place: Place; language: string; onOpenDetails: () => void }) {
  const description = localize(place.description, language);
  return (
    <motion.div
      variants={listItem}
      className="overflow-hidden rounded-2xl border border-stone-200/60 bg-white shadow-sm shadow-stone-900/5 transition-shadow hover:shadow-md"
    >
      <button type="button" onClick={onOpenDetails} className="block w-full text-left">
        <div className="relative h-48 w-full bg-stone-100">
          {place.image_url ? (
            <Image src={place.image_url} alt={place.name} fill sizes="420px" className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageOff className="h-6 w-6 text-stone-300" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />

          {place.category === 'beaches' && place.wind_status && (
            <div className="absolute inset-x-3 top-3">
              <WindBadge status={place.wind_status} note={place.wind_note} />
            </div>
          )}

          <div className="absolute inset-x-3 bottom-3 flex flex-wrap gap-1.5">
            {place.google_rating != null && <RatingBadge value={place.google_rating} />}
          </div>
        </div>
      </button>

      <div className="p-4">
        <p className="text-base font-semibold text-stone-900">{place.name}</p>
        {description && <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-stone-500">{description}</p>}

        <div className="mt-3.5 flex items-center gap-2">
          <motion.a
            whileTap={{ scale: 0.94 }}
            transition={TAP_SPRING}
            href={mapsHref(place)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e: MouseEvent) => e.stopPropagation()}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm"
            style={{ background: `linear-gradient(to right, ${TURQUOISE}, ${TURQUOISE_DARK})` }}
          >
            <Navigation className="h-3.5 w-3.5" />
            Open in Google Maps
          </motion.a>
          {place.phone && (
            <motion.a
              whileTap={{ scale: 0.94 }}
              transition={TAP_SPRING}
              href={telHref(place.phone)}
              onClick={(e: MouseEvent) => e.stopPropagation()}
              className="flex items-center justify-center gap-1.5 rounded-full border border-stone-200 bg-white px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-stone-900"
            >
              <Phone className="h-3.5 w-3.5" />
            </motion.a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function PlaceDetailDrawer({ place, language, onOpenChange }: { place: Place | null; language: string; onOpenChange: (open: boolean) => void }) {
  const description = place ? localize(place.description, language) : '';
  return (
    <Drawer.Root open={place !== null} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-sm" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-t-[32px] bg-[#F7F4EC]">
          <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-stone-300" />
          {place && (
            <div className="flex-1 overflow-y-auto pb-8">
              <Drawer.Title className="sr-only">{place.name}</Drawer.Title>
              <div className="relative h-64 w-full bg-stone-100">
                {place.image_url ? (
                  <Image src={place.image_url} alt={place.name} fill sizes="480px" className="object-cover" priority />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageOff className="h-8 w-8 text-stone-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
                <Drawer.Close asChild>
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    transition={TAP_SPRING}
                    type="button"
                    className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/90 shadow-sm backdrop-blur-md"
                  >
                    <X className="h-4 w-4 text-stone-900" />
                  </motion.button>
                </Drawer.Close>

                <div className="absolute inset-x-5 bottom-4 flex flex-wrap gap-1.5">
                  {place.category === 'beaches' && place.wind_status && (
                    <WindBadge status={place.wind_status} note={place.wind_note} />
                  )}
                  {place.google_rating != null && <RatingBadge value={place.google_rating} />}
                </div>
              </div>

              <div className="px-5 pt-5">
                <h3 className="text-xl font-semibold tracking-tight text-stone-900">{place.name}</h3>
                {description && <p className="mt-2 text-sm leading-relaxed text-stone-500">{description}</p>}

                <div className="mt-6 flex gap-2.5">
                  <motion.a
                    whileTap={{ scale: 0.94 }}
                    transition={TAP_SPRING}
                    href={mapsHref(place)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-sm"
                    style={{ background: `linear-gradient(to right, ${TURQUOISE}, ${TURQUOISE_DARK})` }}
                  >
                    <Navigation className="h-4 w-4" />
                    Open in Google Maps
                  </motion.a>
                  {place.phone && (
                    <motion.a
                      whileTap={{ scale: 0.94 }}
                      transition={TAP_SPRING}
                      href={telHref(place.phone)}
                      className="flex items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-5 py-3.5 text-sm font-bold uppercase tracking-wide text-stone-900 shadow-sm"
                    >
                      <Phone className="h-4 w-4" />
                      Call
                    </motion.a>
                  )}
                </div>
              </div>
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function WifiQRMock({ seed }: { seed: string }) {
  const size = 11;
  const modules = useMemo(() => {
    const h = hashString(seed || 'guest-wifi');
    const grid: boolean[][] = [];
    for (let r = 0; r < size; r += 1) {
      const row: boolean[] = [];
      for (let c = 0; c < size; c += 1) {
        const isFinder = (r < 3 && c < 3) || (r < 3 && c >= size - 3) || (r >= size - 3 && c < 3);
        row.push(isFinder ? true : ((h >> ((r * size + c) % 30)) & 1) === 1);
      }
      grid.push(row);
    }
    return grid;
  }, [seed]);

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-3">
      <div className="grid grid-cols-11 gap-[1.5px]">
        {modules.map((row, r) =>
          row.map((on, c) => (
            <div key={`${r}-${c}`} className={`aspect-square rounded-[1px] ${on ? 'bg-stone-900' : 'bg-transparent'}`} />
          )),
        )}
      </div>
    </div>
  );
}

function WifiDrawer({
  property,
  open,
  onOpenChange,
  onToast,
}: {
  property: Property;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToast: (text: string) => void;
}) {
  const t = useT();
  const [qrOpen, setQrOpen] = useState(false);

  const copy = async (value: string, toastText: string) => {
    try {
      await navigator.clipboard.writeText(value);
      onToast(toastText);
    } catch {
      // clipboard unavailable
    }
  };

  return (
    <>
      <Drawer.Root open={open} onOpenChange={onOpenChange}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-sm" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88vh] w-full max-w-md flex-col rounded-t-[32px] bg-[#F7F4EC]">
            <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-stone-300" />

            <div className="flex items-center gap-3 border-b border-stone-200/60 px-5 pb-4 pt-5">
              <WifiPulse>
                <IconSquircle icon={Wifi} tone={MANUAL_TONES.wifi} />
              </WifiPulse>
              <div className="min-w-0 flex-1">
                <Drawer.Title className="text-base font-semibold text-stone-900">{t('manual.wifi', 'Wi-Fi Credentials')}</Drawer.Title>
                <p className="truncate text-xs text-stone-500">{property.name}</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.94 }}
                transition={TAP_SPRING}
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white"
              >
                <X className="h-4 w-4 text-stone-900" />
              </motion.button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-10 pt-4">
              <div className="flex flex-col gap-3">
                <div className="rounded-[24px] border border-stone-200/60 bg-white p-5 shadow-sm shadow-stone-900/5">
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-stone-500">{t('wifi.network', 'Network')}</p>
                  <div className="mt-1.5 flex items-center justify-between gap-3">
                    <p className="truncate text-2xl font-bold tracking-tight text-stone-900">{property.wifi_ssid ?? '—'}</p>
                    {property.wifi_ssid && (
                      <motion.button
                        whileTap={{ scale: 0.94 }}
                        transition={TAP_SPRING}
                        type="button"
                        onClick={() => copy(property.wifi_ssid as string, t('wifi.network_copied', 'Network name copied to clipboard'))}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-stone-500"
                      >
                        <Copy className="h-4 w-4" />
                      </motion.button>
                    )}
                  </div>
                </div>

                <div className="rounded-[24px] border border-stone-200/60 bg-white p-5 shadow-sm shadow-stone-900/5">
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-stone-500">{t('wifi.password', 'Password')}</p>
                  <div className="mt-1.5 flex items-center justify-between gap-3">
                    <p className="truncate text-2xl font-bold tracking-wide text-stone-900">{property.wifi_password ?? '—'}</p>
                    {property.wifi_password && (
                      <motion.button
                        whileTap={{ scale: 0.94 }}
                        transition={TAP_SPRING}
                        type="button"
                        onClick={() => copy(property.wifi_password as string, t('wifi.password_copied', 'Password copied to clipboard'))}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-stone-500"
                      >
                        <Copy className="h-4 w-4" />
                      </motion.button>
                    )}
                  </div>
                </div>

                {property.wifi_ssid && (
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    transition={TAP_SPRING}
                    type="button"
                    onClick={() => setQrOpen(true)}
                    className="flex items-center gap-3 rounded-[24px] border border-stone-200/60 bg-white px-5 py-4 text-left shadow-sm shadow-stone-900/5"
                  >
                    <IconSquircle icon={QrCode} tone={QR_TONE} />
                    <span className="flex-1 text-sm font-semibold text-stone-900">{t('wifi.show_qr', 'Show Wi-Fi QR Code')}</span>
                    <ChevronRight className="h-4 w-4 text-stone-400" />
                  </motion.button>
                )}
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      <Drawer.Root open={qrOpen} onOpenChange={setQrOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-[70] bg-stone-900/50 backdrop-blur-sm" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-[80] mx-auto flex w-full max-w-md flex-col rounded-t-[32px] bg-[#F7F4EC]">
            <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-stone-300" />
            <div className="flex flex-col items-center gap-4 px-6 pb-10 pt-6">
              <Drawer.Title className="text-base font-semibold text-stone-900">{t('wifi.scan_title', 'Scan to Join Wi-Fi')}</Drawer.Title>
              <WifiQRMock seed={`${property.wifi_ssid}:${property.wifi_password ?? ''}`} />
              <p className="text-center text-xs leading-relaxed text-stone-500">
                Preview only — connect a real generator against a
                <code> WIFI:S:{'{ssid}'};T:WPA;P:{'{password}'};; </code>
                string for a scannable code.
              </p>
              <Drawer.Close asChild>
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  transition={TAP_SPRING}
                  type="button"
                  className="w-full rounded-2xl border border-stone-200 bg-white py-3.5 text-sm font-semibold text-stone-900"
                >
                  {t('common.close', 'Close')}
                </motion.button>
              </Drawer.Close>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}

function CheckInOutDrawer({
  property,
  mode,
  onOpenChange,
}: {
  property: Property;
  mode: 'checkin' | 'checkout' | false;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();
  const [view, setView] = useState<'checkin' | 'checkout'>(mode === 'checkout' ? 'checkout' : 'checkin');

  const steps =
    view === 'checkin'
      ? property.checkin_steps && property.checkin_steps.length > 0
        ? property.checkin_steps
        : DEFAULT_CHECKIN_STEPS
      : property.checkout_steps && property.checkout_steps.length > 0
        ? property.checkout_steps
        : DEFAULT_CHECKOUT_STEPS;

  const time = view === 'checkin' ? property.check_in_time ?? '15:00' : property.check_out_time ?? property.checkout_time ?? '11:00';

  return (
    <Drawer.Root open={mode !== false} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-sm" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[85vh] w-full max-w-md flex-col rounded-t-[32px] bg-[#F7F4EC]">
          <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-stone-300" />

          <div className="border-b border-stone-200/60 px-5 pb-4 pt-5">
            <div className="flex items-center justify-between gap-3">
              <Drawer.Title className="text-base font-semibold text-stone-900">{t('checkinout.title', 'Arrival & Departure')}</Drawer.Title>
              <motion.button
                whileTap={{ scale: 0.94 }}
                transition={TAP_SPRING}
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white"
              >
                <X className="h-4 w-4 text-stone-900" />
              </motion.button>
            </div>

            <div className="mt-4 flex gap-2 rounded-2xl bg-stone-100 p-1">
              <motion.button
                whileTap={{ scale: 0.96 }}
                transition={TAP_SPRING}
                type="button"
                onClick={() => setView('checkin')}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-colors"
                style={view === 'checkin' ? { background: TURQUOISE, color: 'white' } : { color: '#78716C' }}
              >
                <KeyRound className="h-3.5 w-3.5" />
                {t('home.checkin', 'Check-in')}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                transition={TAP_SPRING}
                type="button"
                onClick={() => setView('checkout')}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-colors"
                style={view === 'checkout' ? { background: '#E0523A', color: 'white' } : { color: '#78716C' }}
              >
                <DoorOpen className="h-3.5 w-3.5" />
                {t('home.checkout', 'Check-out')}
              </motion.button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-10 pt-4">
            <div className="mb-5 flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-semibold">
                {view === 'checkin' ? t('checkinout.checkin_from', 'Check-in from') : t('checkinout.checkout_by', 'Check-out by')} {time}
              </span>
            </div>

            <ol className="flex flex-col gap-4">
              {steps.map((step, index) => (
                <li key={index} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-100 text-[11px] font-semibold text-stone-600">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-stone-600">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function GetHelpDrawer({
  property,
  open,
  onOpenChange,
  onOpenAIChat,
  onToast,
}: {
  property: Property;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenAIChat?: () => void;
  onToast: (text: string) => void;
}) {
  const t = useT();
  const [contactExpanded, setContactExpanded] = useState(false);
  const hostPhone = property.host_phone ?? property.reception_phone;
  const waLinkHref = waHref(property.whatsapp_number);
  const mailLinkHref = mailHref(property.host_email);
  const emergencyPhone = (property.emergency_contacts && property.emergency_contacts[0]?.phone) ?? DEFAULT_EMERGENCY_CONTACTS[0].phone;

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-sm" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[85vh] w-full max-w-md flex-col rounded-t-[32px] bg-[#F7F4EC]">
          <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-stone-300" />

          <div className="flex items-center justify-between gap-3 border-b border-stone-200/60 px-5 pb-4 pt-5">
            <Drawer.Title className="text-base font-semibold text-stone-900">{t('help.title', 'Get Help')}</Drawer.Title>
            <motion.button
              whileTap={{ scale: 0.94 }}
              transition={TAP_SPRING}
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white"
            >
              <X className="h-4 w-4 text-stone-900" />
            </motion.button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-4 pt-4">
            <div className="flex flex-col gap-2.5">
              <motion.button
                whileTap={{ scale: 0.96 }}
                transition={TAP_SPRING}
                type="button"
                onClick={() => (onOpenAIChat ? onOpenAIChat() : onToast(t('help.ai_coming_soon', 'AI Concierge is coming soon')))}
                className="flex items-center gap-3 rounded-2xl border border-stone-200/60 bg-white px-4 py-3.5 text-left shadow-sm shadow-stone-900/5"
              >
                <IconSquircle icon={MessageCircle} tone={AI_CHAT_TONE} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-stone-900">{t('help.ai_concierge', 'AI Concierge Chat')}</p>
                  <p className="text-xs text-stone-500">{t('help.instant_answers', 'Instant answers')}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-stone-400" />
              </motion.button>

              <div className="overflow-hidden rounded-2xl border border-stone-200/60 bg-white shadow-sm shadow-stone-900/5">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  transition={TAP_SPRING}
                  type="button"
                  onClick={() => setContactExpanded((v) => !v)}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
                >
                  <IconSquircle icon={PhoneCall} tone={CONTACT_TONE} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-stone-900">{t('help.contact_directly', 'Contact Us Directly')}</p>
                    <p className="text-xs text-stone-500">
                      {t('help.contact_subtitle', 'Emergency · Call Host · WhatsApp · Email')}
                    </p>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-stone-400 transition-transform ${contactExpanded ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence initial={false}>
                  {contactExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden border-t border-stone-100"
                    >
                      <div className="flex flex-col divide-y divide-stone-100">
                        <a href={telHref(emergencyPhone)} className="flex items-center justify-between px-4 py-3 text-sm">
                          <span className="font-medium text-stone-700">
                            {t('help.emergency', 'Emergency')} ({emergencyPhone})
                          </span>
                          <Phone className="h-3.5 w-3.5 text-red-500" />
                        </a>
                        {hostPhone && (
                          <a href={telHref(hostPhone)} className="flex items-center justify-between px-4 py-3 text-sm">
                            <span className="font-medium text-stone-700">{t('support.call_host', 'Call Host')}</span>
                            <Phone className="h-3.5 w-3.5" style={{ color: TURQUOISE }} />
                          </a>
                        )}
                        {waLinkHref && (
                          <a href={waLinkHref} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-4 py-3 text-sm">
                            <span className="font-medium text-stone-700">{t('help.whatsapp_host', 'WhatsApp Host')}</span>
                            <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                          </a>
                        )}
                        {mailLinkHref && (
                          <a href={mailLinkHref} className="flex items-center justify-between px-4 py-3 text-sm">
                            <span className="font-medium text-stone-700">{t('help.email_host', 'Email Host')}</span>
                            <Mail className="h-3.5 w-3.5" style={{ color: TURQUOISE_DARK }} />
                          </a>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="px-5 pb-8 pt-2">
            <Drawer.Close asChild>
              <motion.button
                whileTap={{ scale: 0.96 }}
                transition={TAP_SPRING}
                type="button"
                className="w-full rounded-2xl border border-stone-200 bg-white py-3.5 text-sm font-semibold text-stone-900"
              >
                {t('common.close', 'Close')}
              </motion.button>
            </Drawer.Close>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function FloatingHelpButton({ onPress }: { onPress: () => void }) {
  return (
    <div className="fixed bottom-24 right-5 z-40">
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{ background: TURQUOISE }}
        animate={{ opacity: [0.35, 0, 0.35], scale: [1, 1.4, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.button
        type="button"
        onClick={onPress}
        whileTap={{ scale: 0.94 }}
        transition={TAP_SPRING}
        className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-t border-white/30 text-white shadow-lg"
        style={{ background: `linear-gradient(135deg, ${TURQUOISE}, ${TURQUOISE_DARK})`, boxShadow: `0 10px 24px -6px ${TURQUOISE}88` }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent" />
        <Headset className="relative h-6 w-6" strokeWidth={2.2} />
      </motion.button>
    </div>
  );
}

const DEFAULT_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'el', label: 'Ελληνικά' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
];

function LanguageSwitcher({ variant = 'onImage' }: { variant?: 'onImage' | 'onLight' }) {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const current = DEFAULT_LANGUAGES.find((l) => l.code === language) ?? DEFAULT_LANGUAGES[0];

  const triggerClasses =
    variant === 'onImage'
      ? 'border border-white/30 bg-black/30 text-white backdrop-blur-md'
      : 'border border-stone-200 bg-white text-stone-900 shadow-sm';

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${triggerClasses}`}>
        <Globe className="h-3.5 w-3.5" />
        <span className="text-xs font-semibold uppercase">{current?.code ?? 'en'}</span>
        <ChevronDown className={`h-3 w-3 opacity-70 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.16 }}
              className="absolute right-0 z-50 mt-2 w-36 overflow-hidden rounded-2xl border border-stone-200 bg-white p-1.5 shadow-xl shadow-stone-900/10"
            >
              {DEFAULT_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setLanguage?.(lang.code as any);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors hover:bg-stone-50"
                  style={lang.code === current?.code ? { background: '#EAF7F5', color: TURQUOISE_DARK } : { color: '#57534E' }}
                >
                  {lang.label}
                  {lang.code === current?.code && <Check className="h-3.5 w-3.5" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function KeySafeCard({ code, onToast }: { code?: string | null; onToast: (text: string) => void }) {
  const t = useT();
  const [revealed, setRevealed] = useState(false);
  if (!code) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      onToast(t('home.code_copied', 'Code copied to clipboard'));
    } catch {
      // clipboard unavailable
    }
  };

  return (
    <div className="rounded-2xl border border-stone-200/60 bg-white p-4 shadow-sm shadow-stone-900/5">
      <div className="flex items-center gap-3">
        <IconSquircle icon={KeyRound} tone={KEYSAFE_TONE} />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-stone-500">{t('home.smartlock_title', '🔑 Smart Lock / Key Safe Code')}</p>
          <p className="mt-0.5 select-none text-xl font-bold tracking-[0.2em] text-stone-900">{revealed ? code : '• • • •'}</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          transition={TAP_SPRING}
          type="button"
          onClick={() => setRevealed((v) => !v)}
          aria-label={revealed ? 'Hide code' : 'Reveal code'}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-stone-500"
        >
          {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          transition={TAP_SPRING}
          type="button"
          onClick={copy}
          aria-label="Copy code"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-stone-500"
        >
          <Copy className="h-4 w-4" />
        </motion.button>
      </div>
    </div>
  );
}

function ArrivalInfoCard({
  icon,
  tone,
  emoji,
  title,
  body,
  action,
}: {
  icon: typeof Wifi;
  tone: SquircleTone;
  emoji: string;
  title: string;
  body: string;
  action?: { label: string; href: string; icon: typeof Navigation };
}) {
  return (
    <div className="rounded-2xl border border-stone-200/60 bg-white p-4 shadow-sm shadow-stone-900/5">
      <div className="flex items-start gap-3">
        <IconSquircle icon={icon} tone={tone} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-stone-900">
            {emoji} {title}
          </p>
          {body && <p className="mt-1 text-sm leading-relaxed text-stone-600">{body}</p>}
          {action && (
            <motion.a
              whileTap={{ scale: 0.96 }}
              transition={TAP_SPRING}
              href={action.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3.5 py-2 text-xs font-semibold text-stone-700"
            >
              <action.icon className="h-3.5 w-3.5" />
              {action.label}
            </motion.a>
          )}
        </div>
      </div>
    </div>
  );
}

function HeroHeader({
  property,
  language,
  onOpenCheckin,
  onToast,
}: {
  property: Property;
  language: string;
  onOpenCheckin: (mode: 'checkin' | 'checkout') => void;
  onToast: (text: string) => void;
}) {
  const t = useT();
  const directionsHref = mapsHref(property);
  const paperPlaneHref = mailHref(property.host_email);
  const coverImage = property.cover_image ?? property.hero_image_url;

  const copyAddress = async () => {
    if (!property.address) return;
    try {
      await navigator.clipboard.writeText(property.address);
      onToast(t('home.address_copied', 'Address copied to clipboard'));
    } catch {
      // clipboard unavailable
    }
  };

  const buildingBody =
    localize(property.building_access, language) ||
    t('home.building_access_desc', 'Enter through the main door and head up to the apartment. The elevator is just past the entrance on your right.');

  const parkingBody =
    localize(property.parking_info, language) ||
    t('home.parking_desc', 'Free street parking is available outside, or at the municipal lot 150m away.');

  const lateArrivalBody =
    localize(property.late_arrival_info, language) ||
    t('home.late_arrival_desc', 'Arriving late? No problem — self check-in is available 24/7 via the smart lock keybox.');

  return (
    <div>
      <div className="relative h-80 w-full bg-stone-800">
        {coverImage ? (
          <Image src={coverImage} alt={property.name} fill priority sizes="480px" className="object-cover" />
        ) : (
          <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-stone-700 via-stone-800 to-stone-900">
            <ApartmentHeroScene className="h-full w-full" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />

        <div className="absolute inset-x-4 top-5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 rounded-full border border-white/30 bg-black/30 py-1.5 pl-1.5 pr-1.5 backdrop-blur-md">
            <div className="relative h-7 w-7 overflow-hidden rounded-full bg-white/20">
              {property.host_avatar_url || property.logo_url ? (
                <Image
                  src={(property.host_avatar_url ?? property.logo_url) as string}
                  alt={property.host_name ?? 'Host'}
                  fill
                  sizes="28px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[11px] font-semibold text-white">
                  {(property.host_name ?? property.name)?.charAt(0) ?? '•'}
                </div>
              )}
            </div>
            <span className="pr-1 text-xs font-medium text-white/90">
              {t('home.hosted_by', 'Hosted by')} {property.host_name ?? 'your host'}
            </span>
            {paperPlaneHref && (
              <motion.a
                whileTap={{ scale: 0.9 }}
                transition={TAP_SPRING}
                href={paperPlaneHref}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
                aria-label="Email your host"
              >
                <Send className="h-3.5 w-3.5" strokeWidth={2.2} />
              </motion.a>
            )}
          </div>

          <LanguageSwitcher variant="onImage" />
        </div>

        <div className="absolute inset-x-5 bottom-6">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-white">{property.name}</h1>
          {property.address && (
            <div className="mt-2 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-white/80" />
              <span className="text-xs font-medium text-white/80">{property.address}</span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                transition={TAP_SPRING}
                type="button"
                onClick={copyAddress}
                aria-label="Copy address"
                className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-white/90"
              >
                <Copy className="h-3 w-3" />
              </motion.button>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 pt-5">
        {property.address && (
          <motion.a
            whileTap={{ scale: 0.94 }}
            transition={TAP_SPRING}
            href={directionsHref}
            target="_blank"
            rel="noopener noreferrer"
            className={`relative mb-4 flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r py-4 text-sm font-bold uppercase tracking-[0.08em] text-white shadow-lg border-t border-white/30 ${DIRECTIONS_GRADIENT} ${DIRECTIONS_SHADOW}`}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent" />
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)' }}
              initial={{ x: '-120%' }}
              animate={{ x: '340%' }}
              transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.6, ease: 'easeInOut' }}
            />
            <Navigation className="relative h-4 w-4" strokeWidth={2.2} />
            <span className="relative">{t('home.get_directions', 'Get Directions')}</span>
          </motion.a>
        )}

        <WeatherWidget />

        <div className="grid grid-cols-2 gap-3">
          <motion.button
            type="button"
            onClick={() => onOpenCheckin('checkin')}
            whileTap={{ scale: 0.94 }}
            transition={TAP_SPRING}
            className="rounded-2xl border border-stone-200/60 bg-white p-4 text-left shadow-sm shadow-stone-900/5 transition-shadow hover:shadow-md"
          >
            <CheckInScene className="h-16 w-full" />
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-500">{t('home.checkin', 'Check-in')}</p>
            <span
              className="mt-1.5 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold"
              style={{ background: 'rgba(52,199,89,0.14)', color: '#1F8A3D', boxShadow: '0 0 14px rgba(52,199,89,0.35)' }}
            >
              {t('home.after', 'After')} {property.check_in_time ?? '15:00'}
            </span>
          </motion.button>
          <motion.button
            type="button"
            onClick={() => onOpenCheckin('checkout')}
            whileTap={{ scale: 0.94 }}
            transition={TAP_SPRING}
            className="rounded-2xl border border-stone-200/60 bg-white p-4 text-left shadow-sm shadow-stone-900/5 transition-shadow hover:shadow-md"
          >
            <CheckOutScene className="h-16 w-full" />
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-500">{t('home.checkout', 'Check-out')}</p>
            <span
              className="mt-1.5 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold"
              style={{ background: 'rgba(245,158,11,0.16)', color: '#B45309', boxShadow: '0 0 14px rgba(245,158,11,0.4)' }}
            >
              {t('home.before', 'Before')} {property.check_out_time ?? property.checkout_time ?? '11:00'}
            </span>
          </motion.button>
        </div>

        <DepartureChecklistCard />

        <div className="mt-3 flex flex-col gap-3">
          <KeySafeCard code={property.keysafe_code} onToast={onToast} />

          <ArrivalInfoCard
            icon={Building2}
            tone={BUILDING_TONE}
            emoji="🏢"
            title={t('home.building_access', 'Building & Elevator Access')}
            body={buildingBody}
          />

          <ArrivalInfoCard
            icon={ParkingCircle}
            tone={PARKING_TONE}
            emoji="🅿️"
            title={t('home.parking', 'Parking')}
            body={parkingBody}
            action={{ label: t('home.open_in_maps', 'Open in Google Maps'), href: parkingMapsHref(property), icon: MapPin }}
          />

          <ArrivalInfoCard
            icon={Moon}
            tone={LATE_ARRIVAL_TONE}
            emoji="🌙"
            title={t('home.late_arrival', 'Late Arrival / Night Check-in')}
            body={lateArrivalBody}
          />
        </div>

        <AddToHomeScreenBanner />
      </div>
    </div>
  );
}

function DepartureChecklistCard() {
  const t = useT();
  const [checked, setChecked] = useState<boolean[]>(() => DEFAULT_DEPARTURE_CHECKLIST.map(() => false));
  const doneCount = checked.filter(Boolean).length;
  const total = DEFAULT_DEPARTURE_CHECKLIST.length;
  const allDone = doneCount === total;

  const toggle = (index: number) => {
    setChecked((prev) => prev.map((v, i) => (i === index ? !v : v)));
  };

  return (
    <div className="mt-3 rounded-2xl border border-stone-200/60 bg-white p-4 shadow-sm shadow-stone-900/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <IconSquircle icon={ListChecks} tone={LATE_ARRIVAL_TONE} size={36} />
          <div>
            <p className="text-sm font-bold text-stone-900">{t('home.departure_checklist', 'Departure Checklist')}</p>
            <p className="text-xs text-stone-500">
              {allDone ? t('home.departure_all_done', 'All set — safe travels!') : `${doneCount} ${t('home.of', 'of')} ${total} ${t('home.complete', 'complete')}`}
            </p>
          </div>
        </div>
        {allDone && (
          <motion.span
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={TAP_SPRING}
            className="flex h-7 w-7 items-center justify-center rounded-full text-white"
            style={{ background: 'linear-gradient(135deg, #34C759, #248A3D)' }}
          >
            <Check className="h-4 w-4" strokeWidth={3} />
          </motion.span>
        )}
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${TURQUOISE}, #34C759)` }}
          animate={{ width: `${(doneCount / total) * 100}%` }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <div className="mt-3 flex flex-col gap-1">
        {DEFAULT_DEPARTURE_CHECKLIST.map((task, index) => {
          const isDone = checked[index];
          const label = t(task.key, task.fallback);
          return (
            <motion.button
              key={task.key}
              type="button"
              onClick={() => toggle(index)}
              whileTap={{ scale: 0.98 }}
              transition={TAP_SPRING}
              className="flex items-center gap-3 rounded-xl px-1.5 py-2 text-left transition-colors hover:bg-stone-50"
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  isDone ? 'border-transparent' : 'border-stone-300'
                }`}
                style={isDone ? { background: 'linear-gradient(135deg, #34C759, #248A3D)' } : undefined}
              >
                {isDone && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
              </span>
              <span className={`text-sm ${isDone ? 'text-stone-400 line-through' : 'font-medium text-stone-700'}`}>{label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function AddToHomeScreenBanner() {
  const t = useT();
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-stone-200/60 bg-white shadow-sm shadow-stone-900/5">
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.99 }}
        transition={TAP_SPRING}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <IconSquircle icon={Smartphone} tone={AI_CHAT_TONE} size={36} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-stone-900">{t('home.pwa_title', '📲 Save to Home Screen')}</p>
          <p className="text-xs text-stone-500">{t('home.pwa_subtitle', 'Get one-tap access to this guide, anytime')}</p>
        </div>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={TAP_SPRING} className="text-stone-400">
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </motion.button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-3 px-4 pb-4">
              <div className="flex items-start gap-3 rounded-xl bg-stone-50 p-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-900 text-[11px] font-bold text-white">1</span>
                <p className="flex items-center gap-1 text-xs leading-relaxed text-stone-600">
                  <Share2 className="inline h-3.5 w-3.5 shrink-0" />
                  <span>
                    {t('home.pwa_ios', 'On iPhone (Safari): Tap the Share icon at the bottom, then choose “Add to Home Screen”.')}
                  </span>
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-stone-50 p-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-900 text-[11px] font-bold text-white">2</span>
                <p className="text-xs leading-relaxed text-stone-600">
                  {t('home.pwa_android', 'On Android (Chrome): Tap the menu icon (⋮) at top, then choose “Add to Home screen”.')}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ManualAccordionRow({
  item,
  property,
  expanded,
  onToggle,
  onOpenWifi,
}: {
  item: ManualItem;
  property: Property;
  expanded: boolean;
  onToggle: () => void;
  onOpenWifi?: () => void;
}) {
  const t = useT();
  const Icon = MANUAL_ICONS[item.icon];
  const tone = MANUAL_TONES[item.icon];
  const bodyLines = Array.isArray(item.body) ? item.body : [item.body];

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200/60 bg-white shadow-sm shadow-stone-900/5">
      <motion.button whileTap={{ scale: 0.97 }} transition={TAP_SPRING} type="button" onClick={onToggle} className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
        {item.icon === 'wifi' ? (
          <WifiPulse>
            <IconSquircle icon={Icon} tone={tone} />
          </WifiPulse>
        ) : (
          <IconSquircle icon={Icon} tone={tone} />
        )}
        <span className="flex-1 text-sm font-semibold text-stone-900">{item.title}</span>
        <ChevronDown className={`h-4 w-4 text-stone-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-stone-100 px-4 py-4">
              {item.key === 'wifi' ? (
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm leading-relaxed text-stone-600">{bodyLines.join(' ')}</p>
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    transition={TAP_SPRING}
                    type="button"
                    onClick={onOpenWifi}
                    className="shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold text-white shadow-sm"
                    style={{ background: TURQUOISE }}
                  >
                    {t('manual.view', 'View')}
                  </motion.button>
                </div>
              ) : bodyLines.length > 1 ? (
                <ol className="flex flex-col gap-2.5">
                  {bodyLines.map((line, i) => (
                    <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-stone-600">
                      <span style={{ color: TURQUOISE }}>·</span>
                      {line}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm leading-relaxed text-stone-600">{bodyLines[0]}</p>
              )}

              {/* Εικόνες Συσκευών με universal zoom badge */}
              {item.images && item.images.length > 0 && (
                <div className="mt-3.5 grid grid-cols-2 gap-2.5">
                  {item.images.map((src, i) => (
                    <a
                      key={`${item.key}-img-${i}`}
                      href={src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative block aspect-[4/3] w-full overflow-hidden rounded-xl border border-stone-200 bg-stone-100 shadow-sm"
                    >
                      <img
                        src={src}
                        alt={`${item.title} ${i + 1}`}
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                      <span className="absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                        <span>🔍</span>
                        <span>Zoom</span>
                      </span>
                    </a>
                  ))}
                </div>
              )}

              {item.key === 'trash' && (
                <motion.a
                  whileTap={{ scale: 0.97 }}
                  transition={TAP_SPRING}
                  href={trashMapsHref(property)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3.5 flex items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-500/20"
                >
                  <MapPin className="h-4 w-4" />
                  <span>{t('manual.trash_maps_button', '📍 Open Bin Location in Google Maps')}</span>
                </motion.a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ManualFieldDef {
  key: string;
  icon: ManualIconKey;
  title: string;
  body: string;
  images?: string[];
}

function ManualTab({
  property,
  language,
  expandedKey,
  onExpandedKeyChange,
  onOpenWifi,
}: {
  property: Property;
  language: string;
  expandedKey: string | null;
  onExpandedKeyChange: (key: string | null) => void;
  onOpenWifi: () => void;
}) {
  const t = useT();

  const manualItems: ManualItem[] = useMemo(() => {
    const defs: ManualFieldDef[] = [
      {
        key: 'wifi',
        icon: 'wifi',
        title: t('manual.wifi', 'Wi-Fi Credentials'),
        body: property.wifi_ssid
          ? `Network “${property.wifi_ssid}” — tap View for the password and QR code.`
          : t('manual.wifi_desc', 'Network credentials for high-speed Wi-Fi. Tap View for QR code.'),
      },
      {
        key: 'tapwater',
        icon: 'tapwater',
        title: t('manual.tapwater', 'Tap Water & Drinking Guide'),
        body:
          localize(property.tap_water_info, language) ||
          t('manual.tapwater_desc', 'Tap water is safe for washing and cooking, but bottled mineral water is recommended for drinking.'),
      },
      {
        key: 'plumbing',
        icon: 'plumbing',
        title: t('manual.plumbing', 'Plumbing & Toilet Paper Rules'),
        body:
          localize(property.plumbing_rules, language) ||
          t(
            'manual.plumbing_desc',
            'Please do NOT flush toilet paper or hygiene products down the toilet. Use the small bin provided beside the toilet.',
          ),
      },
      {
        key: 'sockets',
        icon: 'sockets',
        title: t('manual.sockets', 'Electrical Sockets & Voltage'),
        body:
          localize(property.sockets_appliances_info, language) ||
          t(
            'manual.sockets_desc',
            'Standard European Type C/F sockets (230V). An iron, ironing board and hairdryer are located in the main bedroom wardrobe.',
          ),
      },
      {
        key: 'tv',
        icon: 'tv',
        title: t('manual.tv', 'TV & Streaming Apps'),
        body:
          localize(property.tv_streaming_info, language) ||
          t('manual.tv_desc', 'Smart TV with Netflix, YouTube. Turn on with the black remote, press Home for streaming apps.'),
        images: property.tv_images || [],
      },
      {
        key: 'coffee',
        icon: 'coffee',
        title: t('manual.coffee', 'Coffee Machine & Supplies'),
        body:
          localize(property.coffee_supplies_info, language) ||
          t('manual.coffee_desc', 'Nespresso machine on the kitchen counter. Complimentary coffee pods, sugar and tea are inside the cabinet above.'),
      },
      {
        key: 'kitchen',
        icon: 'kitchen',
        title: t('manual.kitchen', 'Stove, Oven & Microwave'),
        body:
          localize(property.kitchen_appliances_info, language) ||
          t(
            'manual.kitchen_desc',
            'Stove touch controls require pressing the lock button for 2 seconds. Oven preheats in 10 mins. Microwave settings on front panel.',
          ),
      },
      {
        key: 'laundry',
        icon: 'laundry',
        title: t('manual.laundry', 'Washing Machine & Laundry'),
        body:
          localize(property.laundry_info, language) ||
          t(
            'manual.laundry_desc',
            'Washing machine is in the bathroom/closet. Detergent pods provided under the sink. We recommend Program 3 (Quick 30min).',
          ),
        images: property.laundry_images || [],
      },
      {
        key: 'dishwasher',
        icon: 'dishwasher',
        title: t('manual.dishwasher', 'Dishwasher Guide'),
        body:
          localize(property.dishwasher_info, language) ||
          t('manual.dishwasher_desc', 'Place one detergent tab in the dispenser and select Eco 50°C mode, then close door firmly to start.'),
        images: property.dishwasher_images || [],
      },
      {
        key: 'water',
        icon: 'water',
        title: t('manual.water', 'Hot Water / Solar Boiler'),
        body:
          localize(property.hot_water_info, language) ||
          t(
            'manual.water_desc',
            'Hot water is solar-heated during the day. If it runs low, flip the booster switch beside the bathroom door and wait 15 minutes.',
          ),
        images: property.hot_water_images || [],
      },
      {
        key: 'ac',
        icon: 'ac',
        title: t('manual.ac', 'Air Conditioning & Heating'),
        body:
          localize(property.amenities_info, language) ||
          t('manual.ac_desc', 'The remote is in the living room drawer. Press MODE to switch between Cool and Heat; we recommend 24°C overnight.'),
        images: property.ac_images || [],
      },
      {
        key: 'linens',
        icon: 'linens',
        title: t('manual.linens', 'Extra Linens, Towels & Pillows'),
        body:
          localize(property.linens_towels_info, language) ||
          t('manual.linens_desc', 'Extra fresh towels, pillows and bed linens are neatly stored on the top shelf of the bedroom wardrobe.'),
      },
      {
        key: 'trash',
        icon: 'trash',
        title: t('manual.trash', 'Trash & Recycling Bins'),
        body:
          localize(property.trash_info, language) ||
          t(
            'manual.trash_desc',
            'General waste bins are on the street corner outside. The blue recycling bin is beside them. Collection runs Tuesday & Friday mornings.',
          ),
      },
      {
        key: 'rules',
        icon: 'rules',
        title: t('manual.rules', 'House Rules & Quiet Hours'),
        body:
          localize(property.house_rules, language) ||
          t(
            'manual.rules_desc',
            'No smoking indoors. Quiet hours are 15:00–17:30 and 23:00–07:00. Please take out the trash before checkout.',
          ),
      },
    ];

    const base: ManualItem[] = defs.map((d) => ({
      key: d.key,
      title: d.title,
      icon: d.icon,
      body: d.body,
      images: d.images,
    }));

    const extra = property.manual_items && property.manual_items.length > 0 ? property.manual_items : [];
    return [...base, ...extra];
  }, [property, language, t]);

  return (
    <motion.div variants={listStagger} initial="hidden" animate="show" className="flex flex-col gap-2.5 px-5 pb-4 pt-6">
      {manualItems.map((item) => (
        <motion.div key={item.key} variants={listItem}>
          <ManualAccordionRow
            item={item}
            property={property}
            expanded={expandedKey === item.key}
            onToggle={() => onExpandedKeyChange(expandedKey === item.key ? null : item.key)}
            onOpenWifi={onOpenWifi}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Explore tab — two-step drill-down                                 */
/* ------------------------------------------------------------------ */

type ExploreSelection = { kind: 'places'; key: PlaceCategory } | { kind: 'info'; key: InfoCategoryKey };

function InfoCategoryDetail({ tile, property, language }: { tile: InfoCategoryConfig; property: Property; language: string }) {
  const t = useT();
  const body = localize(tile.field(property), language) || t(`explore.info_${tile.key}_desc`, tile.fallback);
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl border border-stone-200/60 bg-white p-4 shadow-sm shadow-stone-900/5">
        <p className="whitespace-pre-line text-sm leading-relaxed text-stone-700">{body}</p>
      </div>
      <div className="flex flex-col gap-2.5">
        <motion.a
          whileTap={{ scale: 0.97 }}
          transition={TAP_SPRING}
          href={nearbyMapsHref(tile.mapsQuery, property)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white py-3 text-sm font-semibold text-stone-900 shadow-sm transition-shadow hover:shadow-md"
        >
          <MapPin className="h-4 w-4" />
          {t('explore.find_nearby', 'Find Nearby on Google Maps')}
        </motion.a>
        {tile.key === 'taxi' && property.taxi_phone && (
          <motion.a
            whileTap={{ scale: 0.97 }}
            transition={TAP_SPRING}
            href={telHref(property.taxi_phone)}
            className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-md"
            style={{ background: TURQUOISE }}
          >
            <PhoneCall className="h-4 w-4" />
            {t('explore.call_radiotaxi', 'Call Radiotaxi')}
          </motion.a>
        )}
      </div>
    </div>
  );
}

function ExploreTab({
  places,
  property,
  language,
  initialCategory,
  onDeepLinkConsumed,
  onSelectPlace,
  onToast,
}: {
  places: Place[];
  property: Property;
  language: string;
  initialCategory: PlaceCategory | null;
  onDeepLinkConsumed: () => void;
  onSelectPlace: (place: Place) => void;
  onToast: (text: string) => void;
}) {
  const t = useT();
  const [selected, setSelected] = useState<ExploreSelection | null>(initialCategory ? { kind: 'places', key: initialCategory } : null);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (initialCategory) onDeepLinkConsumed();
  }, []);

  const shelteredBeach = useMemo(() => places.find((p) => p.category === 'beaches' && p.wind_status === 'sheltered'), [places]);

  const filtered = useMemo(
    () => (selected?.kind === 'places' ? places.filter((p) => p.category === selected.key) : []),
    [places, selected],
  );

  const activeTile = useMemo<ExploreTile | null>(() => {
    if (!selected) return null;
    return EXPLORE_TILES.find((t) => t.kind === selected.kind && t.key === selected.key) ?? null;
  }, [selected]);

  // Εμφάνιση των καρτών Rentals & Transfers είτε από το κατάλυμα είτε με fallback στο demo
  const isRentalsCategory = selected?.kind === 'places' && selected.key === 'rentals';
  const hasCarRentalContent = true;
  const hasTransfersContent = true;
  const rentalsHasPropertyContent = isRentalsCategory;

  const carRentalsBody = isRentalsCategory
    ? localize(property.car_rentals_info, language) ||
      t(
        'explore.car_rentals_desc',
        'Special Offer: Please include the coupon code - saitgr - in the comments of your request. This identifies you as our guest, ensuring you the best possible offer and personalized service.'
      )
    : '';

  const carRentalBookingUrl = property.car_rentals_booking_url || property.rentals_booking_url || 'https://sevenrental.gr';

  const transfersBody = isRentalsCategory
    ? localize(property.transfers_info, language) ||
      t(
        'explore.transfers_desc',
        'Transfers from/to Airports (Chania or Heraklion)\n\nWe can arrange professional private transportation directly to our accommodation:\n\n• Chania Airport:\nStandard Taxi (1-4 people): €100\nMinivan (up to 8 people): €130\n\n• Heraklion Airport:\nStandard Taxi (1-4 people): €110\nMinivan (up to 8 people): €140\n\nTo book, please send your flight number, arrival time and number of passengers to our host.'
      )
    : '';

  const transferWhatsapp = property.host_whatsapp || property.whatsapp_number;
  const transferHref = transferWhatsapp
    ? waHref(transferWhatsapp, `Hi! I'd like to arrange an airport/port transfer for my stay.`)
    : telHref(property.host_phone || property.reception_phone);
  const transferIsWhatsapp = Boolean(transferWhatsapp);

  const carRentalCouponCode = useMemo(() => {
    if (!isRentalsCategory) return 'SAITGR';
    const raw = property.car_rentals_info;
    const texts: string[] = [];
    if (typeof raw === 'string') texts.push(raw);
    else if (raw && typeof raw === 'object') {
      for (const value of Object.values(raw)) {
        if (typeof value === 'string') texts.push(value);
      }
    }
    if (carRentalsBody) texts.push(carRentalsBody);

    const pattern = /(?:coupon|promo)\s*code|κωδικ[όο]ς\s*(?:έκπτωσης|κουπονιού|προσφοράς)/i;
    const tokenAfterMatch = /[-:–—\s]+([A-Za-z0-9]{3,20})/;
    for (const text of texts) {
      const labelMatch = text.match(pattern);
      if (!labelMatch) continue;
      const rest = text.slice(labelMatch.index! + labelMatch[0].length);
      const tokenMatch = rest.match(tokenAfterMatch);
      if (tokenMatch?.[1]) return tokenMatch[1].toUpperCase();
    }
    return 'SAITGR';
  }, [isRentalsCategory, property.car_rentals_info, carRentalsBody]);

  const [couponCopied, setCouponCopied] = useState(false);
  const couponCopyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (couponCopyTimeoutRef.current) clearTimeout(couponCopyTimeoutRef.current);
    };
  }, []);

  const handleCopyCouponCode = async () => {
    if (!carRentalCouponCode) return;
    try {
      await navigator.clipboard.writeText(carRentalCouponCode);
      onToast(`Ο κωδικός έκπτωσης "${carRentalCouponCode}" αντιγράφηκε! / Coupon code "${carRentalCouponCode}" copied!`);
      setCouponCopied(true);
      if (couponCopyTimeoutRef.current) clearTimeout(couponCopyTimeoutRef.current);
      couponCopyTimeoutRef.current = setTimeout(() => setCouponCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  return (
    <div className="px-5 pb-4 pt-6">
      <AnimatePresence mode="wait" custom={direction} initial={false}>
        {!selected ? (
          <motion.div key="grid" custom={-1} variants={drillVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.22 }}>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">{t('explore.heading', 'Explore the Area')}</p>
            <div className="grid grid-cols-2 gap-3">
              {EXPLORE_TILES.map((tile) => {
                const count = tile.kind === 'places' ? places.filter((p) => p.category === tile.key).length : 0;
                const showSheltered = tile.kind === 'places' && tile.key === 'beaches' && Boolean(shelteredBeach);
                const tileLabel = t(`explore.cat_${tile.key}`, tile.label);
                const tileSubtitle = t(`explore.sub_${tile.key}`, tile.subtitle);
                return (
                  <motion.button
                    key={`${tile.kind}-${tile.key}`}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    transition={TAP_SPRING}
                    onClick={() => {
                      setDirection(1);
                      setSelected({ kind: tile.kind, key: tile.key } as ExploreSelection);
                    }}
                    className="group flex flex-col gap-3 rounded-2xl border border-stone-200/70 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border-t border-white/30 bg-gradient-to-br shadow-md ${tile.gradient} ${tile.shadow}`}
                      >
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent" />
                        <tile.Scene className="relative h-8 w-8" />
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-stone-300 transition-transform group-hover:translate-x-0.5" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-stone-900">{tileLabel}</p>
                      <p className="mt-0.5 text-xs font-medium text-stone-400">{tileSubtitle}</p>
                    </div>

                    {(count > 0 || showSheltered) && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {showSheltered && <WindBadge status="sheltered" compact />}
                        {count > 0 && (
                          <span className="text-[10px] font-medium text-stone-400">
                            {count} spot{count === 1 ? '' : 's'}
                          </span>
                        )}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div key="list" custom={1} variants={drillVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.22 }}>
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              transition={TAP_SPRING}
              onClick={() => {
                setDirection(-1);
                setSelected(null);
              }}
              className="mb-4 flex items-center gap-1.5 rounded-full border border-stone-200/60 bg-white px-3.5 py-2 text-xs font-semibold text-stone-900 shadow-sm"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t('explore.back', 'Back to Categories')}
            </motion.button>

            {activeTile && (
              <div className="mb-4 flex items-center gap-2.5">
                <div
                  className={`relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-[18px] border-t border-white/30 bg-gradient-to-br shadow-lg ${activeTile.gradient} ${activeTile.shadow}`}
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent" />
                  <activeTile.Scene className="relative h-7 w-7" />
                </div>
                <h2 className="text-lg font-semibold tracking-tight text-stone-900">{t(`explore.cat_${activeTile.key}`, activeTile.label)}</h2>
              </div>
            )}

            {activeTile?.kind === 'info' ? (
              <InfoCategoryDetail tile={activeTile} property={property} language={language} />
            ) : (
              <>
                {selected.kind === 'places' && selected.key === 'beaches' && <LiveWindStrip />}

                {isRentalsCategory && hasCarRentalContent && (
                  <div className="mb-3 overflow-hidden rounded-2xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50 to-white shadow-sm shadow-stone-900/5">
                    <div className="flex items-start gap-3 p-4">
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md"
                        style={{ background: `linear-gradient(135deg, #5E5CE6, #3634A3)` }}
                      >
                        <Car className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-bold text-stone-900">{t('explore.car_rental_title', 'Car Rental')}</p>
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                            <BadgePercent className="h-3 w-3" />
                            {t('explore.special_offer', 'Special Offer')}
                          </span>
                        </div>
                        <p className="mt-1.5 whitespace-pre-line text-xs leading-relaxed text-stone-600">{carRentalsBody}</p>
                      </div>
                    </div>

                    {carRentalCouponCode && (
                      <div className="mx-4 mb-4 flex items-center gap-2 rounded-xl border border-dashed border-amber-300 bg-amber-50/80 px-3 py-2.5">
                        <BadgePercent className="h-4 w-4 shrink-0 text-amber-600" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-medium uppercase tracking-wide text-amber-700/80">
                            {t('explore.coupon_label', 'Κωδικός Έκπτωσης / Coupon Code')}
                          </p>
                          <p className="truncate text-sm font-bold tracking-wide text-amber-900">{carRentalCouponCode}</p>
                        </div>
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.92 }}
                          transition={TAP_SPRING}
                          onClick={handleCopyCouponCode}
                          aria-label={t('explore.copy_coupon', 'Copy coupon code')}
                          className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors ${
                            couponCopied ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-600 text-white hover:bg-amber-700'
                          }`}
                        >
                          {couponCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                          {couponCopied ? t('explore.copied', 'Copied') : t('explore.copy', 'Αντιγραφή')}
                        </motion.button>
                      </div>
                    )}

                    {carRentalBookingUrl && (
                      <motion.a
                        whileTap={{ scale: 0.97 }}
                        transition={TAP_SPRING}
                        href={normalizeExternalUrl(carRentalBookingUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 border-t border-indigo-100 bg-white/70 py-3 text-sm font-semibold text-indigo-700 transition-colors hover:bg-white"
                      >
                        <Car className="h-4 w-4" />
                        {t('explore.book_car_rental', 'Κράτηση Αυτοκινήτου / Book Car Rental')}
                      </motion.a>
                    )}
                  </div>
                )}

                {isRentalsCategory && hasTransfersContent && (
                  <div className="mb-3 overflow-hidden rounded-2xl border border-sky-200/60 bg-gradient-to-br from-sky-50 to-white shadow-sm shadow-stone-900/5">
                    <div className="flex items-start gap-3 p-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 text-white shadow-md">
                        <Bus className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-stone-900">
                          {t('explore.transfers_title', 'Airport & Port Transfers')}
                        </p>
                        <p className="mt-1.5 whitespace-pre-line text-xs leading-relaxed text-stone-600">{transfersBody}</p>
                      </div>
                    </div>
                    {transferHref && (
                      <motion.a
                        whileTap={{ scale: 0.97 }}
                        transition={TAP_SPRING}
                        href={transferHref}
                        target={transferIsWhatsapp ? '_blank' : undefined}
                        rel={transferIsWhatsapp ? 'noopener noreferrer' : undefined}
                        className="flex items-center justify-center gap-2 border-t border-sky-100 bg-white/70 py-3 text-sm font-semibold text-sky-700 transition-colors hover:bg-white"
                      >
                        {transferIsWhatsapp ? <MessageCircle className="h-4 w-4" /> : <PhoneCall className="h-4 w-4" />}
                        {transferIsWhatsapp
                          ? t('explore.contact_whatsapp', 'Book via WhatsApp')
                          : t('explore.contact_call', 'Call Host to Book')}
                      </motion.a>
                    )}
                  </div>
                )}

                <motion.div variants={listStagger} initial="hidden" animate="show" className="flex flex-col gap-3">
                  {filtered.length === 0 && !rentalsHasPropertyContent && (
                    <p className="py-10 text-center text-sm text-stone-400">{t('explore.empty', 'No places added for this category yet.')}</p>
                  )}
                  {filtered.map((place) => (
                    <PlaceCard key={place.id} place={place} language={language} onOpenDetails={() => onSelectPlace(place)} />
                  ))}
                </motion.div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SupportServiceCard({
  badge,
  label,
  value,
  primary,
  secondary,
}: {
  badge: ReactNode;
  label: string;
  value: string;
  primary: { label: string; href: string; icon: typeof Phone; external?: boolean };
  secondary?: { label: string; href: string };
}) {
  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      transition={TAP_SPRING}
      className="flex flex-col gap-3 rounded-2xl border border-stone-200/60 bg-white p-4 shadow-sm shadow-stone-900/5 transition-shadow hover:shadow-md"
    >
      {badge}
      <div>
        <p className="text-xs font-medium text-stone-500">{label}</p>
        <p className="truncate text-lg font-bold text-stone-900">{value}</p>
      </div>
      <div className="mt-auto flex gap-2">
        <motion.a
          whileTap={{ scale: 0.94 }}
          transition={TAP_SPRING}
          href={primary.href}
          target={primary.external ? '_blank' : undefined}
          rel={primary.external ? 'noopener noreferrer' : undefined}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-[11px] font-bold uppercase tracking-wide text-white"
          style={{ background: TURQUOISE }}
        >
          <primary.icon className="h-3.5 w-3.5" />
          {primary.label}
        </motion.a>
        {secondary && (
          <motion.a
            whileTap={{ scale: 0.94 }}
            transition={TAP_SPRING}
            href={secondary.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-stone-200 bg-white py-2 text-[11px] font-bold uppercase tracking-wide text-stone-900"
          >
            <MapPin className="h-3.5 w-3.5" />
            {secondary.label}
          </motion.a>
        )}
      </div>
    </motion.div>
  );
}

function InfoNoteCard({
  scene,
  tone,
  emoji,
  title,
  body,
}: {
  scene: SceneComponent;
  tone: SquircleTone;
  emoji: string;
  title: string;
  body: string;
}) {
  return (
    <div className="col-span-2 flex items-start gap-3 rounded-2xl border border-stone-200/60 bg-white p-4 shadow-sm shadow-stone-900/5">
      <IllustratedSquircle scene={scene} tone={tone} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-stone-900">
          {emoji} {title}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-stone-600">{body}</p>
      </div>
    </div>
  );
}

function HostContactCard({ property }: { property: Property }) {
  const t = useT();
  const hostPhone = property.host_phone || property.reception_phone || '+306900000000';
  const hostWhatsapp = property.host_whatsapp || property.whatsapp_number || '306900000000';
  const hostEmail = property.host_email || 'info@stayguide.gr';

  const callHref = telHref(hostPhone);
  const waLink = waHref(hostWhatsapp, `Hi ${property.host_name ?? ''}! I have a question about my stay.`.trim());
  const mailLink = mailHref(hostEmail);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-stone-200/60 bg-white p-4 shadow-sm shadow-stone-900/5">
      <div className="flex items-center gap-3">
        {property.host_avatar_url ? (
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-4 ring-white shadow-lg shadow-stone-900/10">
            <Image src={property.host_avatar_url} alt={property.host_name ?? 'Host'} fill sizes="56px" className="object-cover" />
          </div>
        ) : (
          <IllustratedSquircle scene={ConciergeScene} tone={HOST_TONE} size={56} />
        )}
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-400">{t('support.your_host', 'Your Host')}</p>
          <p className="truncate text-lg font-bold text-stone-900">{property.host_name ?? t('support.host_title', 'Direct Host Support')}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <motion.a
          whileTap={{ scale: 0.95 }}
          transition={TAP_SPRING}
          href={callHref}
          className="flex flex-col items-center gap-1.5 rounded-xl border border-blue-500/20 bg-blue-500/10 py-3 text-blue-700 transition-colors hover:bg-blue-500/20"
        >
          <Phone className="h-4 w-4" strokeWidth={2.2} />
          <span className="text-[11px] font-bold">{t('support.call_host', 'Call Host')}</span>
        </motion.a>
        <motion.a
          whileTap={{ scale: 0.95 }}
          transition={TAP_SPRING}
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 py-3 text-emerald-700 transition-colors hover:bg-emerald-500/20"
        >
          <MessageCircle className="h-4 w-4" strokeWidth={2.2} />
          <span className="text-[11px] font-bold">{t('support.whatsapp_host', 'WhatsApp')}</span>
        </motion.a>
        <motion.a
          whileTap={{ scale: 0.95 }}
          transition={TAP_SPRING}
          href={mailLink}
          className="flex flex-col items-center gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 py-3 text-amber-700 transition-colors hover:bg-amber-500/20"
        >
          <Mail className="h-4 w-4" strokeWidth={2.2} />
          <span className="text-[11px] font-bold">{t('support.email_host', 'Email')}</span>
        </motion.a>
      </div>
    </div>
  );
}

function GoogleReviewCard({ property }: { property: Property }) {
  const t = useT();

  if (!property.google_review_url) return null;

  return (
    <div className="mt-6">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
        {t('support.review_title', '⭐ Αξιολογήστε τη Διαμονή σας / Rate Your Stay')}
      </p>
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-stone-200/60 bg-white p-5 text-center shadow-sm shadow-stone-900/5">
        <div className="flex items-center gap-1" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" strokeWidth={1.5} />
          ))}
        </div>
        <p className="text-sm leading-relaxed text-stone-600">
          {t(
            'support.review_message',
            'Απολαύσατε τη διαμονή σας; Η γνώμη σας μας βοηθάει πολύ! Αφήστε μας μια κριτική στο Google.',
          )}
        </p>
        <motion.a
          whileTap={{ scale: 0.97 }}
          transition={TAP_SPRING}
          href={property.google_review_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-white shadow-md shadow-amber-500/25 transition-colors hover:bg-amber-600"
        >
          <ExternalLink className="h-4 w-4" strokeWidth={2.2} />
          <span>{t('support.review_cta', 'Γράψτε Κριτική στο Google / Review on Google')}</span>
        </motion.a>
      </div>
    </div>
  );
}

function SupportTab({ property, language }: { property: Property; language: string }) {
  const t = useT();
  const contacts = property.emergency_contacts && property.emergency_contacts.length > 0 ? property.emergency_contacts : DEFAULT_EMERGENCY_CONTACTS;
  const firstAidBody =
    localize(property.first_aid_location, language) ||
    t('support.first_aid_desc', 'The first-aid kit is located in the bathroom cabinet under the sink.');

  return (
    <div className="px-5 pb-4 pt-6">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
        {t('support.emergency_title', '🚨 Emergency & Safety Contacts')}
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        <InfoNoteCard scene={FirstAidScene} tone={FIRST_AID_TONE} emoji="🩹" title={t('support.first_aid', 'First Aid Kit')} body={firstAidBody} />

        {contacts.map((contact) => {
          const iconKey = contact.icon ?? 'siren';
          const Scene = EMERGENCY_SCENES[iconKey];
          const tone = EMERGENCY_TONES[iconKey];
          return (
            <SupportServiceCard
              key={contact.label}
              badge={<IllustratedSquircle scene={Scene} tone={tone} />}
              label={contact.label}
              value={contact.phone}
              primary={{ label: t('support.call', 'Call'), href: telHref(contact.phone) ?? '#', icon: Phone }}
              secondary={
                contact.maps_query ? { label: t('support.maps', 'Maps'), href: nearbyMapsHref(contact.maps_query, property) } : undefined
              }
            />
          );
        })}

        <SupportServiceCard
          badge={<IllustratedSquircle scene={PharmacyScene} tone={PHARMACY_TONE} />}
          label={t('support.pharmacy', '💊 24/7 Duty Pharmacy')}
          value={property.pharmacy_phone ?? t('support.open_now', 'Open Now')}
          primary={{ label: t('support.find', 'Find'), href: pharmacyFinderHref(property), icon: ExternalLink, external: true }}
        />
      </div>

      <p className="mb-3 mt-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
        {t('support.host_title', '🤝 Direct Host Support')}
      </p>
      <HostContactCard property={property} />

      <GoogleReviewCard property={property} />
    </div>
  );
}

function BottomTabBar({ active, onChange, t }: { active: Tab; onChange: (tab: Tab) => void; t: (key: string, fallback: string) => string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md border-t border-stone-200/60 bg-white/95 backdrop-blur-xl">
      <div className="flex items-stretch px-2 pb-[max(env(safe-area-inset-bottom),10px)] pt-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.key === active;
          return (
            <motion.button
              key={tab.key}
              type="button"
              whileTap={{ scale: 0.9 }}
              transition={TAP_SPRING}
              onClick={() => onChange(tab.key)}
              className="relative flex flex-1 flex-col items-center gap-1 py-1.5"
            >
              {isActive && (
                <motion.div
                  layoutId="tab-pill"
                  className="absolute -top-0.5 h-0.5 w-8 rounded-full"
                  style={{ background: TURQUOISE }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className="h-5 w-5" style={{ color: isActive ? TURQUOISE : '#A8A29E' }} strokeWidth={isActive ? 2.2 : 1.8} />
              <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: isActive ? TURQUOISE_DARK : '#A8A29E' }}>
                {t(tab.labelKey, tab.fallback)}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardGrid({ property, places, onOpenAIChat }: DashboardGridProps) {
  const { language } = useLanguage();
  const t = useT();
  const lang = language ?? 'en';

  const [tabState, setTabState] = useState<{ tab: Tab; direction: number }>({ tab: 'home', direction: 0 });
  const [exploreDeepLink, setExploreDeepLink] = useState<PlaceCategory | null>(null);
  const [manualExpandedKey, setManualExpandedKey] = useState<string | null>('wifi');
  const [wifiOpen, setWifiOpen] = useState(false);
  const [checkinMode, setCheckinMode] = useState<'checkin' | 'checkout' | false>(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const toastIdRef = useRef(0);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = (text: string) => {
    toastIdRef.current += 1;
    const id = toastIdRef.current;
    setToasts((current) => [...current, { id, text }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 2200);
  };

  const goTab = (tab: Tab) => {
    setTabState((current) => {
      const from = TAB_ORDER.indexOf(current.tab);
      const to = TAB_ORDER.indexOf(tab);
      return { tab, direction: to >= from ? 1 : -1 };
    });
  };

  let content: ReactNode;
  if (tabState.tab === 'home') {
    content = <HomeSpacer />;
  } else if (tabState.tab === 'manual') {
    content = (
      <ManualTab
        property={property}
        language={lang}
        expandedKey={manualExpandedKey}
        onExpandedKeyChange={setManualExpandedKey}
        onOpenWifi={() => setWifiOpen(true)}
      />
    );
  } else if (tabState.tab === 'explore') {
    content = (
      <ExploreTab
        places={places}
        property={property}
        language={lang}
        initialCategory={exploreDeepLink}
        onDeepLinkConsumed={() => setExploreDeepLink(null)}
        onSelectPlace={setSelectedPlace}
        onToast={pushToast}
      />
    );
  } else {
    content = <SupportTab property={property} language={lang} />;
  }

  return (
    <div className="relative mx-auto min-h-screen max-w-md overflow-x-hidden bg-[#F7F4EC] text-stone-900">
      {tabState.tab === 'home' && (
        <HeroHeader property={property} language={lang} onOpenCheckin={(mode) => setCheckinMode(mode)} onToast={pushToast} />
      )}

      {tabState.tab !== 'home' && (
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-stone-200/60 bg-[#F7F4EC]/90 px-5 py-4 backdrop-blur-xl">
          <h2 className="text-lg font-semibold uppercase tracking-tight text-stone-900">
            {t(TABS.find((tb) => tb.key === tabState.tab)?.labelKey ?? '', TABS.find((tb) => tb.key === tabState.tab)?.fallback ?? '')}
          </h2>
          <LanguageSwitcher variant="onLight" />
        </div>
      )}

      <AnimatePresence mode="wait" custom={tabState.direction} initial={false}>
        <motion.div
          key={tabState.tab}
          custom={tabState.direction}
          variants={tabVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          className="pb-28"
        >
          {content}
        </motion.div>
      </AnimatePresence>

      <BottomTabBar active={tabState.tab} onChange={goTab} t={t} />
      <FloatingHelpButton onPress={() => setHelpOpen(true)} />
      <ToastStack toasts={toasts} />

      <WifiDrawer property={property} open={wifiOpen} onOpenChange={setWifiOpen} onToast={pushToast} />
      <CheckInOutDrawer property={property} mode={checkinMode} onOpenChange={(open) => !open && setCheckinMode(false)} />
      <PlaceDetailDrawer place={selectedPlace} language={lang} onOpenChange={(open) => !open && setSelectedPlace(null)} />
      <GetHelpDrawer property={property} open={helpOpen} onOpenChange={setHelpOpen} onOpenAIChat={onOpenAIChat} onToast={pushToast} />
    </div>
  );
}

function HomeSpacer() {
  return <div className="h-1" />;
}