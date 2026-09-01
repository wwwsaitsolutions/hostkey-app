import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import DashboardGrid from '@/components/DashboardGrid';

// Απενεργοποίηση στατικού cache για real-time ενημερώσεις
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  // 1. Φόρτωση του πρώτου καταλύματος από τη βάση
  const { data: properties, error: propError } = await supabase
    .from('properties')
    .select('*')
    .order('name', { ascending: true })
    .limit(1);

  const property = properties?.[0];

  if (propError || !property) {
    notFound();
  }

  // 2. Φόρτωση όλων των προτάσεων (places)
  const { data: places } = await supabase
    .from('places')
    .select('*')
    .order('name', { ascending: true });

  return (
    <main className="min-h-screen bg-[#F7F4EC]">
      <DashboardGrid property={property} places={places || []} />
    </main>
  );
}