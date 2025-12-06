"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface PdfDropzoneProps {
    onFilesDropped: (files: File[]) => void;
    className?: string;
    maxFiles?: number;
    accept?: Record<string, string[]>;
}

export function PdfDropzone({
    onFilesDropped,
    className,
    maxFiles = 0, // 0 means unlimited
    accept = { "application/pdf": [".pdf"] },
}: PdfDropzoneProps) {
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            onFilesDropped(acceptedFiles);
        },
        [onFilesDropped]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxFiles: maxFiles > 0 ? maxFiles : undefined,
    });

    return (
        <div
            {...getRootProps()}
            className={cn(
                "border-2 border-dashed rounded-xl p-10 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-4 text-center min-h-[300px] bg-slate-50 hover:bg-slate-100",
                isDragActive ? "border-primary bg-primary/5" : "border-slate-300",
                className
            )}
        >
            <input {...getInputProps()} />
            <div className={cn(
                "p-4 rounded-full transition-colors",
                isDragActive ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"
            )}>
                {isDragActive ? (
                    <FileText className="w-10 h-10" />
                ) : (
                    <Upload className="w-10 h-10" />
                )}
            </div>

            <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-700">
                    {isDragActive ? "Drop files here" : "Select PDF files"}
                </h3>
                <p className="text-slate-500 text-sm">
                    or drop files here
                </p>
            </div>

            <button className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-lg font-semibold shadow-md active:scale-95 transition-all">
                Select PDF files
            </button>
        </div>
    );
}
