# Composable Sprite Editor

A modular, context-based sprite editor with a plugin system for tools.

## Architecture Overview

The sprite editor has been refactored to be more composable and extensible:

### 1. Context-Based State Management

The editor now uses React Context for state management, making it easier to share state across components and plugins.

```tsx
import { SpriteEditorProvider, useSpriteEditor } from './lib';

function MyComponent() {
  return (
    <SpriteEditorProvider sprite={mySprite} onSpriteChange={handleChange}>
      <MyCustomEditor />
    </SpriteEditorProvider>
  );
}

function MyCustomEditor() {
  const { state, setTool, undo, redo } = useSpriteEditor();
  // Access and modify editor state
}
```

### 2. Plugin-Based Tool System

Tools are now implemented as plugins that can be registered and used independently:

```tsx
import { toolRegistry, ToolPlugin } from './lib';

// Create a custom tool
const customTool: ToolPlugin = {
  name: 'custom',
  icon: '⭐',
  cursor: 'crosshair',
  
  onMouseDown(point, context) {
    // Handle mouse down
  },
  
  onMouseMove(point, context) {
    // Handle mouse move
  },
  
  onMouseUp(point, context) {
    // Handle mouse up
  }
};

// Register the tool
toolRegistry.register('custom', customTool);
```

### 3. Modular Components

Components are now smaller and focused on specific responsibilities:

- `SpriteEditorProvider` - Provides context and state management
- `ToolManager` - Handles tool plugin lifecycle and events
- `Canvas` - Renders the sprite canvas
- `LeftSidebar` - Tool selection UI
- `TopToolbar` - Tool settings and controls

## Usage Examples

### Basic Usage

```tsx
import { SpriteEditor } from './lib';

function App() {
  const [sprite, setSprite] = useState(mySprite);
  
  return (
    <SpriteEditor
      sprite={sprite}
      onSpriteChange={setSprite}
      initialZoom={8}
      showToolbar={true}
    />
  );
}
```

### Custom Tool Creation

```tsx
import { ToolPlugin, toolRegistry, useSpriteEditor } from './lib';

const rainbowTool: ToolPlugin = {
  name: 'rainbow',
  icon: '🌈',
  
  onMouseDown(point, context) {
    const { state, dispatch } = context;
    // Custom drawing logic
    const newPixels = createRainbowEffect(state.sprite.pixels, point);
    dispatch({ type: 'UPDATE_PIXELS', payload: newPixels });
    dispatch({ type: 'ADD_TO_HISTORY', pixels: newPixels });
  }
};

// Register and use
toolRegistry.register('rainbow', rainbowTool);
```

### Custom Editor Layout

```tsx
import { 
  SpriteEditorProvider, 
  ToolManager, 
  Canvas, 
  useSpriteEditor 
} from './lib';

function CustomEditor({ sprite, onSpriteChange }) {
  return (
    <SpriteEditorProvider sprite={sprite} onSpriteChange={onSpriteChange}>
      <div className="my-custom-layout">
        <MyCustomToolbar />
        <ToolManager>
          <Canvas />
        </ToolManager>
        <MyCustomSidebar />
      </div>
    </SpriteEditorProvider>
  );
}

function MyCustomToolbar() {
  const { setTool, setZoom, undo, redo, canUndo, canRedo } = useSpriteEditor();
  
  return (
    <div>
      <button onClick={() => setTool('pencil')}>Pencil</button>
      <button onClick={() => setTool('eraser')}>Eraser</button>
      <button onClick={undo} disabled={!canUndo}>Undo</button>
      <button onClick={redo} disabled={!canRedo}>Redo</button>
    </div>
  );
}
```

## Built-in Tools

The following tools are included:

- **Pencil** (`pencil`) - Draw pixels
- **Eraser** (`eraser`) - Erase pixels  
- **Fill** (`fill`) - Flood fill areas
- **Line** (`line`) - Draw straight lines

## Tool Plugin API

### ToolPlugin Interface

```tsx
interface ToolPlugin {
  name: string;
  icon?: string;
  cursor?: string;
  
  // Lifecycle
  onActivate?: (context: SpriteEditorContextType) => void;
  onDeactivate?: (context: SpriteEditorContextType) => void;
  
  // Mouse events
  onMouseDown?: (point: Point, context: SpriteEditorContextType) => void;
  onMouseMove?: (point: Point, context: SpriteEditorContextType) => void;
  onMouseUp?: (point: Point, context: SpriteEditorContextType) => void;
  
  // Keyboard events
  onKeyDown?: (event: KeyboardEvent, context: SpriteEditorContextType) => void;
  onKeyUp?: (event: KeyboardEvent, context: SpriteEditorContextType) => void;
  
  // Settings UI
  renderSettings?: (context: SpriteEditorContextType) => React.ReactNode;
}
```

### Context API

The `SpriteEditorContextType` provides access to:

- `state` - Current editor state
- `dispatch` - State reducer dispatch function
- `canvasRef` - Reference to the canvas element
- `screenToPixel` / `pixelToScreen` - Coordinate conversion
- `undo` / `redo` - History operations
- `setTool` / `setZoom` / `toggleGrid` - Tool operations

## Migration Guide

### From Old Architecture

**Before:**
```tsx
// Monolithic component with props drilling
<SpriteEditor
  sprite={sprite}
  onSpriteChange={onChange}
  tool={tool}
  onToolChange={setTool}
  zoom={zoom}
  onZoomChange={setZoom}
  // ... many more props
/>
```

**After:**
```tsx
// Context-based with automatic state management
<SpriteEditorProvider sprite={sprite} onSpriteChange={onChange}>
  <SpriteEditor />
</SpriteEditorProvider>
```

### Creating Custom Tools

**Before:**
```tsx
// Had to modify core components
// Tool logic mixed with UI components
```

**After:**
```tsx
// Clean plugin interface
const myTool: ToolPlugin = {
  name: 'myTool',
  onMouseDown: (point, context) => {
    // Tool logic here
  }
};

toolRegistry.register('myTool', myTool);
```

## Benefits

1. **Modularity** - Components are smaller and focused
2. **Extensibility** - Easy to add new tools via plugins
3. **Reusability** - Context can be used in custom layouts
4. **Type Safety** - Full TypeScript support
5. **Testability** - Tools can be tested independently
6. **Performance** - Better state management with reduced re-renders
