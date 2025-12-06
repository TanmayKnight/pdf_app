import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js"; // Use admin client for webhook typically

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error) {
        return new NextResponse("Webhook Error", { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === "checkout.session.completed") {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        );

        if (!session?.metadata?.userId) {
            return new NextResponse("User id is required", { status: 400 });
        }

        // Initialize Admin Supabase Client to bypass RLS and update user profile
        // Note: In a real app, you'd use SERVICE_ROLE_KEY for admin access here.
        // For this example, we assume we have a key that can update profiles.
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Or better, SERVICE_ROLE_KEY env var
        );

        // Update user profile
        /*
        await supabaseAdmin
            .from('profiles')
            .update({ 
                is_pro: true,
                stripe_customer_id: subscription.customer as string, 
                stripe_subscription_id: subscription.id,
                stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString() 
            })
            .eq('id', session.metadata.userId);
        */
        console.log(`User ${session.metadata.userId} upgraded to Pro!`);
    }

    if (event.type === "invoice.payment_succeeded") {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        );

        /*
        await supabaseAdmin
            .from('profiles')
            .update({
                stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id);
        */
    }

    return new NextResponse(null, { status: 200 });
}
