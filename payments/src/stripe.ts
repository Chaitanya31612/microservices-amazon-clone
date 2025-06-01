import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_KEY!, {
  // Let Stripe use its default API version
});

export { stripe };
