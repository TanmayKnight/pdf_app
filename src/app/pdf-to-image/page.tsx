"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PdfDropzone } from "@/components/pdf-dropzone";
import { convertPdfToImages } from "@/lib/pdf-render";
import { Loader2, File, ArrowRight, Download, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import JSZip from "jszip";

export default function PdfToImagePage() {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    const handleFilesDropped = (droppedFiles: File[]) => {
        if (droppedFiles.length > 0) {
            setFile(droppedFiles[0]);
            setDownloadUrl(null);
        }
    };

    const handleConvert = async () => {
        if (!file) return;
        setIsProcessing(true);

        try {
            const images = await convertPdfToImages(file);

            if (images.length === 0) {
                alert("No images could be extracted.");
                return;
            }

            const zip = new JSZip();
            images.forEach((blob, idx) => {
                zip.file(`${file.name.replace('.pdf', '')}_page_${idx + 1}.jpg`, blob);
            });

            const content = await zip.generateAsync({ type: "blob" });
            setDownloadUrl(URL.createObjectURL(content));

        } catch (error) {
            console.error("Conversion failed", error);
            alert("Failed to convert PDF to images.");
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
                        <h1 className="text-4xl font-extrabold text-slate-900">PDF to Image conversion</h1>
                        <p className="text-xl text-slate-600">Convert each PDF page into a JPG or extract all images contained in a PDF.</p>
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
                                <div className="text-center md:text-left">
                                    <h3 className="text-lg font-bold text-slate-800 mb-2">Convert Pages to JPG</h3>
                                    <p className="text-sm text-slate-600">Every page of this PDF will be converted into a JPG image file.</p>
                                </div>

                                <button
                                    onClick={handleConvert}
                                    disabled={isProcessing}
                                    className={cn(
                                        "w-full flex items-center justify-center gap-2 bg-primary text-white text-xl px-12 py-4 rounded-xl font-bold hover:bg-primary-hover shadow-lg transform hover:-translate-y-1 transition-all",
                                        isProcessing && "opacity-50 cursor-not-allowed hover:transform-none"
                                    )}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="animate-spin w-6 h-6" />
                                            Converting...
                                        </>
                                    ) : (
                                        <>
                                            Convert to JPG
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
                            <h2 className="text-3xl font-bold text-slate-800">PDF Converted!</h2>
                            <p className="text-slate-600 text-lg">
                                Your images are ready to download.
                            </p>
                            <div className="flex justify-center gap-4 pt-4">
                                <a
                                    href={downloadUrl}
                                    download="images.zip"
                                    className="flex items-center gap-2 bg-primary text-white text-lg px-8 py-3 rounded-lg font-bold hover:bg-primary-hover shadow-lg hover:-translate-y-1 transition-all"
                                >
                                    Download JPG Images
                                </a>
                                <button
                                    onClick={() => {
                                        setFile(null);
                                        setDownloadUrl(null);
                                    }}
                                    className="text-slate-500 hover:text-slate-700 font-medium px-4"
                                >
                                    Convert another
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
