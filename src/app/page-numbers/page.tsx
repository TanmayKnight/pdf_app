"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PdfDropzone } from "@/components/pdf-dropzone";
import { addPageNumbers } from "@/lib/pdf-utils";
import { convertPdfToImages } from "@/lib/pdf-render";
import { Loader2, Download, Hash, AlignCenter, AlignLeft, AlignRight, RefreshCw } from "lucide-react";

export default function PageNumbersPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedPdfUrl, setProcessedPdfUrl] = useState<string | null>(null);
    const [position, setPosition] = useState<'bottom-center' | 'bottom-right' | 'bottom-left'>('bottom-center');
    const [startFrom, setStartFrom] = useState(1);
    const [margin, setMargin] = useState(20);
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);

    const handleFileSelect = async (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setProcessedPdfUrl(null);
            setPreviewImages([]);
            setIsPreviewLoading(true);

            try {
                // Generate preview of first 3 pages
                const images = await convertPdfToImages(files[0], 3);
                const urls = images.map(img => URL.createObjectURL(img));
                setPreviewImages(urls);
            } catch (error) {
                console.error("Preview generation failed", error);
            } finally {
                setIsPreviewLoading(false);
            }
        }
    };

    const getOverlayStyle = () => {
        const baseStyle: React.CSSProperties = {
            position: 'absolute',
            bottom: `${margin}px`,
            color: 'black',
            fontSize: '12px',
            fontFamily: 'Helvetica, sans-serif',
            fontWeight: 'bold',
            pointerEvents: 'none',
            zIndex: 10,
        };

        switch (position) {
            case 'bottom-center':
                return { ...baseStyle, left: '50%', transform: 'translateX(-50%)' };
            case 'bottom-right':
                return { ...baseStyle, right: `${margin}px` };
            case 'bottom-left':
                return { ...baseStyle, left: `${margin}px` };
            default:
                return baseStyle;
        }
    };

    const handleProcess = async () => {
        if (!file) return;

        setIsProcessing(true);
        try {
            const pdfBytes = await addPageNumbers(file, {
                position,
                startFrom,
                margin
            });
            const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            setProcessedPdfUrl(url);
        } catch (error) {
            console.error("Error processing PDF:", error);
            alert("Failed to add page numbers. Please try again.");
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
                            <Hash className="w-8 h-8" />
                        </div>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Add Page Numbers</h1>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Easily number your PDF pages. Preview first 3 pages in real-time.
                        </p>
                    </div>

                    {!file ? (
                        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                            <PdfDropzone onFilesDropped={handleFileSelect} accept={{ "application/pdf": [".pdf"] }} maxFiles={1} />
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Controls */}
                            <div className="md:col-span-1 space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit sticky top-24">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <Hash className="w-4 h-4" /> Settings
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Position</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button
                                                onClick={() => setPosition('bottom-left')}
                                                className={`p-2 rounded-lg border flex justify-center ${position === 'bottom-left' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                                            >
                                                <AlignLeft className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => setPosition('bottom-center')}
                                                className={`p-2 rounded-lg border flex justify-center ${position === 'bottom-center' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                                            >
                                                <AlignCenter className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => setPosition('bottom-right')}
                                                className={`p-2 rounded-lg border flex justify-center ${position === 'bottom-right' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                                            >
                                                <AlignRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Start From</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={startFrom}
                                            onChange={(e) => setStartFrom(parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-primary focus:border-primary outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Margin</label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={margin}
                                            onChange={(e) => setMargin(parseInt(e.target.value))}
                                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                                        />
                                        <div className="text-xs text-slate-500 mt-1 text-right">{margin}px</div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleProcess}
                                    disabled={isProcessing}
                                    className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 px-4 rounded-xl font-bold hover:bg-primary-hover transition-colors disabled:opacity-50"
                                >
                                    {isProcessing ? <Loader2 className="animate-spin w-5 h-5" /> : "Apply & Download"}
                                </button>
                            </div>

                            {/* Preview area */}
                            <div className="md:col-span-2 space-y-6">
                                {processedPdfUrl ? (
                                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 text-center">
                                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Download className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900">Document Ready!</h3>
                                        <p className="text-slate-600">Page numbers added successfully.</p>

                                        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                                            <a
                                                href={processedPdfUrl}
                                                download={`numbered_${file.name}`}
                                                className="flex items-center justify-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-hover transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                            >
                                                <Download className="w-5 h-5" />
                                                Download PDF
                                            </a>
                                            <button
                                                onClick={() => { setFile(null); setProcessedPdfUrl(null); setPreviewImages([]); }}
                                                className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-8 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                                            >
                                                <RefreshCw className="w-5 h-5" />
                                                Start Over
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-slate-100 p-8 rounded-2xl shadow-inner border border-slate-200 min-h-[600px] overflow-y-auto max-h-[800px]">
                                        {isPreviewLoading ? (
                                            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                                <p>Generating Preview (First 3 pages)...</p>
                                            </div>
                                        ) : previewImages.length > 0 ? (
                                            <div className="space-y-8 flex flex-col items-center">
                                                {previewImages.map((imgUrl, index) => (
                                                    <div key={index} className="relative shadow-xl w-full max-w-lg bg-white">
                                                        <img
                                                            src={imgUrl}
                                                            alt={`Preview Page ${index + 1}`}
                                                            className="w-full h-auto"
                                                        />
                                                        {/* Styles Overlay */}
                                                        <div style={getOverlayStyle()}>
                                                            {startFrom + index}
                                                        </div>
                                                        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                                            Page {index + 1}
                                                        </div>
                                                    </div>
                                                ))}
                                                <p className="text-sm text-slate-500">Showing first 3 pages preview</p>
                                            </div>
                                        ) : (
                                            <div className="text-center text-slate-400 mt-20">
                                                <p>Preview failed to load</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
