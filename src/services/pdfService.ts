import PDFDocument from 'pdfkit';
import path from 'path';
import pdfParse from 'pdf-parse';

export class PDFService {
    static async parsePdf(buffer: Buffer): Promise<string> {
        const pdfData = await pdfParse(buffer);
        return this.cleanPdfText(pdfData.text);
    }

    static cleanPdfText(text: string): string {
        return text.replace(/\n/g, ' ').replace(/\s\s+/g, ' ').trim();
    }

    static createSummaryPDF(summary: string): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                size: 'A4',
                margins: { top: 50, bottom: 50, left: 50, right: 50 }
            });
            const chunks: Buffer[] = [];

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));

            doc.registerFont('CustomFont', path.join(__dirname, '../assets/fonts/Roboto-Regular.ttf'));
            doc.font('CustomFont');

            doc.fontSize(16).text('Belge Özeti', { align: 'center', width: doc.page.width - 100 });
            doc.moveDown(2);
            doc.fontSize(12).text(summary, { align: 'justify', width: doc.page.width - 100, lineGap: 5, indent: 20 });

            doc.end();
        });
    }
}
