"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PdfDropzone } from "@/components/pdf-dropzone";
import { compressPdf } from "@/lib/pdf-utils";
import { Loader2, File, ArrowRight, Download, CheckCircle2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CompressPdfPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [stats, setStats] = useState<{ original: number, compressed: number } | null>(null);

    const handleFilesDropped = (droppedFiles: File[]) => {
        if (droppedFiles.length > 0) {
            setFile(droppedFiles[0]);
            setDownloadUrl(null);
            setStats(null);
        }
    };

    const handleCompress = async () => {
        if (!file) return;
        setIsProcessing(true);

        try {
            // Prepare minimum wait time to show "processing" feel
            const start = Date.now();
            const compressedBytes = await compressPdf(file);
            const end = Date.now();
            const diff = end - start;
            if (diff < 1000) await new Promise(r => setTimeout(r, 1000 - diff));

            const blob = new Blob([compressedBytes as unknown as BlobPart], { type: "application/pdf" });
            setDownloadUrl(URL.createObjectURL(blob));
            setStats({
                original: file.size,
                compressed: blob.size // In MVP w/ pdf-lib this might not be much smaller, but flow works.
            });

        } catch (error) {
            console.error("Compression failed", error);
            alert("Failed to compress PDF.");
        } finally {
            setIsProcessing(false);
        }
    };

    const getSavings = () => {
        if (!stats) return 0;
        const savings = stats.original - stats.compressed;
        const percent = (savings / stats.original) * 100;
        return percent > 0 ? percent.toFixed(0) : 0;
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-extrabold text-slate-900">Compress PDF file</h1>
                        <p className="text-xl text-slate-600">Reduce file size while optimizing for maximal PDF quality.</p>
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
                                    <File className="text-red-500 w-12 h-12" />
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-slate-700 truncate max-w-[200px]">{file.name}</p>
                                    <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)}MB</p>
                                </div>
                                <button onClick={() => setFile(null)} className="text-red-600 text-sm font-medium hover:underline">Change File</button>
                            </div>

                            <div className="p-8 flex-1 flex flex-col justify-center space-y-8">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-4">Compression Level</h3>
                                    <div className="border-2 border-primary bg-primary/5 p-4 rounded-xl flex items-start gap-3">
                                        <Minimize2 className="w-6 h-6 text-primary mt-1" />
                                        <div>
                                            <h4 className="font-bold text-primary">Recommended Compression</h4>
                                            <p className="text-sm text-slate-600">Good quality, good compression.</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCompress}
                                    disabled={isProcessing}
                                    className={cn(
                                        "w-full flex items-center justify-center gap-2 bg-primary text-white text-xl px-12 py-4 rounded-xl font-bold hover:bg-primary-hover shadow-lg transform hover:-translate-y-1 transition-all",
                                        isProcessing && "opacity-50 cursor-not-allowed hover:transform-none"
                                    )}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="animate-spin w-6 h-6" />
                                            Compressing PDF...
                                        </>
                                    ) : (
                                        <>
                                            Compress PDF
                                            <ArrowRight className="w-6 h-6" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {downloadUrl && stats && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center space-y-6">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-800">PDF Compressed!</h2>
                            <p className="text-slate-600 text-lg">
                                Your PDF is now {getSavings()}% smaller.
                                <br />
                                <span className="text-sm text-slate-400">
                                    {(stats.original / 1024).toFixed(0)}KB → {(stats.compressed / 1024).toFixed(0)}KB
                                </span>
                            </p>
                            <div className="flex justify-center gap-4 pt-4">
                                <a
                                    href={downloadUrl}
                                    download={`compressed_${file?.name || 'document.pdf'}`}
                                    className="flex items-center gap-2 bg-primary text-white text-lg px-8 py-3 rounded-lg font-bold hover:bg-primary-hover shadow-lg hover:-translate-y-1 transition-all"
                                >
                                    Download Compressed PDF
                                </a>
                                <button
                                    onClick={() => {
                                        setFile(null);
                                        setDownloadUrl(null);
                                        setStats(null);
                                    }}
                                    className="text-slate-500 hover:text-slate-700 font-medium px-4"
                                >
                                    Compress another PDF
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
