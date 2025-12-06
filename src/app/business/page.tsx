"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ArrowRight, Building2, Lock, Zap } from "lucide-react";
import Link from "next/link";

export default function BusinessPage() {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar />

            <main className="flex-1">
                {/* Hero */}
                <div className="bg-slate-900 pt-24 pb-24 px-4 text-center">
                    <div className="container mx-auto max-w-4xl">
                        <span className="text-primary font-bold tracking-widest uppercase text-sm mb-4 block">SwiftPDF for Enterprise</span>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tight leading-tight">
                            Secure PDF Infrastructure <br />for Your Entire Organization
                        </h1>
                        <p className="text-slate-400 text-xl max-w-2xl mx-auto font-light leading-relaxed mb-10">
                            Empower your team with fast, secure, and compliant PDF tools.
                            Manage access, monitor usage, and integrate directly into your workflows.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Link href="#" className="bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-primary/50 transform hover:-translate-y-1">
                                Contact Sales
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Features */}
                <div className="container mx-auto px-4 py-24">
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                                <Lock className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Enterprise Grade Security</h3>
                            <p className="text-slate-600 leading-relaxed">
                                SSO integration (SAML/OIDC), Audit logs, and dedicated private cloud instances to ensure your data never leaves your control.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">API Access</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Direct access to our high-performance PDF processing API to build custom internal tools or integrate into your product.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Dedicated Support</h3>
                            <p className="text-slate-600 leading-relaxed">
                                24/7 Priority support, dedicated account manager, and custom SLA agreements to keep your business running smoothly.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
