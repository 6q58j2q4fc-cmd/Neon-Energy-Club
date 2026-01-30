/**
 * Stripe Integration
 * 
 * This module provides Stripe payment functionality.
 * Requires STRIPE_SECRET_KEY to be configured in Settings → Payment.
 */

import { ENV } from "./_core/env";

// Check if Stripe is configured
export function isStripeConfigured(): boolean {
  return !!(process.env.STRIPE_SECRET_KEY && process.env.VITE_STRIPE_PUBLISHABLE_KEY);
}

// Lazy-load Stripe only when configured
let _stripe: any = null;

async function getStripe() {
  if (!isStripeConfigured()) {
    throw new Error("Stripe is not configured. Please add your Stripe API keys in Settings → Payment.");
  }

  if (!_stripe) {
    const Stripe = (await import("stripe")).default;
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-12-15.clover",
    });
  }

  return _stripe;
}

/**
 * Create a Stripe Checkout Session for crowdfunding contributions
 */
export async function createCrowdfundingCheckout(params: {
  amount: number;
  tierName: string;
  customerEmail: string;
  customerName: string;
  userId?: number;
  message?: string;
  origin: string;
}): Promise<{ url: string }> {
  const stripe = await getStripe();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card", "paypal"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `NEON Crowdfunding - ${params.tierName}`,
            description: "Support the NEON Energy Drink relaunch",
            images: [`${params.origin}/neon-can.png`],
          },
          unit_amount: params.amount,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${params.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${params.origin}/crowdfund`,
    customer_email: params.customerEmail,
    client_reference_id: params.userId?.toString(),
    metadata: {
      type: "crowdfunding",
      tier_name: params.tierName,
      customer_name: params.customerName,
      customer_email: params.customerEmail,
      user_id: params.userId?.toString() || "",
      message: params.message || "",
    },
    allow_promotion_codes: true,
  });

  return { url: session.url! };
}

/**
 * Create a Stripe Checkout Session for franchise deposits
 */
export async function createFranchiseCheckout(params: {
  depositAmount: number;
  totalCost: number;
  territory: string;
  squareMiles: number;
  termMonths: number;
  customerEmail: string;
  customerName: string;
  userId?: number;
  origin: string;
}): Promise<{ url: string }> {
  const stripe = await getStripe();

  // Support Affirm for franchise deposits (typically $5,000+) and PayPal for all
  const paymentMethods = ["card", "paypal"];
  if (params.depositAmount >= 5000) {
    paymentMethods.push("affirm");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: paymentMethods,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `NEON Franchise Deposit - ${params.territory}`,
            description: `Territory: ${params.squareMiles} sq mi, Term: ${params.termMonths} months`,
            images: [`${params.origin}/vending-machine.jpg`],
          },
          unit_amount: params.depositAmount * 100, // Convert to cents
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${params.origin}/success?session_id={CHECKOUT_SESSION_ID}&type=franchise`,
    cancel_url: `${params.origin}/franchise`,
    customer_email: params.customerEmail,
    client_reference_id: params.userId?.toString(),
    metadata: {
      type: "franchise",
      territory: params.territory,
      square_miles: params.squareMiles.toString(),
      term_months: params.termMonths.toString(),
      total_cost: params.totalCost.toString(),
      deposit_amount: params.depositAmount.toString(),
      customer_name: params.customerName,
      customer_email: params.customerEmail,
      user_id: params.userId?.toString() || "",
    },
    allow_promotion_codes: true,
  });

  return { url: session.url! };
}

/**
 * Create a Stripe Checkout Session for pre-orders from shopping cart
 */
export async function createPreorderCheckout(params: {
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    type: string;
    flavor?: string;
  }>;
  customerEmail: string;
  customerName: string;
  userId?: number;
  origin: string;
  distributorCode?: string; // For commission attribution from cloned websites
}): Promise<{ url: string }> {
  const stripe = await getStripe();

  const lineItems = params.items.map(item => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.name,
        description: item.flavor ? `Flavor: ${item.flavor}` : (item.type === 'package' ? 'Distributor Package' : 'NEON Energy Drink'),
        images: [`${params.origin}/neon-can.png`],
      },
      unit_amount: Math.round(item.price * 100), // Convert to cents
    },
    quantity: item.quantity,
  }));

  const totalAmount = params.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Support Affirm for orders over $50 and PayPal for all orders
  const paymentMethods = ["card", "paypal"];
  if (totalAmount >= 50) {
    paymentMethods.push("affirm");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: paymentMethods,
    line_items: lineItems,
    mode: "payment",
    success_url: `${params.origin}/success?session_id={CHECKOUT_SESSION_ID}&type=preorder`,
    cancel_url: `${params.origin}/shop`,
    customer_email: params.customerEmail,
    client_reference_id: params.userId?.toString(),
    metadata: {
      type: "preorder",
      customer_name: params.customerName,
      customer_email: params.customerEmail,
      user_id: params.userId?.toString() || "",
      total_amount: totalAmount.toString(),
      items_count: params.items.length.toString(),
      items_json: JSON.stringify(params.items.map(i => ({ name: i.name, qty: i.quantity, price: i.price }))),
      distributor_code: params.distributorCode || "", // For commission attribution
    },
    allow_promotion_codes: true,
    shipping_address_collection: {
      allowed_countries: ["US", "CA", "GB", "AU", "DE", "FR", "ES", "IT", "NL", "BE"],
    },
  });

  return { url: session.url! };
}

/**
 * Retrieve a Checkout Session
 */
export async function getCheckoutSession(sessionId: string) {
  const stripe = await getStripe();
  return await stripe.checkout.sessions.retrieve(sessionId);
}


/**
 * Create a Stripe Checkout Session for vending machine orders
 */
export async function createVendingCheckout(params: {
  orderId: number;
  amount: number;
  machineModel: string;
  quantity: number;
  paymentType: "full" | "deposit" | "payment_plan";
  customerEmail: string;
  customerName: string;
  origin: string;
}): Promise<{ url: string }> {
  const stripe = await getStripe();

  const modelNames: Record<string, string> = {
    standard: "Standard Model",
    premium: "Premium Model",
    deluxe: "Deluxe Model",
  };

  const productName = `NEON Vending Machine - ${modelNames[params.machineModel] || params.machineModel}`;
  const description = params.paymentType === "full" 
    ? `Full payment for ${params.quantity} machine(s)`
    : params.paymentType === "deposit"
    ? `20% deposit for ${params.quantity} machine(s)`
    : `Deposit + first payment for ${params.quantity} machine(s)`;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: productName,
            description: description,
            images: [`${params.origin}/vending-machine-1.webp`],
          },
          unit_amount: params.amount,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${params.origin}/success?session_id={CHECKOUT_SESSION_ID}&type=vending&order_id=${params.orderId}`,
    cancel_url: `${params.origin}/vending`,
    customer_email: params.customerEmail,
    metadata: {
      type: "vending_machine",
      order_id: params.orderId.toString(),
      machine_model: params.machineModel,
      quantity: params.quantity.toString(),
      payment_type: params.paymentType,
      customer_name: params.customerName,
      customer_email: params.customerEmail,
    },
    allow_promotion_codes: true,
  });

  return { url: session.url! };
}
