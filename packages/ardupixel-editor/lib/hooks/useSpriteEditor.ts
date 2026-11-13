// Hook for using the SpriteEditor context

import { useContext } from 'react';
import { SpriteEditorContext } from '../contexts/SpriteEditorContext';
import type { SpriteEditorContextType } from '../contexts/SpriteEditorContext';

export function useSpriteEditor(): SpriteEditorContextType {
  const context = useContext(SpriteEditorContext);
  if (!context) {
    throw new Error('useSpriteEditor must be used within a SpriteEditorProvider');
  }
  return context;
}
