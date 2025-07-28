import * as vscode from "vscode";
import { CatScratchEditorProvider } from "./catScratchEditor";

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(CatScratchEditorProvider.register(context));
}

export function deactivate() {}
