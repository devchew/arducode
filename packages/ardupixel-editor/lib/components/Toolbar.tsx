// Drawing tools toolbar component

import type { DrawingTool, BrushStyle, PencilColor } from "../types";
import { ZoomControls } from "./ZoomControls";
import styles from "./Toolbar.module.css";

interface ToolbarProps {
  activeTool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
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
  pencilColor: PencilColor;
  onPencilColorChange: (color: PencilColor) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  enableScrollZoom?: boolean;
  scrollZoomTarget?: React.RefObject<HTMLElement | null>;
}

const tools: {
  id: DrawingTool;
  icon: string;
  label: string;
  shortcut?: string;
}[] = [
  { id: "pencil", icon: "edit", label: "Pencil", shortcut: "P" },
  { id: "eraser", icon: "clear-all", label: "Eraser", shortcut: "E" },
  { id: "fill", icon: "color-mode", label: "Fill", shortcut: "F" },
  { id: "line", icon: "horizontal-rule", label: "Line", shortcut: "L" },
  {
    id: "rectangle",
    icon: "symbol-misc",
    label: "Rectangle",
    shortcut: "R",
  },
  {
    id: "filled-rectangle",
    icon: "symbol-misc",
    label: "Filled Rectangle",
  },
  { id: "circle", icon: "circle-outline", label: "Circle", shortcut: "C" },
  { id: "filled-circle", icon: "circle-filled", label: "Filled Circle" },
  {
    id: "invert",
    icon: "symbol-color",
    label: "Invert Selection",
    shortcut: "I",
  },
];

export function Toolbar({
  activeTool,
  onToolChange,
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
  pencilColor,
  onPencilColorChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  enableScrollZoom,
  scrollZoomTarget,
}: ToolbarProps) {
  return (
    <vscode-toolbar-container className={styles.toolbar}>
      {/* History Controls */}
      <vscode-toolbar-group>
        <vscode-toolbar-button
          icon="undo"
          label="Undo (Ctrl+Z)"
          disabled={!canUndo}
          onClick={onUndo}
        >
          undo
        </vscode-toolbar-button>
        <vscode-toolbar-button
          icon="redo"
          label="Redo (Ctrl+Y)"
          disabled={!canRedo}
          onClick={onRedo}
        >
          redo
        </vscode-toolbar-button>
      </vscode-toolbar-group>

      <vscode-toolbar-divider />

      {/* Drawing Tools */}
      <vscode-toolbar-group>
        {tools.map((tool) => (
          <vscode-toolbar-button
            key={tool.id}
            icon={tool.icon}
            label={`${tool.label}${tool.shortcut ? ` (${tool.shortcut})` : ""}`}
            pressed={activeTool === tool.id}
            onClick={() => onToolChange(tool.id)}
            className={activeTool === tool.id ? styles.activeTool : ""}
          >
            {tool.label}
          </vscode-toolbar-button>
        ))}
      </vscode-toolbar-group>

      <vscode-toolbar-divider />

      {/* Tool-specific Controls */}
      {activeTool === "eraser" && (
        <vscode-toolbar-group>
          <vscode-label>Size:</vscode-label>
          <input
            type="range"
            min="1"
            max="10"
            value={eraserSize}
            onChange={(e) => onEraserSizeChange(parseInt(e.target.value))}
            title="Eraser Size"
            className={styles.toolbarSlider}
          />
          <span className={styles.toolbarValue}>{eraserSize}</span>
        </vscode-toolbar-group>
      )}

      {activeTool === "pencil" && (
        <vscode-toolbar-group>
          <vscode-label>Brush:</vscode-label>
          <input
            type="range"
            min="1"
            max="10"
            value={brushSize}
            onChange={(e) => onBrushSizeChange(parseInt(e.target.value))}
            title="Brush Size"
            className={styles.toolbarSlider}
          />
          <span className={styles.toolbarValue}>{brushSize}</span>

          <vscode-toolbar-button
            icon="symbol-misc"
            label="Square Brush"
            pressed={brushStyle === "square"}
            onClick={() => onBrushStyleChange("square")}
            className={brushStyle === "square" ? styles.activeTool : ""}
          >
            Square Brush
          </vscode-toolbar-button>
          <vscode-toolbar-button
            icon="circle-large"
            label="Round Brush"
            pressed={brushStyle === "round"}
            onClick={() => onBrushStyleChange("round")}
            className={brushStyle === "round" ? styles.activeTool : ""}
          >
            Round Brush
          </vscode-toolbar-button>

          {/* Pencil Color Controls */}
          <vscode-label>Color:</vscode-label>
          <vscode-toolbar-button
            icon="circle-large-filled"
            label="Black (X to switch)"
            pressed={pencilColor === "black"}
            onClick={() => onPencilColorChange("black")}
            className={`${styles.toolbarColorButtonBlack} ${
              pencilColor === "black" ? styles.activeTool : ""
            }`}
          >
            Black (X to switch)
          </vscode-toolbar-button>
          <vscode-toolbar-button
            icon="circle-outline"
            label="White (X to switch)"
            pressed={pencilColor === "white"}
            onClick={() => onPencilColorChange("white")}
            className={`${styles.toolbarColorButtonWhite} ${
              pencilColor === "white" ? styles.activeTool : ""
            }`}
          >
            White (X to switch)
          </vscode-toolbar-button>
        </vscode-toolbar-group>
      )}

      {activeTool === "eraser" || activeTool === "pencil" ? (
        <vscode-toolbar-divider />
      ) : null}

      {/* View Controls */}
      <vscode-toolbar-group>
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
          label="Toggle Grid (G)"
          pressed={showGrid}
          onClick={onToggleGrid}
          className={showGrid ? styles.activeTool : ""}
        >
          Toggle Grid (G)
        </vscode-toolbar-button>
      </vscode-toolbar-group>

      <vscode-toolbar-divider />

      {/* Quick Actions */}
      <vscode-toolbar-group>
        <vscode-label className={styles.toolbarLabelSmall}>
          Ctrl+Z: Undo | Ctrl+Y: Redo | G: Grid
        </vscode-label>
      </vscode-toolbar-group>
    </vscode-toolbar-container>
  );
}
