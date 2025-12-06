"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PdfDropzone } from "@/components/pdf-dropzone";
import { unlockPdf } from "@/lib/pdf-utils";
import { Loader2, File, ArrowRight, Download, CheckCircle2, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function UnlockPdfPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [password, setPassword] = useState("");

    const handleFilesDropped = (droppedFiles: File[]) => {
        if (droppedFiles.length > 0) {
            setFile(droppedFiles[0]);
            setDownloadUrl(null);
            setPassword("");
        }
    };

    const handleUnlock = async () => {
        if (!file || !password) return;

        setIsProcessing(true);

        try {
            const pdfBytes = await unlockPdf(file, password);
            const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
            setDownloadUrl(URL.createObjectURL(blob));

        } catch (error) {
            console.error("Unlock failed", error);
            alert("Failed to unlock PDF. Is the password correct?");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-extrabold text-slate-900">Unlock PDF file</h1>
                        <p className="text-xl text-slate-600">Remove PDF password security, giving you the freedom to use your PDFs as you want.</p>
                    </div>

                    {!file && (
                        <div className="bg-white p-2 rounded-2xl shadow-sm">
                            <PdfDropzone onFilesDropped={handleFilesDropped} maxFiles={1} />
                        </div>
                    )}

                    {file && !downloadUrl && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
                            <div className="bg-slate-100 p-8 flex-1 flex flex-col items-center justify-center border-r border-slate-200 gap-4">
                                <div className="w-32 h-44 bg-white border border-slate-300 shadow-md flex items-center justify-center rounded">
                                    <Unlock className="text-slate-400 w-12 h-12" />
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-slate-700 truncate max-w-[200px]">{file.name}</p>
                                </div>
                                <button onClick={() => setFile(null)} className="text-red-600 text-sm font-medium hover:underline">Change File</button>
                            </div>

                            <div className="p-8 flex-1 space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-slate-800">Enter PDF Password</h3>
                                    <p className="text-sm text-slate-600">Input the password to unlock this document.</p>
                                    <div className="space-y-2">
                                        <input
                                            type="password"
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter password"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleUnlock}
                                    disabled={isProcessing || !password}
                                    className={cn(
                                        "w-full flex items-center justify-center gap-2 bg-primary text-white text-xl px-12 py-4 rounded-xl font-bold hover:bg-primary-hover shadow-lg transform hover:-translate-y-1 transition-all",
                                        (isProcessing || !password) && "opacity-50 cursor-not-allowed hover:transform-none"
                                    )}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="animate-spin w-6 h-6" />
                                            Unlocking...
                                        </>
                                    ) : (
                                        <>
                                            Unlock PDF
                                            <ArrowRight className="w-6 h-6" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {downloadUrl && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center space-y-6">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-800">PDF Unlocked!</h2>
                            <p className="text-slate-600 text-lg">
                                The password has been removed successfully.
                            </p>
                            <div className="flex justify-center gap-4 pt-4">
                                <a
                                    href={downloadUrl}
                                    download={`unlocked_${file?.name || 'doc.pdf'}`}
                                    className="flex items-center gap-2 bg-primary text-white text-lg px-8 py-3 rounded-lg font-bold hover:bg-primary-hover shadow-lg hover:-translate-y-1 transition-all"
                                >
                                    Download Unlocked PDF
                                </a>
                                <button
                                    onClick={() => {
                                        setFile(null);
                                        setDownloadUrl(null);
                                        setPassword("");
                                    }}
                                    className="text-slate-500 hover:text-slate-700 font-medium px-4"
                                >
                                    Unlock another
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
