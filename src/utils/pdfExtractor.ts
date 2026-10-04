import * as pdfjsLib from 'pdfjs-dist';

// Configure worker using local Vite bundled worker URL
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).href;
  } catch (e) {
    console.warn('PDF worker setup:', e);
  }
}

/**
 * Fallback parser to extract readable text tokens from raw PDF ArrayBuffer
 * when PDF.js worker fails or is blocked by network/offline mode.
 */
function extractTextFromRawPdfBuffer(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let raw = '';
  // Decode ASCII/UTF-8 bytes
  try {
    const decoder = new TextDecoder('utf-8', { fatal: false });
    raw = decoder.decode(bytes);
  } catch {
    for (let i = 0; i < bytes.length; i++) {
      raw += String.fromCharCode(bytes[i]);
    }
  }

  const extractedPieces: string[] = [];

  // Match text in parentheses followed by Tj or ' or "
  // e.g. (Soal 1: ...) Tj
  const parenRegex = /\(([^()]{2,})\)\s*(?:Tj|'|")/g;
  let match: RegExpExecArray | null;
  while ((match = parenRegex.exec(raw)) !== null) {
    const cleanStr = match[1]
      .replace(/\\([()\\])/g, '$1')
      .replace(/\\r/g, '\r')
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .trim();
    if (cleanStr.length > 0) {
      extractedPieces.push(cleanStr);
    }
  }

  // Also match array text blocks: [(Soal) 10 (1:) -20 (Dalam...)] TJ
  const arrayRegex = /\[(.*?)\]\s*TJ/g;
  while ((match = arrayRegex.exec(raw)) !== null) {
    const inner = match[1];
    const itemRegex = /\(([^()]+)\)/g;
    let itemMatch: RegExpExecArray | null;
    const lineParts: string[] = [];
    while ((itemMatch = itemRegex.exec(inner)) !== null) {
      lineParts.push(itemMatch[1]);
    }
    if (lineParts.length > 0) {
      extractedPieces.push(lineParts.join(''));
    }
  }

  return extractedPieces.join('\n');
}

/**
 * Extracts plain text from an uploaded PDF File
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
    });

    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    const textPieces: string[] = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        // @ts-expect-error pdfjs item has str
        .map((item) => item.str || '')
        .join(' ');

      textPieces.push(pageText);
    }

    const fullText = textPieces.join('\n\n').trim();
    if (fullText.length > 0) {
      return fullText;
    }
  } catch (pdfErr) {
    console.warn('PDF.js parser error, falling back to raw buffer parser:', pdfErr);
  }

  // Fallback to direct raw PDF buffer extraction
  const rawExtracted = extractTextFromRawPdfBuffer(arrayBuffer);
  if (rawExtracted.trim().length > 0) {
    return rawExtracted;
  }

  throw new Error('Tidak dapat mengekstrak teks dari berkas PDF ini. Pastikan berkas bukan gambar scan murni tanpa layer teks.');
}
