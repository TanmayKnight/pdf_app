import Link from "next/link";

export function Footer() {
    return (
        <footer className="bg-white border-t border-border mt-auto">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="font-bold text-lg mb-4">SwiftPDF</h3>
                        <p className="text-muted-foreground text-sm">
                            Your go-to solution for all PDF needs. Fast, secure, and free.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Popular Tools</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/merge-pdf" className="hover:text-primary">Merge PDF</Link></li>
                            <li><Link href="/split-pdf" className="hover:text-primary">Split PDF</Link></li>
                            <li><Link href="/compress-pdf" className="hover:text-primary">Compress PDF</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-primary">About</Link></li>
                            <li><Link href="#" className="hover:text-primary">Terms</Link></li>
                            <li><Link href="#" className="hover:text-primary">Privacy</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Support</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-primary">Help Center</Link></li>
                            <li><Link href="#" className="hover:text-primary">Contact Us</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} SwiftPDF. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
