# Ardupixel Editor

A standalone React component library for pixel art editing, specifically designed for integration with VS Code extensions and webviews.

## Features

- **Pixel Art Canvas**: High-performance canvas-based pixel editor with zoom and grid support
- **Drawing Tools**: Pencil, eraser, line, rectangle, circle, and flood fill tools
- **VS Code Integration**: Styled using VS Code CSS variables for seamless webview integration
- **Undo/Redo**: Full history management with keyboard shortcuts
- **Keyboard Shortcuts**: Complete set of hotkeys for efficient editing
- **Zoom Controls**: Smooth zooming with mouse wheel and controls
- **Brush System**: Variable brush sizes and styles

## Installation

```bash
npm install ardupixel-editor
# or
pnpm add ardupixel-editor
```

## Basic Usage

```tsx
import { SpriteEditor } from 'ardupixel-editor';
import type { SpriteData } from 'ardupixel-editor';

function MyApp() {
  const [sprite, setSprite] = useState<SpriteData>({
    id: 'my-sprite',
    name: 'My Sprite',
    width: 32,
    height: 32,
    pixels: Array(32).fill(null).map(() => Array(32).fill(false)),
  });

  return (
    <SpriteEditor
      sprite={sprite}
      onSpriteChange={setSprite}
      initialZoom={8}
    />
  );
}
```

## VS Code Extension Integration

This library is optimized for VS Code webviews and uses VS Code CSS variables for theming:

```css
/* Your VS Code extension webview will automatically inherit the correct theme */
--vscode-editor-background
--vscode-editor-foreground
--vscode-button-background
--vscode-input-background
/* ... and many more */
```

## Keyboard Shortcuts

- **P**: Pencil tool
- **E**: Eraser tool
- **L**: Line tool
- **R**: Rectangle tool
- **C**: Circle tool
- **I**: Invert tool
- **F**: Flood fill
- **X**: Toggle pencil color (black/white) or activate pencil
- **G**: Toggle grid
- **[/]**: Adjust brush size
- **Ctrl+Z**: Undo
- **Ctrl+Y**: Redo
- **Mouse Wheel**: Zoom in/out

## Components

### SpriteEditor (Main Component)
The primary component that combines all editing functionality.

### Canvas
The drawing canvas with pixel manipulation and tool support.

### Toolbar
Tool selection, brush controls, and action buttons.

### ZoomControls
Zoom level management and display.

## Hooks

### useCanvas
Core canvas state management hook with history and drawing operations.

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build library
pnpm build

# Run tests
pnpm test
```

## Migration from Tailwind

This package was migrated from Tailwind CSS to VS Code CSS variables for better integration with VS Code extensions. All styling now uses CSS modules with VS Code-compatible theming.

## License

MIT

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
