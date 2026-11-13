// Fill tool plugin

import type { ToolPlugin } from '../ToolPlugin';
import type { Point } from '../../types';
import type { SpriteEditorContextType } from '../../contexts/SpriteEditorContext';
import * as DrawingUtils from '../../utils/drawing';

export const fillTool: ToolPlugin = {
  name: 'fill',
  icon: '🪣',
  cursor: 'crosshair',
  
  onMouseDown(point: Point, context: SpriteEditorContextType) {
    const { state, dispatch } = context;
    const { sprite, canvasSettings } = state;
    
    // Check bounds
    if (point.x < 0 || point.x >= sprite.width || point.y < 0 || point.y >= sprite.height) {
      return;
    }
    
    // Apply flood fill
    const newPixels = DrawingUtils.clonePixelGrid(sprite.pixels);
    const targetValue = canvasSettings.pencilColor === 'black';
    
    DrawingUtils.floodFill(newPixels, point, targetValue);
    
    dispatch({ type: 'UPDATE_PIXELS', payload: newPixels });
    dispatch({ type: 'ADD_TO_HISTORY', pixels: newPixels });
  }
};
