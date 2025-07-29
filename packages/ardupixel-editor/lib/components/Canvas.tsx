// Main drawing canvas component

import React, { useEffect, useRef, useState } from "react";
import type { Point, PencilColor, DrawingTool, BrushStyle } from "../types";
import styles from "./Canvas.module.css";

interface CanvasProps {
  pixels: boolean[][];
  width: number;
  height: number;
  tool: DrawingTool;
  zoom: number;
  showGrid: boolean;
  eraserSize: number;
  brushSize: number;
  brushStyle: BrushStyle;
  pencilColor: PencilColor;
  onUndo: () => void;
  onRedo: () => void;
  onToolChange: (tool: DrawingTool) => void;
  onToggleGrid: () => void;
  onPencilColorChange?: (color: PencilColor) => void;
  // Props from useCanvas hook
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  previewPixels: boolean[][] | null;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: (e: React.MouseEvent) => void;
}

export function Canvas({
  pixels,
  width,
  height,
  tool,
  zoom,
  showGrid,
  eraserSize,
  brushSize,
  brushStyle,
  pencilColor,
  onUndo,
  onRedo,
  onToolChange,
  onToggleGrid,
  onPencilColorChange,
  canvasRef,
  previewPixels,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
}: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState<Point | null>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "z":
            e.preventDefault();
            if (e.shiftKey) {
              onRedo();
            } else {
              onUndo();
            }
            break;
          case "y":
            e.preventDefault();
            onRedo();
            break;
        }
      } else {
        switch (e.key.toLowerCase()) {
          case "p":
            onToolChange("pencil");
            break;
          case "e":
            onToolChange("eraser");
            break;
          case "f":
            onToolChange("fill");
            break;
          case "l":
            onToolChange("line");
            break;
          case "r":
            onToolChange("rectangle");
            break;
          case "c":
            onToolChange("circle");
            break;
          case "i":
            onToolChange("invert");
            break;
          case "z":
            onToolChange("zoom");
            break;
          case "g":
            onToggleGrid();
            break;
          case "x":
            if (tool === "pencil") {
              // Switch pencil color when pencil tool is active
              const newColor = pencilColor === "black" ? "white" : "black";
              if (onPencilColorChange) {
                onPencilColorChange(newColor);
              }
            } else {
              // Switch to pencil tool from other tools
              onToolChange("pencil");
            }
            break;
          case "[":
            // Note: Brush size changes would need to be handled by parent component
            break;
          case "]":
            // Note: Brush size changes would need to be handled by parent component
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    onUndo,
    onRedo,
    onToolChange,
    onToggleGrid,
    pencilColor,
    tool,
    onPencilColorChange,
  ]);

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const displayPixels = previewPixels || pixels;

    // Set canvas size
    canvas.width = width * zoom;
    canvas.height = height * zoom;

    // Clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw pixels
    ctx.fillStyle = "#000000";
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (displayPixels[y] && displayPixels[y][x]) {
          ctx.fillRect(x * zoom, y * zoom, zoom, zoom);
        }
      }
    }

    // Draw brush preview
    if (mousePosition && (tool === "pencil" || tool === "eraser")) {
      const size = tool === "pencil" ? brushSize : eraserSize;
      const style = tool === "pencil" ? brushStyle : "square";

      ctx.strokeStyle = tool === "pencil" ? "#0000ff" : "#ff0000";
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.7;

      if (size === 1) {
        // Single pixel preview
        ctx.strokeRect(
          mousePosition.x * zoom,
          mousePosition.y * zoom,
          zoom,
          zoom
        );
      } else {
        // Multi-pixel brush preview
        for (let dy = -Math.floor(size / 2); dy <= Math.floor(size / 2); dy++) {
          for (
            let dx = -Math.floor(size / 2);
            dx <= Math.floor(size / 2);
            dx++
          ) {
            const x = mousePosition.x + dx;
            const y = mousePosition.y + dy;

            // Check bounds
            if (x >= 0 && x < width && y >= 0 && y < height) {
              if (style === "round") {
                // Round brush: check if point is within circle radius
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= size / 2) {
                  ctx.strokeRect(x * zoom, y * zoom, zoom, zoom);
                }
              } else {
                // Square brush
                ctx.strokeRect(x * zoom, y * zoom, zoom, zoom);
              }
            }
          }
        }
      }

      ctx.globalAlpha = 1;
    }

    // Draw grid
    if (showGrid && zoom >= 4) {
      ctx.strokeStyle = "#cccccc";
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = 0.5;

      // Vertical lines
      for (let x = 0; x <= width; x++) {
        ctx.beginPath();
        ctx.moveTo(x * zoom, 0);
        ctx.lineTo(x * zoom, height * zoom);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y <= height; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * zoom);
        ctx.lineTo(width * zoom, y * zoom);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    }
  }, [
    pixels,
    previewPixels,
    width,
    height,
    zoom,
    showGrid,
    canvasRef,
    mousePosition,
    tool,
    brushSize,
    brushStyle,
    eraserSize,
  ]);

  // Handle mouse leave to stop drawing
  const handleMouseLeave = () => {
    setMousePosition(null);
  };

  // Track mouse position for brush preview
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const pixelX = Math.floor((e.clientX - rect.left) / zoom);
    const pixelY = Math.floor((e.clientY - rect.top) / zoom);

    // Only show preview for pencil and eraser tools
    if (tool === "pencil" || tool === "eraser") {
      setMousePosition({ x: pixelX, y: pixelY });
    } else {
      setMousePosition(null);
    }

    // Call the original mouse move handler
    handleMouseMove(e);
  };

  return (
    <div ref={containerRef} className={styles.canvasContainer}>
      <div className={styles.canvasWrapper}>
        <div className={styles.canvasFrame}>
          <canvas
            ref={canvasRef}
            className={`${styles.canvasElement} ${styles.canvas}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          />
        </div>

        {/* Canvas Info */}
        <div className={styles.canvasInfo}>
          <p>
            Canvas: {width} × {height} pixels
          </p>
          <p>
            Zoom: {zoom}x | Tool: {tool}
          </p>
        </div>
      </div>
    </div>
  );
}
