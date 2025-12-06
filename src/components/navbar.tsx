"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronDown, FileText, Scissors, Minimize2, Image, FileJson, RotateCw, Shield, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isToolsOpen, setIsToolsOpen] = useState(false);

    const tools = [
        { name: "Merge PDF", href: "/merge-pdf", icon: FileText },
        { name: "Split PDF", href: "/split-pdf", icon: Scissors },
        { name: "Compress PDF", href: "/compress-pdf", icon: Minimize2 },
        { name: "PDF to Image", href: "/pdf-to-image", icon: Image },
        { name: "Image to PDF", href: "/image-to-pdf", icon: FileJson },
        { name: "Rotate PDF", href: "/rotate-pdf", icon: RotateCw },
        { name: "Protect PDF", href: "/protect-pdf", icon: Shield },
        { name: "Unlock PDF", href: "/unlock-pdf", icon: Unlock },
    ];

    return (
        <nav className="bg-white border-b border-border sticky top-0 z-50 shadow-sm font-sans">
            <div className="container mx-auto px-4 h-18 flex items-center justify-between">
                {/* Brand */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                        <span className="text-white font-black text-2xl italic tracking-tighter">S</span>
                    </div>
                    <span className="text-2xl font-black text-slate-800 tracking-tight">Swift<span className="text-primary">PDF</span></span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    <div className="relative group">
                        <button
                            className="flex items-center gap-1 text-base font-semibold text-slate-700 hover:text-primary py-4"
                            onClick={() => setIsToolsOpen(!isToolsOpen)}
                        >
                            All PDF Tools
                            <ChevronDown className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu - CSS Hover based for simplicity + Group */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-[600px] bg-white rounded-2xl shadow-xl border border-slate-100 p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 grid grid-cols-2 gap-4">
                            {tools.map((tool) => (
                                <Link
                                    key={tool.name}
                                    href={tool.href}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 group/item transition-colors"
                                >
                                    <div className="p-2 bg-primary/5 text-primary rounded-md group-hover/item:bg-primary group-hover/item:text-white transition-colors">
                                        <tool.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-800 text-sm">{tool.name}</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                    <Link href="/pricing" className="text-base font-medium text-slate-600 hover:text-primary transition-colors">Pricing</Link>
                    <Link href="/business" className="text-base font-medium text-slate-600 hover:text-primary transition-colors">Business</Link>
                </div>

                {/* Auth Buttons */}
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/login" className="text-sm font-bold text-slate-700 hover:text-primary">Log In</Link>
                        <Link href="/signup" className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                            Sign up
                        </Link>
                    </div>
                    <button
                        className="md:hidden p-2 text-slate-700"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-slate-100 absolute w-full left-0 top-full p-4 flex flex-col gap-4 shadow-xl">
                    <div className="grid grid-cols-2 gap-2">
                        {tools.map((tool) => (
                            <Link
                                key={tool.name}
                                href={tool.href}
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center gap-2 p-3 rounded-lg hover:bg-slate-50 text-sm font-medium"
                            >
                                <tool.icon className="w-4 h-4 text-primary" />
                                {tool.name}
                            </Link>
                        ))}
                    </div>
                    <hr className="border-slate-100" />
                    <Link href="/login" className="block text-center w-full py-3 font-bold text-slate-700 bg-slate-50 rounded-lg">Log In</Link>
                    <Link href="/signup" className="block text-center w-full py-3 font-bold text-white bg-primary rounded-lg">Sign up</Link>
                </div>
            )}
        </nav>
    );
}
