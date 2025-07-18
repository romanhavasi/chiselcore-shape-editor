# Chiselcore Voxel Editor

A 3D voxel shape editor designed for the Chiselcore game engine, featuring a clean Windows XP-style interface with essential controls in the top toolbar.

## Features

- **3D Voxel Editing**: Create and modify 3D voxel shapes in a 7x7x7 grid
- **Windows XP Interface**: Authentic retro styling using XP.css
- **Shape Validation**: Comprehensive connectivity checking with multiple connectivity types
- **File Operations**: Import/export shapes in JSON format with automatic grid size conversion
- **Camera Controls**: Full 3D camera orbiting and zoom
- **Dual Modes**: Add and remove voxels with visual feedback
- **Real-time Statistics**: Live voxel count, density, and shape validation

## Quick Start

1. **Install dependencies** (one-time setup):
   ```bash
   npm install
   ```

2. **Launch the application**:
   ```bash
   ./start.sh
   ```

3. **Open in browser**: Navigate to `http://localhost:3000`

The script automatically detects and uses the best available HTTP server on your system (Python, PHP, Ruby, or Node.js as fallback).

## Self-Hosting

After the initial build, you can serve the app without npm:

```bash
# Use custom port
./start.sh 8080

# Or serve manually with any static file server
cd dist && python3 -m http.server 3000
```

## Controls

### Mouse Controls
- **Left Click**: Add/remove voxels (depending on current mode)
- **Right Click + Drag**: Rotate camera
- **Mouse Wheel**: Zoom in/out

### Toolbar Functions
- **Fill Cube**: Fill the entire 7x7x7 grid
- **Clear**: Remove all voxels except center voxel
- **Load**: Import shape from JSON file
- **Save**: Export shape to JSON file
- **Mode Toggle**: Switch between Add/Remove modes

## Shape Validation

The editor validates shapes using face connectivity - voxels must be connected by shared faces (6-directional connectivity). This ensures shapes are solid and have no floating parts.

## File Format

Shapes are saved in Chiselcore JSON format:

```json
{
  "voxelDataString": "101010...",
  "difficulty": 5,
  "maxMoves": 50
}
```

The editor automatically converts between different grid sizes when importing shapes.

## Technical Details

### Technology Stack
- **Frontend**: React + Three.js for 3D rendering
- **Serving**: Static files with Python/PHP/Ruby HTTP servers
- **Styling**: XP.css for Windows XP appearance
- **Build**: Webpack for bundling

### Project Structure
```
src/
├── components/
│   ├── App.js                    # Main application component
│   ├── SimpleVoxelViewport.js    # 3D viewport with Three.js
│   ├── Toolbar.js                # Top toolbar with controls
│   ├── StatusBar.js              # Bottom status bar
│   ├── ShapeValidator.js         # Shape validation logic
│   └── ShapeSerializer.js        # JSON import/export
├── index.js                      # React entry point
└── index.html                    # HTML template
```

## Development

### Build for Development
```bash
npm run build-watch
```

### Development Server
```bash
npm run dev
```

This runs both the build watcher and development server with auto-restart.

## Requirements

### For Building (one-time setup):
- Node.js 16+ and npm 8+

### For Running:
- Python 3 (pre-installed on Mac/Linux) OR Python 2 OR PHP OR Ruby
- Modern web browser with WebGL support

No Node.js required after building!

## License

MIT License - See LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Troubleshooting

### Build Fails
- Ensure all dependencies are installed: `npm install`
- Check Node.js version: `node --version`

### 3D Viewport Not Working
- Verify WebGL is enabled in your browser
- Try a different browser (Chrome/Firefox recommended)
- Check browser console for errors

### File Upload/Download Issues
- Ensure the server is running on port 3000
- Check that the downloads directory exists
- Verify file permissions

For more help, please open an issue on the project repository. 