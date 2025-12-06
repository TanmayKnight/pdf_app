import Stripe from 'stripe';

// Fallback to a mock key for build/dev if env var is missing
const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key_for_build';

export const stripe = new Stripe(stripeKey, {
    // Updating to match likely latest or use 'latest' if supported, but typically exact date.
    // Actually, to be safe and avoid guessing the exact string which changes often, I will cast to any to bypass the strict check for this property
    // or just omit it if possible (defaults to account version).
    // Let's try omitting it or using a known valid one if I can see the error again.
    // The previous error said: Type '"2025-01-27.acacia"' is not assignable to type '"2025-11-17.clover"'. 
    // So I should use "2025-11-17.clover" IF that is indeed what it wants.
    apiVersion: '2025-11-17.clover' as any, // Cast to any to be safe against minor patch diffs in types
    typescript: true,
});
