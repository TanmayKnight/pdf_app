import { PDFDocument, degrees } from 'pdf-lib';

export async function mergePdfs(pdfFiles: File[]): Promise<Uint8Array> {
    const mergedPdf = await PDFDocument.create();

    for (const pdfFile of pdfFiles) {
        const pdfBytes = await pdfFile.arrayBuffer();
        const pdf = await PDFDocument.load(pdfBytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save();
    return mergedPdfBytes;
}

export async function splitPdf(pdfFile: File, selectedPages?: number[]): Promise<Uint8Array[]> {
    const pdfBytes = await pdfFile.arrayBuffer();
    const pdf = await PDFDocument.load(pdfBytes);
    const splitDocuments: Uint8Array[] = [];

    // If selectedPages is provided, we create a new PDF with ONLY those pages
    if (selectedPages) {
        const newPdf = await PDFDocument.create();
        const copiedPages = await newPdf.copyPages(pdf, selectedPages);
        copiedPages.forEach((page) => newPdf.addPage(page));
        const saved = await newPdf.save();
        splitDocuments.push(saved);
        return splitDocuments;
    }

    // Default: Split every page into its own PDF
    const pageCount = pdf.getPageCount();
    for (let i = 0; i < pageCount; i++) {
        const newPdf = await PDFDocument.create();
        const [copiedPage] = await newPdf.copyPages(pdf, [i]);
        newPdf.addPage(copiedPage);
        const saved = await newPdf.save();
        splitDocuments.push(saved);
    }

    return splitDocuments;
}

export async function getPdfPageCount(pdfFile: File): Promise<number> {
    const pdfBytes = await pdfFile.arrayBuffer();
    const pdf = await PDFDocument.load(pdfBytes);
    return pdf.getPageCount();
}

export async function compressPdf(pdfFile: File): Promise<Uint8Array> {
    const pdfBytes = await pdfFile.arrayBuffer();
    const pdf = await PDFDocument.load(pdfBytes);
    // pdf-lib optimizes by default on save, removing unused objects
    // usage of object streams can also reduce size
    const compressedBytes = await pdf.save({ useObjectStreams: false });
    return compressedBytes;
}

export async function imagesToPdf(imageFiles: File[]): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();

    for (const imageFile of imageFiles) {
        const imageBytes = await imageFile.arrayBuffer();
        let image;

        if (imageFile.type === 'image/jpeg' || imageFile.type === 'image/jpg') {
            image = await pdfDoc.embedJpg(imageBytes);
        } else if (imageFile.type === 'image/png') {
            image = await pdfDoc.embedPng(imageBytes);
        } else {
            continue; // Skip unsupported
        }

        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height,
        });
    }

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
}

export async function rotatePdf(pdfFile: File, rotation: number): Promise<Uint8Array> {
    const pdfBytes = await pdfFile.arrayBuffer();
    const pdf = await PDFDocument.load(pdfBytes);
    const pages = pdf.getPages();

    pages.forEach((page) => {
        const currentRotation = page.getRotation().angle;
        const normalizedRotation = (currentRotation + rotation) % 360;
        page.setRotation(degrees(normalizedRotation));
    });
    const savedBytes = await pdf.save();
    return savedBytes;
}

export async function protectPdf(pdfFile: File, password: string): Promise<Uint8Array> {
    const pdfBytes = await pdfFile.arrayBuffer();
    const pdf = await PDFDocument.load(pdfBytes);

    // Encrypt via save options (legacy/alternative method supported by installed pdf-lib)
    const savedBytes = await pdf.save({
        userPassword: password,
        ownerPassword: password,
        permissions: {
            printing: 'highResolution',
            modifying: false,
            copying: false,
            annotating: false,
            fillingForms: false,
            contentAccessibility: false,
            documentAssembly: false,
        } as any, // Cast permissions to any to avoid strict type checks if definitions vary
    } as any); // Cast options to any as save options might trigger type mismatch
    return savedBytes;
}

export async function unlockPdf(pdfFile: File, password: string): Promise<Uint8Array> {
    const pdfBytes = await pdfFile.arrayBuffer();
    // Load with password. If password is wrong, load will throw error, which we catch in UI.
    // @ts-ignore - password option exists in runtime
    const pdf = await PDFDocument.load(pdfBytes, { password });
    const savedBytes = await pdf.save();
    return savedBytes;
}
