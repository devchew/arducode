// Context for sprite editor state management

import React, { createContext, useReducer, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { SpriteData, DrawingTool, BrushStyle, PencilColor, Point, HistoryState } from '../types';
import * as DrawingUtils from '../utils/drawing';

// State interface
export interface SpriteEditorState {
  sprite: SpriteData;
  canvasSettings: {
    zoom: number;
    showGrid: boolean;
    tool: DrawingTool;
    eraserSize: number;
    brushSize: number;
    brushStyle: BrushStyle;
    pencilColor: PencilColor;
  };
  history: HistoryState[];
  historyIndex: number;
  isDrawing: boolean;
  startPoint: Point | null;
  previewPixels: boolean[][] | null;
}

// Action types
type SpriteEditorAction =
  | { type: 'SET_SPRITE'; payload: SpriteData }
  | { type: 'UPDATE_PIXELS'; payload: boolean[][] }
  | { type: 'SET_CANVAS_SETTING'; key: keyof SpriteEditorState['canvasSettings']; value: unknown }
  | { type: 'SET_TOOL'; tool: DrawingTool }
  | { type: 'SET_ZOOM'; zoom: number }
  | { type: 'TOGGLE_GRID' }
  | { type: 'SET_DRAWING_STATE'; isDrawing: boolean; startPoint?: Point | null }
  | { type: 'SET_PREVIEW_PIXELS'; pixels: boolean[][] | null }
  | { type: 'ADD_TO_HISTORY'; pixels: boolean[][] }
  | { type: 'UNDO' }
  | { type: 'REDO' };

// Context interface
export interface SpriteEditorContextType {
  state: SpriteEditorState;
  dispatch: React.Dispatch<SpriteEditorAction>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onSpriteChange?: (sprite: SpriteData) => void;
  
  // Canvas operations
  screenToPixel: (screenX: number, screenY: number) => Point;
  pixelToScreen: (pixelX: number, pixelY: number) => Point;
  
  // History operations
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  
  // Tool operations
  setTool: (tool: DrawingTool) => void;
  setZoom: (zoom: number) => void;
  toggleGrid: () => void;
  
  // Drawing operations
  startDrawing: (point: Point) => void;
  continueDrawing: (point: Point) => void;
  endDrawing: (point: Point) => void;
}

// Initial state
const createInitialState = (sprite: SpriteData, initialZoom: number = 8): SpriteEditorState => ({
  sprite,
  canvasSettings: {
    zoom: initialZoom,
    showGrid: true,
    tool: 'pencil' as DrawingTool,
    eraserSize: 1,
    brushSize: 1,
    brushStyle: 'square' as BrushStyle,
    pencilColor: 'black' as PencilColor,
  },
  history: [{
    pixels: DrawingUtils.clonePixelGrid(sprite.pixels),
    timestamp: Date.now(),
  }],
  historyIndex: 0,
  isDrawing: false,
  startPoint: null,
  previewPixels: null,
});

// Reducer
function spriteEditorReducer(state: SpriteEditorState, action: SpriteEditorAction): SpriteEditorState {
  switch (action.type) {
    case 'SET_SPRITE':
      return {
        ...state,
        sprite: action.payload,
        history: [{
          pixels: DrawingUtils.clonePixelGrid(action.payload.pixels),
          timestamp: Date.now(),
        }],
        historyIndex: 0,
      };

    case 'UPDATE_PIXELS':
      return {
        ...state,
        sprite: {
          ...state.sprite,
          pixels: action.payload,
        },
      };

    case 'SET_CANVAS_SETTING':
      return {
        ...state,
        canvasSettings: {
          ...state.canvasSettings,
          [action.key]: action.value,
        },
      };

    case 'SET_TOOL':
      return {
        ...state,
        canvasSettings: {
          ...state.canvasSettings,
          tool: action.tool,
        },
      };

    case 'SET_ZOOM':
      return {
        ...state,
        canvasSettings: {
          ...state.canvasSettings,
          zoom: action.zoom,
        },
      };

    case 'TOGGLE_GRID':
      return {
        ...state,
        canvasSettings: {
          ...state.canvasSettings,
          showGrid: !state.canvasSettings.showGrid,
        },
      };

    case 'SET_DRAWING_STATE':
      return {
        ...state,
        isDrawing: action.isDrawing,
        startPoint: action.startPoint ?? state.startPoint,
      };

    case 'SET_PREVIEW_PIXELS':
      return {
        ...state,
        previewPixels: action.pixels,
      };

    case 'ADD_TO_HISTORY': {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push({
        pixels: DrawingUtils.clonePixelGrid(action.pixels),
        timestamp: Date.now(),
      });

      // Limit history to 50 items
      if (newHistory.length > 50) {
        newHistory.shift();
        return {
          ...state,
          history: newHistory,
          historyIndex: 49,
        };
      }

      return {
        ...state,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case 'UNDO': {
      if (state.historyIndex > 0) {
        const newIndex = state.historyIndex - 1;
        const previousState = state.history[newIndex];
        return {
          ...state,
          historyIndex: newIndex,
          sprite: {
            ...state.sprite,
            pixels: DrawingUtils.clonePixelGrid(previousState.pixels),
          },
        };
      }
      return state;
    }

    case 'REDO': {
      if (state.historyIndex < state.history.length - 1) {
        const newIndex = state.historyIndex + 1;
        const nextState = state.history[newIndex];
        return {
          ...state,
          historyIndex: newIndex,
          sprite: {
            ...state.sprite,
            pixels: DrawingUtils.clonePixelGrid(nextState.pixels),
          },
        };
      }
      return state;
    }

    default:
      return state;
  }
}

// Create context
export const SpriteEditorContext = createContext<SpriteEditorContextType | null>(null);

// Provider component
interface SpriteEditorProviderProps {
  children: ReactNode;
  sprite: SpriteData;
  onSpriteChange?: (sprite: SpriteData) => void;
  initialZoom?: number;
}

export function SpriteEditorProvider({
  children,
  sprite,
  onSpriteChange,
  initialZoom = 8,
}: SpriteEditorProviderProps) {
  const [state, dispatch] = useReducer(
    spriteEditorReducer,
    createInitialState(sprite, initialZoom)
  );
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Canvas coordinate conversion
  const screenToPixel = useCallback(
    (screenX: number, screenY: number): Point => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((screenX - rect.left) / state.canvasSettings.zoom);
      const y = Math.floor((screenY - rect.top) / state.canvasSettings.zoom);

      return { x, y };
    },
    [state.canvasSettings.zoom]
  );

  const pixelToScreen = useCallback(
    (pixelX: number, pixelY: number): Point => {
      return {
        x: pixelX * state.canvasSettings.zoom,
        y: pixelY * state.canvasSettings.zoom,
      };
    },
    [state.canvasSettings.zoom]
  );

  // History operations
  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  // Tool operations
  const setTool = useCallback((tool: DrawingTool) => {
    dispatch({ type: 'SET_TOOL', tool });
  }, []);

  const setZoom = useCallback((zoom: number) => {
    dispatch({ type: 'SET_ZOOM', zoom });
  }, []);

  const toggleGrid = useCallback(() => {
    dispatch({ type: 'TOGGLE_GRID' });
  }, []);

  // Drawing operations (to be implemented by tool plugins)
  const startDrawing = useCallback((point: Point) => {
    dispatch({ type: 'SET_DRAWING_STATE', isDrawing: true, startPoint: point });
  }, []);

  const continueDrawing = useCallback((_point: Point) => {
    // This will be handled by tool plugins
  }, []);

  const endDrawing = useCallback((_point: Point) => {
    dispatch({ type: 'SET_DRAWING_STATE', isDrawing: false, startPoint: null });
    dispatch({ type: 'SET_PREVIEW_PIXELS', pixels: null });
  }, []);

  // Notify parent component of sprite changes
  React.useEffect(() => {
    if (onSpriteChange) {
      onSpriteChange(state.sprite);
    }
  }, [state.sprite, onSpriteChange]);

  const contextValue: SpriteEditorContextType = {
    state,
    dispatch,
    canvasRef,
    onSpriteChange,
    screenToPixel,
    pixelToScreen,
    canUndo,
    canRedo,
    undo,
    redo,
    setTool,
    setZoom,
    toggleGrid,
    startDrawing,
    continueDrawing,
    endDrawing,
  };

  return (
    <SpriteEditorContext.Provider value={contextValue}>
      {children}
    </SpriteEditorContext.Provider>
  );
}
