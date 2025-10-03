const typeColorMap: Record<string, { colorClass: string; getLabel: (value: unknown) => string }> = {
    string: { colorClass: 'text-chart-2', getLabel: (value) => value as string },
    number: { colorClass: 'text-chart-3', getLabel: (value) => String(value) },
    boolean: { colorClass: 'text-chart-5', getLabel: (value) => String(value) },
    default: { colorClass: 'text-foreground', getLabel: (value) => String(value) },
    object: { colorClass: 'text-chart-4', getLabel: (value) => String(value) },
    array: { colorClass: 'text-chart-4', getLabel: (value) => String(value) },
    null: { colorClass: 'text-muted-foreground', getLabel: (value) => String(value) },
};

export function getColorForValue(value: unknown): { colorClass: string; label: string } {
    if (value === null) {
        return { colorClass: typeColorMap.null.colorClass, label: 'null' };
    }
    if (Array.isArray(value)) {
        return { colorClass: typeColorMap.array.colorClass, label: `[${value.length} items]` };
    }
    if (typeof value === 'object') {
        const keys = Object.keys(value);
        return { colorClass: typeColorMap.object.colorClass, label: `{${keys.length} keys}` };
    }
    const type = typeof value;
    const mapping = typeColorMap[type] || typeColorMap.default;
    return { colorClass: mapping.colorClass, label: mapping.getLabel(value) };
}
