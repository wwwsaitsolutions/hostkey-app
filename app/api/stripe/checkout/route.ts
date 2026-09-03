import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { propertyId, planType, plan } = body;

    if (!propertyId) {
      return NextResponse.json({ error: 'Missing propertyId' }, { status: 400 });
    }

    // Έλεγχος είτε για planType είτε για plan ('yearly' ή 'monthly')
    const selectedPlan = planType || plan || 'monthly';

    const priceId =
      selectedPlan === 'yearly'
        ? process.env.STRIPE_PRO_YEARLY_PRICE_ID
        : process.env.STRIPE_PRO_MONTHLY_PRICE_ID;

    if (!priceId) {
      return NextResponse.json(
        { 
          error: `Price ID not found for plan: ${selectedPlan}. Ensure STRIPE_PRO_MONTHLY_PRICE_ID and STRIPE_PRO_YEARLY_PRICE_ID are set.` 
        },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hostkey.gr';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        propertyId: String(propertyId),
      },
      client_reference_id: String(propertyId),
      success_url: `${appUrl}/admin?session_id={CHECKOUT_SESSION_ID}&upgraded=true`,
      cancel_url: `${appUrl}/admin?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}