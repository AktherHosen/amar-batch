import jsPDF from 'jspdf';

function hexToRGB(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
        return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
    }
    return [99, 102, 241];
}

type ReceiptData = {
    receipt_number: string;
    student: { name: string; phone: string; guardian_name: string; guardian_phone: string };
    batch: { name: string; subject: string };
    month: number;
    year: number;
    amount_paid: number;
    amount_due: number;
    notes: string | null;
    created_at: string;
    creator: { name: string };
};

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

export function generateReceiptPDF({
    receipt,
    centerName = '',
    primaryColor = '#6366f1',
}: {
    receipt: ReceiptData;
    centerName?: string;
    primaryColor?: string;
}) {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const [pr, pg, pb] = hexToRGB(primaryColor);

    let y = 20;

    // Header background
    doc.setFillColor(pr, pg, pb);
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Center name
    if (centerName) {
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(centerName.toUpperCase(), pageWidth / 2, 12, { align: 'center' });
    }

    // Receipt title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('FEE RECEIPT', pageWidth / 2, 24, { align: 'center' });

    // Receipt number
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(receipt.receipt_number, pageWidth / 2, 32, { align: 'center' });

    y = 50;

    // Receipt info box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, y, pageWidth - 28, 18, 2, 2, 'F');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Receipt No:', 18, y + 7);
    doc.text('Date:', 18, y + 13);
    doc.text(receipt.receipt_number, 45, y + 7);
    doc.text(new Date(receipt.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), 45, y + 13);

    doc.text('Period:', pageWidth / 2 + 4, y + 7);
    doc.text('Received By:', pageWidth / 2 + 4, y + 13);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text(`${MONTHS[receipt.month - 1]} ${receipt.year}`, pageWidth / 2 + 25, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.text(receipt.creator.name, pageWidth / 2 + 25, y + 13);

    y += 28;

    // Student info section
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(pr, pg, pb);
    doc.text('STUDENT INFORMATION', 14, y);
    y += 2;
    doc.setDrawColor(pr, pg, pb);
    doc.setLineWidth(0.5);
    doc.line(14, y, pageWidth / 2 - 5, y);
    y += 8;

    const leftCol = 14;
    const rightCol = pageWidth / 2 + 5;

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');

    doc.text('Name:', leftCol, y);
    doc.text(receipt.student.name, leftCol + 20, y);
    y += 6;
    doc.text('Phone:', leftCol, y);
    doc.text(receipt.student.phone || 'N/A', leftCol + 20, y);
    y += 6;
    doc.text('Guardian:', leftCol, y);
    doc.text(receipt.student.guardian_name || 'N/A', leftCol + 20, y);
    y += 6;
    doc.text('Guardian Phone:', leftCol, y);
    doc.text(receipt.student.guardian_phone || 'N/A', leftCol + 20, y);

    y += 12;

    // Batch info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(pr, pg, pb);
    doc.text('BATCH INFORMATION', 14, y);
    y += 2;
    doc.line(14, y, pageWidth / 2 - 5, y);
    y += 8;

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text('Batch:', leftCol, y);
    doc.text(receipt.batch.name, leftCol + 20, y);
    y += 6;
    doc.text('Subject:', leftCol, y);
    doc.text(receipt.batch.subject || 'N/A', leftCol + 20, y);

    y += 14;

    // Amount box
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(14, y, pageWidth - 28, 24, 2, 2, 'F');

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Amount Due', 22, y + 9);
    doc.text('Amount Paid', pageWidth / 2 + 10, y + 9);

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`৳${Number(receipt.amount_due).toLocaleString()}`, 22, y + 19);
    doc.setTextColor(22, 163, 74);
    doc.text(`৳${Number(receipt.amount_paid).toLocaleString()}`, pageWidth / 2 + 10, y + 19);

    y += 32;

    // Notes
    if (receipt.notes) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(pr, pg, pb);
        doc.text('NOTES', 14, y);
        y += 2;
        doc.line(14, y, pageWidth / 2 - 5, y);
        y += 8;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 41, 59);
        const noteLines = doc.splitTextToSize(receipt.notes, pageWidth - 56);
        doc.text(noteLines, 14, y);
        y += noteLines.length * 5 + 8;
    }

    // Footer section
    const footerY = 260;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);

    // Signature line
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text('Received By:', 14, footerY);
    doc.line(14, footerY + 20, 80, footerY + 20);
    doc.text('Authorized Signature', 14, footerY + 25);

    // Date stamp
    doc.text('Date & Stamp:', pageWidth - 80, footerY);
    doc.line(pageWidth - 80, footerY + 20, pageWidth - 14, footerY + 20);
    doc.text('Official Stamp', pageWidth - 80, footerY + 25);

    // Footer bar
    doc.setFillColor(pr, pg, pb);
    doc.rect(0, 285, pageWidth, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.text(`${centerName} | ${receipt.receipt_number}`, pageWidth / 2, 292, { align: 'center' });

    doc.save(`receipt_${receipt.receipt_number}.pdf`);
}
