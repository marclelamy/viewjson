import { useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import dagre from 'dagre';
import React from 'react';

export function useJsonLayout(): { getLayoutedElements: (nodes: Node[], edges: Edge[]) => { nodes: Node[]; edges: Edge[] } } {
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

    return { getLayoutedElements };
}

