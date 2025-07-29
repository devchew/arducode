// Left sidebar for drawing tools and colors

import type { DrawingTool, PencilColor } from "../types";
import styles from "./LeftSidebar.module.css";

interface LeftSidebarProps {
  activeTool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
  pencilColor: PencilColor;
  onPencilColorChange: (color: PencilColor) => void;
}

const tools: {
  id: DrawingTool;
  icon: string;
  label: string;
}[] = [
  { id: "pencil", icon: "edit", label: "Pencil" },
  { id: "eraser", icon: "clear-all", label: "Eraser" },
  { id: "fill", icon: "color-mode", label: "Fill" },
  { id: "line", icon: "horizontal-rule", label: "Line" },
  { id: "rectangle", icon: "symbol-misc", label: "Rectangle" },
  { id: "filled-rectangle", icon: "symbol-misc", label: "Filled Rectangle" },
  { id: "circle", icon: "circle-outline", label: "Circle" },
  { id: "filled-circle", icon: "circle-filled", label: "Filled Circle" },
  { id: "invert", icon: "symbol-color", label: "Invert Selection" },
];

export function LeftSidebar({
  activeTool,
  onToolChange,
  pencilColor,
  onPencilColorChange,
}: LeftSidebarProps) {
  return (
    <div className={styles.sidebar}>
      {/* Drawing Tools */}
      <div className={styles.toolsSection}>
        {tools.map((tool) => (
          <button
            key={tool.id}
            className={`${styles.toolButton} ${
              activeTool === tool.id ? styles.activeTool : ""
            }`}
            onClick={() => onToolChange(tool.id)}
            title={tool.label}
          >
            <vscode-icon name={tool.icon} />
          </button>
        ))}
      </div>

      {/* Color Palette at Bottom */}
      <div className={styles.colorsSection}>
        <div className={styles.colorPalette}>
          <button
            className={`${styles.colorButton} ${styles.colorButtonBlack} ${
              pencilColor === "black" ? styles.activeColor : ""
            }`}
            onClick={() => onPencilColorChange("black")}
            title="Black"
          >
          </button>
          <button
            className={`${styles.colorButton} ${styles.colorButtonWhite} ${
              pencilColor === "white" ? styles.activeColor : ""
            }`}
            onClick={() => onPencilColorChange("white")}
            title="White"
          >
          </button>
        </div>
      </div>
    </div>
  );
}
