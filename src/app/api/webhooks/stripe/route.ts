import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature");

  if (!signature) {
    return new NextResponse("Missing Stripe signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error(`[WEBHOOK_SIGNATURE_ERROR]`, error.message);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (!session.client_reference_id || !session.subscription) {
          throw new Error("Missing client_reference_id or subscription ID in Stripe session payload");
        }

        // Casteamos como any para evitar restricciones estrictas del tipado en CI
        const subscription = (await stripe.subscriptions.retrieve(
          session.subscription as string
        )) as any;

        await prisma.user.upsert({
          where: { id: session.client_reference_id },
          update: {},
          create: {
            id: session.client_reference_id,
            email: session.customer_details?.email || "",
          },
        });

        await prisma.subscription.upsert({
          where: { userId: session.client_reference_id },
          update: {
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0].price.id,
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
          create: {
            userId: session.client_reference_id,
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0].price.id,
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
        });
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;

        await prisma.subscription.update({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: subscription.status,
            stripePriceId: subscription.items.data[0].price.id,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
        });
        break;
      }
      
      default:
        console.log(`[WEBHOOK_UNHANDLED_EVENT] ${event.type}`);
    }

    return new NextResponse("Webhook payload processed successfully", { status: 200 });
  } catch (error: any) {
    console.error(`[WEBHOOK_PROCESSING_ERROR]`, error);
    return new NextResponse("Internal server error during webhook processing", { status: 500 });
  }
}