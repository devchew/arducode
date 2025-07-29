// Main Sprite Editor component

import { useState, useCallback, useRef } from "react";
import { Canvas } from "./Canvas";
import { Toolbar } from "./Toolbar";
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

  const handlePixelsChange = useCallback(
    (pixels: boolean[][]) => {
      onSpriteChange({
        ...sprite,
        pixels,
      });
    },
    [sprite, onSpriteChange]
  );

  return (
    <div className={`${styles.spriteEditor} ${className}`}>
      {/* Toolbar */}
      {showToolbar && (
        <Toolbar
          activeTool={canvasSettings.tool}
          onToolChange={(tool) =>
            setCanvasSettings((prev) => ({ ...prev, tool }))
          }
          zoom={canvasSettings.zoom}
          onZoomChange={(zoom) =>
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
          onEraserSizeChange={(size) =>
            setCanvasSettings((prev) => ({ ...prev, eraserSize: size }))
          }
          brushSize={canvasSettings.brushSize}
          onBrushSizeChange={(size) =>
            setCanvasSettings((prev) => ({ ...prev, brushSize: size }))
          }
          brushStyle={canvasSettings.brushStyle}
          onBrushStyleChange={(style) =>
            setCanvasSettings((prev) => ({ ...prev, brushStyle: style }))
          }
          pencilColor={canvasSettings.pencilColor}
          onPencilColorChange={(pencilColor) =>
            setCanvasSettings((prev) => ({ ...prev, pencilColor }))
          }
          canUndo={canvasHook.canUndo}
          canRedo={canvasHook.canRedo}
          onUndo={canvasHook.undo}
          onRedo={canvasHook.redo}
          enableScrollZoom={true}
          scrollZoomTarget={spriteCanvasAreaRef}
        />
      )}

      {/* Canvas */}
      <div ref={spriteCanvasAreaRef} className={styles.canvasArea}>
        <Canvas
          pixels={sprite.pixels}
          onPixelsChange={handlePixelsChange}
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
          onToolChange={(tool) =>
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
          onPencilColorChange={(pencilColor) =>
            setCanvasSettings((prev) => ({
              ...prev,
              pencilColor,
            }))
          }
        />
      </div>
    </div>
  );
}
