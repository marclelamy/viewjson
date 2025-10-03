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
  "profile": {
    "name": "John Doe",
    "contacts": [
      {
        "type": "email",
        "value": "john@example.com"
      },
      {
        "type": "phone",
        "value": "+1-555-1234"
      }
    ],
    "isActive": true
  },
  "age": 30,
  "score": 98.7,
  "nullField": null,
  "settings": {
    "theme": "dark",
    "notifications": {
      "email": true,
      "sms": false,
      "channels": [
        {"name": "general", "enabled": true},
        {"name": "alerts", "enabled": false}
      ]
    }
  },
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
  }
}`;

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
                    <div className="bg-card px-6 py-2 border-b border-border">
                        <h1 className="text-lg font-bold text-card-foreground">JSON Input</h1>
                        <p className="text-xs text-muted-foreground mt-0.5">Paste or edit your JSON here</p>
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
                    <div className="bg-card px-6 py-2 border-b border-border flex justify-between items-center">
                        <div>
                            <h1 className="text-lg font-bold text-card-foreground">Graph Visualization</h1>
                            <p className="text-xs text-muted-foreground mt-0.5">Interactive JSON structure diagram</p>
                        </div>
                        <a 
                            href="https://github.com/marclelamy/viewjson" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="View source on GitHub"
                        >
                            <svg 
                                width="24" 
                                height="24" 
                                viewBox="0 0 24 24" 
                                fill="currentColor"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                        </a>
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
