import Razorpay from 'razorpay';

let _razorpay: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (!_razorpay) {
    _razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }
  return _razorpay;
}

export const TIER_AMOUNTS: Record<string, number> = {
  gold: 999,
  silver: 1499,
  diamond: 1999,
};

// Companion keeps 70% of the booking value; platform keeps 30%.
export const COMPANION_SHARE = 0.7;
