"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Check, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function PricingPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        // Check if user is already pro
        const checkPro = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                try {
                    const res = await fetch("/api/billing", {
                        method: "POST",
                        body: JSON.stringify({ action: "check_status" })
                    });
                    const data = await res.json();
                    if (data.isPro) {
                        router.replace("/subscription");
                    }
                } catch (e) { }
            }
        };
        checkPro();
    }, []);

    const handleSubscribe = async () => {
        setIsLoading(true);
        // Check if user is logged in
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.push("/login");
            return;
        }

        // Call Stripe Checkout API
        try {
            const response = await fetch("/api/checkout", {
                method: "POST",
            });
            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert("Failed to start checkout");
            }
        } catch (error) {
            console.error("Checkout error", error);
            alert("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-16">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-6">Simple, Transparent Pricing</h1>
                    <p className="text-xl text-slate-600">
                        Choose the plan that fits your needs.
                        Everything you need to manage PDFs, right here.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Free Plan */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="text-2xl font-bold text-slate-900">Basic</h3>
                        <div className="mt-4 flex items-baseline text-slate-900">
                            <span className="text-5xl font-extrabold tracking-tight">$0</span>
                            <span className="ml-1 text-xl font-semibold text-slate-500">/month</span>
                        </div>
                        <p className="mt-6 text-slate-500">Perfect for quick tasks and occasional use.</p>
                        <ul className="mt-6 space-y-4">
                            <li className="flex items-start">
                                <Check className="flex-shrink-0 w-5 h-5 text-green-500" />
                                <span className="ml-3 text-slate-700">All PDF Tools included</span>
                            </li>
                            <li className="flex items-start">
                                <Check className="flex-shrink-0 w-5 h-5 text-green-500" />
                                <span className="ml-3 text-slate-700">Basic processing speed</span>
                            </li>
                            <li className="flex items-start">
                                <Check className="flex-shrink-0 w-5 h-5 text-green-500" />
                                <span className="ml-3 text-slate-700">Limited file size (10MB)</span>
                            </li>
                        </ul>
                        <button className="mt-8 block w-full bg-slate-100 border border-slate-200 rounded-lg py-3 px-6 text-center font-bold text-slate-900 cursor-not-allowed opacity-70">
                            Current Plan
                        </button>
                    </div>

                    {/* Pro Plan */}
                    <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-primary relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>
                        <h3 className="text-2xl font-bold text-slate-900">Pro</h3>
                        <div className="mt-4 flex items-baseline text-slate-900">
                            <span className="text-5xl font-extrabold tracking-tight">$9</span>
                            <span className="ml-1 text-xl font-semibold text-slate-500">/month</span>
                        </div>
                        <p className="mt-6 text-slate-500">For professionals who need more power and speed.</p>
                        <ul className="mt-6 space-y-4">
                            <li className="flex items-start">
                                <Check className="flex-shrink-0 w-5 h-5 text-primary" />
                                <span className="ml-3 text-slate-700">Unlimited PDF Tools</span>
                            </li>
                            <li className="flex items-start">
                                <Check className="flex-shrink-0 w-5 h-5 text-primary" />
                                <span className="ml-3 text-slate-700">Priority Processing (Faster)</span>
                            </li>
                            <li className="flex items-start">
                                <Check className="flex-shrink-0 w-5 h-5 text-primary" />
                                <span className="ml-3 text-slate-700">Large file sizes (up to 1GB)</span>
                            </li>
                            <li className="flex items-start">
                                <Check className="flex-shrink-0 w-5 h-5 text-primary" />
                                <span className="ml-3 text-slate-700">Ad-free Experience</span>
                            </li>
                            <li className="flex items-start">
                                <Check className="flex-shrink-0 w-5 h-5 text-primary" />
                                <span className="ml-3 text-slate-700">Secure Cloud Storage (Soon)</span>
                            </li>
                        </ul>
                        <button
                            onClick={handleSubscribe}
                            disabled={isLoading}
                            className="mt-8 block w-full bg-primary hover:bg-primary-hover rounded-lg py-3 px-6 text-center font-bold text-white transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                            {isLoading ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : "Get Started with Pro"}
                        </button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
