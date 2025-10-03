import { useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { getColorForValue } from './json-color-utils';
import { createEdge } from './edge-utils';

export function useJsonToGraph(): { jsonToNodes: (json: any) => { nodes: Node[]; edges: Edge[] } } {
    const jsonToNodes = useCallback((json: any): { nodes: Node[]; edges: Edge[] } => {
        const nodes: Node[] = [];
        const edges: Edge[] = [];
        let nodeCounter = 0;

        // Track parent-child relationships
        const childrenMap = new Map<string, string[]>(); // parent -> array of child IDs
        const parentMap = new Map<string, string>(); // child -> parent ID

        const traverse = (obj: any, parent: string, edgeLabel?: string) => {
            const nodeId = parent ? `${parent}-${nodeCounter++}` : `root-${nodeCounter++}`;

            // Handle arrays specially - they don't create nodes, just pass through to elements
            if (Array.isArray(obj)) {
                // Arrays: connect each element directly to the parent (no intermediate array node)
                obj.forEach((item, index) => {
                    const elementLabel = edgeLabel ? `${edgeLabel}[${index}]` : `[${index}]`;
                    traverse(item, parent, elementLabel);
                });
                return nodeId;
            }

            // Track parent-child relationship (not for arrays since they don't create nodes)
            // Get the handle index BEFORE adding to the children list
            let parentHandleIndex = 0;
            if (parent) {
                parentMap.set(nodeId, parent);
                if (!childrenMap.has(parent)) {
                    childrenMap.set(parent, []);
                }
                // The handle index is the current count (before we add this child)
                parentHandleIndex = childrenMap.get(parent)!.length;
                childrenMap.get(parent)!.push(nodeId);
            }

            if (obj === null) {
                // Null primitive value - create a node
                nodes.push({
                    id: nodeId,
                    type: 'customJson',
                    data: {
                        label: 'null',
                        hasParent: !!parent,
                        sourceHandles: [],
                        colorClass: 'text-muted-foreground',
                    },
                    position: { x: 0, y: 0 },
                });

                if (parent) {
                    edges.push(createEdge({
                        source: parent,
                        target: nodeId,
                        sourceHandleIndex: parentHandleIndex,
                        label: edgeLabel,
                    }));
                }
                return nodeId;
            }

            if (typeof obj === 'object') {
                const lines: React.ReactNode[] = [];

                // Process each property
                const entries = Object.entries(obj);
                entries.forEach(([key, value]) => {
                    if (value === null) {
                        const colorInfo = getColorForValue(value);
                        const displayText = `${key}: ${colorInfo.label}`;
                        lines.push(
                            <div key={key} className="flex gap-1 min-w-0" title={displayText}>
                                <span className="text-foreground overflow-hidden text-ellipsis whitespace-nowrap shrink min-w-0">{key}:</span>
                                <span className={`${colorInfo.colorClass} overflow-hidden text-ellipsis whitespace-nowrap shrink min-w-0`}>{colorInfo.label}</span>
                            </div>
                        );
                    } else if (Array.isArray(value)) {
                        // Show array info inline, then traverse elements
                        const displayText = `${key}: [${value.length} items]`;
                        lines.push(
                            <div key={key} className="flex gap-1 min-w-0" title={displayText}>
                                <span className="text-foreground overflow-hidden text-ellipsis whitespace-nowrap shrink min-w-0">{key}:</span>
                                <span className="text-chart-3 overflow-hidden text-ellipsis whitespace-nowrap shrink min-w-0">[{value.length} items]</span>
                            </div>
                        );
                        traverse(value, nodeId, key);
                    } else if (typeof value === 'object') {
                        const objKeys = Object.keys(value);
                        const displayText = `${key}: {${objKeys.length} keys}`;
                        lines.push(
                            <div key={key} className="flex gap-1 min-w-0" title={displayText}>
                                <span className="text-foreground overflow-hidden text-ellipsis whitespace-nowrap shrink min-w-0">{key}:</span>
                                <span className="text-chart-5 overflow-hidden text-ellipsis whitespace-nowrap shrink min-w-0">{`{${objKeys.length} keys}`}</span>
                            </div>
                        );
                        traverse(value, nodeId, key);
                    } else {
                        // Primitive value - color it based on type
                        const colorInfo = getColorForValue(value);
                        const valueStr = JSON.stringify(value);
                        const displayText = `${key}: ${valueStr}`;
                        lines.push(
                            <div key={key} className="flex gap-1 min-w-0" title={displayText}>
                                <span className="text-foreground overflow-hidden text-ellipsis whitespace-nowrap shrink min-w-0">{key}:</span>
                                <span className={`${colorInfo.colorClass} overflow-hidden text-ellipsis whitespace-nowrap shrink min-w-0`}>{valueStr}</span>
                            </div>
                        );
                    }
                });

                nodes.push({
                    id: nodeId,
                    type: 'customJson',
                    data: {
                        label: (
                            <div className="text-left">
                                {lines}
                            </div>
                        ),
                        hasParent: !!parent,
                        sourceHandles: [], // Will be populated later
                    },
                    position: { x: 0, y: 0 },
                });

                if (parent) {
                    edges.push(createEdge({
                        source: parent,
                        target: nodeId,
                        sourceHandleIndex: parentHandleIndex,
                        label: edgeLabel,
                    }));
                }

                return nodeId;
            } else {
                // Primitive value node
                const colorInfo = getColorForValue(obj);
                const valueStr = JSON.stringify(obj);
                const displayValue = valueStr.length > 50 ? valueStr.substring(0, 50) + '...' : valueStr;

                nodes.push({
                    id: nodeId,
                    type: 'customJson',
                    data: {
                        label: displayValue,
                        hasParent: !!parent,
                        sourceHandles: [],
                        colorClass: colorInfo.colorClass,
                    },
                    position: { x: 0, y: 0 },
                });

                if (parent) {
                    edges.push(createEdge({
                        source: parent,
                        target: nodeId,
                        sourceHandleIndex: parentHandleIndex,
                        label: edgeLabel,
                    }));
                }

                return nodeId;
            }
        };

        traverse(json, '');

        // Now populate source handles for each node based on children count
        nodes.forEach(node => {
            const children = childrenMap.get(node.id) || [];
            const sourceHandles = children.map((_, index) => ({
                id: `${node.id}-source-${index}`,
                index,
            }));
            node.data.sourceHandles = sourceHandles;
        });

        return { nodes, edges };
    }, []);

    return { jsonToNodes };
}

