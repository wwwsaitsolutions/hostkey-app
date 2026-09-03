import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { propertyId, hostEmail, hostId } = await req.json();

    if (!propertyId || !hostId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      customer_email: hostEmail,
      line_items: [
        {
          price: process.env.STRIPE_PRO_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        metadata: {
          propertyId,
          hostId,
        },
      },
      metadata: {
        propertyId,
        hostId,
      },
      success_url: `${appUrl}/admin?session_id={CHECKOUT_SESSION_ID}&upgraded=true`,
      cancel_url: `${appUrl}/admin?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}