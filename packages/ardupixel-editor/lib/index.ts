// Main exports for the composable sprite editor

// Context and hooks
export { SpriteEditorProvider } from './contexts/SpriteEditorContext';
export type { SpriteEditorContextType } from './contexts/SpriteEditorContext';
export { useSpriteEditor } from './hooks/useSpriteEditor';

// Components
export { SpriteEditor } from './components/SpriteEditorWithContext';
export { Canvas } from './components/CanvasWithContext';

// Plugin system
export { ToolManager } from './plugins/ToolManager';
export { toolRegistry } from './plugins/ToolPlugin';
export type { ToolPlugin } from './plugins/ToolPlugin';
export { registerBuiltInTools } from './plugins/tools';
export * from './plugins/tools';

// Types
export * from './types';

// Utils
export * from './utils/drawing';
