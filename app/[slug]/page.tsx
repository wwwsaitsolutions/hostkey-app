import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import DashboardGrid from '@/components/DashboardGrid';

// Απενεργοποίηση στατικού cache ώστε κάθε αλλαγή στο Admin να φαίνεται ΑΜΕΣΩΣ στο live
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PropertyPage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Φόρτωση του διαμερίσματος
  const { data: property, error: propError } = await supabase
    .from('properties')
    .select('*')
    .eq('slug', slug)
    .single();

  if (propError || !property) {
    notFound();
  }

  // 2. Φόρτωση ΟΛΩΝ των προτάσεων (παραλίες, φαγητό, supermarkets, bars κλπ.)
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