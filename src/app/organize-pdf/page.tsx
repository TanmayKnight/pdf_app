"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PdfDropzone } from "@/components/pdf-dropzone";
import { getPdfPageCount, organizePdf } from "@/lib/pdf-utils";
import { convertPdfToImages } from "@/lib/pdf-render";
import { Loader2, Download, LayoutGrid, Trash2, ArrowLeft, ArrowRight, RefreshCw, GripVertical } from "lucide-react";

export default function OrganizePdfPage() {
    const [file, setFile] = useState<File | null>(null);
    const [pageCount, setPageCount] = useState<number>(0);
    const [pages, setPages] = useState<number[]>([]); // Array of original indices
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedPdfUrl, setProcessedPdfUrl] = useState<string | null>(null);
    const [thumbnails, setThumbnails] = useState<string[]>([]);
    const [isLoadingThumbnails, setIsLoadingThumbnails] = useState(false);

    const handleFileSelect = async (files: File[]) => {
        if (files.length > 0) {
            const f = files[0];
            setFile(f);
            setProcessedPdfUrl(null);
            setThumbnails([]);
            setIsLoadingThumbnails(true);

            try {
                // 1. Get Page Count
                const count = await getPdfPageCount(f);
                setPageCount(count);
                setPages(Array.from({ length: count }, (_, i) => i));

                // 2. Generate Thumbnails (Low Res for performance)
                // We fetch all pages, but with scale 0.5 (thumbnail size)
                // Note: For very large PDFs (e.g. 50+ pages), this might still take a moment.
                const images = await convertPdfToImages(f, undefined, 0.4);
                const urls = images.map(img => URL.createObjectURL(img));
                setThumbnails(urls);

            } catch (e) {
                console.error("Error loading PDF:", e);
                alert("Could not read PDF. Please try a valid PDF file.");
            } finally {
                setIsLoadingThumbnails(false);
            }
        }
    };

    const movePage = (index: number, direction: 'left' | 'right') => {
        const newPages = [...pages];
        if (direction === 'left' && index > 0) {
            [newPages[index], newPages[index - 1]] = [newPages[index - 1], newPages[index]];
        } else if (direction === 'right' && index < newPages.length - 1) {
            [newPages[index], newPages[index + 1]] = [newPages[index + 1], newPages[index]];
        }
        setPages(newPages);
    };

    const deletePage = (index: number) => {
        const newPages = pages.filter((_, i) => i !== index);
        setPages(newPages);
    };

    const handleProcess = async () => {
        if (!file) return;

        setIsProcessing(true);
        try {
            const pdfBytes = await organizePdf(file, pages);
            const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            setProcessedPdfUrl(url);
        } catch (error) {
            console.error("Error processing PDF:", error);
            alert("Failed to organize PDF. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-12">
                <div className="max-w-6xl mx-auto space-y-8">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
                            <LayoutGrid className="w-8 h-8" />
                        </div>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Organize PDF</h1>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Rearrange document pages, delete unnecessary ones, and download your new PDF.
                        </p>
                    </div>

                    {!file ? (
                        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                            <PdfDropzone onFilesDropped={handleFileSelect} accept={{ "application/pdf": [".pdf"] }} maxFiles={1} />
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Toolbar */}
                            <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200 gap-4 sticky top-20 z-10">
                                <h3 className="font-bold text-slate-700">
                                    {pages.length} Pages • {isLoadingThumbnails ? "Loading previews..." : "Ready to organize"}
                                </h3>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => { setFile(null); setPages([]); setProcessedPdfUrl(null); setThumbnails([]); }}
                                        className="px-4 py-2 text-slate-600 font-medium hover:text-slate-900"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleProcess}
                                        disabled={isProcessing || pages.length === 0 || isLoadingThumbnails}
                                        className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-hover disabled:opacity-50 transition-colors"
                                    >
                                        {isProcessing ? <Loader2 className="animate-spin w-4 h-4" /> : "Save Changes"}
                                    </button>
                                </div>
                            </div>

                            {/* Grid Editor */}
                            {processedPdfUrl ? (
                                <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Download className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">New PDF Ready!</h3>
                                    <p className="text-slate-500 mb-8">You have successfully reorganized specific pages.</p>
                                    <div className="flex justify-center gap-4">
                                        <a
                                            href={processedPdfUrl}
                                            download={`organized_${file.name}`}
                                            className="inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-hover transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                        >
                                            <Download className="w-5 h-5" />
                                            Download PDF
                                        </a>
                                        <button
                                            onClick={() => { setFile(null); setPages([]); setProcessedPdfUrl(null); }}
                                            className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-8 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                                        >
                                            <RefreshCw className="w-5 h-5" />
                                            Start Over
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 min-h-[300px]">
                                    {isLoadingThumbnails && thumbnails.length === 0 ? (
                                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                                            <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
                                            <p>Rendering page thumbnails...</p>
                                        </div>
                                    ) : (
                                        pages.map((originalIndex, index) => (
                                            <div key={index} className="group relative bg-white border-2 border-slate-200 rounded-xl overflow-hidden hover:border-primary transition-all shadow-sm hover:shadow-md h-64 flex flex-col">
                                                {/* Page Number Badge */}
                                                <div className="absolute top-2 left-2 bg-slate-800 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full z-10 shadow-sm">
                                                    {index + 1}
                                                </div>

                                                {/* Thumbnail Image */}
                                                <div className="flex-1 bg-slate-50 flex items-center justify-center overflow-hidden p-2">
                                                    {thumbnails[originalIndex] ? (
                                                        <img
                                                            src={thumbnails[originalIndex]}
                                                            alt={`Page ${originalIndex + 1}`}
                                                            className="object-contain max-w-full max-h-full shadow-sm"
                                                        />
                                                    ) : (
                                                        <div className="animate-pulse w-full h-full bg-slate-200 rounded" />
                                                    )}
                                                </div>

                                                {/* Actions Footer */}
                                                <div className="bg-white border-t border-slate-100 p-2 flex justify-between items-center gap-1">
                                                    <button
                                                        onClick={() => movePage(index, 'left')}
                                                        disabled={index === 0}
                                                        className="p-1.5 hover:bg-slate-100 rounded text-slate-500 disabled:opacity-20 transition-colors"
                                                        title="Move Left"
                                                    >
                                                        <ArrowLeft className="w-4 h-4" />
                                                    </button>
                                                    <div className="text-[10px] text-slate-400 font-mono">
                                                        Src: {originalIndex + 1}
                                                    </div>
                                                    <button
                                                        onClick={() => deletePage(index)}
                                                        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded transition-colors"
                                                        title="Delete Page"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => movePage(index, 'right')}
                                                        disabled={index === pages.length - 1}
                                                        className="p-1.5 hover:bg-slate-100 rounded text-slate-500 disabled:opacity-20 transition-colors"
                                                        title="Move Right"
                                                    >
                                                        <ArrowRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
