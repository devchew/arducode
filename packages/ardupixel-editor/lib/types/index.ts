// Core type definitions for the sprite editor

export interface Point {
  x: number;
  y: number;
}

export interface SpriteData {
  id: string;
  name: string;
  width: number;
  height: number;
  pixels: boolean[][]; // true = black pixel, false = white pixel
  frames?: SpriteFrame[];
  isAnimation?: boolean;
}

export interface SpriteFrame {
  id: string;
  pixels: boolean[][];
  duration?: number; // milliseconds
}

export type DrawingTool =
  | "pencil"
  | "eraser"
  | "fill"
  | "line"
  | "rectangle"
  | "circle"
  | "filled-rectangle"
  | "filled-circle"
  | "invert"
  | "zoom";

export type BrushStyle = "square" | "round";
export type PencilColor = "black" | "white";

export interface CanvasState {
  zoom: number;
  offsetX: number;
  offsetY: number;
  showGrid: boolean;
  tool: DrawingTool;
  eraserSize: number;
  brushSize: number;
  brushStyle: BrushStyle;
  pencilColor: PencilColor;
}

export interface HistoryState {
  pixels: boolean[][];
  timestamp: number;
}

export interface SpriteEditorProps {
  sprite: SpriteData;
  onSpriteChange: (sprite: SpriteData) => void;
  initialZoom?: number;
  showToolbar?: boolean;
  className?: string;
}
