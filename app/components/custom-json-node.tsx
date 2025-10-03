import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export function CustomJsonNode({ data, id }: NodeProps) {
    console.log('Rendering node:', id, 'with data:', data);
    const hasTarget = data.hasParent || false;
    const sourceHandles = data.sourceHandles || [];

    // Wrap string labels in a div with truncation and title for tooltip
    const label = typeof data.label === 'string'
        ? <div className="overflow-hidden text-ellipsis whitespace-nowrap" title={data.label}>{data.label}</div>
        : data.label;

    return (
        <div className={`max-w-[350px] overflow-visible bg-card border-2 border-border rounded-lg p-3 text-[13px] font-mono ${data.colorClass || 'text-card-foreground'}`}>
            {hasTarget && (
                <Handle
                    type="target"
                    position={Position.Left}
                    id={`${id}-target`}
                    className="!bg-muted-foreground"
                />
            )}
            {label}
            {sourceHandles.map((handle: { id: string; index: number }, idx: number) => {
                // Calculate vertical position for each handle
                const totalHandles = sourceHandles.length;
                const spacing = totalHandles > 1 ? 100 / (totalHandles + 1) : 50;
                const top = `${spacing * (idx + 1)}%`;

                return (
                    <Handle
                        key={handle.id}
                        type="source"
                        position={Position.Right}
                        id={handle.id}
                        className="!bg-muted-foreground"
                        style={{ top }}
                    />
                );
            })}
        </div>
    );
}

