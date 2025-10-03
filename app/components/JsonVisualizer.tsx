'use client';

import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
    Node,
    Edge,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    MarkerType,
    Panel,
    Position,
    Handle,
    NodeProps,
} from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';

interface JsonVisualizerProps {
    jsonText: string;
}

// Custom node component with dynamic handles
function CustomJsonNode({ data, id }: NodeProps) {
    const hasTarget = data.hasParent || false;
    const sourceHandles = data.sourceHandles || [];

    // Wrap string labels in a div with truncation and title for tooltip
    const label = typeof data.label === 'string'
        ? <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={data.label}>{data.label}</div>
        : data.label;

    return (
        <div style={{
            ...data.style,
            maxWidth: '350px',
            overflow: 'visible',
        }}>
            {hasTarget && (
                <Handle
                    type="target"
                    position={Position.Left}
                    id={`${id}-target`}
                    style={{ background: '#64748b' }}
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
                        style={{
                            background: '#64748b',
                            top,
                        }}
                    />
                );
            })}
        </div>
    );
}

const nodeTypes = {
    customJson: CustomJsonNode,
};

export default function JsonVisualizer({ jsonText }: JsonVisualizerProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [error, setError] = useState<string | null>(null);

    const getLayoutedElements = useCallback((nodes: Node[], edges: Edge[]) => {
        const dagreGraph = new dagre.graphlib.Graph();
        dagreGraph.setDefaultEdgeLabel(() => ({}));
        dagreGraph.setGraph({ rankdir: 'LR', nodesep: 80, ranksep: 150 });

        nodes.forEach((node) => {
            // Calculate node dimensions based on content
            const label = node.data.label;
            let numLines = 1;
            let maxLineLength = 0;

            if (typeof label === 'string') {
                // Simple string label
                numLines = 1;
                maxLineLength = label.length;
            } else if (label?.props?.children) {
                // JSX element with children
                const children = label.props.children;
                if (Array.isArray(children)) {
                    numLines = children.length;
                    // Estimate max line length from the array of JSX elements
                    maxLineLength = Math.max(...children.map((child: any) => {
                        if (typeof child === 'string') return child.length;
                        if (child?.props?.children) {
                            // Count characters in nested spans
                            const textContent = React.Children.toArray(child.props.children)
                                .map((c: any) => typeof c === 'string' ? c : (c?.props?.children || ''))
                                .join('');
                            return textContent.length;
                        }
                        return 20; // default estimate
                    }));
                } else if (typeof children === 'string') {
                    const lines = children.split('\n');
                    numLines = lines.length;
                    maxLineLength = Math.max(...lines.map(line => line.length));
                }
            }

            // Calculate width with a max of 350px (matching CustomJsonNode maxWidth)
            const width = Math.max(200, Math.min(350, maxLineLength * 7.5 + 40));
            // Calculate height based on number of lines (approximately 24 pixels per line + padding)
            const height = Math.max(60, numLines * 24 + 30);

            dagreGraph.setNode(node.id, { width, height });
        });

        edges.forEach((edge) => {
            dagreGraph.setEdge(edge.source, edge.target);
        });

        dagre.layout(dagreGraph);

        const layoutedNodes = nodes.map((node) => {
            const nodeWithPosition = dagreGraph.node(node.id);
            return {
                ...node,
                position: {
                    x: nodeWithPosition.x - nodeWithPosition.width / 2,
                    y: nodeWithPosition.y - nodeWithPosition.height / 2,
                },
            };
        });

        return { nodes: layoutedNodes, edges };
    }, []);

    const getColorForValue = (value: any) => {
        if (value === null) {
            return { color: '#94a3b8', label: 'null' }; // Gray for null
        }

        const type = typeof value;
        if (type === 'string') {
            return { color: '#34d399', label: value }; // Green for strings
        } else if (type === 'number') {
            return { color: '#fbbf24', label: String(value) }; // Yellow for numbers
        } else if (type === 'boolean') {
            return { color: '#c084fc', label: String(value) }; // Purple for booleans
        }
        return { color: '#cbd5e1', label: String(value) }; // Default gray
    };

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
                        style: {
                            background: '#1e293b',
                            color: '#94a3b8',
                            border: '2px solid #475569',
                            borderRadius: '8px',
                            padding: '12px 16px',
                            fontSize: '13px',
                            fontFamily: 'monospace',
                        },
                    },
                    position: { x: 0, y: 0 },
                });

                if (parent) {
                    const sourceHandle = `${parent}-source-${parentHandleIndex}`;
                    const targetHandle = `${nodeId}-target`;
                    edges.push({
                        id: `e-${parent}-${nodeId}`,
                        source: parent,
                        target: nodeId,
                        sourceHandle,
                        targetHandle,
                        label: edgeLabel,
                        animated: false,
                        markerEnd: { type: MarkerType.ArrowClosed },
                        style: { stroke: '#64748b', strokeWidth: 2 },
                        labelStyle: { fill: '#475569', fontWeight: 600, fontSize: '12px' },
                        labelBgStyle: { fill: '#f1f5f9', fillOpacity: 0.95 },
                    });
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
                            <div key={key} style={{ display: 'flex', gap: '4px', minWidth: 0 }} title={displayText}>
                                <span style={{ color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 1, minWidth: 0 }}>{key}:</span>
                                <span style={{ color: colorInfo.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 1, minWidth: 0 }}>{colorInfo.label}</span>
                            </div>
                        );
                    } else if (Array.isArray(value)) {
                        // Show array info inline, then traverse elements
                        const displayText = `${key}: [${value.length} items]`;
                        lines.push(
                            <div key={key} style={{ display: 'flex', gap: '4px', minWidth: 0 }} title={displayText}>
                                <span style={{ color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 1, minWidth: 0 }}>{key}:</span>
                                <span style={{ color: '#93c5fd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 1, minWidth: 0 }}>[{value.length} items]</span>
                            </div>
                        );
                        traverse(value, nodeId, key);
                    } else if (typeof value === 'object') {
                        const objKeys = Object.keys(value);
                        const displayText = `${key}: {${objKeys.length} keys}`;
                        lines.push(
                            <div key={key} style={{ display: 'flex', gap: '4px', minWidth: 0 }} title={displayText}>
                                <span style={{ color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 1, minWidth: 0 }}>{key}:</span>
                                <span style={{ color: '#a5b4fc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 1, minWidth: 0 }}>{`{${objKeys.length} keys}`}</span>
                            </div>
                        );
                        traverse(value, nodeId, key);
                    } else {
                        // Primitive value - color it based on type
                        const colorInfo = getColorForValue(value);
                        const valueStr = JSON.stringify(value);
                        const displayText = `${key}: ${valueStr}`;
                        lines.push(
                            <div key={key} style={{ display: 'flex', gap: '4px', minWidth: 0 }} title={displayText}>
                                <span style={{ color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 1, minWidth: 0 }}>{key}:</span>
                                <span style={{ color: colorInfo.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 1, minWidth: 0 }}>{valueStr}</span>
                            </div>
                        );
                    }
                });

                nodes.push({
                    id: nodeId,
                    type: 'customJson',
                    data: {
                        label: (
                            <div style={{ textAlign: 'left' }}>
                                {lines}
                            </div>
                        ),
                        hasParent: !!parent,
                        sourceHandles: [], // Will be populated later
                        style: {
                            background: '#1e293b',
                            color: '#cbd5e1',
                            border: '2px solid #475569',
                            borderRadius: '8px',
                            padding: '12px 16px',
                            fontSize: '13px',
                            fontFamily: 'monospace',
                        },
                    },
                    position: { x: 0, y: 0 },
                });

                if (parent) {
                    const sourceHandle = `${parent}-source-${parentHandleIndex}`;
                    const targetHandle = `${nodeId}-target`;
                    edges.push({
                        id: `e-${parent}-${nodeId}`,
                        source: parent,
                        target: nodeId,
                        sourceHandle,
                        targetHandle,
                        label: edgeLabel,
                        animated: false,
                        markerEnd: { type: MarkerType.ArrowClosed },
                        style: { stroke: '#64748b', strokeWidth: 2 },
                        labelStyle: { fill: '#475569', fontWeight: 600, fontSize: '12px' },
                        labelBgStyle: { fill: '#f1f5f9', fillOpacity: 0.95 },
                    });
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
                        style: {
                            background: '#1e293b',
                            color: colorInfo.color,
                            border: '2px solid #475569',
                            borderRadius: '8px',
                            padding: '12px 16px',
                            fontSize: '13px',
                            fontFamily: 'monospace',
                        },
                    },
                    position: { x: 0, y: 0 },
                });

                if (parent) {
                    const sourceHandle = `${parent}-source-${parentHandleIndex}`;
                    const targetHandle = `${nodeId}-target`;
                    edges.push({
                        id: `e-${parent}-${nodeId}`,
                        source: parent,
                        target: nodeId,
                        sourceHandle,
                        targetHandle,
                        label: edgeLabel,
                        animated: false,
                        markerEnd: { type: MarkerType.ArrowClosed },
                        style: { stroke: '#64748b', strokeWidth: 2 },
                        labelStyle: { fill: '#475569', fontWeight: 600, fontSize: '12px' },
                        labelBgStyle: { fill: '#f1f5f9', fillOpacity: 0.95 },
                    });
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

    useEffect(() => {
        if (!jsonText.trim()) {
            setNodes([]);
            setEdges([]);
            setError(null);
            return;
        }

        try {
            const parsed = JSON.parse(jsonText);
            const { nodes: newNodes, edges: newEdges } = jsonToNodes(parsed);
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(newNodes, newEdges);
            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
            setError(null);
        } catch (e) {
            setError((e as Error).message);
            setNodes([]);
            setEdges([]);
        }
    }, [jsonText, jsonToNodes, getLayoutedElements, setNodes, setEdges]);

    return (
        <div className="w-full h-full relative bg-slate-50">
            {error && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-red-100 border-2 border-red-400 text-red-800 px-6 py-3 rounded-lg shadow-lg">
                    <strong>Error:</strong> {error}
                </div>
            )}
            {!error && nodes.length === 0 && jsonText.trim() === '' && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-slate-400 text-lg font-medium">
                    Enter JSON to visualize
                </div>
            )}
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.1 }}
                maxZoom={10000}
                minZoom={0.0001}
            >
                <Background />
                <Controls />
                <Panel position="top-right" className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md border border-slate-200">
                    <div className="text-sm font-medium text-slate-700">
                        {nodes.length} nodes
                    </div>
                </Panel>
            </ReactFlow>
        </div>
    );
}

