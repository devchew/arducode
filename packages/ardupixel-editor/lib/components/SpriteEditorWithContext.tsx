// Refactored Sprite Editor component using context and plugins

import React from 'react';
import { SpriteEditorProvider } from '../contexts/SpriteEditorContext';
import { ToolManager } from '../plugins/ToolManager';
import { Canvas } from './CanvasWithContext';
import { LeftSidebar } from './LeftSidebar';
import { TopToolbar } from './TopToolbar';
import { useSpriteEditor } from '../hooks/useSpriteEditor';
import type { SpriteEditorProps } from '../types';
import styles from './SpriteEditor.module.css';
import "@vscode-elements/elements/dist/bundled.js";

// Internal component that uses the context
function SpriteEditorContent({
  showToolbar = true,
  className = '',
}: Pick<SpriteEditorProps, 'showToolbar' | 'className'>) {
  const context = useSpriteEditor();
  const { state, setTool, setZoom, toggleGrid, undo, redo, canUndo, canRedo } = context;
  const { canvasSettings } = state;

  return (
    <div className={`${styles.spriteEditor} ${className}`}>
      {/* Top Toolbar */}
      {showToolbar && (
        <TopToolbar
          activeTool={canvasSettings.tool}
          zoom={canvasSettings.zoom}
          onZoomChange={setZoom}
          showGrid={canvasSettings.showGrid}
          onToggleGrid={toggleGrid}
          eraserSize={canvasSettings.eraserSize}
          onEraserSizeChange={(size: number) =>
            context.dispatch({ type: 'SET_CANVAS_SETTING', key: 'eraserSize', value: size })
          }
          brushSize={canvasSettings.brushSize}
          onBrushSizeChange={(size: number) =>
            context.dispatch({ type: 'SET_CANVAS_SETTING', key: 'brushSize', value: size })
          }
          brushStyle={canvasSettings.brushStyle}
          onBrushStyleChange={(style) =>
            context.dispatch({ type: 'SET_CANVAS_SETTING', key: 'brushStyle', value: style })
          }
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
          enableScrollZoom={canvasSettings.tool === 'zoom'}
          scrollZoomTarget={React.createRef()}
        />
      )}

      {/* Main Content Area */}
      <div className={styles.mainContent}>
        {/* Left Sidebar */}
        {showToolbar && (
          <LeftSidebar
            activeTool={canvasSettings.tool}
            onToolChange={setTool}
            pencilColor={canvasSettings.pencilColor}
            onPencilColorChange={(pencilColor) =>
              context.dispatch({ type: 'SET_CANVAS_SETTING', key: 'pencilColor', value: pencilColor })
            }
          />
        )}

        {/* Canvas with Tool Manager */}
        <ToolManager>
          <div className={styles.canvasArea}>
            <Canvas />
          </div>
        </ToolManager>
      </div>
    </div>
  );
}

// Main component that provides context
export function SpriteEditor({
  sprite,
  onSpriteChange,
  initialZoom = 8,
  showToolbar = true,
  className = "",
}: SpriteEditorProps) {
  return (
    <SpriteEditorProvider
      sprite={sprite}
      onSpriteChange={onSpriteChange}
      initialZoom={initialZoom}
    >
      <SpriteEditorContent
        showToolbar={showToolbar}
        className={className}
      />
    </SpriteEditorProvider>
  );
}
