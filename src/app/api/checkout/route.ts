import { createClient } from "@/lib/supabase-server";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: "SwiftPDF Pro Subscription",
                            description: "Unlimited access to all PDF tools",
                        },
                        unit_amount: 900, // $9.00
                        recurring: {
                            interval: "month",
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: "subscription",
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?canceled=true`,
            metadata: {
                userId: user.id,
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error("Internal Error", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
