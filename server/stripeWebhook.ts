import { Request, Response } from 'express';
import Stripe from 'stripe';
import { getDb } from './db';
import { distributors, orders, preorders } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { processOrderCommissions } from './mlmDataMonitor';

// Get Stripe instance
async function getStripe(): Promise<Stripe> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(secretKey, { apiVersion: '2025-12-15.clover' });
}

/**
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(req: Request, res: Response): Promise<void> {
  const stripe = await getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event: Stripe.Event;
  
  try {
    // Verify webhook signature if secret is configured
    if (webhookSecret) {
      const signature = req.headers['stripe-signature'] as string;
      event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
    } else {
      // For development without webhook secret
      event = JSON.parse(req.body.toString());
    }
  } catch (err: any) {
    console.error('[Stripe Webhook] Signature verification failed:', err.message);
    res.status(400).json({ error: `Webhook Error: ${err.message}` });
    return;
  }
  
  // Handle test events
  if (event.id.startsWith('evt_test_')) {
    console.log('[Stripe Webhook] Test event detected, returning verification response');
    res.json({ verified: true });
    return;
  }
  
  console.log(`[Stripe Webhook] Received event: ${event.type} (${event.id})`);
  
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event?.data.object as Stripe.Checkout.Session);
        break;
        
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event?.data.object as Stripe.PaymentIntent);
        break;
        
      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }
    
    res.json({ received: true });
  } catch (error: any) {
    console.error(`[Stripe Webhook] Error processing ${event.type}:`, error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Handle checkout.session.completed event
 * This is where we create orders and process commissions
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.error('[Stripe Webhook] Database not available');
    return;
  }
  
  const metadata = session.metadata || {};
  const type = metadata.type;
  
  console.log(`[Stripe Webhook] Processing checkout completion for type: ${type}`);
  console.log(`[Stripe Webhook] Metadata:`, metadata);
  
  // Handle preorder type
  if (type === 'preorder') {
    const distributorCode = metadata.distributor_code;
    const customerEmail = metadata.customer_email;
    const customerName = metadata.customer_name;
    const totalAmount = parseFloat(metadata.total_amount || '0');
    
    let distributorId: number | null = null;
    
    // Find distributor by code for commission attribution
    if (distributorCode) {
      const [distributor] = await db.select({ id: distributors.id })
        .from(distributors)
        .where(eq(distributors.distributorCode, distributorCode))
        .limit(1);
      
      if (distributor) {
        distributorId = distributor.id;
        console.log(`[Stripe Webhook] Found distributor ${distributorId} for code ${distributorCode}`);
      }
    }
    
    // Create preorder record
    const pv = Math.round(totalAmount * 0.75); // 75% of order value is PV
    
    const preorderResult = await db.insert(preorders).values({
      name: customerName || 'Customer',
      email: customerEmail || '',
      quantity: parseInt(metadata.items_count || '1'),
      address: 'Pending - from Stripe checkout',
      city: 'Pending',
      state: 'Pending',
      postalCode: '00000',
      country: 'USA',
      status: 'confirmed',
    });
    
    const preorderId = (preorderResult as any)[0]?.insertId;
    console.log(`[Stripe Webhook] Created preorder ${preorderId}`);
    
    // Create order record for commission tracking
    if (distributorId) {
      // Generate unique order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      const orderResult = await db.insert(orders).values({
        userId: null,
        distributorId,
        packageId: 1, // Default package
        orderNumber,
        customerName: customerName || 'Customer',
        customerEmail: customerEmail || '',
        shippingAddress: (session as any).shipping_details?.address?.line1 || 'Pending - from Stripe checkout',
        totalAmount: totalAmount.toFixed(2),
        pv,
        status: 'paid',
        stripePaymentId: session.payment_intent as string,
        isAutoShip: 0,
      });
      
      const orderId = (orderResult as any)[0]?.insertId;
      console.log(`[Stripe Webhook] Created order ${orderId} for distributor ${distributorId}`);
      
      // Process commissions for this order
      if (orderId) {
        await processOrderCommissions(orderId);
        console.log(`[Stripe Webhook] Processed commissions for order ${orderId}`);
        
        // Update charity impact tracking
        try {
          const { updateImpactOnOrderCompletion } = await import('./charityImpact');
          await updateImpactOnOrderCompletion(orderId);
          console.log(`[Stripe Webhook] Updated charity impact for order ${orderId}`);
        } catch (error: any) {
          console.error(`[Stripe Webhook] Error updating charity impact:`, error);
          // Don't fail the webhook if impact tracking fails
        }
      }
    }
  }
  
  // Handle crowdfunding type
  if (type === 'crowdfunding') {
    console.log(`[Stripe Webhook] Crowdfunding contribution completed: $${metadata.amount}`);
    // Crowdfunding doesn't need commission processing
  }
  
  // Handle franchise deposit type
  if (type === 'franchise_deposit') {
    console.log(`[Stripe Webhook] Franchise deposit completed: $${metadata.deposit_amount}`);
    // Franchise deposits don't need commission processing
  }
}

/**
 * Handle payment_intent.succeeded event
 */
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  console.log(`[Stripe Webhook] Payment succeeded: ${paymentIntent.id}, amount: $${paymentIntent.amount / 100}`);
  // Most processing is done in checkout.session.completed
  // This is mainly for logging and backup processing
}

export default { handleStripeWebhook };
