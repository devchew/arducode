// Example usage of the composable sprite editor

import React, { useState } from 'react';
import { 
  SpriteEditorProvider,
  SpriteEditor,
  ToolManager,
  Canvas,
  toolRegistry,
  useSpriteEditor,
  type ToolPlugin,
  type SpriteData 
} from '../lib';

// Example 1: Basic usage with default components
export function BasicExample() {
  const [sprite, setSprite] = useState<SpriteData>({
    id: '1',
    name: 'test',
    width: 32,
    height: 32,
    pixels: Array(32).fill(null).map(() => Array(32).fill(false))
  });

  return (
    <SpriteEditor
      sprite={sprite}
      onSpriteChange={setSprite}
      initialZoom={8}
      showToolbar={true}
    />
  );
}

// Example 2: Custom tool creation
const stampTool: ToolPlugin = {
  name: 'stamp',
  icon: '🏷️',
  cursor: 'crosshair',
  
  onMouseDown(point, context) {
    const { state, dispatch } = context;
    const { sprite, canvasSettings } = state;
    
    // Check bounds
    if (point.x < 0 || point.x >= sprite.width || point.y < 0 || point.y >= sprite.height) {
      return;
    }
    
    // Create a simple 3x3 stamp pattern
    const newPixels = [...sprite.pixels.map(row => [...row])];
    const pattern = [
      [false, true, false],
      [true, true, true],
      [false, true, false]
    ];
    
    const offsetX = point.x - 1;
    const offsetY = point.y - 1;
    
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        const pixelX = offsetX + x;
        const pixelY = offsetY + y;
        
        if (pixelX >= 0 && pixelX < sprite.width && 
            pixelY >= 0 && pixelY < sprite.height) {
          if (pattern[y][x]) {
            newPixels[pixelY][pixelX] = canvasSettings.pencilColor === 'black';
          }
        }
      }
    }
    
    dispatch({ type: 'UPDATE_PIXELS', payload: newPixels });
    dispatch({ type: 'ADD_TO_HISTORY', pixels: newPixels });
  }
};

// Register the custom tool
toolRegistry.register('stamp', stampTool);

// Example 3: Custom layout with context
export function CustomLayoutExample() {
  const [sprite, setSprite] = useState<SpriteData>({
    id: '2',
    name: 'custom',
    width: 16,
    height: 16,
    pixels: Array(16).fill(null).map(() => Array(16).fill(false))
  });

  return (
    <SpriteEditorProvider 
      sprite={sprite} 
      onSpriteChange={setSprite}
      initialZoom={12}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <CustomToolbar />
        <div style={{ display: 'flex', flex: 1 }}>
          <CustomSidebar />
          <ToolManager>
            <div style={{ flex: 1, padding: '20px' }}>
              <Canvas />
            </div>
          </ToolManager>
        </div>
      </div>
    </SpriteEditorProvider>
  );
}

function CustomToolbar() {
  const { state, setTool, setZoom, undo, redo, canUndo, canRedo, toggleGrid } = useSpriteEditor();
  const { canvasSettings } = state;

  return (
    <div style={{ 
      display: 'flex', 
      gap: '10px', 
      padding: '10px', 
      borderBottom: '1px solid #ccc',
      backgroundColor: '#f5f5f5'
    }}>
      <button 
        onClick={() => setTool('pencil')}
        style={{ 
          backgroundColor: canvasSettings.tool === 'pencil' ? '#007acc' : '#fff',
          color: canvasSettings.tool === 'pencil' ? '#fff' : '#000'
        }}
      >
        ✏️ Pencil
      </button>
      
      <button 
        onClick={() => setTool('eraser')}
        style={{ 
          backgroundColor: canvasSettings.tool === 'eraser' ? '#007acc' : '#fff',
          color: canvasSettings.tool === 'eraser' ? '#fff' : '#000'
        }}
      >
        🧹 Eraser
      </button>
      
      <button 
        onClick={() => setTool('fill')}
        style={{ 
          backgroundColor: canvasSettings.tool === 'fill' ? '#007acc' : '#fff',
          color: canvasSettings.tool === 'fill' ? '#fff' : '#000'
        }}
      >
        🪣 Fill
      </button>
      
      <button 
        onClick={() => setTool('stamp')}
        style={{ 
          backgroundColor: canvasSettings.tool === 'stamp' ? '#007acc' : '#fff',
          color: canvasSettings.tool === 'stamp' ? '#fff' : '#000'
        }}
      >
        🏷️ Stamp
      </button>
      
      <div style={{ margin: '0 20px', borderLeft: '1px solid #ccc' }} />
      
      <button onClick={undo} disabled={!canUndo}>
        ↶ Undo
      </button>
      
      <button onClick={redo} disabled={!canRedo}>
        ↷ Redo
      </button>
      
      <div style={{ margin: '0 20px', borderLeft: '1px solid #ccc' }} />
      
      <label>
        Zoom: 
        <input
          type="range"
          min="1"
          max="32"
          value={canvasSettings.zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          style={{ marginLeft: '5px' }}
        />
        {canvasSettings.zoom}x
      </label>
      
      <button onClick={toggleGrid}>
        {canvasSettings.showGrid ? '📋' : '📄'} Grid
      </button>
    </div>
  );
}

function CustomSidebar() {
  const { state, dispatch } = useSpriteEditor();
  const { canvasSettings } = state;

  return (
    <div style={{ 
      width: '200px', 
      padding: '20px', 
      borderRight: '1px solid #ccc',
      backgroundColor: '#fafafa'
    }}>
      <h3>Tool Settings</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <label>
          <div>Pencil Color:</div>
          <select
            value={canvasSettings.pencilColor}
            onChange={(e) => dispatch({ 
              type: 'SET_CANVAS_SETTING', 
              key: 'pencilColor', 
              value: e.target.value 
            })}
            style={{ width: '100%', marginTop: '5px' }}
          >
            <option value="black">Black</option>
            <option value="white">White</option>
          </select>
        </label>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label>
          <div>Brush Size:</div>
          <input
            type="range"
            min="1"
            max="10"
            value={canvasSettings.brushSize}
            onChange={(e) => dispatch({ 
              type: 'SET_CANVAS_SETTING', 
              key: 'brushSize', 
              value: Number(e.target.value) 
            })}
            style={{ width: '100%', marginTop: '5px' }}
          />
          <div style={{ textAlign: 'center', fontSize: '12px' }}>
            {canvasSettings.brushSize}px
          </div>
        </label>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label>
          <div>Brush Style:</div>
          <select
            value={canvasSettings.brushStyle}
            onChange={(e) => dispatch({ 
              type: 'SET_CANVAS_SETTING', 
              key: 'brushStyle', 
              value: e.target.value 
            })}
            style={{ width: '100%', marginTop: '5px' }}
          >
            <option value="square">Square</option>
            <option value="round">Round</option>
          </select>
        </label>
      </div>
    </div>
  );
}
