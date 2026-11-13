// Example: Custom tool plugin for invert operation

import React from 'react';
import type { ToolPlugin } from '../ToolPlugin';
import type { Point } from '../../types';
import type { SpriteEditorContextType } from '../../contexts/SpriteEditorContext';
import * as DrawingUtils from '../../utils/drawing';

export const invertTool: ToolPlugin = {
  name: 'invert',
  icon: '🔄',
  cursor: 'crosshair',
  
  onMouseDown(point: Point, context: SpriteEditorContextType) {
    const { state, dispatch } = context;
    const { sprite } = state;
    
    // Check bounds
    if (point.x < 0 || point.x >= sprite.width || point.y < 0 || point.y >= sprite.height) {
      return;
    }
    
    // Start selection
    context.startDrawing(point);
  },
  
  onMouseMove(point: Point, context: SpriteEditorContextType) {
    const { state, dispatch } = context;
    const { sprite, isDrawing, startPoint } = state;
    
    if (!isDrawing || !startPoint) return;
    
    // Check bounds
    if (point.x < 0 || point.x >= sprite.width || point.y < 0 || point.y >= sprite.height) {
      return;
    }
    
    // Create preview of inverted area
    const previewPixels = DrawingUtils.clonePixelGrid(sprite.pixels);
    DrawingUtils.invertPixels(previewPixels, startPoint, point);
    
    dispatch({ type: 'SET_PREVIEW_PIXELS', pixels: previewPixels });
  },
  
  onMouseUp(point: Point, context: SpriteEditorContextType) {
    const { state, dispatch } = context;
    const { sprite, isDrawing, startPoint } = state;
    
    if (!isDrawing || !startPoint) return;
    
    // Apply invert operation
    const newPixels = DrawingUtils.clonePixelGrid(sprite.pixels);
    DrawingUtils.invertPixels(newPixels, startPoint, point);
    
    dispatch({ type: 'UPDATE_PIXELS', payload: newPixels });
    dispatch({ type: 'ADD_TO_HISTORY', pixels: newPixels });
    context.endDrawing(point);
  },
  
  renderSettings(context: SpriteEditorContextType) {
    return (
      <div>
        <p>Click and drag to select an area to invert</p>
      </div>
    );
  }
};
