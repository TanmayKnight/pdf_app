"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PdfDropzone } from "@/components/pdf-dropzone";
import { addWatermark } from "@/lib/pdf-utils";
import { convertPdfToImages } from "@/lib/pdf-render";
import { Loader2, Download, Stamp, Type, RefreshCw, Palette, Layers, Move } from "lucide-react";

export default function WatermarkPdfPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedPdfUrl, setProcessedPdfUrl] = useState<string | null>(null);
    const [text, setText] = useState("Confidential");
    const [color, setColor] = useState("#ff0000");
    const [opacity, setOpacity] = useState(0.5);
    const [size, setSize] = useState(50);
    const [position, setPosition] = useState<'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('center');
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);

    const handleFileSelect = async (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setProcessedPdfUrl(null);
            setPreviewImage(null);
            setIsPreviewLoading(true);

            try {
                // Generate preview of first page
                const images = await convertPdfToImages(files[0]);
                if (images.length > 0) {
                    setPreviewImage(URL.createObjectURL(images[0]));
                }
            } catch (error) {
                console.error("Preview generation failed", error);
            } finally {
                setIsPreviewLoading(false);
            }
        }
    };

    // Style generation for preview overlay
    const getOverlayStyle = () => {
        const baseStyle: React.CSSProperties = {
            position: 'absolute',
            color: color,
            opacity: opacity,
            fontSize: `${size / 2}px`, // Scale down slightly for visual fit on screen vs PDF point size
            fontWeight: 'bold',
            fontFamily: 'Helvetica, Arial, sans-serif',
            pointerEvents: 'none', // Allow clicks to pass through
            zIndex: 10,
        };

        switch (position) {
            case 'center':
                return { ...baseStyle, top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(45deg)' };
            case 'top-left':
                return { ...baseStyle, top: '5%', left: '5%' };
            case 'top-right':
                return { ...baseStyle, top: '5%', right: '5%' };
            case 'bottom-left':
                return { ...baseStyle, bottom: '5%', left: '5%' };
            case 'bottom-right':
                return { ...baseStyle, bottom: '5%', right: '5%' };
            default:
                return baseStyle;
        }
    };

    const handleProcess = async () => {
        if (!file) return;

        setIsProcessing(true);
        try {
            const pdfBytes = await addWatermark(file, text, {
                color,
                opacity,
                size,
                position
            });
            const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            setProcessedPdfUrl(url);
        } catch (error) {
            console.error("Error processing PDF:", error);
            alert("Failed to watermark PDF. Please try again.");
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
                            <Stamp className="w-8 h-8" />
                        </div>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Watermark PDF</h1>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Stamp text over your PDF pages. Preview in real-time.
                        </p>
                    </div>

                    {!file ? (
                        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                            <PdfDropzone onFilesDropped={handleFileSelect} accept={{ "application/pdf": [".pdf"] }} maxFiles={1} />
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Controls */}
                            <div className="md:col-span-1 space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <Stamp className="w-4 h-4" /> Watermark Settings
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><Type className="w-3 h-3" /> Text</label>
                                        <input
                                            type="text"
                                            value={text}
                                            onChange={(e) => setText(e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-primary focus:border-primary outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><Palette className="w-3 h-3" /> Color</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={color}
                                                onChange={(e) => setColor(e.target.value)}
                                                className="w-10 h-10 p-1 rounded cursor-pointer border border-slate-300"
                                            />
                                            <span className="text-xs text-slate-500">{color}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><Layers className="w-3 h-3" /> Opacity ({Math.round(opacity * 100)}%)</label>
                                        <input
                                            type="range"
                                            min="0.1"
                                            max="1"
                                            step="0.1"
                                            value={opacity}
                                            onChange={(e) => setOpacity(parseFloat(e.target.value))}
                                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><Move className="w-3 h-3" /> Position</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {/* Visual Position Grid */}
                                            {['top-left', 'center', 'top-right', 'bottom-left', 'bottom-right'].map((pos) => (
                                                <button
                                                    key={pos}
                                                    onClick={() => setPosition(pos as any)}
                                                    className={`p-2 rounded border text-xs ${position === pos ? 'bg-primary text-white border-primary' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                                                >
                                                    {pos.replace('-', ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Font Size ({size}px)</label>
                                        <input
                                            type="range"
                                            min="20"
                                            max="200"
                                            step="5"
                                            value={size}
                                            onChange={(e) => setSize(parseInt(e.target.value))}
                                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                                        />
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
                            <div className="md:col-span-2 bg-slate-100 p-8 rounded-2xl shadow-inner border border-slate-200 flex flex-col items-center justify-start min-h-[600px] overflow-auto relative">
                                {processedPdfUrl ? (
                                    <div className="text-center space-y-6 mt-12 bg-white p-8 rounded-2xl shadow-lg">
                                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Download className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900">Document Ready!</h3>
                                        <p className="text-slate-600">Your watermarked PDF has been generated.</p>

                                        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                                            <a
                                                href={processedPdfUrl}
                                                download={`watermarked_${file.name}`}
                                                className="flex items-center justify-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-hover transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                            >
                                                <Download className="w-5 h-5" />
                                                Download PDF
                                            </a>
                                            <button
                                                onClick={() => { setFile(null); setProcessedPdfUrl(null); setPreviewImage(null); }}
                                                className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-8 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                                            >
                                                <RefreshCw className="w-5 h-5" />
                                                Start Over
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {isPreviewLoading ? (
                                            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                                <p>Generating Preview...</p>
                                            </div>
                                        ) : previewImage ? (
                                            <div className="relative shadow-2xl">
                                                <img
                                                    src={previewImage}
                                                    alt="Preview"
                                                    className="max-w-full h-auto bg-white"
                                                    style={{ maxHeight: '70vh' }}
                                                />
                                                {/* Styles Overlay */}
                                                <div style={getOverlayStyle()}>
                                                    {text}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center text-slate-400">
                                                <p>Preview failed to load</p>
                                            </div>
                                        )}
                                        {!processedPdfUrl && (
                                            <p className="mt-4 text-xs text-slate-400 font-medium">Real-time Preview (Approximation)</p>
                                        )}
                                    </>
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
