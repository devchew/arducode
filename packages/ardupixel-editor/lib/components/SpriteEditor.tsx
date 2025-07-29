// Main Sprite Editor component

import { useState, useRef } from "react";
import { Canvas } from "./Canvas";
import { LeftSidebar } from "./LeftSidebar";
import { TopToolbar } from "./TopToolbar";
import { useCanvas } from "../hooks/useCanvas";
import type {
  SpriteEditorProps,
  DrawingTool,
  BrushStyle,
  PencilColor,
} from "../types";
import styles from "./SpriteEditor.module.css";
import "@vscode-elements/elements/dist/bundled.js";

export function SpriteEditor({
  sprite,
  onSpriteChange,
  initialZoom = 8,
  showToolbar = true,
  className = "",
}: SpriteEditorProps) {
  const [canvasSettings, setCanvasSettings] = useState({
    zoom: initialZoom,
    showGrid: true,
    tool: "pencil" as DrawingTool,
    eraserSize: 1,
    brushSize: 1,
    brushStyle: "square" as BrushStyle,
    pencilColor: "black" as PencilColor,
  });

  const spriteCanvasAreaRef = useRef<HTMLDivElement>(null);

  // Canvas hook for undo/redo functionality
  const canvasHook = useCanvas({
    pixels: sprite.pixels,
    onPixelsChange: (pixels) => {
      onSpriteChange({
        ...sprite,
        pixels,
      });
    },
    width: sprite.width,
    height: sprite.height,
  });

  return (
    <div className={`${styles.spriteEditor} ${className}`}>
      {/* Top Toolbar */}
      {showToolbar && (
        <TopToolbar
          activeTool={canvasSettings.tool}
          zoom={canvasSettings.zoom}
          onZoomChange={(zoom: number) =>
            setCanvasSettings((prev) => ({ ...prev, zoom }))
          }
          showGrid={canvasSettings.showGrid}
          onToggleGrid={() =>
            setCanvasSettings((prev) => ({
              ...prev,
              showGrid: !prev.showGrid,
            }))
          }
          eraserSize={canvasSettings.eraserSize}
          onEraserSizeChange={(size: number) =>
            setCanvasSettings((prev) => ({ ...prev, eraserSize: size }))
          }
          brushSize={canvasSettings.brushSize}
          onBrushSizeChange={(size: number) =>
            setCanvasSettings((prev) => ({ ...prev, brushSize: size }))
          }
          brushStyle={canvasSettings.brushStyle}
          onBrushStyleChange={(style: BrushStyle) =>
            setCanvasSettings((prev) => ({ ...prev, brushStyle: style }))
          }
          canUndo={canvasHook.canUndo}
          canRedo={canvasHook.canRedo}
          onUndo={canvasHook.undo}
          onRedo={canvasHook.redo}
          enableScrollZoom={true}
          scrollZoomTarget={spriteCanvasAreaRef}
        />
      )}

      {/* Main Content Area */}
      <div className={styles.mainContent}>
        {/* Left Sidebar */}
        {showToolbar && (
          <LeftSidebar
            activeTool={canvasSettings.tool}
            onToolChange={(tool: DrawingTool) =>
              setCanvasSettings((prev) => ({ ...prev, tool }))
            }
            pencilColor={canvasSettings.pencilColor}
            onPencilColorChange={(pencilColor: PencilColor) =>
              setCanvasSettings((prev) => ({ ...prev, pencilColor }))
            }
          />
        )}

        {/* Canvas */}
        <div ref={spriteCanvasAreaRef} className={styles.canvasArea}>
          <Canvas
            pixels={sprite.pixels}
            width={sprite.width}
            height={sprite.height}
            tool={canvasSettings.tool}
            zoom={canvasSettings.zoom}
            showGrid={canvasSettings.showGrid}
            eraserSize={canvasSettings.eraserSize}
            brushSize={canvasSettings.brushSize}
            brushStyle={canvasSettings.brushStyle}
            pencilColor={canvasSettings.pencilColor}
            onUndo={canvasHook.undo}
            onRedo={canvasHook.redo}
            onToolChange={(tool: DrawingTool) =>
              setCanvasSettings((prev) => ({
                ...prev,
                tool,
              }))
            }
            onToggleGrid={() =>
              setCanvasSettings((prev) => ({
                ...prev,
                showGrid: !prev.showGrid,
              }))
            }
            onPencilColorChange={(pencilColor: PencilColor) =>
              setCanvasSettings((prev) => ({
                ...prev,
                pencilColor,
              }))
            }
            canvasRef={canvasHook.canvasRef}
            previewPixels={canvasHook.previewPixels}
            handleMouseDown={canvasHook.handleMouseDown}
            handleMouseMove={canvasHook.handleMouseMove}
            handleMouseUp={canvasHook.handleMouseUp}
          />
        </div>
      </div>
    </div>
  );
}
