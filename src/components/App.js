import React, { useState, useCallback } from 'react';
import SimpleVoxelViewport from './SimpleVoxelViewport';
import Toolbar from './Toolbar';
import { validateShape } from './ShapeValidator';
import { exportToJSON, importFromJSON, importFromJSONWithGridConversion, validateJSONFormat } from './ShapeSerializer';

function App() {
  const gridSize = 7;
  
  const initializeFilledCube = () => {
    const size = gridSize * gridSize * gridSize;
    return new Array(size).fill(true);
  };

  const [voxelData, setVoxelData] = useState(initializeFilledCube);
  const [voxelMode, setVoxelMode] = useState('add');
  const [statusMessage, setStatusMessage] = useState('Ready - Left click to add voxels, right click to rotate camera');
  const [shapeMetadata, setShapeMetadata] = useState({
    difficulty: 5,
    maxMoves: 50
  });

  const voxelCount = voxelData.filter(voxel => voxel).length;

  const getVoxelIndex = useCallback((x, y, z) => {
    return x + y * gridSize + z * gridSize * gridSize;
  }, [gridSize]);

  const handleVoxelAction = useCallback((x, y, z) => {
    const index = getVoxelIndex(x, y, z);
    
    setVoxelData(prevData => {
      const newData = [...prevData];
      if (voxelMode === 'add') {
        newData[index] = true;
        setStatusMessage(`Added voxel at (${x}, ${y}, ${z})`);
      } else if (voxelMode === 'remove') {
        const currentVoxelCount = prevData.filter(voxel => voxel).length;
        if (currentVoxelCount <= 1) {
          setStatusMessage('Cannot remove last voxel - shape must have at least one voxel');
          return prevData;
        }
        newData[index] = false;
        setStatusMessage(`Removed voxel at (${x}, ${y}, ${z})`);
      }
      return newData;
    });
  }, [getVoxelIndex, voxelMode]);

  const handleFillCube = useCallback(() => {
    setVoxelData(initializeFilledCube());
    setStatusMessage('Filled entire cube');
  }, []);

  const handleClearGrid = useCallback(() => {
    const size = gridSize * gridSize * gridSize;
    const newData = new Array(size).fill(false);
    
    const centerX = Math.floor(gridSize / 2);
    const centerY = Math.floor(gridSize / 2);
    const centerZ = Math.floor(gridSize / 2);
    const centerIndex = centerX + centerY * gridSize + centerZ * gridSize * gridSize;
    newData[centerIndex] = true;
    
    setVoxelData(newData);
    setStatusMessage(`Cleared shape - center voxel remains at (${centerX}, ${centerY}, ${centerZ})`);
  }, [gridSize]);

  const handleMetadataChange = useCallback((newMetadata) => {
    setShapeMetadata(newMetadata);
  }, []);

  const handleModeToggle = useCallback(() => {
    setVoxelMode(prevMode => {
      const newMode = prevMode === 'add' ? 'remove' : 'add';
      const modeText = newMode === 'add' ? 'add' : 'remove';
      const actionText = newMode === 'add' ? 'add' : 'remove';
      setStatusMessage(`Switched to ${modeText} mode - Left click to ${actionText} voxels, right click to rotate camera`);
      return newMode;
    });
  }, []);

  const handleSaveShape = useCallback(async () => {
    try {
      const validation = validateShape(voxelData, gridSize, 'face');
      
      console.log('Shape validation result:', validation);
      if (validation.debugInfo && validation.debugInfo.componentCount > 1) {
        console.log('Found multiple components:');
        validation.debugInfo.components.forEach((component, index) => {
          console.log(`Component ${index}:`, component.positions);
        });
        console.log('Floating voxels:', validation.debugInfo.floatingVoxels);
      }
      
      if (!validation.isValid) {
        const errorMessage = `Cannot save shape:\n${validation.errors.join('\n')}`;
        alert(errorMessage);
        setStatusMessage('Save failed - shape is invalid');
        return;
      }
      
      const jsonData = exportToJSON(voxelData, shapeMetadata);
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'shape.json';
      a.click();
      URL.revokeObjectURL(url);
      setStatusMessage('Shape downloaded successfully');
    } catch (error) {
      const errorMessage = `Save error: ${error.message}`;
      setStatusMessage(errorMessage);
      console.error('Save error:', error);
    }
  }, [voxelData, gridSize, shapeMetadata]);

  const handleLoadShape = useCallback(async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const jsonData = JSON.parse(event.target.result);
              
              const formatValidation = validateJSONFormat(jsonData);
              if (!formatValidation.isValid) {
                const errorMessage = `Invalid file format:\n${formatValidation.errors.join('\n')}`;
                alert(errorMessage);
                setStatusMessage('Load failed - invalid format');
                return;
              }
              
              const importedData = importFromJSONWithGridConversion(jsonData, gridSize);
              
              setVoxelData(importedData.voxelData);
              setShapeMetadata(importedData.metadata);
              
              let statusMessage = `Shape loaded from ${file.name}`;
              if (importedData.wasConverted) {
                statusMessage += ` (converted from ${importedData.originalGridSize}³ to ${gridSize}³)`;
              }
              setStatusMessage(statusMessage);
              
            } catch (error) {
              setStatusMessage(`Load error: ${error.message}`);
            }
          };
          reader.readAsText(file);
        }
      };
      input.click();
    } catch (error) {
      setStatusMessage(`Load error: ${error.message}`);
      console.error('Load error:', error);
    }
  }, [gridSize]);

  return (
    <div style={{ 
      height: '100vh', 
      margin: 0,
      padding: 0,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Toolbar 
        onFillCube={handleFillCube}
        onClearGrid={handleClearGrid}
        voxelCount={voxelCount}
        gridSize={gridSize}
        shapeMetadata={shapeMetadata}
        onMetadataChange={handleMetadataChange}
        voxelMode={voxelMode}
        onModeToggle={handleModeToggle}
        onSaveShape={handleSaveShape}
        onLoadShape={handleLoadShape}
      />

      <div style={{ 
        flex: 1,
        background: '#008080'
      }}>
        <SimpleVoxelViewport
          gridSize={gridSize}
          voxelData={voxelData}
          onVoxelAction={handleVoxelAction}
          voxelMode={voxelMode}
        />
      </div>
    </div>
  );
}

export default App; 