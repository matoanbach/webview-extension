import React, { useEffect, useState } from 'react';
import './App.css';

declare global {
  interface Window {
    acquireVsCodeApi(): { postMessage(msg: any): void };
  }
}
const vscode = window.acquireVsCodeApi();

const App: React.FC = () => {
  const [funcName, setFuncName] = useState<string | null>(null);
  const [rawMessage, setRawMessage] = useState<string>('');

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const msg = event.data;
      switch (msg.type) {
        case 'generateDependencies':
          setFuncName(msg.name);
          setRawMessage('');
          break;
        case 'callHierarchy':
          setRawMessage(JSON.stringify(msg, null, 2));
          break;
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  return (
    <div className="p-4 font-mono text-sm">
      {funcName ? (
        <div className="mb-4">
          Generating dependencies for: <strong>{funcName}</strong>
        </div>
      ) : (
        <div className="mb-4">Hover over a function and click “Generate dependencies”</div>
      )}

      {rawMessage && (
        <pre className="bg-gray-900 text-green-300 p-3 rounded overflow-auto">
          {rawMessage}
        </pre>
      )}
    </div>
  );
};

export default App;