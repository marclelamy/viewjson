import { useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { getColorForValue } from './json-color-utils';
import { createEdge } from './edge-utils';

export type NodeField = {
    key: string;
    value: string;
    valueColor: string;
};

export type NodeLabel = 
    | { type: 'simple'; text: string; colorClass?: string }
    | { type: 'object'; fields: NodeField[] };

export type NodeData = {
    label: NodeLabel;
    hasParent: boolean;
    sourceHandles: Array<{ id: string; index: number }>;
};

export function useJsonToGraph(): { jsonToNodes: (json: unknown) => { nodes: Node[]; edges: Edge[] } } {
    const jsonToNodes = useCallback((json: unknown): { nodes: Node[]; edges: Edge[] } => {
        const nodes: Node[] = [];
        const edges: Edge[] = [];
        let nodeCounter = 0;

        // Track parent-child relationships
        const childrenMap = new Map<string, string[]>(); // parent -> array of child IDs
        const parentMap = new Map<string, string>(); // child -> parent ID

        const traverse = (obj: unknown, parent: string, edgeLabel?: string) => {
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
                        label: {
                            type: 'simple',
                            text: 'null',
                            colorClass: 'text-muted-foreground',
                        },
                        hasParent: !!parent,
                        sourceHandles: [],
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
                const fields: NodeField[] = [];

                // Process each property
                const entries = Object.entries(obj);
                entries.forEach(([key, value]) => {
                    const colorInfo = getColorForValue(value);
                    let valueDisplay: string;
                    
                    // Check for null explicitly since typeof null === 'object' in JavaScript
                    if (value !== null && (Array.isArray(value) || typeof value === 'object')) {
                        valueDisplay = colorInfo.label;
                        traverse(value, nodeId, key);
                    } else {
                        // Primitives and null - display inline
                        valueDisplay = value === null ? colorInfo.label : JSON.stringify(value);
                    }

                    fields.push({
                        key,
                        value: valueDisplay,
                        valueColor: colorInfo.colorClass,
                    });
                });

                nodes.push({
                    id: nodeId,
                    type: 'customJson',
                    data: {
                        label: {
                            type: 'object',
                            fields,
                        },
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
                        label: {
                            type: 'simple',
                            text: displayValue,
                            colorClass: colorInfo.colorClass,
                        },
                        hasParent: !!parent,
                        sourceHandles: [],
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

