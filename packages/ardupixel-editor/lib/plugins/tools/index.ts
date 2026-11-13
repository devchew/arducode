// Tool registration and exports

import { toolRegistry } from '../ToolPlugin';
import { pencilTool } from './pencilTool';
import { eraserTool } from './eraserTool';
import { fillTool } from './fillTool';
import { lineTool } from './lineTool';

// Register all built-in tools
export function registerBuiltInTools() {
  toolRegistry.register('pencil', pencilTool);
  toolRegistry.register('eraser', eraserTool);
  toolRegistry.register('fill', fillTool);
  toolRegistry.register('line', lineTool);
}

// Export tools for direct use
export {
  pencilTool,
  eraserTool,
  fillTool,
  lineTool,
  toolRegistry
};
