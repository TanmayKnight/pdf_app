"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PdfDropzone } from "@/components/pdf-dropzone";
import { rotatePdf } from "@/lib/pdf-utils";
import { convertPdfToImages } from "@/lib/pdf-render";
import { Loader2, File, ArrowRight, Download, CheckCircle2, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RotatePdfPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [rotation, setRotation] = useState<number>(90); // Default 90 degrees clockwise

    const handleFilesDropped = async (droppedFiles: File[]) => {
        if (droppedFiles.length > 0) {
            const selectedFile = droppedFiles[0];
            setFile(selectedFile);
            setDownloadUrl(null);
            setPreviewUrl(null);
            setRotation(90);

            // Generate preview
            try {
                // We only need the first page for preview-icon
                const images = await convertPdfToImages(selectedFile);
                if (images.length > 0) {
                    setPreviewUrl(URL.createObjectURL(images[0]));
                }
            } catch (err) {
                console.error("Preview generation failed", err);
            }
        }
    };

    const handleRotate = async () => {
        if (!file) return;
        setIsProcessing(true);

        try {
            const pdfBytes = await rotatePdf(file, rotation);
            const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
            setDownloadUrl(URL.createObjectURL(blob));

        } catch (error) {
            console.error("Rotation failed", error);
            alert("Failed to rotate PDF.");
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
                        <h1 className="text-4xl font-extrabold text-slate-900">Rotate PDF files</h1>
                        <p className="text-xl text-slate-600">Rotate your PDFs the way you need them. Simple and fast.</p>
                    </div>

                    {!file && (
                        <div className="bg-white p-2 rounded-2xl shadow-sm">
                            <PdfDropzone onFilesDropped={handleFilesDropped} maxFiles={1} />
                        </div>
                    )}

                    {file && !downloadUrl && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
                            <div className="bg-slate-100 p-8 flex-1 flex flex-col items-center justify-center border-r border-slate-200 gap-4">
                                <div className="w-[200px] h-[280px] bg-slate-200 border border-slate-300 shadow-md flex items-center justify-center rounded relative transition-transform duration-500 overflow-hidden" style={{ transform: `rotate(${rotation}deg)` }}>
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="PDF Preview" className="w-full h-full object-contain bg-white" />
                                    ) : (
                                        <File className="text-red-500 w-12 h-12" />
                                    )}
                                    <span className="absolute top-2 right-2 text-xs bg-slate-200/90 px-1 rounded z-10">PDF</span>
                                </div>
                                <div className="text-center mt-4">
                                    <p className="font-bold text-slate-700 truncate max-w-[200px]">{file.name}</p>
                                </div>
                                <button onClick={() => setFile(null)} className="text-red-600 text-sm font-medium hover:underline">Change File</button>
                            </div>

                            <div className="p-8 flex-1 flex flex-col justify-center space-y-8">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-4">Rotation Options</h3>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setRotation((prev) => (prev + 90) % 360 || 360)} // Keep positive for effect
                                            className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold flex flex-col items-center gap-2 transition-colors border border-slate-200"
                                        >
                                            <RotateCw className="w-6 h-6" />
                                            Rotate Right (90°)
                                        </button>
                                    </div>
                                    <p className="text-sm text-slate-500 mt-4 text-center">
                                        Total Rotation: {rotation}°
                                    </p>
                                </div>

                                <button
                                    onClick={handleRotate}
                                    disabled={isProcessing}
                                    className={cn(
                                        "w-full flex items-center justify-center gap-2 bg-primary text-white text-xl px-12 py-4 rounded-xl font-bold hover:bg-primary-hover shadow-lg transform hover:-translate-y-1 transition-all",
                                        isProcessing && "opacity-50 cursor-not-allowed hover:transform-none"
                                    )}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="animate-spin w-6 h-6" />
                                            Rotating...
                                        </>
                                    ) : (
                                        <>
                                            Rotate PDF
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
                            <h2 className="text-3xl font-bold text-slate-800">PDF Rotated!</h2>
                            <p className="text-slate-600 text-lg">
                                The pages have been rotated successfully.
                            </p>
                            <div className="flex justify-center gap-4 pt-4">
                                <a
                                    href={downloadUrl}
                                    download={`rotated_${file?.name || 'doc.pdf'}`}
                                    className="flex items-center gap-2 bg-primary text-white text-lg px-8 py-3 rounded-lg font-bold hover:bg-primary-hover shadow-lg hover:-translate-y-1 transition-all"
                                >
                                    Download PDF
                                </a>
                                <button
                                    onClick={() => {
                                        setFile(null);
                                        setDownloadUrl(null);
                                        setRotation(90);
                                    }}
                                    className="text-slate-500 hover:text-slate-700 font-medium px-4"
                                >
                                    Rotate another
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
