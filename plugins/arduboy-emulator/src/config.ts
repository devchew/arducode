import * as vscode from "vscode";

export const detectHexPath = async (): Promise<string> => {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    return ".pio/build/arduboy/firmware.hex";
  }

  try {
    const platformioIniPath = vscode.Uri.joinPath(
      workspaceFolder.uri,
      "platformio.ini"
    );
    await vscode.workspace.fs.readFile(platformioIniPath);

    return ".pio/build/arduboy/firmware.hex";
  } catch {
    try {
      const buildDir = vscode.Uri.joinPath(workspaceFolder.uri, "build");
      const buildDirStat = await vscode.workspace.fs.stat(buildDir);
      if (buildDirStat.type === vscode.FileType.Directory) {
        return "build/firmware.hex";
      }
    } catch {}

    return ".pio/build/arduboy/firmware.hex";
  }
};

export const generateDefaultConfig = async (): Promise<void> => {
  try {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      vscode.window.showErrorMessage("No workspace folder found");
      return;
    }

    const configPath = vscode.Uri.joinPath(workspaceFolder.uri, "arduboy.ini");
    const defaultHexPath = await detectHexPath();

    try {
      const existingData = await vscode.workspace.fs.readFile(configPath);
      const existingText = new TextDecoder().decode(existingData);

      const lines = existingText.split(/\r?\n/);
      let hasHexPath = false;

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (
          trimmedLine.startsWith("hex_path=") &&
          !trimmedLine.startsWith("#")
        ) {
          hasHexPath = true;
          break;
        }
      }

      if (!hasHexPath) {
        const needsNewline =
          !existingText.endsWith("\n") && existingText.length > 0;
        const appendText = `${
          needsNewline ? "\n" : ""
        }\n# Default emulator hex path\nhex_path=${defaultHexPath}\n`;
        const updatedContent = existingText + appendText;
        await vscode.workspace.fs.writeFile(
          configPath,
          new TextEncoder().encode(updatedContent)
        );
        vscode.window.showInformationMessage(
          "Added hex_path to existing arduboy.ini"
        );

        const document = await vscode.workspace.openTextDocument(configPath);
        await vscode.window.showTextDocument(document);
      } else {
        vscode.window.showInformationMessage(
          "arduboy.ini already contains hex_path configuration"
        );

        const document = await vscode.workspace.openTextDocument(configPath);
        await vscode.window.showTextDocument(document);
      }
    } catch (error) {
      const defaultConfig = `# Arduboy Emulator Configuration
# 
# Path to the hex file (relative to workspace root)
# If this file is missing or hex_path is not specified, 
# the emulator will fallback to: .pio/build/arduboy/firmware.hex

hex_path=${defaultHexPath}

# Example configurations:
# 
# For custom build directory:
# hex_path=build/firmware.hex
#
# For different PlatformIO environment:
# hex_path=.pio/build/leonardo/firmware.hex
#
# For Arduino IDE builds:
# hex_path=build/arduino.avr.leonardo/firmware.hex
#
# For custom output location:
# hex_path=dist/my-game.hex
`;

      await vscode.workspace.fs.writeFile(
        configPath,
        new TextEncoder().encode(defaultConfig)
      );
      vscode.window.showInformationMessage(
        "Created default arduboy.ini configuration file"
      );

      const document = await vscode.workspace.openTextDocument(configPath);
      await vscode.window.showTextDocument(document);
    }
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to generate config file: ${error}`);
  }
};

export const readArduboyConfig = async (): Promise<string | null> => {
  try {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return null;
    }

    const configPath = vscode.Uri.joinPath(workspaceFolder.uri, "arduboy.ini");
    const configData = await vscode.workspace.fs.readFile(configPath);
    const configText = new TextDecoder().decode(configData);

    const lines = configText.split(/\r?\n/);
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith("#") || trimmedLine === "") {
        continue;
      }
      if (trimmedLine.startsWith("hex_path=")) {
        const hexPath = trimmedLine.substring("hex_path=".length).trim();
        return hexPath || null;
      }
    }

    return null;
  } catch (error) {
    return null;
  }
};

export const getFirmwarePath = async (): Promise<vscode.Uri | null> => {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    return null;
  }

  const configHexPath = await readArduboyConfig();

  if (configHexPath) {
    return vscode.Uri.joinPath(workspaceFolder.uri, configHexPath);
  } else {
    return vscode.Uri.joinPath(
      workspaceFolder.uri,
      ".pio",
      "build",
      "arduboy",
      "firmware.hex"
    );
  }
};
