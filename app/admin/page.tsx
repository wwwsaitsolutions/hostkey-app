'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  DoorOpen,
  ExternalLink,
  Home as HomeIcon,
  LifeBuoy,
  Loader2,
  Plus,
  Save,
  Sparkles,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

/** Editable bilingual (EN/EL) value. `rest` silently carries any other
 * language keys already present on the row (fr, de, ...) so saving from
 * this admin never clobbers translations added elsewhere. */
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

interface PropertyFormState {
  id: string | null;

  // --- Section 1: Basic info & access ---
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

  // --- Section 2: Arrival & logistics ---
  building_access: BilingualValue;
  elevator_info: BilingualValue;
  parking_info: BilingualValue;
  parking_maps_url: string;
  late_arrival_info: BilingualValue;

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

  // --- Section 4: Local mobility & safety ---
  luggage_storage_info: BilingualValue;
  bus_transport_info: BilingualValue;
  taxi_station_info: BilingualValue;
  taxi_phone: string;
  rentals_booking_url: string;
  first_aid_location: BilingualValue;
  pharmacy_phone: string;
  pharmacy_finder_url: string;
}

type SectionKey = 'basic' | 'arrival' | 'manual' | 'mobility';

interface ToastItem {
  id: number;
  type: 'success' | 'error';
  message: string;
}

/* ------------------------------------------------------------------ */
/*  Static config                                                      */
/* ------------------------------------------------------------------ */

const SECTIONS: { key: SectionKey; label: string; icon: typeof HomeIcon }[] = [
  { key: 'basic', label: 'Basic Info & Access', icon: HomeIcon },
  { key: 'arrival', label: 'Arrival & Logistics', icon: DoorOpen },
  { key: 'manual', label: 'House Manual', icon: BookOpen },
  { key: 'mobility', label: 'Local & Safety', icon: LifeBuoy },
];

const FIELD_CLASS =
  'w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm outline-none transition-colors placeholder:text-stone-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20';

/* ------------------------------------------------------------------ */
/*  Helpers — form <-> Supabase row conversion                         */
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
  };
}

/** Normalizes a Supabase column value (null, a legacy plain string, or a
 * `{ en, el, fr, ... }` jsonb object) into an editable BilingualValue,
 * preserving any language keys beyond EN/EL in `rest`. */
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

/** Serializes a BilingualValue back to a jsonb-ready object, merging in any
 * preserved non-EN/EL languages. Returns null when there is nothing to
 * store, so the column can be cleared out cleanly. */
function fromBilingual(value: BilingualValue): Record<string, string> | null {
  const merged: Record<string, string> = { ...(value.rest ?? {}) };
  if (value.en.trim()) merged.en = value.en.trim();
  if (value.el.trim()) merged.el = value.el.trim();
  return Object.keys(merged).length > 0 ? merged : null;
}

/** A plain text column: empty input becomes `null` so optional columns stay
 * clean rather than filling up with empty strings. */
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
  };
}

function formToPayload(form: PropertyFormState): Record<string, unknown> {
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
  };
}

/* ------------------------------------------------------------------ */
/*  Small reusable form controls                                       */
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

/** A single labeled card holding both EN and EL inputs for one bilingual
 * content field, side by side on wide screens. */
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

/* ------------------------------------------------------------------ */
/*  Toasts                                                             */
/* ------------------------------------------------------------------ */

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
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AdminPage() {
  const [propertyList, setPropertyList] = useState<PropertySummary[]>([]);
  const [form, setForm] = useState<PropertyFormState>(emptyForm());
  const [activeSection, setActiveSection] = useState<SectionKey>('basic');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingProperty, setLoadingProperty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

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
    setPropertyList((data as PropertySummary[]) ?? []);
  }, [pushToast]);

  useEffect(() => {
    loadPropertyList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectProperty = useCallback(
    async (id: string) => {
      if (!id) {
        setForm(emptyForm());
        setActiveSection('basic');
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
      setActiveSection('basic');
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

  const set = useCallback(<K extends keyof PropertyFormState>(key: K) => {
    return (value: PropertyFormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    };
  }, []);

  const liveGuideHref = useMemo(() => (form.slug.trim() ? `/${form.slug.trim()}` : null), [form.slug]);

  return (
    <div className="min-h-screen bg-[#F7F4EC] pb-24 text-stone-900">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      {/* Header + property selector */}
      <div className="sticky top-0 z-30 border-b border-stone-200/60 bg-[#F7F4EC]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-stone-900">Property Admin</h1>
              <p className="text-xs text-stone-500">Manage properties and their multi-language guidebook content</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex min-w-[220px] flex-1 items-center gap-2">
              <select
                value={form.id ?? ''}
                onChange={(e) => handleSelectProperty(e.target.value)}
                disabled={loadingList || loadingProperty}
                className={FIELD_CLASS + ' flex-1 disabled:opacity-60'}
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

          {!form.id && (
            <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs font-medium text-amber-800">
              <Sparkles className="h-3.5 w-3.5" />
              New property — fill in the details below and press Save to create it.
            </div>
          )}
        </div>

        {/* Section tabs */}
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

      {/* Form body */}
      <div className="mx-auto max-w-5xl px-5 pt-6">
        {activeSection === 'basic' && (
          <div className="flex flex-col gap-6">
            <SectionHeading title="Basic Info & Access" subtitle="Identity, address, self check-in credentials, and host contact details." />

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
                    Generate from name
                  </button>
                </div>
              </div>
            </div>

            <TextField label="Address" value={form.address} onChange={set('address')} placeholder="12 Arkadiou Street, Rethymno, Crete" />
            <TextField label="Cover Image URL" value={form.cover_image} onChange={set('cover_image')} placeholder="https://…" type="url" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField label="Check-in Time" value={form.check_in_time} onChange={set('check_in_time')} placeholder="15:00" />
              <TextField label="Check-out Time" value={form.check_out_time} onChange={set('check_out_time')} placeholder="11:00" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <TextField label="Smart Lock / Keysafe Code" value={form.keysafe_code} onChange={set('keysafe_code')} placeholder="4821" />
              <TextField label="Wi-Fi SSID" value={form.wifi_ssid} onChange={set('wifi_ssid')} placeholder="Suite_5G" />
              <TextField label="Wi-Fi Password" value={form.wifi_password} onChange={set('wifi_password')} placeholder="••••••••" />
            </div>

            <div className="mt-2 rounded-2xl border border-stone-200/70 bg-white p-4 shadow-sm shadow-stone-900/5">
              <p className="mb-3 text-sm font-semibold text-stone-900">Host Details</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField label="Host Name" value={form.host_name} onChange={set('host_name')} placeholder="Maria" />
                <TextField label="Host Avatar URL" value={form.host_avatar_url} onChange={set('host_avatar_url')} placeholder="https://…" type="url" />
                <TextField label="Host Phone" value={form.host_phone} onChange={set('host_phone')} placeholder="+30 690 000 0000" type="tel" />
                <TextField
                  label="Host WhatsApp"
                  value={form.whatsapp_number}
                  onChange={set('whatsapp_number')}
                  placeholder="+30 690 000 0000"
                  type="tel"
                />
                <TextField label="Host Email" value={form.host_email} onChange={set('host_email')} placeholder="maria@stayguide.gr" type="email" />
              </div>
            </div>
          </div>
        )}

        {activeSection === 'arrival' && (
          <div className="flex flex-col gap-5">
            <SectionHeading title="Arrival & Logistics" subtitle="Building access, parking, and late-arrival guidance — shown in English and Greek." />

            <BilingualField label="Building Access Instructions" value={form.building_access} onChange={set('building_access')} />
            <BilingualField label="Elevator Info" value={form.elevator_info} onChange={set('elevator_info')} />
            <BilingualField label="Parking Instructions" value={form.parking_info} onChange={set('parking_info')} />
            <TextField
              label="Parking — Google Maps URL"
              value={form.parking_maps_url}
              onChange={set('parking_maps_url')}
              placeholder="https://maps.google.com/…"
              type="url"
            />
            <BilingualField label="Late Arrival Instructions" value={form.late_arrival_info} onChange={set('late_arrival_info')} />
          </div>
        )}

        {activeSection === 'manual' && (
          <div className="flex flex-col gap-5">
            <SectionHeading title="House Manual" subtitle="Every apartment-manual accordion in the guest app — shown in English and Greek." />

            <BilingualField label="Tap Water & Drinking Guide" value={form.tap_water_info} onChange={set('tap_water_info')} />
            <BilingualField label="Plumbing & Toilet Paper Rules" value={form.plumbing_rules} onChange={set('plumbing_rules')} />
            <BilingualField label="Electrical Sockets & Appliances" value={form.sockets_appliances_info} onChange={set('sockets_appliances_info')} />
            <BilingualField label="TV & Streaming" value={form.tv_streaming_info} onChange={set('tv_streaming_info')} />
            <BilingualField label="Coffee Machine & Supplies" value={form.coffee_supplies_info} onChange={set('coffee_supplies_info')} />
            <BilingualField label="Kitchen Appliances" value={form.kitchen_appliances_info} onChange={set('kitchen_appliances_info')} />
            <BilingualField label="Washing Machine / Laundry" value={form.laundry_info} onChange={set('laundry_info')} />
            <BilingualField label="Dishwasher" value={form.dishwasher_info} onChange={set('dishwasher_info')} />
            <BilingualField label="Hot Water / Solar Boiler" value={form.hot_water_info} onChange={set('hot_water_info')} />
            <BilingualField label="Air Conditioning / Heating" value={form.amenities_info} onChange={set('amenities_info')} />
            <BilingualField label="Extra Linens & Towels" value={form.linens_towels_info} onChange={set('linens_towels_info')} />
            <BilingualField label="Trash Instructions" value={form.trash_info} onChange={set('trash_info')} />
            <TextField
              label="Trash — Google Maps URL"
              value={form.trash_maps_url}
              onChange={set('trash_maps_url')}
              placeholder="https://maps.google.com/…"
              type="url"
            />
            <BilingualField label="House Rules & Quiet Hours" value={form.house_rules} onChange={set('house_rules')} />
          </div>
        )}

        {activeSection === 'mobility' && (
          <div className="flex flex-col gap-5">
            <SectionHeading title="Local Mobility & Safety" subtitle="Getting around, transfers, and emergency information — shown in English and Greek." />

            <BilingualField label="Luggage Storage Info" value={form.luggage_storage_info} onChange={set('luggage_storage_info')} />
            <BilingualField label="Public Bus / KTEL Info" value={form.bus_transport_info} onChange={set('bus_transport_info')} />
            <BilingualField label="Taxi Station Info" value={form.taxi_station_info} onChange={set('taxi_station_info')} />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField label="Taxi Phone" value={form.taxi_phone} onChange={set('taxi_phone')} placeholder="+30 28310 00000" type="tel" />
              <TextField
                label="Car / Transfers Booking URL"
                value={form.rentals_booking_url}
                onChange={set('rentals_booking_url')}
                placeholder="https://…"
                type="url"
              />
            </div>

            <BilingualField label="First Aid Kit Location" value={form.first_aid_location} onChange={set('first_aid_location')} />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField label="Pharmacy Phone" value={form.pharmacy_phone} onChange={set('pharmacy_phone')} placeholder="+30 28310 00000" type="tel" />
              <TextField
                label="Pharmacy Finder URL"
                value={form.pharmacy_finder_url}
                onChange={set('pharmacy_finder_url')}
                placeholder="https://…"
                type="url"
              />
            </div>
          </div>
        )}
      </div>

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200/60 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-3.5">
          <p className="hidden text-xs text-stone-500 sm:block">
            {form.id ? 'Editing an existing property.' : 'Creating a new property.'}
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
    </div>
  );
}