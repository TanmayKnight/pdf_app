
import { createClient } from "@/lib/supabase-server";
import { stripe } from "@/lib/stripe";
import { redirect } from "next/navigation";
import PricingClient from "./pricing-client";

export default async function PricingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        try {
            // Fetch stripe customer
            const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
            if (customers.data.length > 0) {
                const subscriptions = await stripe.subscriptions.list({
                    customer: customers.data[0].id,
                    status: 'active',
                    limit: 1
                });
                if (subscriptions.data.length > 0) {
                    // User is definitely Pro, redirect server-side
                    redirect("/subscription");
                }
            }
        } catch (error) {
            console.error("Server-side pricing check failed", error);
        }
    }

    return <PricingClient />
}
