// Tool plugin system for sprite editor

import type { Point } from '../types';
import type { SpriteEditorContextType } from '../contexts/SpriteEditorContext';

// Base interface for all tools
export interface ToolPlugin {
  name: string;
  icon?: string;
  cursor?: string;
  
  // Tool lifecycle methods
  onActivate?: (context: SpriteEditorContextType) => void;
  onDeactivate?: (context: SpriteEditorContextType) => void;
  
  // Drawing methods
  onMouseDown?: (point: Point, context: SpriteEditorContextType) => void;
  onMouseMove?: (point: Point, context: SpriteEditorContextType) => void;
  onMouseUp?: (point: Point, context: SpriteEditorContextType) => void;
  
  // Keyboard events
  onKeyDown?: (event: KeyboardEvent, context: SpriteEditorContextType) => void;
  onKeyUp?: (event: KeyboardEvent, context: SpriteEditorContextType) => void;
  
  // Tool settings UI
  renderSettings?: (context: SpriteEditorContextType) => React.ReactNode;
}

// Tool registry
class ToolRegistry {
  private tools = new Map<string, ToolPlugin>();
  
  register(toolName: string, plugin: ToolPlugin) {
    this.tools.set(toolName, plugin);
  }
  
  get(toolName: string): ToolPlugin | undefined {
    return this.tools.get(toolName);
  }
  
  getAll(): Map<string, ToolPlugin> {
    return new Map(this.tools);
  }
  
  unregister(toolName: string) {
    this.tools.delete(toolName);
  }
}

export const toolRegistry = new ToolRegistry();
