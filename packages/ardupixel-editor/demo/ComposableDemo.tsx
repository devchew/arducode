// Demo of the new composable sprite editor system

import React, { useState } from 'react';
import { 
  SpriteEditorProvider,
  useSpriteEditor,
  ToolManager,
  Canvas,
  toolRegistry,
  type SpriteData,
  type ToolPlugin,
  type DrawingTool
} from '../lib';

// Create demo sprite data
const createDemoSprite = (): SpriteData => ({
  id: 'demo',
  name: 'Demo Sprite',
  width: 16,
  height: 16,
  pixels: Array(16).fill(null).map(() => Array(16).fill(false))
});

// Custom tool example
const crossTool: ToolPlugin = {
  name: 'cross',
  icon: '✚',
  cursor: 'crosshair',
  
  onMouseDown(point, context) {
    const { state, dispatch } = context;
    const { sprite, canvasSettings } = state;
    
    if (point.x < 0 || point.x >= sprite.width || point.y < 0 || point.y >= sprite.height) {
      return;
    }
    
    const newPixels = [...sprite.pixels.map(row => [...row])];
    const pixelValue = canvasSettings.pencilColor === 'black';
    
    // Draw cross pattern
    for (let x = 0; x < sprite.width; x++) {
      newPixels[point.y][x] = pixelValue;
    }
    for (let y = 0; y < sprite.height; y++) {
      newPixels[y][point.x] = pixelValue;
    }
    
    dispatch({ type: 'UPDATE_PIXELS', payload: newPixels });
    dispatch({ type: 'ADD_TO_HISTORY', pixels: newPixels });
  }
};

// Register the custom tool
toolRegistry.register('cross', crossTool);

// Simple toolbar component
function SimpleToolbar() {
  const { state, setTool, undo, redo, canUndo, canRedo, toggleGrid, setZoom } = useSpriteEditor();
  const { canvasSettings } = state;
  
  const tools = [
    { id: 'pencil', label: '✏️ Pencil' },
    { id: 'eraser', label: '🧹 Eraser' },
    { id: 'fill', label: '🪣 Fill' },
    { id: 'line', label: '📏 Line' },
    { id: 'cross', label: '✚ Cross' }
  ];

  return (
    <div className="toolbar">
      <div className="tool-group">
        {tools.map(tool => (
          <button
            key={tool.id}
            className={`tool-btn ${canvasSettings.tool === tool.id ? 'active' : ''}`}
            onClick={() => setTool(tool.id as DrawingTool)}
          >
            {tool.label}
          </button>
        ))}
      </div>
      
      <div className="tool-group">
        <button onClick={undo} disabled={!canUndo}>↶ Undo</button>
        <button onClick={redo} disabled={!canRedo}>↷ Redo</button>
      </div>
      
      <div className="tool-group">
        <label>
          Zoom: 
          <input
            type="range"
            min="4"
            max="20"
            value={canvasSettings.zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
          {canvasSettings.zoom}x
        </label>
        <button onClick={toggleGrid}>
          {canvasSettings.showGrid ? '📋' : '📄'} Grid
        </button>
      </div>
    </div>
  );
}

// Main demo component
export function ComposableDemo() {
  const [sprite, setSprite] = useState<SpriteData>(createDemoSprite());

  return (
    <div className="demo-container">
      <h1>Composable Sprite Editor Demo</h1>
      
      <SpriteEditorProvider
        sprite={sprite}
        onSpriteChange={setSprite}
        initialZoom={12}
      >
        <div className="editor-layout">
          <SimpleToolbar />
          <ToolManager>
            <div className="canvas-container">
              <Canvas />
            </div>
          </ToolManager>
        </div>
      </SpriteEditorProvider>
      
      <div className="info">
        <h3>Features Demonstrated:</h3>
        <ul>
          <li>Context-based state management</li>
          <li>Plugin-based tool system</li>
          <li>Custom tool creation (Cross tool)</li>
          <li>Modular component architecture</li>
          <li>Built-in tools: Pencil, Eraser, Fill, Line</li>
        </ul>
      </div>
    </div>
  );
}
