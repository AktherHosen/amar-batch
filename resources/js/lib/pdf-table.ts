import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function hexToRGB(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    if (result) {
        return [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16),
        ];
    }

    return [99, 102, 241]; // Default indigo
}

export function generateTablePDF({
    title,
    headers,
    rows,
    filename,
    primaryColor = '#6366f1',
    centerName = '',
}: {
    title: string;
    headers: string[];
    rows: (string | number)[][];
    filename: string;
    primaryColor?: string;
    centerName?: string;
}) {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const [pr, pg, pb] = hexToRGB(primaryColor);

    // Header background
    doc.setFillColor(pr, pg, pb);
    doc.rect(0, 0, pageWidth, 35, 'F');

    // Thin accent line below header
    doc.setFillColor(pr, pg, pb);
    doc.rect(0, 35, pageWidth, 1, 'F');

    // Coaching center name
    if (centerName) {
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(centerName.toUpperCase(), 14, 10);
    }

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, 20);

    // Date line
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 255);
    doc.text(
        `Generated on ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`,
        14,
        27,
    );

    // Table
    autoTable(doc, {
        startY: 42,
        head: [headers],
        body: rows.map((row) => row.map(String)),
        styles: {
            fontSize: 9,
            cellPadding: 4,
            textColor: [30, 41, 59],
            lineColor: [226, 232, 240],
            lineWidth: 0.1,
        },
        headStyles: {
            fillColor: [pr, pg, pb],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9,
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252],
        },
        margin: { left: 14, right: 14 },
    });

    // Footer
    const pageCount = doc.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        // Footer line
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);

        // Page number
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, {
            align: 'center',
        });

        // Center name in footer
        if (centerName) {
            doc.text(centerName, 14, pageHeight - 10);
        }
    }

    doc.save(`${filename.replace(/\s+/g, '_')}.pdf`);
}
