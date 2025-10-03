'use client';

import { useState, useRef } from 'react';
import JsonVisualizer from './components/json-visualizer';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";

const exampleJson = `{
    "id": 12345,
    "name": "John Doe",
    "age": 30,
    "email": "john@example.com",
    "isActive": true,
    "score": 98.7,
    "nullField": null,
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "country": "USA",
      "coordinates": {
        "lat": 40.7128,
        "lng": -74.0060,
        "history": [
          {"lat": 40.7127, "lng": -74.0059, "timestamp": "2023-12-31T23:59:59Z"},
          {"lat": 40.7126, "lng": -74.0058, "timestamp": "2023-12-30T12:00:00Z"}
        ]
      }
}}`;

export default function Home() {
    const [jsonText, setJsonText] = useState(exampleJson);
    const lineNumbersRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Calculate line numbers based on the text content
    const lineCount = jsonText.split('\n').length;
    const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

    // Synchronize scroll between textarea and line numbers
    const handleScroll = () => {
        if (lineNumbersRef.current && textareaRef.current) {
            lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
        }
    };

    return (
        <ResizablePanelGroup direction="horizontal" className="h-screen w-screen overflow-hidden bg-background">
            {/* Left Panel - Text Area */}
            <ResizablePanel defaultSize={20} minSize={0} maxSize={100}>
                <div className="h-full flex flex-col border-r border-border">
                    <div className="bg-card px-6 py-4 border-b border-border">
                        <h1 className="text-xl font-bold text-card-foreground">JSON Input</h1>
                        <p className="text-sm text-muted-foreground mt-1">Paste or edit your JSON here</p>
                    </div>
                    <div className="flex-1 overflow-hidden flex">
                        {/* Line numbers */}
                        <div
                            ref={lineNumbersRef}
                            className="bg-card text-muted-foreground font-mono text-sm py-6 px-3 text-right select-none overflow-hidden border-r border-border"
                            style={{
                                overflowY: 'hidden',
                                lineHeight: '1.5rem',
                            }}>
                            {lineNumbers.map((num) => (
                                <div key={num} style={{ height: '1.5rem' }}>{num}</div>
                            ))}
                        </div>
                        {/* Text area */}
                        <textarea
                            ref={textareaRef}
                            value={jsonText}
                            onChange={(e) => setJsonText(e.target.value)}
                            onScroll={handleScroll}
                            className="flex-1 text-xs h-full py-6 px-3 bg-background text-foreground font-mono text-sm resize-none focus:outline-none overflow-auto"
                            placeholder="Enter your JSON here..."
                            spellCheck={false}
                            wrap="off"
                            style={{
                                lineHeight: '1.5rem',
                                whiteSpace: 'pre',
                            }}
                        />
                    </div>
                </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Right Panel - React Flow Visualization */}
            <ResizablePanel defaultSize={80} minSize={0} maxSize={100}>
                <div className="h-full flex flex-col">
                    <div className="bg-card px-6 py-4 border-b border-border">
                        <h1 className="text-xl font-bold text-card-foreground">Graph Visualization</h1>
                        <p className="text-sm text-muted-foreground mt-1">Interactive JSON structure diagram</p>
                    </div>
                    <div className="flex-1">
                        <JsonVisualizer 
                            jsonText={jsonText} 
                            onJsonRepair={setJsonText}
                        />
                    </div>
                </div>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}
