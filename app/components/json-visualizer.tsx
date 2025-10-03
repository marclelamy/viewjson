'use client';

import { useEffect, useState } from 'react';
import ReactFlow, {
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    Panel,
    ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { CustomJsonNode } from './custom-json-node';
import { useJsonLayout } from './use-json-layout';
import { useJsonToGraph } from './use-json-to-graph';

interface JsonVisualizerProps {
    jsonText: string;
}

const nodeTypes = {
    customJson: CustomJsonNode,
};

export default function JsonVisualizer({ jsonText }: JsonVisualizerProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [error, setError] = useState<string | null>(null);

    const { getLayoutedElements } = useJsonLayout();
    const { jsonToNodes } = useJsonToGraph();

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
            console.log('Generated nodes:', newNodes.length, 'edges:', newEdges.length);
            console.log('First node:', newNodes[0]);
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(newNodes, newEdges);
            console.log('Layouted nodes:', layoutedNodes.length, 'edges:', layoutedEdges.length);
            console.log('First layouted node:', layoutedNodes[0]);
            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
            setError(null);
        } catch (e) {
            console.error('Error parsing JSON:', e);
            setError((e as Error).message);
            setNodes([]);
            setEdges([]);
        }
    }, [jsonText, jsonToNodes, getLayoutedElements, setNodes, setEdges]);

    return (
        <div className="w-full h-full relative bg-background">
            {error && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-destructive/10 border-2 border-destructive text-destructive px-6 py-3 rounded-lg shadow-lg">
                    <strong>Error:</strong> {error}
                </div>
            )}
            {!error && nodes.length === 0 && jsonText.trim() === '' && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-muted-foreground text-lg font-medium">
                    Enter JSON to visualize
                </div>
            )}
            <ReactFlowProvider>
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
                    <Panel position="top-right" className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md border border-border">
                        <div className="text-sm font-medium text-card-foreground">
                            {nodes.length} nodes
                        </div>
                    </Panel>
                </ReactFlow>
            </ReactFlowProvider>
        </div>
    );
}

