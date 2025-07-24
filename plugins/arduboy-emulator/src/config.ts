import * as vscode from "vscode";

// Function to detect the most likely hex path for the current project
export const detectHexPath = async (): Promise<string> => {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    return ".pio/build/arduboy/firmware.hex";
  }

  try {
    // Check if platformio.ini exists to suggest PlatformIO paths
    const platformioIniPath = vscode.Uri.joinPath(
      workspaceFolder.uri,
      "platformio.ini"
    );
    await vscode.workspace.fs.readFile(platformioIniPath);

    // If platformio.ini exists, use the default PlatformIO path
    return ".pio/build/arduboy/firmware.hex";
  } catch {
    // Check for Arduino IDE build structure
    try {
      const buildDir = vscode.Uri.joinPath(workspaceFolder.uri, "build");
      const buildDirStat = await vscode.workspace.fs.stat(buildDir);
      if (buildDirStat.type === vscode.FileType.Directory) {
        return "build/firmware.hex";
      }
    } catch {
      // Fallback to default
    }

    return ".pio/build/arduboy/firmware.hex";
  }
};

// Function to generate or update the arduboy.ini config file
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
      // Check if config file already exists
      const existingData = await vscode.workspace.fs.readFile(configPath);
      const existingText = new TextDecoder().decode(existingData);

      // Check if hex_path already exists in the file
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
        // Append hex_path to existing file
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

        // Open the updated file for editing
        const document = await vscode.workspace.openTextDocument(configPath);
        await vscode.window.showTextDocument(document);
      } else {
        vscode.window.showInformationMessage(
          "arduboy.ini already contains hex_path configuration"
        );

        // Still open the file for editing
        const document = await vscode.workspace.openTextDocument(configPath);
        await vscode.window.showTextDocument(document);
      }
    } catch (error) {
      // File doesn't exist, create new one
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

      // Open the created file for editing
      const document = await vscode.workspace.openTextDocument(configPath);
      await vscode.window.showTextDocument(document);
    }
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to generate config file: ${error}`);
  }
};

// Function to read and parse arduboy.ini config file
export const readArduboyConfig = async (): Promise<string | null> => {
  try {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return null;
    }

    const configPath = vscode.Uri.joinPath(workspaceFolder.uri, "arduboy.ini");
    const configData = await vscode.workspace.fs.readFile(configPath);
    const configText = new TextDecoder().decode(configData);

    // Parse the config file for hex_path
    const lines = configText.split(/\r?\n/); // Handle both Windows and Unix line endings
    for (const line of lines) {
      const trimmedLine = line.trim();
      // Skip comments and empty lines
      if (trimmedLine.startsWith("#") || trimmedLine === "") {
        continue;
      }
      if (trimmedLine.startsWith("hex_path=")) {
        const hexPath = trimmedLine.substring("hex_path=".length).trim();
        return hexPath || null; // Return null if empty after trimming
      }
    }

    return null;
  } catch (error) {
    // Config file doesn't exist or can't be read
    return null;
  }
};

// Function to get the firmware path from config or fallback to default
export const getFirmwarePath = async (): Promise<vscode.Uri | null> => {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    return null;
  }

  // Try to read config file
  const configHexPath = await readArduboyConfig();

  if (configHexPath) {
    // Use path from config (relative to workspace root)
    return vscode.Uri.joinPath(workspaceFolder.uri, configHexPath);
  } else {
    // Fallback to default path
    return vscode.Uri.joinPath(
      workspaceFolder.uri,
      ".pio",
      "build",
      "arduboy",
      "firmware.hex"
    );
  }
};
