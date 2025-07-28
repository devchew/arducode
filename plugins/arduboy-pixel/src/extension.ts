import * as vscode from "vscode";
import { ArduboyPixelEditorProvider } from "./arduboyPixelEditor";

export function activate(context: vscode.ExtensionContext) {
  const openSpriteEditorCommand = vscode.commands.registerCommand(
    "arduboyPixel.openSpriteEditor",
    (uri?: vscode.Uri) => {
      const targetUri = uri || vscode.window.activeTextEditor?.document.uri;
      if (targetUri) {
        vscode.commands.executeCommand(
          "vscode.openWith",
          targetUri,
          "arduboyPixel.spriteEditor"
        );
      }
    }
  );

  context.subscriptions.push(openSpriteEditorCommand);

  context.subscriptions.push(ArduboyPixelEditorProvider.register(context));
}

export function deactivate() {}
