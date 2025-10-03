export function getColorForValue(value: any): { colorClass: string; label: string } {
    if (value === null) {
        return { colorClass: 'text-muted-foreground', label: 'null' };
    }

    const type = typeof value;
    if (type === 'string') {
        return { colorClass: 'text-chart-2', label: value };
    } else if (type === 'number') {
        return { colorClass: 'text-chart-4', label: String(value) };
    } else if (type === 'boolean') {
        return { colorClass: 'text-chart-1', label: String(value) };
    }
    return { colorClass: 'text-foreground', label: String(value) };
}

