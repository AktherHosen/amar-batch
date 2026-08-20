import * as XLSX from 'xlsx';

export function exportToExcel({
    title,
    headers,
    rows,
    filename,
}: {
    title: string;
    headers: string[];
    rows: (string | number | boolean | null)[][];
    filename: string;
}) {
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Auto-fit column widths
    const colWidths = headers.map((h, i) => {
        const maxLen = Math.max(
            h.length,
            ...rows.map((r) => String(r[i] ?? '').length),
        );

        return { wch: Math.min(maxLen + 2, 40) };
    });
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, title.slice(0, 31));
    XLSX.writeFile(wb, `${filename.replace(/\s+/g, '_')}.xlsx`);
}

export function importFromExcel(
    file: File,
): Promise<{ headers: string[]; rows: (string | number)[][] }> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const wb = XLSX.read(data, { type: 'array' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const raw = XLSX.utils.sheet_to_json<(string | number)[]>(ws, {
                    header: 1,
                });

                if (raw.length < 2) {
                    reject(
                        new Error('Excel file is empty or has no data rows'),
                    );

                    return;
                }

                const headers = raw[0].map(String);
                const rows = raw
                    .slice(1)
                    .filter((r) => r.some((c) => c !== null && c !== ''));
                resolve({ headers, rows });
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
    });
}
