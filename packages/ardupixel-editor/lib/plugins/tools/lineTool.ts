// Line tool plugin

import type { ToolPlugin } from '../ToolPlugin';
import type { Point } from '../../types';
import type { SpriteEditorContextType } from '../../contexts/SpriteEditorContext';
import * as DrawingUtils from '../../utils/drawing';

export const lineTool: ToolPlugin = {
  name: 'line',
  icon: '📏',
  cursor: 'crosshair',
  
  onMouseDown(point: Point, context: SpriteEditorContextType) {
    const { state } = context;
    const { sprite } = state;
    
    // Check bounds
    if (point.x < 0 || point.x >= sprite.width || point.y < 0 || point.y >= sprite.height) {
      return;
    }
    
    // Start drawing line
    context.startDrawing(point);
  },
  
  onMouseMove(point: Point, context: SpriteEditorContextType) {
    const { state, dispatch } = context;
    const { sprite, canvasSettings, isDrawing, startPoint } = state;
    
    if (!isDrawing || !startPoint) return;
    
    // Check bounds
    if (point.x < 0 || point.x >= sprite.width || point.y < 0 || point.y >= sprite.height) {
      return;
    }
    
    // Create preview of line
    const previewPixels = DrawingUtils.clonePixelGrid(sprite.pixels);
    const pixelValue = canvasSettings.pencilColor === 'black';
    
    DrawingUtils.drawLine(previewPixels, startPoint, point, pixelValue);
    
    dispatch({ type: 'SET_PREVIEW_PIXELS', pixels: previewPixels });
  },
  
  onMouseUp(point: Point, context: SpriteEditorContextType) {
    const { state, dispatch } = context;
    const { sprite, canvasSettings, isDrawing, startPoint } = state;
    
    if (!isDrawing || !startPoint) return;
    
    // Check bounds
    if (point.x < 0 || point.x >= sprite.width || point.y < 0 || point.y >= sprite.height) {
      context.endDrawing(point);
      return;
    }
    
    // Draw final line
    const newPixels = DrawingUtils.clonePixelGrid(sprite.pixels);
    const pixelValue = canvasSettings.pencilColor === 'black';
    
    DrawingUtils.drawLine(newPixels, startPoint, point, pixelValue);
    
    dispatch({ type: 'UPDATE_PIXELS', payload: newPixels });
    dispatch({ type: 'ADD_TO_HISTORY', pixels: newPixels });
    context.endDrawing(point);
  }
};
