// Tool Manager component that handles tool plugins

import React, { useEffect } from 'react';
import { useSpriteEditor } from '../hooks/useSpriteEditor';
import { toolRegistry } from './ToolPlugin';
import { registerBuiltInTools } from './tools';

interface ToolManagerProps {
  children: React.ReactNode;
}

export function ToolManager({ children }: ToolManagerProps) {
  const context = useSpriteEditor();
  const { state } = context;
  const currentTool = state.canvasSettings.tool;

  // Register built-in tools on mount
  useEffect(() => {
    registerBuiltInTools();
  }, []);

  // Handle tool activation/deactivation
  useEffect(() => {
    const tool = toolRegistry.get(currentTool);
    if (tool?.onActivate) {
      tool.onActivate(context);
    }

    return () => {
      if (tool?.onDeactivate) {
        tool.onDeactivate(context);
      }
    };
  }, [currentTool, context]);

  return <>{children}</>;
}
