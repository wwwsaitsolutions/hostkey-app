import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import DashboardGrid from '@/components/DashboardGrid';

export const revalidate = 60; // Live ανανέωση cache ανά 60 δευτερόλεπτα

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PropertyPage({ params }: PageProps) {
  // 1. Await για το params (συμβατότητα με Next.js 15+)
  const { slug } = await params;

  // 2. Φόρτωση του συγκεκριμένου καταλύματος βάσει του slug
  const { data: property, error: propError } = await supabase
    .from('properties')
    .select('*')
    .eq('slug', slug)
    .single();

  if (propError || !property) {
    notFound();
  }

  // 3. Φόρτωση των προτάσεων (places) για το συγκεκριμένο κατάλυμα
  const { data: places } = await supabase
    .from('places')
    .select('*')
    .or(`property_id.eq.${property.id},property_id.is.null`);

  return (
    <main className="min-h-screen bg-[#F7F4EC]">
      <DashboardGrid property={property} places={places || []} />
    </main>
  );
}