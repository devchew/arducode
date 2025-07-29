// Top toolbar for tool options and view controls

import type { DrawingTool, BrushStyle } from "../types";
import { ZoomControls } from "./ZoomControls";
import styles from "./TopToolbar.module.css";

interface TopToolbarProps {
  activeTool: DrawingTool;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  eraserSize: number;
  onEraserSizeChange: (size: number) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  brushStyle: BrushStyle;
  onBrushStyleChange: (style: BrushStyle) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  enableScrollZoom?: boolean;
  scrollZoomTarget?: React.RefObject<HTMLElement | null>;
}

export function TopToolbar({
  activeTool,
  zoom,
  onZoomChange,
  showGrid,
  onToggleGrid,
  eraserSize,
  onEraserSizeChange,
  brushSize,
  onBrushSizeChange,
  brushStyle,
  onBrushStyleChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  enableScrollZoom,
  scrollZoomTarget,
}: TopToolbarProps) {
  const getActiveToolName = (tool: DrawingTool) => {
    const toolNames: Record<DrawingTool, string> = {
      pencil: "Pencil",
      eraser: "Eraser",
      fill: "Fill",
      line: "Line",
      rectangle: "Rectangle",
      "filled-rectangle": "Filled Rectangle",
      circle: "Circle",
      "filled-circle": "Filled Circle",
      invert: "Invert Selection",
      zoom: "Zoom",
    };
    return toolNames[tool];
  };

  return (
    <div className={styles.topToolbar}>
      {/* Left section: History + Tool Options */}
      <div className={styles.leftSection}>
        {/* History Controls */}
        <div className={styles.historyControls}>
          <vscode-toolbar-button
            icon="undo"
            label="Undo"
            disabled={!canUndo}
            onClick={onUndo}
          />
          <vscode-toolbar-button
            icon="redo"
            label="Redo"
            disabled={!canRedo}
            onClick={onRedo}
          />
        </div>

        <div className={styles.divider} />

        {/* Current Tool Display */}
        <div className={styles.toolInfo}>
          <span className={styles.toolLabel}>
            {getActiveToolName(activeTool)}
          </span>
        </div>

        {/* Tool-specific Options */}
        {activeTool === "eraser" && (
          <div className={styles.toolOptions}>
            <vscode-label>Size:</vscode-label>
            <input
              type="range"
              min="1"
              max="10"
              value={eraserSize}
              onChange={(e) => onEraserSizeChange(parseInt(e.target.value))}
              className={styles.slider}
              title="Eraser Size"
            />
            <span className={styles.sliderValue}>{eraserSize}</span>
          </div>
        )}

        {activeTool === "pencil" && (
          <div className={styles.toolOptions}>
            <vscode-label>Size:</vscode-label>
            <input
              type="range"
              min="1"
              max="10"
              value={brushSize}
              onChange={(e) => onBrushSizeChange(parseInt(e.target.value))}
              className={styles.slider}
              title="Brush Size"
            />
            <span className={styles.sliderValue}>{brushSize}</span>

            <div className={styles.divider} />

            <vscode-label>Style:</vscode-label>
            <vscode-toolbar-button
              icon="symbol-misc"
              label="Square"
              pressed={brushStyle === "square"}
              onClick={() => onBrushStyleChange("square")}
            />
            <vscode-toolbar-button
              icon="circle-large"
              label="Round"
              pressed={brushStyle === "round"}
              onClick={() => onBrushStyleChange("round")}
            />
          </div>
        )}
      </div>

      {/* Right section: View Controls */}
      <div className={styles.rightSection}>
        <ZoomControls
          zoom={zoom}
          onZoomChange={onZoomChange}
          minZoom={1}
          maxZoom={128}
          zoomStep={1}
          presets={[1, 2, 4, 8, 64]}
          variant="toolbar"
          enableScrollZoom={enableScrollZoom}
          scrollZoomTarget={scrollZoomTarget}
        />

        <vscode-toolbar-button
          icon="grid"
          label="Grid"
          pressed={showGrid}
          onClick={onToggleGrid}
        />
      </div>
    </div>
  );
}
