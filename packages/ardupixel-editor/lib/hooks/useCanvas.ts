// Canvas management hook for drawing operations

import { useRef, useCallback, useEffect, useState } from "react";
import type { Point, DrawingTool, HistoryState } from "../types";
import * as DrawingUtils from "../utils/drawing";

interface UseCanvasProps {
  pixels: boolean[][];
  onPixelsChange: (pixels: boolean[][]) => void;
  width: number;
  height: number;
  tool: DrawingTool;
  zoom: number;
  eraserSize: number;
  brushSize: number;
  brushStyle: string;
  pencilColor: string;
  onZoomChange: (zoom: number) => void;
}

export function useCanvas({ 
  pixels, 
  onPixelsChange, 
  tool,
  zoom,
  eraserSize,
  brushSize,
  brushStyle,
  pencilColor,
  onZoomChange
}: UseCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isInitialized = useRef(false);

  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [previewPixels, setPreviewPixels] = useState<boolean[][] | null>(null);

  // Add current state to history
  const addToHistory = useCallback(
    (newPixels: boolean[][]) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({
        pixels: DrawingUtils.clonePixelGrid(newPixels),
        timestamp: Date.now(),
      });

      // Limit history to 50 items
      if (newHistory.length > 50) {
        newHistory.shift();
        setHistoryIndex(49); // Keep index at max when trimming
      } else {
        const newIndex = newHistory.length - 1;
        setHistoryIndex(newIndex); // Point to the newly added item
      }

      setHistory(newHistory);
    },
    [history, historyIndex]
  );

  // Undo operation
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const previousState = history[newIndex];
      onPixelsChange(DrawingUtils.clonePixelGrid(previousState.pixels));
    }
  }, [history, historyIndex, onPixelsChange]);

  // Redo operation
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const nextState = history[newIndex];
      onPixelsChange(DrawingUtils.clonePixelGrid(nextState.pixels));
    }
  }, [history, historyIndex, onPixelsChange]);

  // Convert screen coordinates to pixel coordinates
  const screenToPixel = useCallback(
    (screenX: number, screenY: number): Point => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((screenX - rect.left) / zoom);
      const y = Math.floor((screenY - rect.top) / zoom);

      return { x, y };
    },
    [zoom]
  );

  // Handle drawing operations
  const draw = useCallback(
    (point: Point, tool: DrawingTool) => {
      const newPixels = DrawingUtils.clonePixelGrid(pixels);

      switch (tool) {
        case "pencil": {
          // Draw with brush size and style, using selected color
          const size = brushSize;
          const style = brushStyle;
          const pixelValue = pencilColor === "black";

          if (size === 1) {
            DrawingUtils.setPixelAtPoint(newPixels, point, pixelValue);
          } else {
            // Apply brush pattern based on style
            for (
              let dy = -Math.floor(size / 2);
              dy <= Math.floor(size / 2);
              dy++
            ) {
              for (
                let dx = -Math.floor(size / 2);
                dx <= Math.floor(size / 2);
                dx++
              ) {
                const targetPoint = { x: point.x + dx, y: point.y + dy };

                if (style === "round") {
                  // Round brush: check if point is within circle radius
                  const distance = Math.sqrt(dx * dx + dy * dy);
                  if (distance <= size / 2) {
                    DrawingUtils.setPixelAtPoint(
                      newPixels,
                      targetPoint,
                      pixelValue
                    );
                  }
                } else {
                  // Square brush: draw all points in square
                  DrawingUtils.setPixelAtPoint(
                    newPixels,
                    targetPoint,
                    pixelValue
                  );
                }
              }
            }
          }
          break;
        }

        case "eraser": {
          // Draw a square eraser
          const size = eraserSize;
          for (
            let dy = -Math.floor(size / 2);
            dy <= Math.floor(size / 2);
            dy++
          ) {
            for (
              let dx = -Math.floor(size / 2);
              dx <= Math.floor(size / 2);
              dx++
            ) {
              DrawingUtils.setPixelAtPoint(
                newPixels,
                { x: point.x + dx, y: point.y + dy },
                false
              );
            }
          }
          break;
        }

        case "fill":
          DrawingUtils.floodFill(
            newPixels,
            point,
            !DrawingUtils.getPixelAtPoint(pixels, point)
          );
          break;

        case "zoom":
          // Zoom tool doesn't modify pixels, just changes zoom level
          // This will be handled in mouse events
          break;
      }

      onPixelsChange(newPixels);
    },
    [
      pixels,
      onPixelsChange,
      eraserSize,
      brushSize,
      brushStyle,
      pencilColor,
    ]
  );

  // Handle shape preview
  const updateShapePreview = useCallback(
    (currentPoint: Point) => {
      if (!startPoint) return;

      const preview = DrawingUtils.clonePixelGrid(pixels);

      switch (tool) {
        case "line":
          DrawingUtils.drawLine(preview, startPoint, currentPoint, true);
          break;

        case "rectangle":
          DrawingUtils.drawRectangle(
            preview,
            startPoint,
            currentPoint,
            true,
            false
          );
          break;

        case "filled-rectangle":
          DrawingUtils.drawRectangle(
            preview,
            startPoint,
            currentPoint,
            true,
            true
          );
          break;

        case "circle": {
          const radius = Math.sqrt(
            (currentPoint.x - startPoint.x) ** 2 +
              (currentPoint.y - startPoint.y) ** 2
          );
          DrawingUtils.drawCircle(
            preview,
            startPoint,
            Math.round(radius),
            true,
            false
          );
          break;
        }

        case "filled-circle": {
          const filledRadius = Math.sqrt(
            (currentPoint.x - startPoint.x) ** 2 +
              (currentPoint.y - startPoint.y) ** 2
          );
          DrawingUtils.drawCircle(
            preview,
            startPoint,
            Math.round(filledRadius),
            true,
            true
          );
          break;
        }

        case "invert":
          DrawingUtils.invertPixels(preview, startPoint, currentPoint);
          break;
      }

      setPreviewPixels(preview);
    },
    [pixels, startPoint, tool]
  );

  // Mouse event handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const point = screenToPixel(e.clientX, e.clientY);
      setIsDrawing(true);
      setStartPoint(point);

      if (tool === "zoom") {
        // Handle zoom tool click
        const zoomStep = 1;
        const maxZoom = 128;
        const minZoom = 1;
        
        if (e.button === 0) {
          // Left click: zoom in
          const newZoom = Math.min(maxZoom, zoom + zoomStep);
          onZoomChange(newZoom);
        } else if (e.button === 2) {
          // Right click: zoom out
          e.preventDefault(); // Prevent context menu
          const newZoom = Math.max(minZoom, zoom - zoomStep);
          onZoomChange(newZoom);
        }
      } else if (
        tool === "pencil" ||
        tool === "eraser" ||
        tool === "fill"
      ) {
        addToHistory(pixels);
        draw(point, tool);
      }
    },
    [screenToPixel, tool, zoom, addToHistory, pixels, draw, onZoomChange]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const point = screenToPixel(e.clientX, e.clientY);

      if (isDrawing && tool !== "zoom") {
        if (tool === "pencil" || tool === "eraser") {
          draw(point, tool);
        } else if (startPoint) {
          updateShapePreview(point);
        }
      }
    },
    [
      screenToPixel,
      isDrawing,
      tool,
      draw,
      startPoint,
      updateShapePreview,
    ]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (!isDrawing || !startPoint) return;

      const point = screenToPixel(e.clientX, e.clientY);

      if (tool === "zoom") {
        // Zoom tool doesn't need history or drawing operations
        // Zoom action was already handled in mouseDown
      } else if (
        tool !== "pencil" &&
        tool !== "eraser" &&
        tool !== "fill"
      ) {
        addToHistory(pixels);
        const newPixels = DrawingUtils.clonePixelGrid(pixels);

        switch (tool) {
          case "line":
            DrawingUtils.drawLine(newPixels, startPoint, point, true);
            break;

          case "rectangle":
            DrawingUtils.drawRectangle(
              newPixels,
              startPoint,
              point,
              true,
              false
            );
            break;

          case "filled-rectangle":
            DrawingUtils.drawRectangle(
              newPixels,
              startPoint,
              point,
              true,
              true
            );
            break;

          case "circle": {
            const radius = Math.sqrt(
              (point.x - startPoint.x) ** 2 + (point.y - startPoint.y) ** 2
            );
            DrawingUtils.drawCircle(
              newPixels,
              startPoint,
              Math.round(radius),
              true,
              false
            );
            break;
          }

          case "filled-circle": {
            const filledRadius = Math.sqrt(
              (point.x - startPoint.x) ** 2 + (point.y - startPoint.y) ** 2
            );
            DrawingUtils.drawCircle(
              newPixels,
              startPoint,
              Math.round(filledRadius),
              true,
              true
            );
            break;
          }

          case "invert":
            DrawingUtils.invertPixels(newPixels, startPoint, point);
            break;
        }

        onPixelsChange(newPixels);
        // Add the final result to history after shape drawing
        addToHistory(newPixels);
      } else {
        // For pencil/eraser/fill tools, add the current final state to history
        addToHistory(pixels);
      }

      setIsDrawing(false);
      setStartPoint(null);
      setPreviewPixels(null);
    },
    [
      isDrawing,
      startPoint,
      screenToPixel,
      tool,
      addToHistory,
      pixels,
      onPixelsChange,
    ]
  );

  // Initialize history
  useEffect(() => {
    if (!isInitialized.current && history.length === 0) {
      setHistory([
        {
          pixels: DrawingUtils.clonePixelGrid(pixels),
          timestamp: Date.now(),
        },
      ]);
      setHistoryIndex(0);
      isInitialized.current = true;
    }
  }, [pixels, history.length]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return {
    canvasRef,
    previewPixels,
    isDrawing,
    undo,
    redo,
    canUndo,
    canRedo,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}
