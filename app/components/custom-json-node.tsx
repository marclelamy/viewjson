import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeLabel } from './use-json-to-graph';

/**
 * Custom node component for JSON graph visualization
 * Renders JSON values with appropriate styling and handles for connections
 * 
 * This component is memoized to prevent unnecessary re-renders as recommended by React Flow
 */
export const CustomJsonNode = memo(({ data, id }: NodeProps) => {
    const hasTarget = data.hasParent || false;
    const sourceHandles = data.sourceHandles || [];
    const label = data.label as NodeLabel;

    const renderLabel = () => {
        if (label.type === 'simple') {
            return (
                <div 
                    className={`overflow-hidden text-ellipsis whitespace-nowrap ${label.colorClass || ''}`}
                    title={label.text}
                >
                    {label.text}
                </div>
            );
        } else {
            // object type
            return (
                <div className="text-left">
                    {label.fields.map((field, idx) => {
                        const displayText = `${field.key}: ${field.value}`;
                        return (
                            <div key={idx} className="flex gap-1 min-w-0" title={displayText}>
                                <span className="text-foreground overflow-hidden text-ellipsis whitespace-nowrap shrink min-w-0">
                                    {field.key}:
                                </span>
                                <span className={`${field.valueColor} overflow-hidden text-ellipsis whitespace-nowrap shrink min-w-0`}>
                                    {field.value}
                                </span>
                            </div>
                        );
                    })}
                </div>
            );
        }
    };

    return (
        <div className="max-w-[350px] overflow-visible bg-card border-2 border-border rounded-lg p-3 text-[13px] font-mono text-card-foreground">
            {hasTarget && (
                <Handle
                    type="target"
                    position={Position.Left}
                    id={`${id}-target`}
                    className="!bg-muted-foreground"
                />
            )}
            {renderLabel()}
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
});

CustomJsonNode.displayName = 'CustomJsonNode';

