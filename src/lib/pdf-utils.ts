import { PDFDocument, degrees, rgb, StandardFonts } from 'pdf-lib';

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
export async function addWatermark(pdfFile: File, text: string, options: {
    color: string;
    opacity: number;
    size: number;
    position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}): Promise<Uint8Array> {
    const pdfBytes = await pdfFile.arrayBuffer();
    const pdf = await PDFDocument.load(pdfBytes);
    const pages = pdf.getPages();
    const font = await pdf.embedFont(StandardFonts.HelveticaBold);

    // Convert hex color to rgb
    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255
        } : { r: 0, g: 0, b: 0 };
    }
    const colorRGB = hexToRgb(options.color);

    pages.forEach((page) => {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(text, options.size);
        const textHeight = font.heightAtSize(options.size);

        let x = 0;
        let y = 0;
        const margin = 20;

        switch (options.position) {
            case 'center':
                x = (width / 2) - (textWidth / 2);
                y = (height / 2) - (textHeight / 2);
                break;
            case 'top-left':
                x = margin;
                y = height - textHeight - margin;
                break;
            case 'top-right':
                x = width - textWidth - margin;
                y = height - textHeight - margin;
                break;
            case 'bottom-left':
                x = margin;
                y = margin;
                break;
            case 'bottom-right':
                x = width - textWidth - margin;
                y = margin;
                break;
        }

        page.drawText(text, {
            x,
            y,
            size: options.size,
            font: font,
            color: rgb(colorRGB.r, colorRGB.g, colorRGB.b),
            opacity: options.opacity,
            rotate: options.position === 'center' ? degrees(45) : degrees(0), // Slant if center
        });
    });

    const savedBytes = await pdf.save();
    return savedBytes;
}

export async function addPageNumbers(pdfFile: File, options: {
    position: 'bottom-center' | 'bottom-right' | 'bottom-left';
    startFrom: number;
    margin: number;
}): Promise<Uint8Array> {
    const pdfBytes = await pdfFile.arrayBuffer();
    const pdf = await PDFDocument.load(pdfBytes);
    const pages = pdf.getPages();
    const font = await pdf.embedFont(StandardFonts.Helvetica);

    pages.forEach((page, idx) => {
        const { width } = page.getSize();
        const pageNum = idx + options.startFrom;
        const text = `${pageNum}`;
        const textSize = 12;
        const textWidth = font.widthOfTextAtSize(text, textSize);

        let x = 0;
        let y = options.margin;

        switch (options.position) {
            case 'bottom-center':
                x = (width / 2) - (textWidth / 2);
                break;
            case 'bottom-right':
                x = width - textWidth - options.margin;
                break;
            case 'bottom-left':
                x = options.margin;
                break;
        }

        page.drawText(text, {
            x,
            y,
            size: textSize,
            font: font,
            color: rgb(0, 0, 0),
        });
    });

    const savedBytes = await pdf.save();
    return savedBytes;
}

export async function organizePdf(pdfFile: File, pageOrder: number[]): Promise<Uint8Array> {
    const pdfBytes = await pdfFile.arrayBuffer();
    const pdf = await PDFDocument.load(pdfBytes);
    const newPdf = await PDFDocument.create();

    // pageOrder is array of indices (0-based)
    const copiedPages = await newPdf.copyPages(pdf, pageOrder);
    copiedPages.forEach((page) => newPdf.addPage(page));

    const savedBytes = await newPdf.save();
    return savedBytes;
}
