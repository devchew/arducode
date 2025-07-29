// Reusable zoom controls component with keyboard shortcuts

import { useEffect, useCallback } from "react";
import styles from "./ZoomControls.module.css";

interface ZoomControlsProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onZoomFit?: () => void;
  showFitButton?: boolean;
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
  presets?: number[];
  variant?: "composition" | "toolbar";
  enableScrollZoom?: boolean;
  scrollZoomTarget?: React.RefObject<HTMLElement | null>;
}

export function ZoomControls({
  zoom,
  onZoomChange,
  onZoomFit,
  showFitButton = false,
  minZoom = 0.25,
  maxZoom = 8,
  zoomStep = 0.25,
  presets = [0.25, 0.5, 2, 4],
  variant = "composition",
  enableScrollZoom = false,
  scrollZoomTarget,
}: ZoomControlsProps) {
  // Helper function to round zoom to prevent UI breaking
  const roundZoom = useCallback((value: number): number => {
    return Math.round(value * 100) / 100; // Round to 2 decimal places
  }, []);

  // Keyboard shortcuts for zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "=" || e.key === "+") {
          e.preventDefault();
          onZoomChange(roundZoom(Math.min(maxZoom, zoom + zoomStep)));
        } else if (e.key === "-") {
          e.preventDefault();
          onZoomChange(roundZoom(Math.max(minZoom, zoom - zoomStep)));
        } else if (e.key === "0") {
          e.preventDefault();
          onZoomChange(1); // Reset to 100%
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [zoom, onZoomChange, minZoom, maxZoom, zoomStep, roundZoom]);

  // Scroll zoom functionality
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (!enableScrollZoom) return;

      e.preventDefault();
      const delta = e.deltaY > 0 ? -zoomStep : zoomStep;
      const newZoom = Math.min(maxZoom, Math.max(minZoom, zoom + delta));
      onZoomChange(roundZoom(newZoom));
    },
    [
      enableScrollZoom,
      zoomStep,
      zoom,
      minZoom,
      maxZoom,
      onZoomChange,
      roundZoom,
    ]
  );

  useEffect(() => {
    if (!enableScrollZoom || !scrollZoomTarget?.current) return;

    const element = scrollZoomTarget.current;
    element.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      element.removeEventListener("wheel", handleWheel);
    };
  }, [enableScrollZoom, scrollZoomTarget, handleWheel]);

  if (variant === "toolbar") {
    return (
      <div className={styles.zoomControlsToolbar}>
        <vscode-toolbar-button
          onClick={() =>
            onZoomChange(roundZoom(Math.max(minZoom, zoom - zoomStep)))
          }
          disabled={zoom <= minZoom}
          label="Zoom Out (Ctrl + -)"
        >
          -
        </vscode-toolbar-button>

        <vscode-label className={styles.zoomDisplay}>
          {roundZoom(zoom)}x
        </vscode-label>

        <vscode-toolbar-button
          onClick={() =>
            onZoomChange(roundZoom(Math.min(maxZoom, zoom + zoomStep)))
          }
          disabled={zoom >= maxZoom}
          label="Zoom In (Ctrl + +)"
        >
          +
        </vscode-toolbar-button>

        {/* Toolbar-style presets */}
        <div className={styles.zoomPresets}>
          {presets.slice(0, 4).map((preset) => (
            <vscode-button
              key={preset}
              secondary
              onClick={() => onZoomChange(preset)}
              className={zoom === preset ? styles.active : ""}
              title={`Zoom to ${preset}x`}
            >
              {preset}x
            </vscode-button>
          ))}
        </div>
      </div>
    );
  }

  // Default composition variant
  return (
    <div className={styles.zoomControlsComposition}>
      <vscode-label className={styles.zoomLabel}>Zoom:</vscode-label>
      <vscode-toolbar-button
        onClick={() =>
          onZoomChange(roundZoom(Math.max(minZoom, zoom - zoomStep)))
        }
        disabled={zoom <= minZoom}
        label="Zoom Out (Ctrl + -)"
      >
        -
      </vscode-toolbar-button>
      <span className={styles.zoomDisplay}>{roundZoom(zoom)}x</span>
      <vscode-toolbar-button
        onClick={() =>
          onZoomChange(roundZoom(Math.min(maxZoom, zoom + zoomStep)))
        }
        disabled={zoom >= maxZoom}
        label="Zoom In (Ctrl + +)"
      >
        +
      </vscode-toolbar-button>
      <vscode-button
        onClick={() => onZoomChange(1)}
        title="Reset Zoom (Ctrl + 0)"
      >
        100%
      </vscode-button>
      {showFitButton && onZoomFit && (
        <vscode-button onClick={onZoomFit} title="Fit to Screen">
          Fit
        </vscode-button>
      )}
      {/* Zoom presets */}
      <div className={styles.zoomPresets}>
        {presets.map((preset) => (
          <vscode-button
            key={preset}
            secondary
            onClick={() => onZoomChange(preset)}
            className={zoom === preset ? styles.active : ""}
            title={`Zoom to ${preset * 100}%`}
          >
            {preset * 100}%
          </vscode-button>
        ))}
      </div>
    </div>
  );
}
