// Remove top level import to prevent SSR issues
// import * as pdfjsLib from 'pdfjs-dist';

export async function convertPdfToImages(file: File): Promise<Blob[]> {
    // Dynamic import to ensure this only runs on client
    const pdfjsLib = await import('pdfjs-dist');

    // Set worker source to local file to avoid CDN issues/version mismatches
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const pageCount = pdf.numPages;
    const images: Blob[] = [];

    for (let i = 1; i <= pageCount; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // High quality scale

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (!context) continue;

        await page.render({
            canvasContext: context,
            viewport: viewport
        } as any).promise;

        // Convert canvas to blob
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
        if (blob) images.push(blob);
    }

    return images;
}
