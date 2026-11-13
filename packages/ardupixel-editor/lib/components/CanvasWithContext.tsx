// Refactored Canvas component using context

import React, { useEffect } from 'react';
import { useSpriteEditor } from '../hooks/useSpriteEditor';
import { toolRegistry } from '../plugins/ToolPlugin';
import styles from './Canvas.module.css';

interface CanvasProps {
  className?: string;
}

export function Canvas({ className = '' }: CanvasProps) {
  const context = useSpriteEditor();
  const { state, canvasRef, screenToPixel } = context;
  const { sprite, canvasSettings, previewPixels } = state;

  // Draw the canvas
  const draw = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { zoom, showGrid } = canvasSettings;
    const { width, height, pixels } = sprite;

    // Set canvas size
    canvas.width = width * zoom;
    canvas.height = height * zoom;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Use preview pixels if available, otherwise use sprite pixels
    const pixelsToRender = previewPixels || pixels;

    // Draw pixels
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixelValue = pixelsToRender[y][x];
        ctx.fillStyle = pixelValue ? '#000000' : '#ffffff';
        ctx.fillRect(x * zoom, y * zoom, zoom, zoom);
      }
    }

    // Draw grid
    if (showGrid && zoom >= 4) {
      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 1;
      
      // Vertical lines
      for (let x = 0; x <= width; x++) {
        ctx.beginPath();
        ctx.moveTo(x * zoom + 0.5, 0);
        ctx.lineTo(x * zoom + 0.5, height * zoom);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let y = 0; y <= height; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * zoom + 0.5);
        ctx.lineTo(width * zoom, y * zoom + 0.5);
        ctx.stroke();
      }
    }
  }, [canvasRef, sprite, canvasSettings, previewPixels]);

  // Redraw when state changes
  useEffect(() => {
    draw();
  }, [draw]);

  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const point = screenToPixel(e.clientX, e.clientY);
    
    // Delegate to tool plugin
    const tool = toolRegistry.get(state.canvasSettings.tool);
    if (tool?.onMouseDown) {
      tool.onMouseDown(point, context);
    } else {
      context.startDrawing(point);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const point = screenToPixel(e.clientX, e.clientY);
    
    // Delegate to tool plugin
    const tool = toolRegistry.get(state.canvasSettings.tool);
    if (tool?.onMouseMove) {
      tool.onMouseMove(point, context);
    } else {
      context.continueDrawing(point);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    const point = screenToPixel(e.clientX, e.clientY);
    
    // Delegate to tool plugin
    const tool = toolRegistry.get(state.canvasSettings.tool);
    if (tool?.onMouseUp) {
      tool.onMouseUp(point, context);
    } else {
      context.endDrawing(point);
    }
  };

  const handleMouseLeave = () => {
    if (state.isDrawing) {
      context.endDrawing({ x: -1, y: -1 });
    }
  };

  return (
    <div className={`${styles.canvasContainer} ${className}`}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
}
