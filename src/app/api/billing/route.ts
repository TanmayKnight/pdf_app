
import { createClient } from "@/lib/supabase-server";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await request.json();
        const { action } = body;

        // 1. Get Customer ID (In real app, query 'profiles' table. Here we search Stripe or assume metadata)
        // For MVP without DB sync reliability, we search Stripe by email.
        const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
        let customerId = customers.data[0]?.id;

        if (!customerId) {
            // Create if missing (should happen in checkout, but good fallback)
            const newCustomer = await stripe.customers.create({ email: user.email!, metadata: { userId: user.id } });
            customerId = newCustomer.id;
        }

        if (action === "check_status") {
            const subscriptions = await stripe.subscriptions.list({
                customer: customerId,
                status: 'active',
                limit: 1
            });
            const isPro = subscriptions.data.length > 0;
            return NextResponse.json({
                isPro,
                subscription: isPro ? subscriptions.data[0] : null
            });
        }

        if (action === "create_portal") {
            const session = await stripe.billingPortal.sessions.create({
                customer: customerId,
                return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription`,
            });
            return NextResponse.json({ url: session.url });
        }

        // Retention Offer Action: Apply coupon
        if (action === "apply_retention") {
            // Retrieve active subscription
            const subscriptions = await stripe.subscriptions.list({
                customer: customerId,
                status: 'active',
                limit: 1
            });

            if (subscriptions.data.length === 0) {
                return new NextResponse("No active subscription", { status: 400 });
            }

            const subId = subscriptions.data[0].id;

            // Create a 50% off coupon for 1 month if not exists
            // Ideally create this once in Dashboard. Here we mock/create on fly or use a known ID.
            // Let's create a one-time coupon on the fly (not best practice for scale but works for MVP)
            const coupon = await stripe.coupons.create({
                percent_off: 50,
                duration: 'once',
                name: 'Retention Offer 50%'
            });

            await stripe.subscriptions.update(subId, {
                coupon: coupon.id,
            } as any);

            return NextResponse.json({ success: true });
        }

        return new NextResponse("Invalid action", { status: 400 });

    } catch (error: any) {
        console.error("Billing Error", error);
        return new NextResponse(error.message, { status: 500 });
    }
}
