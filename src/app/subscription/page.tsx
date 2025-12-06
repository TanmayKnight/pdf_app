"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useEffect, useState } from "react";
import { Loader2, Crown, CreditCard, AlertTriangle, Gift } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function SubscriptionPage() {
    const [loading, setLoading] = useState(true);
    const [isPro, setIsPro] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showRetentionOffer, setShowRetentionOffer] = useState(false);
    const [processingAction, setProcessingAction] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const checkStatus = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }

            try {
                const res = await fetch("/api/billing", {
                    method: "POST",
                    body: JSON.stringify({ action: "check_status" })
                });
                const data = await res.json();
                setIsPro(data.isPro);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        checkStatus();
    }, [router, supabase.auth]);

    const handleManageBilling = async () => {
        setProcessingAction(true);
        try {
            const res = await fetch("/api/billing", {
                method: "POST",
                body: JSON.stringify({ action: "create_portal" })
            });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
        } catch (error) {
            alert("Failed to load billing portal");
        } finally {
            setProcessingAction(false);
        }
    };

    const handleApplyRetention = async () => {
        setProcessingAction(true);
        try {
            const res = await fetch("/api/billing", {
                method: "POST",
                body: JSON.stringify({ action: "apply_retention" })
            });
            if (res.ok) {
                alert("Discount Applied! Thank you for staying with us.");
                setShowRetentionOffer(false);
                setShowCancelModal(false);
            } else {
                alert("Failed to apply discount.");
            }
        } catch (error) {
            alert("Error applying discount");
        } finally {
            setProcessingAction(false);
        }
    };

    const handleProceedToCancel = () => {
        // Redirect to portal for actual cancellation
        handleManageBilling();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-slate-50">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="animate-spin w-8 h-8 text-primary" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-12">
                <div className="max-w-3xl mx-auto space-y-8">
                    <h1 className="text-3xl font-bold text-slate-900">Subscription & Billing</h1>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className={`p-4 rounded-xl ${isPro ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-600"}`}>
                                <Crown className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">
                                    Current Plan: <span className={isPro ? "text-primary" : "text-slate-600"}>{isPro ? "SwiftPDF Pro" : "Free Tier"}</span>
                                </h2>
                                <p className="text-slate-500">
                                    {isPro ? "You have unlimited access to all features." : "Upgrade to unlock unlimited features."}
                                </p>
                            </div>
                        </div>

                        {isPro ? (
                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={handleManageBilling}
                                    disabled={processingAction}
                                    className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
                                >
                                    <CreditCard className="w-5 h-5" />
                                    Manage Payment Method / Invoices
                                </button>
                                <button
                                    onClick={() => { setShowCancelModal(true); setShowRetentionOffer(true); }}
                                    className="w-full text-red-600 font-medium hover:bg-red-50 py-3 rounded-xl transition-colors"
                                >
                                    Cancel Subscription
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => router.push("/pricing")}
                                className="w-full bg-primary text-white px-6 py-4 rounded-xl font-bold hover:bg-primary-hover transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                Upgrade to Pro
                            </button>
                        )}
                    </div>
                </div>

                {/* Retention Modal */}
                {showCancelModal && showRetentionOffer && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                        <div className="bg-white max-w-md w-full rounded-2xl p-8 space-y-6 shadow-2xl scale-100">
                            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto">
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-slate-900">Wait! Don't go yet.</h3>
                                <p className="text-slate-600 mt-2">
                                    We'd love to keep you as a SwiftPDF Pro member.
                                    How about <span className="font-bold text-green-600">50% OFF</span> your next month?
                                </p>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={handleApplyRetention}
                                    disabled={processingAction}
                                    className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 flex items-center justify-center gap-2"
                                >
                                    <Gift className="w-5 h-5" />
                                    {processingAction ? "Applying..." : "Claim 50% Off & Stay"}
                                </button>
                                <button
                                    onClick={handleProceedToCancel}
                                    className="w-full bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200"
                                >
                                    No thanks, I still want to cancel
                                </button>
                                <button
                                    onClick={() => setShowCancelModal(false)}
                                    className="w-full text-slate-400 font-medium text-sm hover:text-slate-600"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
