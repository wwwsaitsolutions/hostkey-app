import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import DashboardGrid from '@/components/DashboardGrid';

// Revalidate every 60 seconds for live updates without full rebuild
export const revalidate = 60;

export default async function HomePage() {
  // 1. Fetch default property (e.g. Rethymno Old Town Suite)
  const { data: property, error: propError } = await supabase
    .from('properties')
    .select('*')
    .eq('slug', 'rethymno-old-town-suite')
    .single();

  // 2. Fetch all POIs (beaches, sights, restaurants)
  const { data: places, error: placesError } = await supabase
    .from('places')
    .select('*');

  if (propError || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center text-slate-400">
        <p>Could not load apartment guide. Please verify your Supabase setup and slug.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-between">
      <div>
        {/* Top Header with Welcome & Language Picker */}
        <Header property={property} />

        {/* Dynamic Buttons Grid */}
        <DashboardGrid property={property} places={places || []} />
      </div>

      {/* Subtle Footer */}
      <footer className="text-center py-4 text-[11px] text-slate-500 tracking-wider">
        Powered by Digital Guest Guide
      </footer>
    </main>
  );
}