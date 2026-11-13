// Pencil tool plugin

import type { ToolPlugin } from '../ToolPlugin';
import type { Point } from '../../types';
import type { SpriteEditorContextType } from '../../contexts/SpriteEditorContext';
import * as DrawingUtils from '../../utils/drawing';

export const pencilTool: ToolPlugin = {
  name: 'pencil',
  icon: '✏️',
  cursor: 'crosshair',
  
  onMouseDown(point: Point, context: SpriteEditorContextType) {
    const { state, dispatch } = context;
    const { sprite, canvasSettings } = state;
    
    // Check bounds
    if (point.x < 0 || point.x >= sprite.width || point.y < 0 || point.y >= sprite.height) {
      return;
    }
    
    // Start drawing
    context.startDrawing(point);
    
    // Apply pencil
    const newPixels = DrawingUtils.clonePixelGrid(sprite.pixels);
    const pixelValue = canvasSettings.pencilColor === 'black';
    
    if (canvasSettings.brushSize === 1) {
      newPixels[point.y][point.x] = pixelValue;
    } else {
      // Apply brush
      DrawingUtils.applyBrush(
        newPixels,
        point.x,
        point.y,
        canvasSettings.brushSize,
        canvasSettings.brushStyle,
        pixelValue
      );
    }
    
    dispatch({ type: 'UPDATE_PIXELS', payload: newPixels });
  },
  
  onMouseMove(point: Point, context: SpriteEditorContextType) {
    const { state, dispatch } = context;
    const { sprite, canvasSettings, isDrawing } = state;
    
    if (!isDrawing) return;
    
    // Check bounds
    if (point.x < 0 || point.x >= sprite.width || point.y < 0 || point.y >= sprite.height) {
      return;
    }
    
    // Continue drawing
    const newPixels = DrawingUtils.clonePixelGrid(sprite.pixels);
    const pixelValue = canvasSettings.pencilColor === 'black';
    
    if (canvasSettings.brushSize === 1) {
      newPixels[point.y][point.x] = pixelValue;
    } else {
      // Apply brush
      DrawingUtils.applyBrush(
        newPixels,
        point.x,
        point.y,
        canvasSettings.brushSize,
        canvasSettings.brushStyle,
        pixelValue
      );
    }
    
    dispatch({ type: 'UPDATE_PIXELS', payload: newPixels });
  },
  
  onMouseUp(point: Point, context: SpriteEditorContextType) {
    const { state, dispatch } = context;
    
    if (state.isDrawing) {
      // Add to history
      dispatch({ type: 'ADD_TO_HISTORY', pixels: state.sprite.pixels });
      context.endDrawing(point);
    }
  }
};
