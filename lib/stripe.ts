import Stripe from 'stripe';

const apiKey = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_build';

export const stripe = new Stripe(apiKey, {
  apiVersion: '2025-02-24.acacia' as any,
  appInfo: {
    name: 'Hostkey Platform',
    version: '1.0.0',
  },
});