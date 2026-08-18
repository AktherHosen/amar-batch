import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function getPrimaryRGB(): [number, number, number] {
    const raw = getComputedStyle(document.documentElement)
        .getPropertyValue('--primary')
        .trim();
    const el = document.createElement('div');
    el.style.color = raw;
    el.style.position = 'absolute';
    el.style.visibility = 'hidden';
    document.body.appendChild(el);
    const computed = getComputedStyle(el).color;
    document.body.removeChild(el);
    const match = computed.match(/\d+/g);
    if (match) {
        return [Number(match[0]), Number(match[1]), Number(match[2])];
    }
    return [30, 41, 59];
}

export function generateTablePDF({
    title,
    headers,
    rows,
    filename,
}: {
    title: string;
    headers: string[];
    rows: (string | number)[][];
    filename: string;
}) {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const [pr, pg, pb] = getPrimaryRGB();

    // Header
    doc.setFillColor(pr, pg, pb);
    doc.rect(0, 0, pageWidth, 30, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, 18);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(
        `Generated on ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`,
        14,
        25,
    );

    // Table
    autoTable(doc, {
        startY: 36,
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
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
            `Page ${i} of ${pageCount}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' },
        );
    }

    doc.save(`${filename.replace(/\s+/g, '_')}.pdf`);
}
