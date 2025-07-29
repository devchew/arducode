// Demo app for the SpriteEditor component

import { useState } from "react";
import { SpriteEditor } from "../lib/main";
import type { SpriteData } from "../lib/main";
import "./Demo.css";

function createDefaultSprite(): SpriteData {
  return {
    id: "demo-sprite",
    name: "Demo Sprite",
    width: 32,
    height: 32,
    pixels: Array(32)
      .fill(null)
      .map(() => Array(32).fill(false)),
  };
}

function App() {
  const [sprite, setSprite] = useState<SpriteData>(createDefaultSprite());

  const handleSpriteChange = (newSprite: SpriteData) => {
    setSprite(newSprite);
  };

  const handleNewSprite = () => {
    setSprite(createDefaultSprite());
  };

  const handleResizeSprite = (width: number, height: number) => {
    setSprite((prev) => ({
      ...prev,
      width,
      height,
      pixels: Array(height)
        .fill(null)
        .map(() => Array(width).fill(false)),
    }));
  };

  return (
    <div className="demo-app">
      <header className="demo-header">
        <h1>Ardupixel Editor Demo</h1>
        <div className="demo-controls">
          <vscode-button onClick={handleNewSprite}>New Sprite</vscode-button>
          <vscode-single-select
            value={`${sprite.width}x${sprite.height}`}
            onChange={(e) => {
              const target = e.target as HTMLElement & { value: string };
              const [width, height] = target.value.split("x").map(Number);
              handleResizeSprite(width, height);
            }}
            title="Select sprite size"
          >
            <vscode-option value="8x8">8x8</vscode-option>
            <vscode-option value="16x16">16x16</vscode-option>
            <vscode-option value="32x32">32x32</vscode-option>
            <vscode-option value="64x64">64x64</vscode-option>
            <vscode-option value="128x64">
              128x64 (Arduboy Screen)
            </vscode-option>
          </vscode-single-select>
        </div>
      </header>

      <main className="demo-main">
        <SpriteEditor
          sprite={sprite}
          onSpriteChange={handleSpriteChange}
          className="demo-editor"
        />
      </main>
    </div>
  );
}

export default App;
