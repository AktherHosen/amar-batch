export function getGrade(marks: number, total: number): string {
    if (total === 0) return 'N/A';
    const pct = (marks / total) * 100;
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B+';
    if (pct >= 60) return 'B';
    if (pct >= 50) return 'C+';
    if (pct >= 40) return 'C';
    if (pct >= 33) return 'D';
    return 'F';
}

export function getGradeColor(grade: string): string {
    switch (grade) {
        case 'A+': return 'text-green-600';
        case 'A': return 'text-green-600';
        case 'B+': return 'text-blue-600';
        case 'B': return 'text-blue-600';
        case 'C+': return 'text-yellow-600';
        case 'C': return 'text-yellow-600';
        case 'D': return 'text-orange-600';
        case 'F': return 'text-red-600';
        default: return 'text-muted-foreground';
    }
}

export function getGradeBadgeVariant(grade: string): 'default' | 'secondary' | 'destructive' | 'success' | 'warning' {
    switch (grade) {
        case 'A+': case 'A': return 'success';
        case 'B+': case 'B': return 'default';
        case 'C+': case 'C': return 'warning';
        case 'D': return 'secondary';
        case 'F': return 'destructive';
        default: return 'secondary';
    }
}
