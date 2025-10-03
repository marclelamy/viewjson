'use client';

import { useEffect, useState, useRef } from 'react';
import ReactFlow, {
    Background,
    useNodesState,
    useEdgesState,
    Panel,
    ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { jsonrepair } from 'jsonrepair';
import { CustomJsonNode } from './custom-json-node';
import { CustomJsonEdge } from './custom-json-edge';
import { useJsonLayout } from './use-json-layout';
import { useJsonToGraph } from './use-json-to-graph';

interface JsonVisualizerProps {
    jsonText: string;
    onJsonRepair?: (repairedJson: string) => void;
}

// Define custom node types outside component to prevent re-renders
const nodeTypes = {
    customJson: CustomJsonNode,
};

// Define custom edge types outside component to prevent re-renders
const edgeTypes = {
    customJson: CustomJsonEdge,
};

export default function JsonVisualizer({ jsonText, onJsonRepair }: JsonVisualizerProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [error, setError] = useState<string | null>(null);
    const [isRepairing, setIsRepairing] = useState(false);
    const [repairSuccess, setRepairSuccess] = useState(false);
    const justRepairedRef = useRef(false);

    const { getLayoutedElements } = useJsonLayout();
    const { jsonToNodes } = useJsonToGraph();

    const handleRepairJson = async () => {
        if (!error || !onJsonRepair) return;

        setIsRepairing(true);
        
        try {
            // Attempt to repair the JSON
            const repairedJson = jsonrepair(jsonText);
            // Verify it's valid JSON
            JSON.parse(repairedJson);
            // If successful, update the parent's textarea
            onJsonRepair(repairedJson);
            setError(null);
            setRepairSuccess(true);
            justRepairedRef.current = true;
            // Hide success message after 3 seconds
            setTimeout(() => {
                setRepairSuccess(false);
                justRepairedRef.current = false;
            }, 3000);
        } catch (repairError) {
            // If repair fails, update error message
            setError(`Failed to repair JSON: ${(repairError as Error).message}`);
        } finally {
            setIsRepairing(false);
        }
    };

    useEffect(() => {
        // Clear success message when JSON changes, unless we just repaired it
        if (!justRepairedRef.current) {
            setRepairSuccess(false);
        }

        if (!jsonText.trim()) {
            setNodes([]);
            setEdges([]);
            setError(null);
            return;
        }

        // Temporarily suppress console.error to prevent Next.js error overlay in dev mode
        const originalConsoleError = console.error;
        console.error = () => {};

        try {
            const parsed = JSON.parse(jsonText);
            const { nodes: newNodes, edges: newEdges } = jsonToNodes(parsed);
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(newNodes, newEdges);
            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
            setError(null);
        } catch (e) {
            console.error = originalConsoleError; // Restore console.error
            setError((e as Error).message);
            setNodes([]);
            setEdges([]);
            return;
        } finally {
            console.error = originalConsoleError; // Always restore console.error
        }
    }, [jsonText, jsonToNodes, getLayoutedElements, setNodes, setEdges, repairSuccess]);

    return (
        <div className="w-full h-full relative bg-background">
            {error && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-destructive/10 border-2 border-destructive text-destructive px-6 py-3 rounded-lg shadow-lg max-w-2xl">
                    <div className="flex items-start gap-4">
                        <div className="flex-1">
                            <strong>Invalid JSON:</strong> {error}
                        </div>
                        {onJsonRepair && (
                            <button
                                onClick={handleRepairJson}
                                disabled={isRepairing}
                                className="px-4 py-2 bg-accent text-accent-foreground hover:bg-accent/90 rounded-md font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                                {isRepairing ? 'Repairing...' : 'Repair JSON'}
                            </button>
                        )}
                    </div>
                </div>
            )}
            {repairSuccess && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-green-500/10 border-2 border-green-500 text-green-700 dark:text-green-400 px-6 py-3 rounded-lg shadow-lg">
                    <strong>✓ JSON repaired successfully!</strong>
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
                    edgeTypes={edgeTypes}
                    fitView
                    fitViewOptions={{ padding: 0.1 }}
                    maxZoom={10000}
                    minZoom={0.0001}
                    proOptions={{ hideAttribution: true }}
                >
                    <Background />
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

