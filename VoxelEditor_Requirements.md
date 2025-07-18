# 3D Voxel Shape Editor for Chiselcore

## Project Overview
Create a standalone 3D voxel editor application using Electron, Three.js, and web technologies that can create, edit, and manage voxel shapes compatible with the Chiselcore game engine. The tool should provide an intuitive interface for 3D shape creation and seamlessly integrate with the existing JSON serialization format.

## Core Requirements

### 1. 3D Voxel Editor Interface
- **3D Viewport**: Create a Three.js scene with orbital camera controls for 360° rotation, zoom, and pan
- **Grid System**: Display a visible 3D grid (default 8x8x8, configurable up to 16x16x16)
- **Voxel Rendering**: Render individual cubes with distinct faces, wireframe outlines, and hover effects
- **Interactive Controls**: 
  - Left-click to add voxels
  - Right-click (or Ctrl+click) to remove voxels
  - Hover highlighting for the target voxel position
  - Keyboard shortcuts for common actions

### 2. Shape Management
- **New Shape**: Create empty grid with configurable dimensions
- **Load Shape**: Drag & drop JSON files OR file browser to load existing Chiselcore shapes
- **Save Shape**: Download JSON files in Chiselcore-compatible format
- **Shape Properties**: Editable metadata (difficulty, maxMoves)
- **Shape Validation**: Ensure shapes have at least one voxel and valid metadata

### 3. JSON Format Compatibility
Implement the updated Chiselcore `ShapeData` format:
```json
{
    "difficulty": 1,
    "maxMoves": 50,
    "voxelDataString": "001100110011..." // Binary string representation
}
```

**Notes:**
- Grid size is auto-detected from the cube root of `voxelDataString.length`
- Shape name is handled by the filename itself
- Binary string uses '1' for active voxels, '0' for empty space
- String length must be a perfect cube (8³=512, 10³=1000, 16³=4096, etc.)

### 4. User Interface
- **Top Toolbar**: New, Load, Save, Grid Size selector, Shape properties
- **Side Panel**: Shape metadata editor, statistics (voxel count, dimensions)
- **Bottom Status**: Current tool, mouse coordinates, help text
- **Context Menu**: Right-click options for copy/paste operations
- **Responsive Design**: Adaptable to different window sizes

### 5. Technical Implementation

#### Frontend Stack
- **Electron** for desktop app packaging
- **Three.js** for 3D rendering and scene management
- **HTML5/CSS3/JavaScript** for UI components
- **File API** for drag & drop functionality

#### Core Classes/Modules
```javascript
// VoxelGrid.js - Core voxel data management
class VoxelGrid {
    constructor(size = 8)
    getVoxel(x, y, z)
    setVoxel(x, y, z, active)
    toShapeData()
    fromShapeData(jsonData)
    getVoxelCount()
    getGridSize() // Auto-calculated from data
    clear()
    resize(newSize) // Resize grid, center existing data
}

// ShapeSerializer.js - JSON import/export
class ShapeSerializer {
    static exportToJSON(voxelGrid, metadata)
    static importFromJSON(jsonString)
    static validateShapeData(data)
    static detectGridSize(voxelDataString) // Calculate cube root
}

// VoxelRenderer.js - Three.js visualization
class VoxelRenderer {
    constructor(scene, gridSize)
    updateMesh()
    highlightVoxel(x, y, z)
    handleMouseEvents()
    setGridSize(size) // Update visualization grid
}

// EditorController.js - Main application logic
class EditorController {
    constructor()
    newShape(size)
    loadShape(file)
    saveShape(filename)
    addVoxel(x, y, z)
    removeVoxel(x, y, z)
    resizeGrid(newSize)
}
```

### 6. Advanced Features
- **Undo/Redo System**: Command pattern for action history
- **Copy/Paste**: Select and duplicate voxel regions
- **Shape Preview**: Multiple viewing angles like the blueprint system
- **Import Validation**: Check JSON format and provide helpful error messages
- **Auto-save**: Temporary storage in localStorage
- **Export Options**: Different grid sizes, optimization for empty space
- **Grid Resizing**: Convert between different grid sizes with smart centering

### 7. File Operations
- **Drag & Drop Zone**: Visual indicator for file drop areas
- **File Browser**: Native OS file picker integration via Electron
- **Download Manager**: Save files to user-specified locations with .json extension
- **Recent Files**: Quick access to recently edited shapes
- **Batch Export**: Convert multiple shapes at once
- **Auto-naming**: Suggest filenames based on shape characteristics

### 8. Grid Size Management
Since grid size is no longer stored in JSON:
- **Auto-detection**: Calculate grid size as cube root of voxelDataString length
- **Validation**: Ensure string length is a perfect cube
- **Supported Sizes**: 4³(64), 5³(125), 6³(216), 8³(512), 10³(1000), 12³(1728), 16³(4096)
- **Resize Operations**: 
  - Expand: Center existing shape in larger grid
  - Shrink: Crop or warn about data loss
  - Convert: Between different standard sizes

### 9. UI/UX Guidelines
- **Intuitive Controls**: Similar to Blender/3D modeling software
- **Visual Feedback**: Clear indication of current tool and actions
- **Error Handling**: User-friendly messages for invalid operations
- **Performance**: Smooth 60fps rendering even with complex shapes
- **Accessibility**: Keyboard shortcuts and screen reader support
- **Grid Size Indicator**: Always show current detected/working grid size

### 10. Development Structure
```
voxel-editor/
├── main.js                 # Electron main process
├── renderer/
│   ├── index.html         # Main UI
│   ├── css/
│   │   └── styles.css     # Application styling
│   ├── js/
│   │   ├── app.js         # Main application entry
│   │   ├── VoxelGrid.js   # Core grid logic
│   │   ├── VoxelRenderer.js # Three.js rendering
│   │   ├── ShapeSerializer.js # JSON handling
│   │   ├── EditorController.js # Main controller
│   │   ├── GridUtils.js   # Grid size detection/conversion
│   │   └── UI.js          # Interface management
│   └── assets/
│       └── icons/         # UI icons and images
├── package.json
└── README.md
```

### 11. JSON Format Validation
```javascript
// Example validation logic
function validateShapeData(data) {
    if (!data.voxelDataString || typeof data.voxelDataString !== 'string') {
        throw new Error('Missing or invalid voxelDataString');
    }
    
    const length = data.voxelDataString.length;
    const cubeRoot = Math.round(Math.cbrt(length));
    
    if (cubeRoot ** 3 !== length) {
        throw new Error(`Invalid voxel data length: ${length} is not a perfect cube`);
    }
    
    if (!/^[01]+$/.test(data.voxelDataString)) {
        throw new Error('voxelDataString must contain only 0s and 1s');
    }
    
    // Validate metadata
    if (typeof data.difficulty !== 'number' || data.difficulty < 1) {
        throw new Error('Invalid difficulty value');
    }
    
    if (typeof data.maxMoves !== 'number' || data.maxMoves < 1) {
        throw new Error('Invalid maxMoves value');
    }
    
    return true;
}
```

### 12. Testing & Quality
- **Unit Tests**: Core logic validation (VoxelGrid, ShapeSerializer, GridUtils)
- **Integration Tests**: File import/export workflows
- **Performance Tests**: Large grid handling (16³ = 4096 voxels)
- **Compatibility Tests**: Verify exported shapes work in Chiselcore
- **Error Recovery**: Graceful handling of corrupted files
- **Grid Size Tests**: Validate auto-detection and conversion between sizes

## Success Criteria
1. **Functional**: Can create, edit, and save shapes compatible with Chiselcore
2. **Intuitive**: Non-technical users can create simple shapes within 5 minutes
3. **Performant**: Handles 16x16x16 grids smoothly on average hardware
4. **Reliable**: No data loss during normal operation
5. **Extensible**: Code structure allows easy addition of new features
6. **Smart**: Automatically detects grid sizes and handles conversions seamlessly

## Optional Enhancements
- **Shape Library**: Built-in collection of common shapes
- **Animation Preview**: Rotate shapes like the blueprint viewer
- **Shape Optimization**: Remove unnecessary empty space and suggest optimal grid size
- **Multi-format Export**: Support other voxel formats
- **Collaborative Editing**: Share shapes via cloud storage
- **Plugin System**: Extensible architecture for custom tools
- **Shape Analysis**: Statistics like surface area, volume, complexity
- **Grid Templates**: Quick-start templates for common sizes
- **Batch Processing**: Convert legacy shapes with stored grid sizes

## Migration Notes
For existing Chiselcore shapes that still contain `shapeName` and `gridSize`:
- **Backward Compatibility**: Support loading old format
- **Auto-migration**: Strip unnecessary fields on save
- **Validation**: Verify gridSize matches detected size from voxelDataString
- **Warning System**: Alert users about format differences

Focus on creating a polished, professional tool that enhances the Chiselcore development workflow while being accessible to content creators and game designers. The simplified JSON format reduces redundancy and makes the system more maintainable. 