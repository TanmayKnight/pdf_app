"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PdfDropzone } from "@/components/pdf-dropzone";
import { splitPdf, getPdfPageCount } from "@/lib/pdf-utils";
import { Loader2, File, ArrowRight, Download, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import JSZip from "jszip";

export default function SplitPdfPage() {
    const [file, setFile] = useState<File | null>(null);
    const [pageCount, setPageCount] = useState<number>(0);
    const [splitMode, setSplitMode] = useState<"all" | "extract">("all");
    const [extractRanges, setExtractRanges] = useState<string>("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    // Handlers for Dropzone
    const handleFilesDropped = async (droppedFiles: File[]) => {
        if (droppedFiles.length > 0) {
            const selectedFile = droppedFiles[0];
            setFile(selectedFile);
            setDownloadUrl(null);
            // Get page count
            try {
                const count = await getPdfPageCount(selectedFile);
                setPageCount(count);
            } catch (e) {
                console.error("Failed to load PDF", e);
                alert("Invalid PDF file");
                setFile(null);
            }
        }
    };

    const parseRanges = (rangeStr: string, totalPages: number): number[] => {
        // 1-3, 5, 7-9
        const pages: Set<number> = new Set();
        const parts = rangeStr.split(",");
        for (const part of parts) {
            const trimmed = part.trim();
            if (trimmed.includes("-")) {
                const [start, end] = trimmed.split("-").map(Number);
                if (!isNaN(start) && !isNaN(end) && start > 0 && end <= totalPages && start <= end) {
                    for (let i = start; i <= end; i++) {
                        pages.add(i - 1); // 0-indexed
                    }
                }
            } else {
                const num = Number(trimmed);
                if (!isNaN(num) && num > 0 && num <= totalPages) {
                    pages.add(num - 1);
                }
            }
        }
        return Array.from(pages).sort((a, b) => a - b);
    };

    const handleSplit = async () => {
        if (!file) return;
        setIsProcessing(true);

        try {
            let pdfs: Uint8Array[] = [];

            if (splitMode === 'all') {
                pdfs = await splitPdf(file);
            } else {
                const pagesToExtract = parseRanges(extractRanges, pageCount);
                if (pagesToExtract.length === 0) {
                    alert("Please enter valid page numbers to extract.");
                    setIsProcessing(false);
                    return;
                }
                // For "extract", we currently implement "Merge extracted pages into one file" behavior as common default
                // Or we could split them individually. Let's do "Merge extracted" for simplicity of the "Extract" concept usually implies creating a new doc from subset

                // Wait, ilovepdf "Split" -> "extract pages" usually means "Select pages" and then either "merge selected pages in one PDF" or "split selected pages".
                // Let's implement: "Selected pages" -> Save as a new single PDF containing those pages.
                pdfs = await splitPdf(file, pagesToExtract);
            }

            if (pdfs.length === 1) {
                const blob = new Blob([pdfs[0] as unknown as BlobPart], { type: "application/pdf" });
                setDownloadUrl(URL.createObjectURL(blob));
            } else {
                // Zip multiple files
                const zip = new JSZip();
                pdfs.forEach((pdfBytes, idx) => {
                    zip.file(`${file.name.replace(".pdf", "")}_page_${idx + 1}.pdf`, pdfBytes);
                });
                const content = await zip.generateAsync({ type: "blob" });
                setDownloadUrl(URL.createObjectURL(content));
            }

        } catch (error) {
            console.error("Split failed", error);
            alert("Failed to split PDF.");
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
                        <h1 className="text-4xl font-extrabold text-slate-900">Split PDF file</h1>
                        <p className="text-xl text-slate-600">Separate one page or a whole set for easy conversion into independent PDF files.</p>
                    </div>

                    {!file && (
                        <div className="bg-white p-2 rounded-2xl shadow-sm">
                            <PdfDropzone onFilesDropped={handleFilesDropped} maxFiles={1} />
                        </div>
                    )}

                    {file && !downloadUrl && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
                            {/* Left: Preview / File Info */}
                            <div className="bg-slate-100 p-8 flex-1 flex flex-col items-center justify-center border-r border-slate-200 gap-4">
                                <div className="w-32 h-44 bg-white border border-slate-300 shadow-md flex items-center justify-center rounded">
                                    <File className="text-red-500 w-12 h-12" />
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-slate-700 truncate max-w-[200px]">{file.name}</p>
                                    <p className="text-sm text-slate-500">{pageCount} Pages • {(file.size / 1024 / 1024).toFixed(2)}MB</p>
                                </div>
                                <button onClick={() => setFile(null)} className="text-red-600 text-sm font-medium hover:underline">Change File</button>
                            </div>

                            {/* Right: Options */}
                            <div className="p-8 flex-1 space-y-8">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-4">Split Options</h3>
                                    <div className="flex gap-4 mb-6">
                                        <button
                                            onClick={() => setSplitMode("all")}
                                            className={cn(
                                                "flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all text-sm",
                                                splitMode === "all" ? "border-primary bg-primary/5 text-primary" : "border-slate-200 text-slate-600 hover:border-slate-300"
                                            )}
                                        >
                                            Split All Pages
                                        </button>
                                        <button
                                            onClick={() => setSplitMode("extract")}
                                            className={cn(
                                                "flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all text-sm",
                                                splitMode === "extract" ? "border-primary bg-primary/5 text-primary" : "border-slate-200 text-slate-600 hover:border-slate-300"
                                            )}
                                        >
                                            Extract Pages
                                        </button>
                                    </div>

                                    {splitMode === "all" ? (
                                        <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg">
                                            Every page of this PDF will be converted into a separate PDF file. You will download a ZIP file containing {pageCount} PDFs.
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Pages to extract</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 1, 3-5, 8"
                                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                value={extractRanges}
                                                onChange={(e) => setExtractRanges(e.target.value)}
                                            />
                                            <p className="text-xs text-slate-500">
                                                Enter page numbers or ranges separated by commas.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleSplit}
                                    disabled={isProcessing}
                                    className={cn(
                                        "w-full flex items-center justify-center gap-2 bg-primary text-white text-xl px-12 py-4 rounded-xl font-bold hover:bg-primary-hover shadow-lg transform hover:-translate-y-1 transition-all",
                                        isProcessing && "opacity-50 cursor-not-allowed hover:transform-none"
                                    )}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="animate-spin w-6 h-6" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            {splitMode === "all" ? "Split PDF" : "Extract PDF"}
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
                            <h2 className="text-3xl font-bold text-slate-800">Your PDF has been split!</h2>
                            <div className="flex justify-center gap-4 pt-4">
                                <a
                                    href={downloadUrl}
                                    download={splitMode === 'all' ? "split_pages.zip" : "extracted.pdf"}
                                    className="flex items-center gap-2 bg-primary text-white text-lg px-8 py-3 rounded-lg font-bold hover:bg-primary-hover shadow-lg hover:-translate-y-1 transition-all"
                                >
                                    Download {splitMode === 'all' ? 'ZIP' : 'PDF'}
                                </a>
                                <button
                                    onClick={() => {
                                        setFile(null);
                                        setDownloadUrl(null);
                                    }}
                                    className="text-slate-500 hover:text-slate-700 font-medium px-4"
                                >
                                    Split another PDF
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
