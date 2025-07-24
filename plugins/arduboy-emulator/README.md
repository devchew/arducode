# arduboy-emulator README

## User Journey

- command palette
- "open arduboy emulator"
- open new tab with emulator - if posible on side by side with code editor
- load hex file from build folder
- run emulator

## Project Structure

- `src/extension.ts` - Main extension entry point and VS Code integration
- `src/config.ts` - Configuration file handling and path detection
- `src/playerWebView.ts` - Webview HTML generation
- `src/ardens/` - Emulator implementation files

on hex file change:

- show toast with "hex file changed, reload emulator [ok] [cancel]"
- if user clicks "ok", reload emulator
- if user clicks "cancel", do nothing

## Configuration

The emulator supports custom configuration through an `arduboy.ini` file in the workspace root.

### Quick Setup

Use the command palette to run **"Generate Arduboy Emulator Config"** to automatically create or update your configuration file.

### Setting up arduboy.ini

Create an `arduboy.ini` file in your project root with the following format:

```ini
# Arduboy Emulator Configuration
# Path to the hex file (relative to workspace root)
hex_path=.pio/build/arduboy/firmware.hex
```

### Configuration Options

- `hex_path` - Relative path from workspace root to your compiled hex file

### Example Configurations

```ini
# For PlatformIO with default Arduboy environment
hex_path=.pio/build/arduboy/firmware.hex

# For PlatformIO with Leonardo environment  
hex_path=.pio/build/leonardo/firmware.hex

# For Arduino IDE builds
hex_path=build/arduino.avr.leonardo/firmware.hex

# For custom build output
hex_path=dist/my-game.hex
```

### Automatic Configuration Generation

The extension provides a command to automatically generate or update your configuration:

1. Open the command palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Run **"Generate Arduboy Emulator Config"**
3. The command will:
   - Create a new `arduboy.ini` file if it doesn't exist
   - Add the `hex_path` setting to an existing file if it's missing
   - Open the file for editing so you can customize the path

### Fallback Behavior

If `arduboy.ini` is missing or doesn't contain a `hex_path` setting, the emulator will fallback to the default path: `.pio/build/arduboy/firmware.hex`

### Auto-reload

The emulator will automatically reload when:

- The configured hex file changes
- The `arduboy.ini` configuration file is modified

