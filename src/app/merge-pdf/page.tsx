"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PdfDropzone } from "@/components/pdf-dropzone";
import { mergePdfs } from "@/lib/pdf-utils";
import { Loader2, File, X, ArrowRight, Download } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MergePdfPage() {
    const [files, setFiles] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    const handleFilesDropped = (droppedFiles: File[]) => {
        // Add new files to existing ones
        setFiles((prev) => [...prev, ...droppedFiles]);
        setDownloadUrl(null); // Reset download if new files are added
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
        setDownloadUrl(null);
    };

    const handleMerge = async () => {
        if (files.length < 2) return;

        setIsProcessing(true);
        try {
            const mergedPdfBytes = await mergePdfs(files);
            const blob = new Blob([mergedPdfBytes as unknown as BlobPart], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            setDownloadUrl(url);
        } catch (error) {
            console.error("Failed to merge PDFs", error);
            alert("Failed to merge PDFs. Please try again.");
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
                        <h1 className="text-4xl font-extrabold text-slate-900">Merge PDF files</h1>
                        <p className="text-xl text-slate-600">Combine PDFs in the order you want with the easiest PDF merger available.</p>
                    </div>

                    {/* Initial State: No files */}
                    {files.length === 0 && (
                        <div className="bg-white p-2 rounded-2xl shadow-sm">
                            <PdfDropzone onFilesDropped={handleFilesDropped} />
                        </div>
                    )}

                    {/* Files Selected State */}
                    {files.length > 0 && !downloadUrl && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                                <h2 className="font-bold text-lg text-slate-700">Selected Files ({files.length})</h2>
                                <button
                                    onClick={() => setFiles([])}
                                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                                >
                                    Clear all
                                </button>
                            </div>

                            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                                {files.map((file, idx) => (
                                    <div key={idx} className="relative group bg-slate-100 p-4 rounded-xl flex flex-col items-center gap-3 border border-slate-200 hover:border-primary/50 transition-colors">
                                        <div className="w-12 h-16 bg-white border border-slate-300 rounded flex items-center justify-center shadow-sm">
                                            <File className="text-red-500 w-6 h-6" />
                                        </div>
                                        <span className="text-xs text-center font-medium text-slate-700 truncate w-full px-2" title={file.name}>
                                            {file.name}
                                        </span>
                                        <button
                                            onClick={() => removeFile(idx)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-xl hover:bg-slate-50 cursor-pointer">
                                    <PdfDropzone
                                        onFilesDropped={handleFilesDropped}
                                        className="border-0 p-0 min-h-0 bg-transparent hover:bg-transparent shadow-none"
                                    />
                                    <span className="text-xs font-semibold text-primary mt-2">+ Add more</span>
                                </div>
                            </div>

                            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
                                <button
                                    onClick={handleMerge}
                                    disabled={isProcessing || files.length < 2}
                                    className={cn(
                                        "flex items-center gap-2 bg-primary text-white text-xl px-12 py-4 rounded-xl font-bold hover:bg-primary-hover shadow-lg transform hover:-translate-y-1 transition-all",
                                        (isProcessing || files.length < 2) && "opacity-50 cursor-not-allowed hover:transform-none"
                                    )}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="animate-spin w-6 h-6" />
                                            Merging PDF...
                                        </>
                                    ) : (
                                        <>
                                            Merge PDF
                                            <ArrowRight className="w-6 h-6" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Success/Download State */}
                    {downloadUrl && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center space-y-6">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Download className="w-10 h-10" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-800">Your PDF has been merged!</h2>
                            <p className="text-slate-600 text-lg">
                                The files have been combined into a single PDF document.
                            </p>
                            <div className="flex justify-center gap-4 pt-4">
                                <a
                                    href={downloadUrl}
                                    download="merged.pdf"
                                    className="flex items-center gap-2 bg-primary text-white text-lg px-8 py-3 rounded-lg font-bold hover:bg-primary-hover shadow-lg hover:-translate-y-1 transition-all"
                                >
                                    Download Merged PDF
                                </a>
                                <button
                                    onClick={() => {
                                        setFiles([]);
                                        setDownloadUrl(null);
                                    }}
                                    className="text-slate-500 hover:text-slate-700 font-medium px-4"
                                >
                                    Merge other files
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
