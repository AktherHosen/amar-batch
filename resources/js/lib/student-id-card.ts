import jsPDF from 'jspdf';

function hexToRGB(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
        return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
    }
    return [99, 102, 241];
}

type StudentData = {
    name: string;
    code: string;
    phone: string;
    guardian_name: string;
    guardian_phone: string;
    coaching_class: string | null;
    section: string | null;
    batch_name: string | null;
    photo_url?: string | null;
};

export function generateStudentIDCard({
    student,
    centerName = '',
    primaryColor = '#6366f1',
}: {
    student: StudentData;
    centerName?: string;
    primaryColor?: string;
}) {
    const doc = new jsPDF('p', 'mm', 'a4');
    const [pr, pg, pb] = hexToRGB(primaryColor);

    const cardWidth = 85;
    const cardHeight = 55;
    const margin = 15;

    // Front side
    drawCard(doc, student, centerName, pr, pg, pb, margin, margin, cardWidth, cardHeight, false);

    // Back side (to the right)
    drawCard(doc, student, centerName, pr, pg, pb, margin + cardWidth + 10, margin, cardWidth, cardHeight, true);

    doc.save(`id_card_${student.code || student.name.replace(/\s+/g, '_')}.pdf`);
}

function drawCard(
    doc: jsPDF,
    student: StudentData,
    centerName: string,
    pr: number,
    pg: number,
    pb: number,
    x: number,
    y: number,
    w: number,
    h: number,
    isBack: boolean,
) {
    // Card background
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, y, w, h, 3, 3, 'F');

    // Card border
    doc.setDrawColor(pr, pg, pb);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, y, w, h, 3, 3, 'S');

    // Header bar
    doc.setFillColor(pr, pg, pb);
    doc.roundedRect(x, y, w, 12, 3, 3, 'F');
    doc.rect(x, y + 9, w, 3, 'F');

    // Center name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(centerName.toUpperCase(), x + w / 2, y + 5, { align: 'center' });

    // "STUDENT ID" label
    doc.setFontSize(5);
    doc.setFont('helvetica', 'normal');
    doc.text('STUDENT IDENTITY CARD', x + w / 2, y + 9.5, { align: 'center' });

    if (!isBack) {
        // Front side content
        let contentY = y + 16;

        // Student name
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(student.name, x + 4, contentY);
        contentY += 5;

        // Student code
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(`ID: ${student.code}`, x + 4, contentY);
        contentY += 5;

        // Class/Batch
        if (student.coaching_class || student.batch_name) {
            doc.setFontSize(7);
            doc.setTextColor(30, 41, 59);
            const classInfo = [student.coaching_class, student.section].filter(Boolean).join(' - ');
            const batchInfo = student.batch_name || '';
            if (classInfo) {
                doc.text(`Class: ${classInfo}`, x + 4, contentY);
                contentY += 4;
            }
            if (batchInfo) {
                doc.text(`Batch: ${batchInfo}`, x + 4, contentY);
                contentY += 4;
            }
        }

        // Guardian
        if (student.guardian_name) {
            doc.setFontSize(6);
            doc.setTextColor(100, 116, 139);
            doc.text(`Guardian: ${student.guardian_name}`, x + 4, contentY);
        }
    } else {
        // Back side content
        let contentY = y + 16;

        doc.setTextColor(30, 41, 59);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text('Emergency Contact', x + 4, contentY);
        contentY += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
        doc.setTextColor(100, 116, 139);

        if (student.guardian_name) {
            doc.text(`Guardian: ${student.guardian_name}`, x + 4, contentY);
            contentY += 4;
        }
        if (student.guardian_phone) {
            doc.text(`Phone: ${student.guardian_phone}`, x + 4, contentY);
            contentY += 4;
        }
        if (student.phone) {
            doc.text(`Student Phone: ${student.phone}`, x + 4, contentY);
            contentY += 8;
        }

        // Barcode-like representation of student code
        doc.setFontSize(6);
        doc.setTextColor(30, 41, 59);
        doc.setFont('courier', 'bold');
        doc.text(student.code, x + w / 2, contentY, { align: 'center' });
        contentY += 4;

        // Draw barcode lines
        const barcodeY = contentY;
        const barcodeX = x + 10;
        const barcodeWidth = w - 20;
        doc.setFillColor(0, 0, 0);
        for (let i = 0; i < student.code.length; i++) {
            const charCode = student.code.charCodeAt(i);
            const barWidth = (charCode % 3) + 1;
            const barX = barcodeX + (i / student.code.length) * barcodeWidth;
            doc.rect(barX, barcodeY, barWidth * 0.3, 4, 'F');
        }

        // Footer
        doc.setFontSize(5);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(148, 163, 184);
        doc.text('This card is the property of ' + centerName, x + w / 2, y + h - 4, { align: 'center' });
    }

    // Footer line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(x + 4, y + h - 6, x + w - 4, y + h - 6);
}

export function generateBatchIDCards({
    students,
    centerName = '',
    primaryColor = '#6366f1',
}: {
    students: StudentData[];
    centerName?: string;
    primaryColor?: string;
}) {
    const doc = new jsPDF('p', 'mm', 'a4');
    const [pr, pg, pb] = hexToRGB(primaryColor);

    const cardWidth = 85;
    const cardHeight = 55;
    const margin = 15;
    const gap = 10;

    const cardsPerRow = 2;
    const rowsPerPage = 5;
    const cardsPerPage = cardsPerRow * rowsPerPage;

    students.forEach((student, index) => {
        const pageIndex = Math.floor(index / cardsPerPage);
        const cardIndexOnPage = index % cardsPerPage;
        const col = cardIndexOnPage % cardsPerRow;
        const row = Math.floor(cardIndexOnPage / cardsPerRow);

        if (cardIndexOnPage === 0 && index > 0) {
            doc.addPage();
        }

        const x = margin + col * (cardWidth + gap);
        const y = margin + row * (cardHeight + gap);

        drawCard(doc, student, centerName, pr, pg, pb, x, y, cardWidth, cardHeight, false);
    });

    doc.save(`id_cards_${centerName.replace(/\s+/g, '_') || 'batch'}.pdf`);
}
