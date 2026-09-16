import Razorpay from 'razorpay';

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const TIER_AMOUNTS: Record<string, number> = {
  gold: 999,
  silver: 1499,
  diamond: 1999,
};
