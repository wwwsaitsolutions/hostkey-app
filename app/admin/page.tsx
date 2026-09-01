'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  BookOpen,
  Bot,
  CheckCircle2,
  Compass,
  DoorOpen,
  ExternalLink,
  Home as HomeIcon,
  LifeBuoy,
  Loader2,
  Phone,
  Plus,
  Save,
  Sparkles,
  Star,
  Trash2,
  Upload,
  Wand2,
  X,
  ImageIcon,
  LogOut,
  Crown,
  Check,
  User,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

/* ------------------------------------------------------------------ */
/* Τύποι Δεδομένων                                                    */
/* ------------------------------------------------------------------ */

interface MultilingualValue {
  el: string;
  en: string;
  fr?: string;
  de?: string;
  rest?: Record<string, string>;
}

function emptyMultilingual(): MultilingualValue {
  return { el: '', en: '', fr: '', de: '' };
}

interface PropertySummary {
  id: string;
  name: string;
  slug: string;
}

export type PlaceCategory =
  | 'beaches'
  | 'groceries'
  | 'food'
  | 'nightlife'
  | 'gyms'
  | 'culture'
  | 'activities'
  | 'rentals';

const CATEGORY_OPTIONS: { value: PlaceCategory; label: string }[] = [
  { value: 'beaches', label: '🏖️ Παραλίες & Καιρός' },
  { value: 'groceries', label: '🥖 Φούρνοι & Σούπερ Μάρκετ' },
  { value: 'food', label: '🍽️ Φαγητό & Ταβέρνες' },
  { value: 'nightlife', label: '🍸 Μπαρ & Νυχτερινή Ζωή' },
  { value: 'gyms', label: '💪 Γυμναστήρια & Πισίνες' },
  { value: 'culture', label: '🏛️ Αξιοθέατα & Πολιτισμός' },
  { value: 'activities', label: '🥾 Δραστηριότητες & Κρουαζιέρες' },
  { value: 'rentals', label: '🚗 Ενοικιάσεις & Μεταφορές' },
];

export interface PlaceItem {
  id: string;
  category: PlaceCategory;
  name: string;
  description: MultilingualValue;
  image_url: string;
  google_rating: string;
  wind_status: 'sheltered' | 'exposed' | '';
  wind_note: string;
  phone: string;
  address: string;
}

function emptyPlace(): PlaceItem {
  return {
    id: '',
    category: 'groceries',
    name: '',
    description: emptyMultilingual(),
    image_url: '',
    google_rating: '4.8',
    wind_status: '',
    wind_note: '',
    phone: '',
    address: '',
  };
}

interface PropertyFormState {
  id: string | null;
  name: string;
  slug: string;
  address: string;
  cover_image: string;
  check_in_time: string;
  check_out_time: string;
  keysafe_code: string;
  wifi_ssid: string;
  wifi_password: string;
  host_name: string;
  host_phone: string;
  whatsapp_number: string;
  host_email: string;
  host_avatar_url: string;

  building_access: MultilingualValue;
  elevator_info: MultilingualValue;
  parking_info: MultilingualValue;
  parking_maps_url: string;
  late_arrival_info: MultilingualValue;
  checkin_steps_text: string;
  checkout_steps_text: string;

  tap_water_info: MultilingualValue;
  plumbing_rules: MultilingualValue;
  sockets_appliances_info: MultilingualValue;
  tv_streaming_info: MultilingualValue;
  coffee_supplies_info: MultilingualValue;
  kitchen_appliances_info: MultilingualValue;
  laundry_info: MultilingualValue;
  dishwasher_info: MultilingualValue;
  hot_water_info: MultilingualValue;
  amenities_info: MultilingualValue;
  linens_towels_info: MultilingualValue;
  trash_info: MultilingualValue;
  trash_maps_url: string;
  house_rules: MultilingualValue;

  luggage_storage_info: MultilingualValue;
  bus_transport_info: MultilingualValue;
  taxi_station_info: MultilingualValue;
  taxi_phone: string;
  car_rentals_info: MultilingualValue;
  car_rentals_booking_url: string;
  transfers_info: MultilingualValue;
  first_aid_location: MultilingualValue;
  pharmacy_phone: string;
  pharmacy_finder_url: string;

  ai_custom_instructions: string;
}

type SectionKey = 'basic' | 'arrival' | 'manual' | 'mobility' | 'safety' | 'places' | 'ai';

interface ToastItem {
  id: number;
  type: 'success' | 'error';
  message: string;
}

const SECTIONS: { key: SectionKey; label: string; icon: typeof HomeIcon }[] = [
  { key: 'basic', label: 'Βασικά & Οικοδεσπότης', icon: HomeIcon },
  { key: 'arrival', label: 'Άφιξη & Πρόσβαση', icon: DoorOpen },
  { key: 'manual', label: 'Οδηγός Σπιτιού', icon: BookOpen },
  { key: 'mobility', label: 'Μετακινήσεις & Μεταφορές', icon: LifeBuoy },
  { key: 'safety', label: 'Έκτακτη Ανάγκη & Ασφάλεια', icon: Phone },
  { key: 'places', label: 'Προτάσεις & Σημεία', icon: Compass },
  { key: 'ai', label: 'AI Βοηθός Επισκεπτών', icon: Bot },
];

const FIELD_CLASS =
  'w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm outline-none transition-colors placeholder:text-stone-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20';

/* ------------------------------------------------------------------ */
/* Βοηθητικές Συναρτήσεις                                             */
/* ------------------------------------------------------------------ */

function emptyForm(): PropertyFormState {
  return {
    id: null,
    name: '',
    slug: '',
    address: '',
    cover_image: '',
    check_in_time: '15:00',
    check_out_time: '11:00',
    keysafe_code: '',
    wifi_ssid: '',
    wifi_password: '',
    host_name: '',
    host_phone: '',
    whatsapp_number: '',
    host_email: '',
    host_avatar_url: '',

    building_access: emptyMultilingual(),
    elevator_info: emptyMultilingual(),
    parking_info: emptyMultilingual(),
    parking_maps_url: '',
    late_arrival_info: emptyMultilingual(),
    checkin_steps_text: '',
    checkout_steps_text: '',

    tap_water_info: emptyMultilingual(),
    plumbing_rules: emptyMultilingual(),
    sockets_appliances_info: emptyMultilingual(),
    tv_streaming_info: emptyMultilingual(),
    coffee_supplies_info: emptyMultilingual(),
    kitchen_appliances_info: emptyMultilingual(),
    laundry_info: emptyMultilingual(),
    dishwasher_info: emptyMultilingual(),
    hot_water_info: emptyMultilingual(),
    amenities_info: emptyMultilingual(),
    linens_towels_info: emptyMultilingual(),
    trash_info: emptyMultilingual(),
    trash_maps_url: '',
    house_rules: emptyMultilingual(),

    luggage_storage_info: emptyMultilingual(),
    bus_transport_info: emptyMultilingual(),
    taxi_station_info: emptyMultilingual(),
    taxi_phone: '',
    car_rentals_info: emptyMultilingual(),
    car_rentals_booking_url: '',
    transfers_info: emptyMultilingual(),
    first_aid_location: emptyMultilingual(),
    pharmacy_phone: '',
    pharmacy_finder_url: '',

    ai_custom_instructions: '',
  };
}

function toMultilingual(raw: unknown): MultilingualValue {
  if (raw == null) return emptyMultilingual();
  if (typeof raw === 'string') return { el: raw, en: raw, fr: '', de: '' };
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    const obj = raw as Record<string, string>;
    const { el, en, fr, de, ...rest } = obj;
    return {
      el: el ?? '',
      en: en ?? '',
      fr: fr ?? '',
      de: de ?? '',
      rest: Object.keys(rest).length > 0 ? rest : undefined,
    };
  }
  return emptyMultilingual();
}

function fromMultilingual(value: MultilingualValue): Record<string, string> | null {
  const merged: Record<string, string> = { ...(value.rest ?? {}) };
  if (value.el?.trim()) merged.el = value.el.trim();
  if (value.en?.trim()) merged.en = value.en.trim();
  if (value.fr?.trim()) merged.fr = value.fr.trim();
  if (value.de?.trim()) merged.de = value.de.trim();
  return Object.keys(merged).length > 0 ? merged : null;
}

function fromText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function translateText(greekText: string): Promise<{ en: string; fr: string; de: string }> {
  if (!greekText.trim()) return { en: '', fr: '', de: '' };
  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: greekText, targetLangs: ['en', 'fr', 'de'] }),
    });
    const data = await res.json();
    return {
      en: data.translations?.en ?? '',
      fr: data.translations?.fr ?? '',
      de: data.translations?.de ?? '',
    };
  } catch {
    return { en: greekText, fr: '', de: '' };
  }
}

function rowToForm(row: Record<string, unknown>): PropertyFormState {
  const str = (key: string): string => {
    const v = row[key];
    return typeof v === 'string' ? v : v == null ? '' : String(v);
  };

  const stepsToStr = (arr: unknown): string => {
    if (Array.isArray(arr)) return arr.join('\n');
    return '';
  };

  return {
    id: (row.id as string) ?? null,
    name: str('name'),
    slug: str('slug'),
    address: str('address'),
    cover_image: str('cover_image'),
    check_in_time: str('check_in_time') || '15:00',
    check_out_time: str('check_out_time') || '11:00',
    keysafe_code: str('keysafe_code'),
    wifi_ssid: str('wifi_ssid'),
    wifi_password: str('wifi_password'),
    host_name: str('host_name'),
    host_phone: str('host_phone'),
    whatsapp_number: str('whatsapp_number'),
    host_email: str('host_email'),
    host_avatar_url: str('host_avatar_url'),

    building_access: toMultilingual(row.building_access),
    elevator_info: toMultilingual(row.elevator_info),
    parking_info: toMultilingual(row.parking_info),
    parking_maps_url: str('parking_maps_url'),
    late_arrival_info: toMultilingual(row.late_arrival_info),
    checkin_steps_text: stepsToStr(row.checkin_steps),
    checkout_steps_text: stepsToStr(row.checkout_steps),

    tap_water_info: toMultilingual(row.tap_water_info),
    plumbing_rules: toMultilingual(row.plumbing_rules),
    sockets_appliances_info: toMultilingual(row.sockets_appliances_info),
    tv_streaming_info: toMultilingual(row.tv_streaming_info),
    coffee_supplies_info: toMultilingual(row.coffee_supplies_info),
    kitchen_appliances_info: toMultilingual(row.kitchen_appliances_info),
    laundry_info: toMultilingual(row.laundry_info),
    dishwasher_info: toMultilingual(row.dishwasher_info),
    hot_water_info: toMultilingual(row.hot_water_info),
    amenities_info: toMultilingual(row.amenities_info),
    linens_towels_info: toMultilingual(row.linens_towels_info),
    trash_info: toMultilingual(row.trash_info),
    trash_maps_url: str('trash_maps_url'),
    house_rules: toMultilingual(row.house_rules),

    luggage_storage_info: toMultilingual(row.luggage_storage_info),
    bus_transport_info: toMultilingual(row.bus_transport_info),
    taxi_station_info: toMultilingual(row.taxi_station_info),
    taxi_phone: str('taxi_phone'),
    car_rentals_info: toMultilingual(row.car_rentals_info),
    car_rentals_booking_url: str('car_rentals_booking_url') || str('rentals_booking_url'),
    transfers_info: toMultilingual(row.transfers_info),
    first_aid_location: toMultilingual(row.first_aid_location),
    pharmacy_phone: str('pharmacy_phone'),
    pharmacy_finder_url: str('pharmacy_finder_url'),

    ai_custom_instructions: str('ai_custom_instructions'),
  };
}

function formToPayload(form: PropertyFormState, userId?: string | null): Record<string, unknown> {
  const parseLines = (text: string): string[] | null => {
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    return lines.length > 0 ? lines : null;
  };

  const payload: Record<string, unknown> = {
    name: form.name.trim(),
    slug: form.slug.trim(),
    address: fromText(form.address),
    cover_image: fromText(form.cover_image),
    check_in_time: fromText(form.check_in_time),
    check_out_time: fromText(form.check_out_time),
    keysafe_code: fromText(form.keysafe_code),
    wifi_ssid: fromText(form.wifi_ssid),
    wifi_password: fromText(form.wifi_password),
    host_name: fromText(form.host_name),
    host_phone: fromText(form.host_phone),
    whatsapp_number: fromText(form.whatsapp_number),
    host_email: fromText(form.host_email),
    host_avatar_url: fromText(form.host_avatar_url),

    building_access: fromMultilingual(form.building_access),
    elevator_info: fromMultilingual(form.elevator_info),
    parking_info: fromMultilingual(form.parking_info),
    parking_maps_url: fromText(form.parking_maps_url),
    late_arrival_info: fromMultilingual(form.late_arrival_info),
    checkin_steps: parseLines(form.checkin_steps_text),
    checkout_steps: parseLines(form.checkout_steps_text),

    tap_water_info: fromMultilingual(form.tap_water_info),
    plumbing_rules: fromMultilingual(form.plumbing_rules),
    sockets_appliances_info: fromMultilingual(form.sockets_appliances_info),
    tv_streaming_info: fromMultilingual(form.tv_streaming_info),
    coffee_supplies_info: fromMultilingual(form.coffee_supplies_info),
    kitchen_appliances_info: fromMultilingual(form.kitchen_appliances_info),
    laundry_info: fromMultilingual(form.laundry_info),
    dishwasher_info: fromMultilingual(form.dishwasher_info),
    hot_water_info: fromMultilingual(form.hot_water_info),
    amenities_info: fromMultilingual(form.amenities_info),
    linens_towels_info: fromMultilingual(form.linens_towels_info),
    trash_info: fromMultilingual(form.trash_info),
    trash_maps_url: fromText(form.trash_maps_url),
    house_rules: fromMultilingual(form.house_rules),

    luggage_storage_info: fromMultilingual(form.luggage_storage_info),
    bus_transport_info: fromMultilingual(form.bus_transport_info),
    taxi_station_info: fromMultilingual(form.taxi_station_info),
    taxi_phone: fromText(form.taxi_phone),
    car_rentals_info: fromMultilingual(form.car_rentals_info),
    car_rentals_booking_url: fromText(form.car_rentals_booking_url),
    transfers_info: fromMultilingual(form.transfers_info),
    first_aid_location: fromMultilingual(form.first_aid_location),
    pharmacy_phone: fromText(form.pharmacy_phone),
    pharmacy_finder_url: fromText(form.pharmacy_finder_url),

    ai_custom_instructions: fromText(form.ai_custom_instructions),
  };

  if (userId) {
    payload.user_id = userId;
  }

  return payload;
}

/* ------------------------------------------------------------------ */
/* Πεδία Φόρμας & Upload                                              */
/* ------------------------------------------------------------------ */

function FieldLabel({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <span className="flex items-baseline justify-between gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">{children}</span>
      {hint && <span className="text-[11px] font-normal normal-case text-stone-400">{hint}</span>}
    </span>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <FieldLabel hint={hint}>{label}</FieldLabel>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={FIELD_CLASS} />
    </label>
  );
}

function FileUploadField({
  label,
  value,
  onChange,
  onToast,
  hint,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  onToast: (type: 'success' | 'error', message: string) => void;
  hint?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage.from('guidebook-media').upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('guidebook-media').getPublicUrl(filePath);
      onChange(data.publicUrl);
      onToast('success', 'Το αρχείο ανέβηκε επιτυχώς!');
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      onToast('error', `Σφάλμα μεταφόρτωσης: ${errObj?.message || 'Ελέγξτε το storage bucket'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel hint={hint}>{label}</FieldLabel>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="*/*"
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-bold text-stone-700 shadow-sm transition-colors hover:bg-stone-50 disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin text-emerald-600" /> : <Upload className="h-4 w-4" />}
          {uploading ? 'Μεταφόρτωση…' : '📁 Επιλογή Φωτογραφίας / Αρχείου'}
        </button>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="ή επικολλήστε link απευθείας (https://…)"
          className={FIELD_CLASS + ' flex-1 text-xs'}
        />

        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="shrink-0 p-2 text-stone-400 hover:text-red-500"
            title="Διαγραφή αρχείου"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {value && (
        <div className="mt-1 flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-2">
          {value.match(/\.(jpeg|jpg|gif|png|webp|avif|svg)($|\?)/i) ? (
            <img src={value} alt="Προεπισκόπηση" className="h-12 w-16 rounded-lg object-cover" />
          ) : (
            <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-stone-100 text-stone-400">
              <ImageIcon className="h-5 w-5" />
            </div>
          )}
          <span className="truncate text-xs text-stone-500">{value}</span>
        </div>
      )}
    </div>
  );
}

function MultilingualField({
  label,
  value,
  onChange,
  multiline = true,
  hint,
}: {
  label: string;
  value: MultilingualValue;
  onChange: (value: MultilingualValue) => void;
  multiline?: boolean;
  hint?: string;
}) {
  const [translating, setTranslating] = useState(false);
  const baseClass = FIELD_CLASS + (multiline ? ' resize-y' : '');

  const handleTranslate = async () => {
    if (!value.el.trim()) return;
    setTranslating(true);
    const trans = await translateText(value.el);
    onChange({
      ...value,
      en: trans.en,
      fr: trans.fr,
      de: trans.de,
    });
    setTranslating(false);
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-stone-200/70 bg-white p-4 shadow-sm shadow-stone-900/5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-stone-900">{label}</span>
        <button
          type="button"
          onClick={handleTranslate}
          disabled={translating || !value.el.trim()}
          className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-40"
        >
          {translating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
          {translating ? 'Μετάφραση…' : '🪄 Μετάφραση σε EN, FR, DE'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <span className="inline-flex w-fit items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-emerald-800">
            🇬🇷 Ελληνικά (Γράψτε εδώ)
          </span>
          {multiline ? (
            <textarea
              rows={3}
              value={value.el}
              onChange={(e) => onChange({ ...value, el: e.target.value })}
              placeholder="Πληκτρολογήστε στα ελληνικά…"
              className={baseClass + ' border-emerald-300'}
            />
          ) : (
            <input
              type="text"
              value={value.el}
              onChange={(e) => onChange({ ...value, el: e.target.value })}
              placeholder="Πληκτρολογήστε στα ελληνικά…"
              className={baseClass + ' border-emerald-300'}
            />
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="inline-flex w-fit items-center rounded-full bg-stone-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-stone-600">
            🇬🇧 Αγγλικά (Αυτόματη μετάφραση)
          </span>
          {multiline ? (
            <textarea
              rows={3}
              value={value.en}
              onChange={(e) => onChange({ ...value, en: e.target.value })}
              placeholder="Αγγλική μετάφραση…"
              className={baseClass}
            />
          ) : (
            <input
              type="text"
              value={value.en}
              onChange={(e) => onChange({ ...value, en: e.target.value })}
              placeholder="Αγγλική μετάφραση…"
              className={baseClass}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-1">
      <h2 className="text-base font-bold text-stone-900">{title}</h2>
      <p className="text-sm text-stone-500">{subtitle}</p>
    </div>
  );
}

function ToastStack({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: number) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed right-4 top-4 z-[100] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2.5">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-2.5 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-sm ${
            toast.type === 'success' ? 'border-emerald-200 bg-emerald-50/95 text-emerald-900' : 'border-red-200 bg-red-50/95 text-red-900'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          )}
          <p className="flex-1 text-sm leading-relaxed">{toast.message}</p>
          <button type="button" onClick={() => onDismiss(toast.id)} className="shrink-0 text-current opacity-60 hover:opacity-100">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Κύρια Σελίδα Admin                                                 */
/* ------------------------------------------------------------------ */

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);

  const [propertyList, setPropertyList] = useState<PropertySummary[]>([]);
  const [form, setForm] = useState<PropertyFormState>(emptyForm());
  const [activeSection, setActiveSection] = useState<SectionKey>('basic');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingProperty, setLoadingProperty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoTranslatingAll, setAutoTranslatingAll] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [agreedTerms, setAgreedTerms] = useState<boolean>(true);
  const [showProModal, setShowProModal] = useState<string | null>(null);

  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<PlaceCategory | 'all'>('all');
  const [editingPlace, setEditingPlace] = useState<PlaceItem | null>(null);
  const [savingPlace, setSavingPlace] = useState(false);

  const pushToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  // Έλεγχος Συνεδρίας Χρήστη (Master PIN + Supabase Auth)
  useEffect(() => {
    const checkUser = async () => {
      const isMaster = typeof window !== 'undefined' ? localStorage.getItem('hostkey_is_master') : null;
      const { data: { session } } = await supabase.auth.getSession();

      if (isMaster === 'true') {
        setUser({ email: 'Master Admin', isMaster: true });
        setAuthChecking(false);
        return;
      }

      if (!session) {
        router.replace('/login');
      } else {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('hostkey_is_master');
        }
        setUser(session.user);
      }
      setAuthChecking(false);
    };
    checkUser();
  }, [router]);

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hostkey_admin_auth');
      localStorage.removeItem('hostkey_is_master');
    }
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleSelectProperty = useCallback(
    async (id: string) => {
      if (!id) {
        setForm(emptyForm());
        return;
      }
      setLoadingProperty(true);
      const { data, error } = await supabase.from('properties').select('*').eq('id', id).single();
      setLoadingProperty(false);
      if (error || !data) {
        pushToast('error', `Αδυναμία φόρτωσης καταλύματος: ${error?.message ?? 'δεν βρέθηκε'}`);
        return;
      }
      setForm(rowToForm(data as Record<string, unknown>));
    },
    [pushToast],
  );

  // Φόρτωση καταλυμάτων: Όλα αν είναι Master Admin, ΜΟΝΟ τα δικά του αν είναι απλός χρήστης
  const loadPropertyList = useCallback(async () => {
    const isMaster = typeof window !== 'undefined' && localStorage.getItem('hostkey_is_master') === 'true';

    setLoadingList(true);
    let query = supabase.from('properties').select('id, name, slug').order('name', { ascending: true });

    if (!isMaster && user?.id) {
      query = query.eq('user_id', user.id);
    }

    const { data, error } = await query;
    setLoadingList(false);

    if (error) {
      pushToast('error', `Αδυναμία φόρτωσης λίστας: ${error.message}`);
      return;
    }

    const list = (data as PropertySummary[]) ?? [];
    setPropertyList(list);

    if (list.length > 0) {
      handleSelectProperty(list[0].id);
    } else {
      setForm(emptyForm());
    }
  }, [user?.id, pushToast, handleSelectProperty]);

  const loadPlaces = useCallback(async () => {
    setLoadingPlaces(true);
    const { data, error } = await supabase.from('places').select('*').order('name', { ascending: true });
    setLoadingPlaces(false);
    if (error) {
      pushToast('error', `Αδυναμία φόρτωσης τοποθεσιών: ${error.message}`);
      return;
    }
    const mapped: PlaceItem[] = ((data as Record<string, unknown>[]) ?? []).map((row) => ({
      id: String(row.id),
      category: row.category as PlaceCategory,
      name: String(row.name ?? ''),
      description: toMultilingual(row.description),
      image_url: String(row.image_url ?? ''),
      google_rating: row.google_rating != null ? String(row.google_rating) : '4.8',
      wind_status: (row.wind_status as 'sheltered' | 'exposed') || '',
      wind_note: String(row.wind_note ?? ''),
      phone: String(row.phone ?? ''),
      address: String(row.address ?? ''),
    }));
    setPlaces(mapped);
  }, [pushToast]);

  useEffect(() => {
    if (user) {
      loadPropertyList();
      loadPlaces();
    }
  }, [user, loadPropertyList, loadPlaces]);

  const handleCreateNew = useCallback(() => {
    setForm(emptyForm());
    setActiveSection('basic');
  }, []);

  const handleAutoTranslateAll = async () => {
    setAutoTranslatingAll(true);
    pushToast('success', 'Μετάφραση όλων των ελληνικών κειμένων σε Αγγλικά, Γαλλικά & Γερμανικά…');

    const updated = { ...form };
    const fields: (keyof PropertyFormState)[] = [
      'building_access',
      'elevator_info',
      'parking_info',
      'late_arrival_info',
      'tap_water_info',
      'plumbing_rules',
      'sockets_appliances_info',
      'tv_streaming_info',
      'coffee_supplies_info',
      'kitchen_appliances_info',
      'laundry_info',
      'dishwasher_info',
      'hot_water_info',
      'amenities_info',
      'linens_towels_info',
      'trash_info',
      'house_rules',
      'luggage_storage_info',
      'bus_transport_info',
      'taxi_station_info',
      'car_rentals_info',
      'transfers_info',
      'first_aid_location',
    ];

    await Promise.all(
      fields.map(async (key) => {
        const val = updated[key] as MultilingualValue;
        if (val?.el?.trim()) {
          const trans = await translateText(val.el);
          (updated[key] as MultilingualValue) = {
            ...val,
            en: trans.en,
            fr: trans.fr,
            de: trans.de,
          };
        }
      }),
    );

    setForm(updated);
    setAutoTranslatingAll(false);
    pushToast('success', 'Όλα τα πεδία μεταφράστηκαν! Πατήστε "Αποθήκευση Αλλαγών" για εφαρμογή.');
  };

  const handleSave = useCallback(async () => {
    if (!form.name.trim()) {
      pushToast('error', 'Παρακαλώ εισάγετε όνομα καταλύματος.');
      setActiveSection('basic');
      return;
    }
    if (!form.slug.trim()) {
      pushToast('error', 'Παρακαλώ εισάγετε slug για το link (URL).');
      setActiveSection('basic');
      return;
    }

    if (!agreedTerms && !form.id) {
      pushToast('error', 'Παρακαλώ αποδεχτείτε τους όρους χρήσης για να συνεχίσετε.');
      return;
    }

    setSaving(true);
    const payload = formToPayload(form, user?.id);

    try {
      if (form.id) {
        const { data, error } = await supabase.from('properties').update(payload).eq('id', form.id).select().single();
        if (error) throw error;
        setForm(rowToForm(data as Record<string, unknown>));
        pushToast('success', `Το κατάλυμα "${form.name}" ενημερώθηκε επιτυχώς.`);
      } else {
        const { data, error } = await supabase.from('properties').insert(payload).select().single();
        if (error) throw error;
        setForm(rowToForm(data as Record<string, unknown>));
        pushToast('success', `Το κατάλυμα "${form.name}" δημιουργήθηκε επιτυχώς.`);
      }
      await loadPropertyList();
    } catch (err: unknown) {
      const errorObj = err as { message?: string; details?: string };
      const message = errorObj?.message || errorObj?.details || 'Σφάλμα κατά την αποθήκευση.';
      pushToast('error', message);
    } finally {
      setSaving(false);
    }
  }, [form, agreedTerms, user?.id, loadPropertyList, pushToast]);

  const handleSavePlace = useCallback(async () => {
    if (!editingPlace) return;
    if (!editingPlace.name.trim()) {
      pushToast('error', 'Παρακαλώ εισάγετε όνομα σημείου.');
      return;
    }

    setSavingPlace(true);
    const payload = {
      category: editingPlace.category,
      name: editingPlace.name.trim(),
      description: fromMultilingual(editingPlace.description),
      image_url: fromText(editingPlace.image_url),
      google_rating: editingPlace.google_rating ? parseFloat(editingPlace.google_rating) : null,
      wind_status: editingPlace.wind_status || null,
      wind_note: fromText(editingPlace.wind_note),
      phone: fromText(editingPlace.phone),
      address: fromText(editingPlace.address),
    };

    try {
      if (editingPlace.id) {
        const { error } = await supabase.from('places').update(payload).eq('id', editingPlace.id);
        if (error) throw error;
        pushToast('success', `Το σημείο "${editingPlace.name}" ενημερώθηκε επιτυχώς.`);
      } else {
        const { error } = await supabase.from('places').insert(payload);
        if (error) throw error;
        pushToast('success', `Το σημείο "${editingPlace.name}" προστέθηκε επιτυχώς.`);
      }
      setEditingPlace(null);
      await loadPlaces();
    } catch (err: unknown) {
      const errorObj = err as { message?: string; details?: string };
      const message = errorObj?.message || errorObj?.details || 'Αδυναμία αποθήκευσης σημείου.';
      pushToast('error', message);
    } finally {
      setSavingPlace(false);
    }
  }, [editingPlace, loadPlaces, pushToast]);

  const handleDeletePlace = useCallback(
    async (id: string, name: string) => {
      if (!confirm(`Είστε σίγουροι ότι θέλετε να διαγράψετε το σημείο "${name}";`)) return;
      const { error } = await supabase.from('places').delete().eq('id', id);
      if (error) {
        pushToast('error', `Αδυναμία διαγραφής: ${error.message}`);
        return;
      }
      pushToast('success', `Το σημείο "${name}" διαγράφηκε.`);
      await loadPlaces();
    },
    [loadPlaces, pushToast],
  );

  const set = useCallback(<K extends keyof PropertyFormState>(key: K) => {
    return (value: PropertyFormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    };
  }, []);

  const liveGuideHref = useMemo(() => (form.slug.trim() ? `/${form.slug.trim()}` : null), [form.slug]);

  const filteredPlaces = useMemo(() => {
    if (selectedCategoryFilter === 'all') return places;
    return places.filter((p) => p.category === selectedCategoryFilter);
  }, [places, selectedCategoryFilter]);

  if (authChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F4EC]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F4EC] pb-28 text-stone-900">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      {/* Κεφαλίδα Διαχείρισης */}
      <div className="sticky top-0 z-30 border-b border-stone-200/60 bg-[#F7F4EC]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md" title="Αρχική Σελίδα">
                <Sparkles className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-stone-900">Πίνακας Ελέγχου Hostkey</h1>
                <p className="flex items-center gap-1.5 text-xs text-stone-500">
                  <User className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{user?.email}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAutoTranslateAll}
                disabled={autoTranslatingAll}
                className="flex items-center gap-2 rounded-xl border border-emerald-600 bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
              >
                {autoTranslatingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                {autoTranslatingAll ? 'Μετάφραση όλων…' : '🪄 Αυτόματη Μετάφραση Όλων'}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50"
                title="Αποσύνδεση"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Αποσύνδεση</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex min-w-[220px] flex-1 items-center gap-2">
              <select
                value={form.id ?? ''}
                onChange={(e) => handleSelectProperty(e.target.value)}
                disabled={loadingList || loadingProperty}
                className={FIELD_CLASS + ' flex-1 disabled:opacity-60 font-semibold'}
              >
                <option value="">{loadingList ? 'Φόρτωση καταλυμάτων…' : '— Επιλέξτε κατάλυμα —'}</option>
                {propertyList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {loadingProperty && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-stone-400" />}
            </div>

            <button
              type="button"
              onClick={handleCreateNew}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 shadow-sm transition-colors hover:bg-stone-50"
            >
              <Plus className="h-4 w-4" />
              Νέο Κατάλυμα
            </button>

            {liveGuideHref && (
              <a
                href={liveGuideHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-500/20"
              >
                🔗 Προβολή Live Οδηγού
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>

        {/* Καρτέλες Ενοτήτων */}
        <div className="mx-auto max-w-5xl px-5">
          <div className="flex gap-1 overflow-x-auto pb-3">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = section.key === activeSection;
              return (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => setActiveSection(section.key)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                    isActive ? 'bg-stone-900 text-white shadow-sm' : 'bg-white text-stone-500 hover:bg-stone-100'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {section.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Περιεχόμενο Φόρμας */}
      <div className="mx-auto max-w-5xl px-5 pt-6">

        {/* 1. Βασικά Στοιχεία & Οικοδεσπότης */}
        {activeSection === 'basic' && (
          <div className="flex flex-col gap-6">
            <SectionHeading
              title="Βασικές Πληροφορίες & Στοιχεία Οικοδεσπότη"
              subtitle="Όνομα, διεύθυνση, κεντρική φωτογραφία, κωδικοί Wi-Fi και απευθείας επικοινωνία."
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField label="Όνομα Καταλύματος" value={form.name} onChange={set('name')} placeholder="π.χ. Πολυτελές Παραθαλάσσιο Διαμέρισμα" />
              <div className="flex flex-col gap-1.5">
                <FieldLabel hint="Αναγνωριστικό συνδέσμου URL">Σύνδεσμος (Slug)</FieldLabel>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => set('slug')(slugify(e.target.value))}
                    placeholder="π.χ. seaside-luxury-apartment"
                    className={FIELD_CLASS}
                  />
                  <button
                    type="button"
                    onClick={() => set('slug')(slugify(form.name))}
                    disabled={!form.name.trim()}
                    className="shrink-0 rounded-xl border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-600 transition-colors hover:bg-stone-50 disabled:opacity-40"
                  >
                    Δημιουργία
                  </button>
                </div>
              </div>
            </div>

            <TextField label="Διεύθυνση Καταλύματος" value={form.address} onChange={set('address')} placeholder="π.χ. Σοφοκλή Βενιζέλου 24, Ρέθυμνο" />

            <FileUploadField
              label="Κεντρική Φωτογραφία Καταλύματος"
              value={form.cover_image}
              onChange={set('cover_image')}
              onToast={pushToast}
              hint="PNG, JPG, WEBP από τη συσκευή σας"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <TextField label="Κωδικός Κλειδοθήκης / Smart Lock" value={form.keysafe_code} onChange={set('keysafe_code')} placeholder="π.χ. 1234" />
              <TextField label="Όνομα Wi-Fi (SSID)" value={form.wifi_ssid} onChange={set('wifi_ssid')} placeholder="π.χ. Apartment_WiFi" />
              <TextField label="Κωδικός Wi-Fi" value={form.wifi_password} onChange={set('wifi_password')} placeholder="π.χ. welcome2026" />
            </div>

            <div className="mt-2 rounded-2xl border border-stone-200/70 bg-white p-5 shadow-sm shadow-stone-900/5">
              <p className="mb-3 text-sm font-bold text-stone-900">Στοιχεία Επικοινωνίας & Υποστήριξης Οικοδεσπότη</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField label="Όνομα Οικοδεσπότη" value={form.host_name} onChange={set('host_name')} placeholder="π.χ. Μαρία" />
                <FileUploadField
                  label="Φωτογραφία Προφίλ Οικοδεσπότη"
                  value={form.host_avatar_url}
                  onChange={set('host_avatar_url')}
                  onToast={pushToast}
                />
                <TextField label="Τηλέφωνο Κλήσης Οικοδεσπότη" value={form.host_phone} onChange={set('host_phone')} placeholder="+30 690 000 0000" type="tel" />
                <TextField label="Αριθμός WhatsApp Οικοδεσπότη" value={form.whatsapp_number} onChange={set('whatsapp_number')} placeholder="+30 690 000 0000" type="tel" />
                <TextField label="Email Οικοδεσπότη" value={form.host_email} onChange={set('host_email')} placeholder="host@example.com" type="email" />
              </div>
            </div>

            {!form.id && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-emerald-400 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs leading-relaxed text-emerald-950">
                    Αποδέχομαι τους <strong>Όρους Χρήσης</strong> και την παροχή του δωρεάν ψηφιακού οδηγού με τις προεπιλεγμένες υπηρεσίες της πλατφόρμας Hostkey.
                  </span>
                </label>
              </div>
            )}
          </div>
        )}

        {/* 2. Άφιξη, Κλειδοθήκη & Πρόσβαση */}
        {activeSection === 'arrival' && (
          <div className="flex flex-col gap-5">
            <SectionHeading
              title="Άφιξη, Κλειδοθήκη & Check-in / Out"
              subtitle="Ώρες άφιξης/αναχώρησης, οδηγίες εισόδου, πάρκινγκ και αναλυτικά βήματα check-in."
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField label="Ώρα Check-in" value={form.check_in_time} onChange={set('check_in_time')} placeholder="15:00" />
              <TextField label="Ώρα Check-out" value={form.check_out_time} onChange={set('check_out_time')} placeholder="11:00" />
            </div>

            <MultilingualField label="Οδηγίες Εισόδου στην Οικοδομή & Πρόσβασης" value={form.building_access} onChange={set('building_access')} />
            <MultilingualField label="Οδηγίες Ασανσέρ (Όροφος, λειτουργία)" value={form.elevator_info} onChange={set('elevator_info')} />
            <MultilingualField label="Οδηγίες Πάρκινγκ (Ιδιωτικό ή δρόμος)" value={form.parking_info} onChange={set('parking_info')} />
            <TextField label="Σύνδεσμος Τοποθεσίας Πάρκινγκ (Google Maps URL)" value={form.parking_maps_url} onChange={set('parking_maps_url')} placeholder="https://maps.google.com/…" type="url" />
            <MultilingualField label="Οδηγίες Καθυστερημένης Άφιξης (Late Arrival)" value={form.late_arrival_info} onChange={set('late_arrival_info')} />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5 rounded-2xl border border-stone-200/70 bg-white p-4">
                <FieldLabel hint="Ένα βήμα ανά γραμμή">Βήματα Άφιξης / Check-in (Αναδυόμενος Οδηγός)</FieldLabel>
                <textarea
                  rows={4}
                  value={form.checkin_steps_text}
                  onChange={(e) => set('checkin_steps_text')(e.target.value)}
                  placeholder="π.χ.&#10;Φτάνετε οποιαδήποτε ώρα μετά τις 15:00...&#10;Ανοίγετε την κλειδοθήκη με τον κωδικό...&#10;Τα κλειδιά βρίσκονται μέσα..."
                  className={FIELD_CLASS}
                />
              </div>

              <div className="flex flex-col gap-1.5 rounded-2xl border border-stone-200/70 bg-white p-4">
                <FieldLabel hint="Ένα βήμα ανά γραμμή">Βήματα Αναχώρησης / Check-out (Αναδυόμενος Οδηγός)</FieldLabel>
                <textarea
                  rows={4}
                  value={form.checkout_steps_text}
                  onChange={(e) => set('checkout_steps_text')(e.target.value)}
                  placeholder="π.χ.&#10;Η αναχώρηση γίνεται έως τις 11:00...&#10;Κλείνετε κλιματιστικά και φώτα...&#10;Τοποθετείτε τα κλειδιά πίσω στην κλειδοθήκη..."
                  className={FIELD_CLASS}
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. Οδηγός Σπιτιού (House Manual) */}
        {activeSection === 'manual' && (
          <div className="flex flex-col gap-5">
            <SectionHeading title="Ψηφιακός Οδηγός Σπιτιού" subtitle="Όλες οι οδηγίες συσκευών και κανόνων σπιτιού που εμφανίζονται στον επισκέπτη — αυτόματα μεταφρασμένες." />
            <MultilingualField label="Πόσιμο Νερό Βρύσης & Οδηγίες" value={form.tap_water_info} onChange={set('tap_water_info')} />
            <MultilingualField label="Κανόνες Υδραυλικών & Χαρτί Τουαλέτας" value={form.plumbing_rules} onChange={set('plumbing_rules')} />
            <MultilingualField label="Πρίζες & Ηλεκτρικές Συσκευές" value={form.sockets_appliances_info} onChange={set('sockets_appliances_info')} />
            <MultilingualField label="Τηλεόραση & Εφαρμογές Streaming (Netflix κ.λπ.)" value={form.tv_streaming_info} onChange={set('tv_streaming_info')} />
            <MultilingualField label="Καφετιέρα & Αναλώσιμα Καφέ" value={form.coffee_supplies_info} onChange={set('coffee_supplies_info')} />
            <MultilingualField label="Κουζίνα, Φούρνος & Μικροσυσκευές" value={form.kitchen_appliances_info} onChange={set('kitchen_appliances_info')} />
            <MultilingualField label="Πλυντήριο Ρούχων & Απορρυπαντικό" value={form.laundry_info} onChange={set('laundry_info')} />
            <MultilingualField label="Πλυντήριο Πιάτων" value={form.dishwasher_info} onChange={set('dishwasher_info')} />
            <MultilingualField label="Ζεστό Νερό & Ηλιακός / Θερμοσίφωνας" value={form.hot_water_info} onChange={set('hot_water_info')} />
            <MultilingualField label="Κλιματισμός & Θέρμανση (A/C)" value={form.amenities_info} onChange={set('amenities_info')} />
            <MultilingualField label="Έξτρα Κλινοσκεπάσματα, Πετσέτες & Μαξιλάρια" value={form.linens_towels_info} onChange={set('linens_towels_info')} />
            <MultilingualField label="Διαχείριση Σκουπιδιών & Ανακύκλωση" value={form.trash_info} onChange={set('trash_info')} />
            <TextField label="Τοποθεσία Κάδων Σκουπιδιών (Google Maps URL)" value={form.trash_maps_url} onChange={set('trash_maps_url')} placeholder="https://maps.google.com/…" type="url" />
            <MultilingualField label="Κανόνες Σπιτιού & Ώρες Κοινής Ησυχίας" value={form.house_rules} onChange={set('house_rules')} />
          </div>
        )}

        {/* 4. Μετακινήσεις & Μεταφορές */}
        {activeSection === 'mobility' && (
          <div className="flex flex-col gap-5">
            <SectionHeading title="Τοπικές Μετακινήσεις & Μεταφορές" subtitle="Πληροφορίες για αποθήκευση αποσκευών, λεωφορεία ΚΤΕΛ, ταξί, ενοικιάσεις αυτοκινήτων και transfers." />
            <MultilingualField label="Χώρος Αποθήκευσης Αποσκευών (Lockers)" value={form.luggage_storage_info} onChange={set('luggage_storage_info')} />
            <MultilingualField label="Αστικά & Υπεραστικά Λεωφορεία (ΚΤΕΛ)" value={form.bus_transport_info} onChange={set('bus_transport_info')} />
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <MultilingualField label="Πιάτσα Ταξί & Ραδιοταξί" value={form.taxi_station_info} onChange={set('taxi_station_info')} />
              <div className="flex flex-col justify-start">
                <TextField label="Τηλέφωνο Ταξί" value={form.taxi_phone} onChange={set('taxi_phone')} placeholder="+30 28310 25000" type="tel" />
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-stone-900">🚗 Ενοικιάσεις Αυτοκινήτων</span>
                <button
                  type="button"
                  onClick={() => setShowProModal('Ενοικιάσεις Αυτοκινήτων & Δικά σας Affiliate Links')}
                  className="flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-1 text-[11px] font-bold text-amber-800 hover:bg-amber-100"
                >
                  <Crown className="h-3 w-3 text-amber-600" />
                  <span>Προσαρμοσμένο Affiliate (Pro)</span>
                </button>
              </div>
              <MultilingualField label="Οδηγίες & Προτάσεις Ενοικίασης Αυτοκινήτου" value={form.car_rentals_info} onChange={set('car_rentals_info')} />
              <TextField label="Σύνδεσμος Κράτησης Ενοικίασης (Booking URL)" value={form.car_rentals_booking_url} onChange={set('car_rentals_booking_url')} placeholder="https://sevenrental.gr" type="url" />
            </div>

            <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-stone-900">🚐 Μεταφορές από/προς Αεροδρόμια & Λιμάνια (Transfers)</span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">Περιλαμβάνεται Δωρεάν</span>
              </div>
              <MultilingualField label="Οδηγίες Μεταφοράς & Σημεία Παραλαβής" value={form.transfers_info} onChange={set('transfers_info')} />
            </div>
          </div>
        )}

        {/* 5. Έκτακτη Ανάγκη & Ασφάλεια */}
        {activeSection === 'safety' && (
          <div className="flex flex-col gap-5">
            <SectionHeading title="Έκτακτη Ανάγκη, Φαρμακεία & Πρώτες Βοήθειες" subtitle="Κρίσιμες πληροφορίες ασφάλειας που εμφανίζονται στην καρτέλα Υποστήριξης του επισκέπτη." />
            <MultilingualField label="Ακριβής Τοποθεσία Κουτιού Πρώτων Βοηθειών (First Aid Kit)" value={form.first_aid_location} onChange={set('first_aid_location')} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField label="Τηλέφωνο Εφημερεύοντος Φαρμακείου" value={form.pharmacy_phone} onChange={set('pharmacy_phone')} placeholder="+30 28310 12345" type="tel" />
              <TextField label="Σύνδεσμος Εύρεσης Εφημερευόντων Φαρμακείων (URL)" value={form.pharmacy_finder_url} onChange={set('pharmacy_finder_url')} placeholder="https://…" type="url" />
            </div>
          </div>
        )}

        {/* 6. Προτάσεις & Σημεία (Explore Places) */}
        {activeSection === 'places' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <SectionHeading
                title="Προτάσεις, Παραλίες & Αξιοθέατα"
                subtitle="Διαχειριστείτε παραλίες, ταβέρνες, σούπερ μάρκετ, νυχτερινή ζωή και σημεία ενδιαφέροντος."
              />
              <button
                type="button"
                onClick={() => setEditingPlace(emptyPlace())}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4" />
                Προσθήκη Νέου Σημείου
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                type="button"
                onClick={() => setSelectedCategoryFilter('all')}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  selectedCategoryFilter === 'all' ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 border border-stone-200'
                }`}
              >
                Όλα τα Σημεία ({places.length})
              </button>
              {CATEGORY_OPTIONS.map((cat) => {
                const count = places.filter((p) => p.category === cat.value).length;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setSelectedCategoryFilter(cat.value)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${
                      selectedCategoryFilter === cat.value ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 border border-stone-200'
                    }`}
                  >
                    {cat.label} ({count})
                  </button>
                );
              })}
            </div>

            {loadingPlaces ? (
              <div className="flex items-center justify-center py-12 text-stone-400">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : filteredPlaces.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-400">
                Δεν βρέθηκαν σημεία σε αυτή την κατηγορία. Πατήστε "Προσθήκη Νέου Σημείου" για να δημιουργήσετε.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPlaces.map((place) => (
                  <div key={place.id} className="flex flex-col justify-between overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                    <div>
                      {place.image_url ? (
                        <div className="h-36 w-full bg-cover bg-center" style={{ backgroundImage: `url(${place.image_url})` }} />
                      ) : (
                        <div className="flex h-36 w-full items-center justify-center bg-stone-100 text-stone-400 text-xs">
                          Χωρίς Φωτογραφία
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                            {CATEGORY_OPTIONS.find((c) => c.value === place.category)?.label.split(' ')[1]}
                          </span>
                          {place.google_rating && (
                            <span className="flex items-center gap-0.5 text-xs font-bold text-amber-600">
                              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                              {place.google_rating}
                            </span>
                          )}
                        </div>
                        <h3 className="mt-1 text-base font-bold text-stone-900">{place.name}</h3>
                        <p className="mt-1 line-clamp-2 text-xs text-stone-500">{place.description.el || place.description.en || '—'}</p>
                      </div>
                    </div>
                    <div className="flex border-t border-stone-100 p-2 gap-2 bg-stone-50">
                      <button
                        type="button"
                        onClick={() => setEditingPlace(place)}
                        className="flex-1 rounded-lg bg-white border border-stone-200 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100"
                      >
                        Επεξεργασία
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePlace(place.id, place.name)}
                        className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
                        title="Διαγραφή"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 7. AI Βοηθός Επισκεπτών */}
        {activeSection === 'ai' && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <SectionHeading
                title="Βάση Γνώσης AI Βοηθού Επισκεπτών (AI Concierge)"
                subtitle="Προσθέστε ειδικές οδηγίες, μυστικά tips και πληροφορίες για αυτό το σπίτι. Ο AI βοηθός θα τις χρησιμοποιεί για να απαντά άμεσα στους επισκέπτες σας 24/7."
              />
              <button
                type="button"
                onClick={() => setShowProModal('24/7 AI Concierge Βοηθός')}
                className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-95"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI Pro Προσθήκη</span>
              </button>
            </div>

            <div className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-sm">
              <FieldLabel hint="Ιδιαιτερότητες σπιτιού, οδηγίες θερμοσίφωνα, ανακύκλωση, μυστικά tips...">
                Ειδικές Οδηγίες & Γνώση για το AI
              </FieldLabel>
              <textarea
                rows={10}
                value={form.ai_custom_instructions}
                onChange={(e) => set('ai_custom_instructions')(e.target.value)}
                placeholder="Παράδειγμα:&#10;- Ο διακόπτης για το ζεστό νερό βρίσκεται αριστερά από την πόρτα του μπάνιου.&#10;- Ο μπλε κάδος ανακύκλωσης αδειάζει κάθε Τρίτη πρωί.&#10;- Ο καλύτερος κοντινός φούρνος απέχει μόλις 80μ. στα δεξιά.&#10;- Για νυχτερινή άφιξη: η κλειδοθήκη φωτίζεται από φωτοκύτταρο."
                className={FIELD_CLASS + ' mt-2'}
              />
            </div>
          </div>
        )}
      </div>

      {/* Κάτω Μπάρα Αποθήκευσης */}
      {activeSection !== 'places' && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200/60 bg-white/95 backdrop-blur-xl">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-3.5">
            <p className="hidden text-xs text-stone-500 sm:block">
              {form.id ? `Επεξεργασία καταλύματος: ${form.name}` : 'Δημιουργία νέου καταλύματος.'}
            </p>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="ml-auto flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-md transition-opacity disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #10B981, #047857)' }}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Αποθήκευση…' : form.id ? 'Αποθήκευση Αλλαγών' : 'Δημιουργία Καταλύματος'}
            </button>
          </div>
        </div>
      )}

      {/* Pro Αναβάθμιση Modal */}
      {showProModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <Crown className="h-5 w-5" />
              </div>
              <button type="button" onClick={() => setShowProModal(null)} className="text-stone-400 hover:text-stone-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <h3 className="mt-4 text-lg font-bold text-stone-900">{showProModal}</h3>
            <p className="mt-1 text-xs leading-relaxed text-stone-500">
              Ξεκλειδώστε την πλήρη αυτονομία στο κατάλυμά σας. Προσθέστε τις δικές σας συμφωνίες ή ενεργοποιήστε τον έξυπνο AI βοηθό που απαντά στους επισκέπτες 24/7.
            </p>

            <div className="mt-4 flex flex-col gap-2 rounded-2xl bg-stone-50 p-3.5 text-xs text-stone-700">
              <span className="flex items-center gap-2 font-medium"><Check className="h-3.5 w-3.5 text-emerald-600" /> Δικά σας προσαρμοσμένα links & τηλέφωνα</span>
              <span className="flex items-center gap-2 font-medium"><Check className="h-3.5 w-3.5 text-emerald-600" /> 24/7 AI Concierge Chatbot για επισκέπτες</span>
              <span className="flex items-center gap-2 font-medium"><Check className="h-3.5 w-3.5 text-emerald-600" /> Άμεση ενεργοποίηση χωρίς συμβόλαια</span>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowProModal(null)}
                className="flex-1 rounded-xl border border-stone-200 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50"
              >
                Κλείσιμο
              </button>
              <button
                type="button"
                onClick={() => {
                  pushToast('success', 'Το αίτημά σας καταγράφηκε! Θα επικοινωνήσουμε μαζί σας.');
                  setShowProModal(null);
                }}
                className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700"
              >
                Ενεργοποίηση Pro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Παράθυρο Προσθήκης / Επεξεργασίας Σημείου */}
      {editingPlace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
              <h3 className="text-base font-bold text-stone-900">{editingPlace.id ? 'Επεξεργασία Σημείου' : 'Προσθήκη Νέου Σημείου'}</h3>
              <button type="button" onClick={() => setEditingPlace(null)} className="text-stone-400 hover:text-stone-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-stone-500">Κατηγορία</label>
                <select
                  value={editingPlace.category}
                  onChange={(e) => setEditingPlace({ ...editingPlace, category: e.target.value as PlaceCategory })}
                  className={FIELD_CLASS + ' mt-1'}
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <TextField
                label="Όνομα Σημείου / Επιχείρησης"
                value={editingPlace.name}
                onChange={(val) => setEditingPlace({ ...editingPlace, name: val })}
                placeholder="π.χ. Παραδοσιακός Φούρνος & Καφέ"
              />

              <MultilingualField
                label="Περιγραφή"
                value={editingPlace.description}
                onChange={(val) => setEditingPlace({ ...editingPlace, description: val })}
              />

              <FileUploadField
                label="Φωτογραφία Σημείου"
                value={editingPlace.image_url}
                onChange={(val) => setEditingPlace({ ...editingPlace, image_url: val })}
                onToast={pushToast}
                hint="PNG, JPG, WEBP από τη συσκευή σας"
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField
                  label="Βαθμολογία Google (1.0 - 5.0)"
                  value={editingPlace.google_rating}
                  onChange={(val) => setEditingPlace({ ...editingPlace, google_rating: val })}
                  placeholder="4.8"
                />
                <TextField
                  label="Τηλέφωνο Επικοινωνίας"
                  value={editingPlace.phone}
                  onChange={(val) => setEditingPlace({ ...editingPlace, phone: val })}
                  placeholder="+30 28310 12345"
                  type="tel"
                />
              </div>

              <TextField
                label="Διεύθυνση / Τοποθεσία στο Google Maps"
                value={editingPlace.address}
                onChange={(val) => setEditingPlace({ ...editingPlace, address: val })}
                placeholder="π.χ. Αρκαδίου 15, Παλιά Πόλη"
              />

              {editingPlace.category === 'beaches' && (
                <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4 flex flex-col gap-3">
                  <span className="text-xs font-bold uppercase text-sky-800">🏖️ Ρυθμίσεις Ανέμου Παραλίας</span>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-stone-500">Κατάσταση Ανέμου</label>
                      <select
                        value={editingPlace.wind_status}
                        onChange={(e) =>
                          setEditingPlace({
                            ...editingPlace,
                            wind_status: e.target.value as 'sheltered' | 'exposed' | '',
                          })
                        }
                        className={FIELD_CLASS + ' mt-1'}
                      >
                        <option value="">Προεπιλογή (Χωρίς σήμανση)</option>
                        <option value="sheltered">🛡️ Απάνεμη (Ιδανική όταν φυσάει)</option>
                        <option value="exposed">💨 Εκτεθειμένη στον άνεμο</option>
                      </select>
                    </div>
                    <TextField
                      label="Σημείωση Ανέμου"
                      value={editingPlace.wind_note}
                      onChange={(val) => setEditingPlace({ ...editingPlace, wind_note: val })}
                      placeholder="π.χ. Προστατεύεται από τους βοριάδες"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-stone-200 bg-stone-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setEditingPlace(null)}
                className="rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-100"
              >
                Ακύρωση
              </button>
              <button
                type="button"
                onClick={handleSavePlace}
                disabled={savingPlace}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-60"
              >
                {savingPlace && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingPlace.id ? 'Αποθήκευση Αλλαγών' : 'Προσθήκη Σημείου'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}