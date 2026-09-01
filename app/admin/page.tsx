'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
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
  MapPin,
  Phone,
  Plus,
  Save,
  Sparkles,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

interface BilingualValue {
  en: string;
  el: string;
  rest?: Record<string, string>;
}

function emptyBilingual(): BilingualValue {
  return { en: '', el: '' };
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
  { value: 'beaches', label: '🏖️ Beaches & Weather' },
  { value: 'groceries', label: '🥖 Bakery & Supermarkets' },
  { value: 'food', label: '🍽️ Food & Taverns' },
  { value: 'nightlife', label: '🍸 Bars & Nightlife' },
  { value: 'gyms', label: '💪 Gyms & Pools' },
  { value: 'culture', label: '🏛️ Sights & Culture' },
  { value: 'activities', label: '🥾 Activities & Cruises' },
  { value: 'rentals', label: '🚗 Rentals & Transfers' },
];

export interface PlaceItem {
  id: string;
  category: PlaceCategory;
  name: string;
  description: BilingualValue;
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
    category: 'food',
    name: '',
    description: emptyBilingual(),
    image_url: '',
    google_rating: '4.8',
    wind_status: '',
    wind_note: '',
    phone: '',
    address: '',
  };
}

export interface EmergencyContact {
  label: string;
  phone: string;
  maps_query?: string;
}

interface PropertyFormState {
  id: string | null;

  // --- Section 1: Basic info & Host ---
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

  // --- Section 2: Arrival & Logistics ---
  building_access: BilingualValue;
  elevator_info: BilingualValue;
  parking_info: BilingualValue;
  parking_maps_url: string;
  late_arrival_info: BilingualValue;
  checkin_steps_text: string;
  checkout_steps_text: string;

  // --- Section 3: House manual ---
  tap_water_info: BilingualValue;
  plumbing_rules: BilingualValue;
  sockets_appliances_info: BilingualValue;
  tv_streaming_info: BilingualValue;
  coffee_supplies_info: BilingualValue;
  kitchen_appliances_info: BilingualValue;
  laundry_info: BilingualValue;
  dishwasher_info: BilingualValue;
  hot_water_info: BilingualValue;
  amenities_info: BilingualValue;
  linens_towels_info: BilingualValue;
  trash_info: BilingualValue;
  trash_maps_url: string;
  house_rules: BilingualValue;

  // --- Section 4: Mobility & Safety ---
  luggage_storage_info: BilingualValue;
  bus_transport_info: BilingualValue;
  taxi_station_info: BilingualValue;
  taxi_phone: string;
  rentals_booking_url: string;
  first_aid_location: BilingualValue;
  pharmacy_phone: string;
  pharmacy_finder_url: string;

  // --- Section 5: AI Knowledge Base ---
  ai_custom_instructions: string;
}

type SectionKey = 'basic' | 'arrival' | 'manual' | 'mobility' | 'safety' | 'places' | 'ai';

interface ToastItem {
  id: number;
  type: 'success' | 'error';
  message: string;
}

/* ------------------------------------------------------------------ */
/*  Static config                                                     */
/* ------------------------------------------------------------------ */

const SECTIONS: { key: SectionKey; label: string; icon: typeof HomeIcon }[] = [
  { key: 'basic', label: 'Basic & Host Info', icon: HomeIcon },
  { key: 'arrival', label: 'Arrival & Lockbox', icon: DoorOpen },
  { key: 'manual', label: 'House Manual', icon: BookOpen },
  { key: 'mobility', label: 'Local Mobility', icon: LifeBuoy },
  { key: 'safety', label: 'Emergency & Safety', icon: Phone },
  { key: 'places', label: 'Explore Places', icon: Compass },
  { key: 'ai', label: 'AI Concierge Knowledge', icon: Bot },
];

const FIELD_CLASS =
  'w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm outline-none transition-colors placeholder:text-stone-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20';

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
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

    building_access: emptyBilingual(),
    elevator_info: emptyBilingual(),
    parking_info: emptyBilingual(),
    parking_maps_url: '',
    late_arrival_info: emptyBilingual(),
    checkin_steps_text: '',
    checkout_steps_text: '',

    tap_water_info: emptyBilingual(),
    plumbing_rules: emptyBilingual(),
    sockets_appliances_info: emptyBilingual(),
    tv_streaming_info: emptyBilingual(),
    coffee_supplies_info: emptyBilingual(),
    kitchen_appliances_info: emptyBilingual(),
    laundry_info: emptyBilingual(),
    dishwasher_info: emptyBilingual(),
    hot_water_info: emptyBilingual(),
    amenities_info: emptyBilingual(),
    linens_towels_info: emptyBilingual(),
    trash_info: emptyBilingual(),
    trash_maps_url: '',
    house_rules: emptyBilingual(),

    luggage_storage_info: emptyBilingual(),
    bus_transport_info: emptyBilingual(),
    taxi_station_info: emptyBilingual(),
    taxi_phone: '',
    rentals_booking_url: '',
    first_aid_location: emptyBilingual(),
    pharmacy_phone: '',
    pharmacy_finder_url: '',

    ai_custom_instructions: '',
  };
}

function toBilingual(raw: unknown): BilingualValue {
  if (raw == null) return emptyBilingual();
  if (typeof raw === 'string') return { en: raw, el: '' };
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    const obj = raw as Record<string, string>;
    const { en, el, ...rest } = obj;
    return { en: en ?? '', el: el ?? '', rest: Object.keys(rest).length > 0 ? rest : undefined };
  }
  return emptyBilingual();
}

function fromBilingual(value: BilingualValue): Record<string, string> | null {
  const merged: Record<string, string> = { ...(value.rest ?? {}) };
  if (value.en.trim()) merged.en = value.en.trim();
  if (value.el.trim()) merged.el = value.el.trim();
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

    building_access: toBilingual(row.building_access),
    elevator_info: toBilingual(row.elevator_info),
    parking_info: toBilingual(row.parking_info),
    parking_maps_url: str('parking_maps_url'),
    late_arrival_info: toBilingual(row.late_arrival_info),
    checkin_steps_text: stepsToStr(row.checkin_steps),
    checkout_steps_text: stepsToStr(row.checkout_steps),

    tap_water_info: toBilingual(row.tap_water_info),
    plumbing_rules: toBilingual(row.plumbing_rules),
    sockets_appliances_info: toBilingual(row.sockets_appliances_info),
    tv_streaming_info: toBilingual(row.tv_streaming_info),
    coffee_supplies_info: toBilingual(row.coffee_supplies_info),
    kitchen_appliances_info: toBilingual(row.kitchen_appliances_info),
    laundry_info: toBilingual(row.laundry_info),
    dishwasher_info: toBilingual(row.dishwasher_info),
    hot_water_info: toBilingual(row.hot_water_info),
    amenities_info: toBilingual(row.amenities_info),
    linens_towels_info: toBilingual(row.linens_towels_info),
    trash_info: toBilingual(row.trash_info),
    trash_maps_url: str('trash_maps_url'),
    house_rules: toBilingual(row.house_rules),

    luggage_storage_info: toBilingual(row.luggage_storage_info),
    bus_transport_info: toBilingual(row.bus_transport_info),
    taxi_station_info: toBilingual(row.taxi_station_info),
    taxi_phone: str('taxi_phone'),
    rentals_booking_url: str('rentals_booking_url'),
    first_aid_location: toBilingual(row.first_aid_location),
    pharmacy_phone: str('pharmacy_phone'),
    pharmacy_finder_url: str('pharmacy_finder_url'),

    ai_custom_instructions: str('ai_custom_instructions'),
  };
}

function formToPayload(form: PropertyFormState): Record<string, unknown> {
  const parseLines = (text: string): string[] | null => {
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    return lines.length > 0 ? lines : null;
  };

  return {
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

    building_access: fromBilingual(form.building_access),
    elevator_info: fromBilingual(form.elevator_info),
    parking_info: fromBilingual(form.parking_info),
    parking_maps_url: fromText(form.parking_maps_url),
    late_arrival_info: fromBilingual(form.late_arrival_info),
    checkin_steps: parseLines(form.checkin_steps_text),
    checkout_steps: parseLines(form.checkout_steps_text),

    tap_water_info: fromBilingual(form.tap_water_info),
    plumbing_rules: fromBilingual(form.plumbing_rules),
    sockets_appliances_info: fromBilingual(form.sockets_appliances_info),
    tv_streaming_info: fromBilingual(form.tv_streaming_info),
    coffee_supplies_info: fromBilingual(form.coffee_supplies_info),
    kitchen_appliances_info: fromBilingual(form.kitchen_appliances_info),
    laundry_info: fromBilingual(form.laundry_info),
    dishwasher_info: fromBilingual(form.dishwasher_info),
    hot_water_info: fromBilingual(form.hot_water_info),
    amenities_info: fromBilingual(form.amenities_info),
    linens_towels_info: fromBilingual(form.linens_towels_info),
    trash_info: fromBilingual(form.trash_info),
    trash_maps_url: fromText(form.trash_maps_url),
    house_rules: fromBilingual(form.house_rules),

    luggage_storage_info: fromBilingual(form.luggage_storage_info),
    bus_transport_info: fromBilingual(form.bus_transport_info),
    taxi_station_info: fromBilingual(form.taxi_station_info),
    taxi_phone: fromText(form.taxi_phone),
    rentals_booking_url: fromText(form.rentals_booking_url),
    first_aid_location: fromBilingual(form.first_aid_location),
    pharmacy_phone: fromText(form.pharmacy_phone),
    pharmacy_finder_url: fromText(form.pharmacy_finder_url),

    ai_custom_instructions: fromText(form.ai_custom_instructions),
  };
}

/* ------------------------------------------------------------------ */
/*  Form Controls                                                     */
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

function BilingualField({
  label,
  value,
  onChange,
  multiline = true,
  hint,
}: {
  label: string;
  value: BilingualValue;
  onChange: (value: BilingualValue) => void;
  multiline?: boolean;
  hint?: string;
}) {
  const baseClass = FIELD_CLASS + (multiline ? ' resize-y' : '');
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-stone-200/70 bg-white p-4 shadow-sm shadow-stone-900/5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-stone-900">{label}</span>
        {hint && <span className="text-[11px] text-stone-400">{hint}</span>}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <span className="inline-flex w-fit items-center rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-stone-500">
            EN
          </span>
          {multiline ? (
            <textarea
              rows={3}
              value={value.en}
              onChange={(e) => onChange({ ...value, en: e.target.value })}
              placeholder="English text"
              className={baseClass}
            />
          ) : (
            <input
              type="text"
              value={value.en}
              onChange={(e) => onChange({ ...value, en: e.target.value })}
              placeholder="English text"
              className={baseClass}
            />
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="inline-flex w-fit items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
            EL
          </span>
          {multiline ? (
            <textarea
              rows={3}
              value={value.el}
              onChange={(e) => onChange({ ...value, el: e.target.value })}
              placeholder="Ελληνικό κείμενο"
              className={baseClass}
            />
          ) : (
            <input
              type="text"
              value={value.el}
              onChange={(e) => onChange({ ...value, el: e.target.value })}
              placeholder="Ελληνικό κείμενο"
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
/*  Main Component                                                    */
/* ------------------------------------------------------------------ */

export default function AdminPage() {
  const [propertyList, setPropertyList] = useState<PropertySummary[]>([]);
  const [form, setForm] = useState<PropertyFormState>(emptyForm());
  const [activeSection, setActiveSection] = useState<SectionKey>('basic');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingProperty, setLoadingProperty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Places
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

  const loadPropertyList = useCallback(async () => {
    setLoadingList(true);
    const { data, error } = await supabase.from('properties').select('id, name, slug').order('name', { ascending: true });
    setLoadingList(false);
    if (error) {
      pushToast('error', `Could not load properties: ${error.message}`);
      return;
    }
    const list = (data as PropertySummary[]) ?? [];
    setPropertyList(list);
    if (list.length > 0 && !form.id) {
      handleSelectProperty(list[0].id);
    }
  }, [pushToast]);

  const loadPlaces = useCallback(async () => {
    setLoadingPlaces(true);
    const { data, error } = await supabase.from('places').select('*').order('name', { ascending: true });
    setLoadingPlaces(false);
    if (error) {
      pushToast('error', `Could not load places: ${error.message}`);
      return;
    }
    const mapped: PlaceItem[] = ((data as Record<string, unknown>[]) ?? []).map((row) => ({
      id: String(row.id),
      category: row.category as PlaceCategory,
      name: String(row.name ?? ''),
      description: toBilingual(row.description),
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
    loadPropertyList();
    loadPlaces();
  }, [loadPropertyList, loadPlaces]);

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
        pushToast('error', `Could not load that property: ${error?.message ?? 'not found'}`);
        return;
      }
      setForm(rowToForm(data as Record<string, unknown>));
    },
    [pushToast],
  );

  const handleCreateNew = useCallback(() => {
    setForm(emptyForm());
    setActiveSection('basic');
  }, []);

  const handleSave = useCallback(async () => {
    if (!form.name.trim()) {
      pushToast('error', 'Please enter a property name before saving.');
      setActiveSection('basic');
      return;
    }
    if (!form.slug.trim()) {
      pushToast('error', 'Please enter a URL slug before saving.');
      setActiveSection('basic');
      return;
    }

    setSaving(true);
    const payload = formToPayload(form);

    try {
      if (form.id) {
        const { data, error } = await supabase.from('properties').update(payload).eq('id', form.id).select().single();
        if (error) throw error;
        setForm(rowToForm(data as Record<string, unknown>));
        pushToast('success', `${form.name} was updated successfully.`);
      } else {
        const { data, error } = await supabase.from('properties').insert(payload).select().single();
        if (error) throw error;
        setForm(rowToForm(data as Record<string, unknown>));
        pushToast('success', `${form.name} was created successfully.`);
      }
      await loadPropertyList();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong while saving.';
      pushToast('error', message);
    } finally {
      setSaving(false);
    }
  }, [form, loadPropertyList, pushToast]);

  const handleSavePlace = useCallback(async () => {
    if (!editingPlace) return;
    if (!editingPlace.name.trim()) {
      pushToast('error', 'Please enter a place name.');
      return;
    }

    setSavingPlace(true);
    const payload = {
      category: editingPlace.category,
      name: editingPlace.name.trim(),
      description: fromBilingual(editingPlace.description),
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
        pushToast('success', `"${editingPlace.name}" updated successfully.`);
      } else {
        const { error } = await supabase.from('places').insert(payload);
        if (error) throw error;
        pushToast('success', `"${editingPlace.name}" added successfully.`);
      }
      setEditingPlace(null);
      await loadPlaces();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not save place.';
      pushToast('error', message);
    } finally {
      setSavingPlace(false);
    }
  }, [editingPlace, loadPlaces, pushToast]);

  const handleDeletePlace = useCallback(
    async (id: string, name: string) => {
      if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
      const { error } = await supabase.from('places').delete().eq('id', id);
      if (error) {
        pushToast('error', `Could not delete place: ${error.message}`);
        return;
      }
      pushToast('success', `"${name}" was deleted.`);
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

  return (
    <div className="min-h-screen bg-[#F7F4EC] pb-28 text-stone-900">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-stone-200/60 bg-[#F7F4EC]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-stone-900">Hostkey Admin Control</h1>
              <p className="text-xs text-stone-500">Manage all guest portal data, contacts, manual & AI knowledge</p>
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
                <option value="">{loadingList ? 'Loading properties…' : '— Select a property —'}</option>
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
              Create New Property
            </button>

            {liveGuideHref && (
              <a
                href={liveGuideHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-500/20"
              >
                🔗 View Live Guide
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>

        {/* Section Tabs */}
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

      {/* Form Content */}
      <div className="mx-auto max-w-5xl px-5 pt-6">
        {/* 1. Basic & Host Info */}
        {activeSection === 'basic' && (
          <div className="flex flex-col gap-6">
            <SectionHeading
              title="Basic Info & Host Contacts"
              subtitle="Identification, address, Wi-Fi and direct host channels (used in Direct Support & Help modal)."
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField label="Property Name" value={form.name} onChange={set('name')} placeholder="Rethymno Luxury Suite" />
              <div className="flex flex-col gap-1.5">
                <FieldLabel hint="URL identifier">Slug</FieldLabel>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => set('slug')(slugify(e.target.value))}
                    placeholder="rethymno-luxury-suite"
                    className={FIELD_CLASS}
                  />
                  <button
                    type="button"
                    onClick={() => set('slug')(slugify(form.name))}
                    disabled={!form.name.trim()}
                    className="shrink-0 rounded-xl border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-600 transition-colors hover:bg-stone-50 disabled:opacity-40"
                  >
                    Generate
                  </button>
                </div>
              </div>
            </div>

            <TextField label="Address" value={form.address} onChange={set('address')} placeholder="12 Arkadiou Street, Rethymno, Crete" />
            <TextField label="Cover Image URL" value={form.cover_image} onChange={set('cover_image')} placeholder="https://…" type="url" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <TextField label="Smart Lock / Keysafe Code" value={form.keysafe_code} onChange={set('keysafe_code')} placeholder="4821" />
              <TextField label="Wi-Fi SSID" value={form.wifi_ssid} onChange={set('wifi_ssid')} placeholder="Suite_5G" />
              <TextField label="Wi-Fi Password" value={form.wifi_password} onChange={set('wifi_password')} placeholder="••••••••" />
            </div>

            <div className="mt-2 rounded-2xl border border-stone-200/70 bg-white p-5 shadow-sm shadow-stone-900/5">
              <p className="mb-3 text-sm font-bold text-stone-900">Direct Host Support & Contact Details</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField label="Host Display Name" value={form.host_name} onChange={set('host_name')} placeholder="Maria" />
                <TextField label="Host Avatar URL" value={form.host_avatar_url} onChange={set('host_avatar_url')} placeholder="https://…" type="url" />
                <TextField label="Host Phone (Call)" value={form.host_phone} onChange={set('host_phone')} placeholder="+30 690 000 0000" type="tel" />
                <TextField label="Host WhatsApp Number" value={form.whatsapp_number} onChange={set('whatsapp_number')} placeholder="+30 690 000 0000" type="tel" />
                <TextField label="Host Email" value={form.host_email} onChange={set('host_email')} placeholder="maria@hostkey.gr" type="email" />
              </div>
            </div>
          </div>
        )}

        {/* 2. Arrival & Lockbox */}
        {activeSection === 'arrival' && (
          <div className="flex flex-col gap-5">
            <SectionHeading
              title="Arrival, Lockbox & Check-in / Out"
              subtitle="Timetables, entrance instructions, parking and interactive step guides."
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField label="Check-in Time" value={form.check_in_time} onChange={set('check_in_time')} placeholder="15:00" />
              <TextField label="Check-out Time" value={form.check_out_time} onChange={set('check_out_time')} placeholder="11:00" />
            </div>

            <BilingualField label="Building & Elevator Access Instructions" value={form.building_access} onChange={set('building_access')} />
            <BilingualField label="Elevator Specific Info" value={form.elevator_info} onChange={set('elevator_info')} />
            <BilingualField label="Parking Instructions" value={form.parking_info} onChange={set('parking_info')} />
            <TextField label="Parking — Google Maps URL" value={form.parking_maps_url} onChange={set('parking_maps_url')} placeholder="https://maps.google.com/…" type="url" />
            <BilingualField label="Late Arrival Instructions" value={form.late_arrival_info} onChange={set('late_arrival_info')} />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5 rounded-2xl border border-stone-200/70 bg-white p-4">
                <FieldLabel hint="One step per line">Check-in Steps (Drawer Modal)</FieldLabel>
                <textarea
                  rows={4}
                  value={form.checkin_steps_text}
                  onChange={(e) => set('checkin_steps_text')(e.target.value)}
                  placeholder="Arrive anytime after 15:00...&#10;Open lockbox with code...&#10;Keys are inside..."
                  className={FIELD_CLASS}
                />
              </div>

              <div className="flex flex-col gap-1.5 rounded-2xl border border-stone-200/70 bg-white p-4">
                <FieldLabel hint="One step per line">Check-out Steps (Drawer Modal)</FieldLabel>
                <textarea
                  rows={4}
                  value={form.checkout_steps_text}
                  onChange={(e) => set('checkout_steps_text')(e.target.value)}
                  placeholder="Checkout is by 11:00...&#10;Turn off AC & lights...&#10;Leave keys in lockbox..."
                  className={FIELD_CLASS}
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. House Manual */}
        {activeSection === 'manual' && (
          <div className="flex flex-col gap-5">
            <SectionHeading title="Apartment House Manual" subtitle="Every accordion guide inside the manual tab — bilingual (EN / EL)." />
            <BilingualField label="Tap Water & Drinking Guide" value={form.tap_water_info} onChange={set('tap_water_info')} />
            <BilingualField label="Plumbing & Toilet Paper Rules" value={form.plumbing_rules} onChange={set('plumbing_rules')} />
            <BilingualField label="Electrical Sockets & Voltage" value={form.sockets_appliances_info} onChange={set('sockets_appliances_info')} />
            <BilingualField label="TV & Streaming Apps" value={form.tv_streaming_info} onChange={set('tv_streaming_info')} />
            <BilingualField label="Coffee Machine & Supplies" value={form.coffee_supplies_info} onChange={set('coffee_supplies_info')} />
            <BilingualField label="Stove, Oven & Microwave" value={form.kitchen_appliances_info} onChange={set('kitchen_appliances_info')} />
            <BilingualField label="Washing Machine & Laundry" value={form.laundry_info} onChange={set('laundry_info')} />
            <BilingualField label="Dishwasher Guide" value={form.dishwasher_info} onChange={set('dishwasher_info')} />
            <BilingualField label="Hot Water / Solar Boiler" value={form.hot_water_info} onChange={set('hot_water_info')} />
            <BilingualField label="Air Conditioning & Heating" value={form.amenities_info} onChange={set('amenities_info')} />
            <BilingualField label="Extra Linens, Towels & Pillows" value={form.linens_towels_info} onChange={set('linens_towels_info')} />
            <BilingualField label="Trash & Recycling Instructions" value={form.trash_info} onChange={set('trash_info')} />
            <TextField label="Trash Bins — Google Maps Pin URL" value={form.trash_maps_url} onChange={set('trash_maps_url')} placeholder="https://maps.google.com/…" type="url" />
            <BilingualField label="House Rules & Quiet Hours" value={form.house_rules} onChange={set('house_rules')} />
          </div>
        )}

        {/* 4. Local Mobility */}
        {activeSection === 'mobility' && (
          <div className="flex flex-col gap-5">
            <SectionHeading title="Local Mobility & Transport" subtitle="Information cards for baggage, public buses, taxi stands and vehicle rentals." />
            <BilingualField label="Luggage Storage Lockers Info" value={form.luggage_storage_info} onChange={set('luggage_storage_info')} />
            <BilingualField label="Public Bus / KTEL Timetables & Info" value={form.bus_transport_info} onChange={set('bus_transport_info')} />
            <BilingualField label="Taxi Ranks & Radio-Taxi Info" value={form.taxi_station_info} onChange={set('taxi_station_info')} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField label="Taxi Phone" value={form.taxi_phone} onChange={set('taxi_phone')} placeholder="+30 28310 25000" type="tel" />
              <TextField label="Car & Transfer Booking URL" value={form.rentals_booking_url} onChange={set('rentals_booking_url')} placeholder="https://…" type="url" />
            </div>
          </div>
        )}

        {/* 5. Emergency & Safety */}
        {activeSection === 'safety' && (
          <div className="flex flex-col gap-5">
            <SectionHeading title="Emergency, Pharmacy & First Aid" subtitle="Safety information cards shown on the Support tab." />
            <BilingualField label="First Aid Kit Exact Location" value={form.first_aid_location} onChange={set('first_aid_location')} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField label="Duty Pharmacy Phone" value={form.pharmacy_phone} onChange={set('pharmacy_phone')} placeholder="+30 28310 12345" type="tel" />
              <TextField label="24/7 Pharmacy Finder URL" value={form.pharmacy_finder_url} onChange={set('pharmacy_finder_url')} placeholder="https://…" type="url" />
            </div>
          </div>
        )}

        {/* 6. Explore Places */}
        {activeSection === 'places' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <SectionHeading
                title="Explore Places & Spots"
                subtitle="Manage beaches, taverns, supermarkets, nightlife & cultural attractions."
              />
              <button
                type="button"
                onClick={() => setEditingPlace(emptyPlace())}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4" />
                Add New Place
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                type="button"
                onClick={() => setSelectedCategoryFilter('all')}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  selectedCategoryFilter === 'all' ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 border border-stone-200'
                }`}
              >
                All Spots ({places.length})
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

            {/* Places Grid */}
            {loadingPlaces ? (
              <div className="flex items-center justify-center py-12 text-stone-400">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : filteredPlaces.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-400">
                No places found for this category. Click "Add New Place" to create one.
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
                          No Image
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
                        <p className="mt-1 line-clamp-2 text-xs text-stone-500">{place.description.en || place.description.el || '—'}</p>
                      </div>
                    </div>
                    <div className="flex border-t border-stone-100 p-2 gap-2 bg-stone-50">
                      <button
                        type="button"
                        onClick={() => setEditingPlace(place)}
                        className="flex-1 rounded-lg bg-white border border-stone-200 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePlace(place.id, place.name)}
                        className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
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

        {/* 7. AI Concierge Knowledge */}
        {activeSection === 'ai' && (
          <div className="flex flex-col gap-5">
            <SectionHeading
              title="AI Concierge Knowledge Base"
              subtitle="Custom instructions and facts specific to this apartment. The AI Concierge chat will use this context to answer guests' questions."
            />
            <div className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-sm">
              <FieldLabel hint="Special quirks, secret tips, exact trash location, heating instructions...">
                Apartment AI Context & Knowledge
              </FieldLabel>
              <textarea
                rows={10}
                value={form.ai_custom_instructions}
                onChange={(e) => set('ai_custom_instructions')(e.target.value)}
                placeholder="Example:&#10;- The water heater booster switch is on the left of the bathroom door.&#10;- Recycling bins are collected every Tuesday morning.&#10;- The best nearby bakery is 'Veneto Bakery' 80m down the alley.&#10;- Late night check-in: keysafe code is illuminated with a torch."
                className={FIELD_CLASS + ' mt-2'}
              />
            </div>
          </div>
        )}
      </div>

      {/* Sticky Save Bar (for Property) */}
      {activeSection !== 'places' && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200/60 bg-white/95 backdrop-blur-xl">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-3.5">
            <p className="hidden text-xs text-stone-500 sm:block">
              {form.id ? `Editing property: ${form.name}` : 'Creating a new property.'}
            </p>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="ml-auto flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-md transition-opacity disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #10B981, #047857)' }}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Saving…' : form.id ? 'Save Changes' : 'Create Property'}
            </button>
          </div>
        </div>
      )}

      {/* Place Modal */}
      {editingPlace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
              <h3 className="text-base font-bold text-stone-900">{editingPlace.id ? 'Edit Place' : 'Add New Place'}</h3>
              <button type="button" onClick={() => setEditingPlace(null)} className="text-stone-400 hover:text-stone-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-stone-500">Category</label>
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
                label="Place Name"
                value={editingPlace.name}
                onChange={(val) => setEditingPlace({ ...editingPlace, name: val })}
                placeholder="e.g. Taverna Othonas"
              />

              <BilingualField
                label="Description"
                value={editingPlace.description}
                onChange={(val) => setEditingPlace({ ...editingPlace, description: val })}
              />

              <TextField
                label="Photo URL"
                value={editingPlace.image_url}
                onChange={(val) => setEditingPlace({ ...editingPlace, image_url: val })}
                placeholder="https://images.unsplash.com/…"
                type="url"
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField
                  label="Google Rating (1.0 - 5.0)"
                  value={editingPlace.google_rating}
                  onChange={(val) => setEditingPlace({ ...editingPlace, google_rating: val })}
                  placeholder="4.8"
                />
                <TextField
                  label="Phone Number"
                  value={editingPlace.phone}
                  onChange={(val) => setEditingPlace({ ...editingPlace, phone: val })}
                  placeholder="+30 28310 12345"
                  type="tel"
                />
              </div>

              <TextField
                label="Address / Location on Google Maps"
                value={editingPlace.address}
                onChange={(val) => setEditingPlace({ ...editingPlace, address: val })}
                placeholder="Petichaki Square 10, Rethymno"
              />

              {editingPlace.category === 'beaches' && (
                <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4 flex flex-col gap-3">
                  <span className="text-xs font-bold uppercase text-sky-800">🏖️ Beach Wind Settings</span>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-stone-500">Wind Status</label>
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
                        <option value="">Default (No badge)</option>
                        <option value="sheltered">🛡️ Sheltered (Best for windy days)</option>
                        <option value="exposed">💨 Exposed</option>
                      </select>
                    </div>
                    <TextField
                      label="Wind Note"
                      value={editingPlace.wind_note}
                      onChange={(val) => setEditingPlace({ ...editingPlace, wind_note: val })}
                      placeholder="e.g. Protected from North winds"
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
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePlace}
                disabled={savingPlace}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-60"
              >
                {savingPlace && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingPlace.id ? 'Save Changes' : 'Add Place'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}