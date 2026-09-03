'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { X, Check, Search, MapPin } from 'lucide-react';

interface MasterBeach {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  image_url: string;
  google_rating: number;
  wind_status: 'sheltered' | 'exposed';
  lat: number;
  lng: number;
  region: string;
}

interface BeachPickerModalProps {
  propertyId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BeachPickerModal({ propertyId, isOpen, onClose, onSuccess }: BeachPickerModalProps) {
  const [masterBeaches, setMasterBeaches] = useState<MasterBeach[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    async function fetchData() {
      setLoading(true);
      const { data: masters } = await supabase
        .from('master_beaches')
        .select('*')
        .order('region', { ascending: true });

      const { data: existingPlaces } = await supabase
        .from('places')
        .select('name')
        .eq('property_id', propertyId)
        .eq('category', 'beaches');

      if (masters) {
        setMasterBeaches(masters as MasterBeach[]);

        if (existingPlaces) {
          const matchedIds: string[] = [];
          existingPlaces.forEach((ep) => {
            const epName = typeof ep.name === 'object' && ep.name !== null ? (ep.name as any).el || (ep.name as any).en : ep.name;
            const match = (masters as MasterBeach[]).find((m) => m.name.el === epName || m.name.en === epName);
            if (match) matchedIds.push(match.id);
          });
          setSelectedIds(matchedIds);
        }
      }
      setLoading(false);
    }

    fetchData();
  }, [isOpen, propertyId]);

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length >= 15) {
        alert('Μπορείτε να επιλέξετε έως 15 παραλίες.');
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const chosen = masterBeaches.filter((b) => selectedIds.includes(b.id));

    await supabase.from('places').delete().eq('property_id', propertyId).eq('category', 'beaches');

    if (chosen.length > 0) {
      const payload = chosen.map((b) => ({
        property_id: propertyId,
        category: 'beaches',
        name: b.name,
        description: b.description,
        image_url: b.image_url,
        google_rating: b.google_rating,
        wind_status: b.wind_status,
        wind_note: null,
        lat: b.lat,
        lng: b.lng,
      }));

      await supabase.from('places').insert(payload);
    }

    setSaving(false);
    onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  const regions = Array.from(new Set(masterBeaches.map((b) => b.region)));

  const filteredBeaches = masterBeaches.filter((b) => {
    const nameMatch =
      (b.name.el || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.name.en || '').toLowerCase().includes(search.toLowerCase());
    const regionMatch = regionFilter === 'all' || b.region === regionFilter;
    return nameMatch && regionMatch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex h-[88vh] w-full max-w-3xl flex-col rounded-3xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Επιλογή Παραλιών Καταλύματος</h2>
            <p className="text-xs text-stone-500">
              Επιλεγμένες: <span className="font-bold text-teal-600">{selectedIds.length}</span> / 15
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-b border-stone-100 bg-stone-50 px-6 py-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder="Αναζήτηση παραλίας..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setRegionFilter('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                regionFilter === 'all' ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-600'
              }`}
            >
              Όλες
            </button>
            {regions.map((reg) => (
              <button
                key={reg}
                onClick={() => setRegionFilter(reg)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  regionFilter === reg ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-600'
                }`}
              >
                {reg}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading ? (
            <p className="py-12 text-center text-sm text-stone-400">Φόρτωση καταλόγου παραλιών...</p>
          ) : filteredBeaches.length === 0 ? (
            <p className="py-12 text-center text-sm text-stone-400">Δεν βρέθηκαν παραλίες.</p>
          ) : (
            filteredBeaches.map((beach) => {
              const isSelected = selectedIds.includes(beach.id);
              return (
                <div
                  key={beach.id}
                  onClick={() => toggleSelect(beach.id)}
                  className={`group flex items-center gap-4 rounded-2xl border p-3.5 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50/40 shadow-sm'
                      : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50/70'
                  }`}
                >
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                      isSelected ? 'border-teal-600 bg-teal-600 text-white' : 'border-stone-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="h-4 w-4" strokeWidth={3} />}
                  </div>

                  <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                    <Image src={beach.image_url} alt={beach.name.el || beach.name.en} fill className="object-cover" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-bold text-stone-900">{beach.name.el}</p>
                      <span className="text-xs text-stone-400">({beach.name.en})</span>
                    </div>
                    <p className="line-clamp-1 text-xs text-stone-500 mt-0.5">{beach.description.el}</p>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-stone-400">
                      <span className="flex items-center gap-0.5">
                        <MapPin className="h-3 w-3" /> {beach.region}
                      </span>
                      <span>•</span>
                      <span>⭐ {beach.google_rating}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t border-stone-200 bg-stone-50 px-6 py-4">
          <p className="text-xs text-stone-500">
            {selectedIds.length === 0 ? 'Δεν έχει επιλεγεί παραλία' : `${selectedIds.length} παραλίες επιλέχθηκαν`}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={saving}
              className="rounded-xl px-4 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-200 transition-colors"
            >
              Ακύρωση
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Αποθήκευση...' : 'Εφαρμογή Επιλογών'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}