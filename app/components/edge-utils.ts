import { Edge, MarkerType } from 'reactflow';

interface CreateEdgeParams {
    source: string;
    target: string;
    sourceHandleIndex: number;
    label?: string;
}

export function createEdge({ source, target, sourceHandleIndex, label }: CreateEdgeParams): Edge {
    const sourceHandle = `${source}-source-${sourceHandleIndex}`;
    const targetHandle = `${target}-target`;

    return {
        id: `e-${source}-${target}`,
        source,
        target,
        sourceHandle,
        targetHandle,
        label,
        animated: false,
        markerEnd: { type: MarkerType.ArrowClosed },
        className: 'stroke-muted-foreground stroke-2',
    };
}

