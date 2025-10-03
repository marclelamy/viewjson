'use client';

import { useState, useRef } from 'react';
import JsonVisualizer from './components/JsonVisualizer';

const exampleJson = `{
  "user": {
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
    },
    "hobbies": [
      "reading",
      "coding",
      "gaming",
      {
        "type": "sports",
        "details": {
          "name": "basketball",
          "level": "amateur",
          "stats": {
            "gamesPlayed": 42,
            "averageScore": 15.2,
            "seasons": [
              {"year": 2022, "points": 500},
              {"year": 2023, "points": 620}
            ]
          }
        }
      }
    ],
    "friends": [
      {
        "id": 54321,
        "name": "Jane Smith",
        "contact": {
          "email": "jane@example.com",
          "phone": null
        },
        "hobbies": ["yoga", "traveling"]
      },
      {
        "id": 67890,
        "name": "Bob Johnson",
        "contact": {
          "email": "bob@example.com",
          "phone": "555-1234"
        },
        "hobbies": [
          "photography",
          {
            "type": "music",
            "instruments": ["guitar", "piano"],
            "bands": [
              {"name": "The Notes", "active": true},
              {"name": "Jazzers", "active": false}
            ]
          }
        ]
      }
    ],
    "metadata": {
      "created": "2024-01-01T10:00:00Z",
      "updated": "2024-06-01T15:30:00Z",
      "tags": ["user", "premium", "beta-tester"],
      "preferences": {
        "theme": "dark",
        "notifications": {
          "email": true,
          "sms": false,
          "push": {
            "enabled": true,
            "frequency": "daily"
          }
        },
        "languages": ["en", "es", "fr"]
      }
    },
    "projects": [
      {
        "id": "p1",
        "name": "Alpha",
        "status": "active",
        "tasks": [
          {"id": "t1", "title": "Setup", "completed": true},
          {"id": "t2", "title": "Development", "completed": false, "subtasks": [
            {"id": "st1", "title": "API", "completed": true},
            {"id": "st2", "title": "UI", "completed": false}
          ]}
        ]
      },
      {
        "id": "p2",
        "name": "Beta",
        "status": "archived",
        "tasks": []
      }
    ],
    "logs": [
      {"timestamp": "2024-06-01T12:00:00Z", "event": "login", "ip": "192.168.1.1"},
      {"timestamp": "2024-06-01T12:05:00Z", "event": "update_profile", "changes": ["email", "address"]},
      {"timestamp": "2024-06-01T12:10:00Z", "event": "logout"}
    ],
    "settings": {
      "privacy": {
        "profileVisible": true,
        "searchable": false,
        "blockedUsers": [67890, 11111, 22222]
      },
      "security": {
        "2fa": true,
        "backupCodes": ["abc123", "def456", "ghi789"],
        "lastPasswordChange": "2024-05-20T08:00:00Z"
      }
    }
  },
  "system": {
    "version": "2.5.1",
    "maintenance": false,
    "features": {
      "beta": ["new-dashboard", "ai-suggestions"],
      "deprecated": ["legacy-api"],
      "limits": {
        "maxUsers": 1000,
        "maxProjects": 100,
        "maxStorageGB": 500
      }
    },
    "uptime": 1234567,
    "alerts": [
      {"type": "info", "message": "System running smoothly"},
      {"type": "warning", "message": "Storage nearing limit", "details": {"used": 480, "limit": 500}},
      {"type": "error", "message": "Legacy API will be removed soon"}
    ]
  },
  "arrayOfObjects": [
    {"a": 1, "b": [1,2,3], "c": {"d": "deep", "e": [4,5,{"f": "deeper"}]}},
    {"g": null, "h": true, "i": [false, true, null, 0, ""]},
    [1,2,3,{"nestedArr": [4,5,6,{"deepest": "value"}]}]
  ],
  "emptyArray": [],
  "emptyObject": {},
  "deepNest": {
    "level1": {
      "level2": {
        "level3": {
          "level4": {
            "level5": {
              "value": "You found me!",
              "array": [1, {"deep": [2, {"deeper": [3, {"deepest": "End"}]}]}]
            }
          }
        }
      }
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
    <div className="flex h-screen w-screen overflow-hidden bg-slate-900">
      {/* Left Panel - Text Area */}
      <div className="w-[20%] h-full flex flex-col border-r border-slate-700">
        <div className="bg-slate-800 px-6 py-4 border-b border-slate-700">
          <h1 className="text-xl font-bold text-white">JSON Input</h1>
          <p className="text-sm text-slate-400 mt-1">Paste or edit your JSON here</p>
        </div>
        <div className="flex-1 overflow-hidden flex">
          {/* Line numbers */}
          <div 
            ref={lineNumbersRef}
            className="bg-slate-800 text-slate-500 font-mono text-sm py-6 px-3 text-right select-none overflow-hidden border-r border-slate-700"
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
            className="flex-1 h-full py-6 px-3 bg-slate-900 text-slate-100 font-mono text-sm resize-none focus:outline-none overflow-auto"
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

      {/* Right Panel - React Flow Visualization */}
      <div className="flex-1 h-full flex flex-col">
        <div className="bg-slate-800 px-6 py-4 border-b border-slate-700">
          <h1 className="text-xl font-bold text-white">Graph Visualization</h1>
          <p className="text-sm text-slate-400 mt-1">Interactive JSON structure diagram</p>
        </div>
        <div className="flex-1">
          <JsonVisualizer jsonText={jsonText} />
        </div>
      </div>
    </div>
  );
}
