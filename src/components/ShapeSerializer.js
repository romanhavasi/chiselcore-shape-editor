export function voxelDataToBinaryString(voxelData) {
  return voxelData.map(voxel => voxel ? '1' : '0').join('');
}

export function binaryStringToVoxelData(binaryString) {
  return binaryString.split('').map(bit => bit === '1');
}

export function detectGridSize(binaryString) {
  const length = binaryString.length;
  const cubeRoot = Math.round(Math.cbrt(length));
  
  if (cubeRoot * cubeRoot * cubeRoot === length) {
    return cubeRoot;
  }
  
  throw new Error(`Binary string length (${length}) is not a perfect cube`);
}

export function exportToJSON(voxelData, metadata) {
  const binaryString = voxelDataToBinaryString(voxelData);
  
  return {
    voxelDataString: binaryString,
    difficulty: metadata.difficulty || 5,
    maxMoves: metadata.maxMoves || 50
  };
}

export function importFromJSON(jsonData) {
  console.log('Importing JSON data:', jsonData);
  
  const voxelData = binaryStringToVoxelData(jsonData.voxelDataString);
  const gridSize = detectGridSize(jsonData.voxelDataString);
  
  console.log('Imported voxel data length:', voxelData.length);
  console.log('Detected grid size:', gridSize);
  console.log('Expected length for grid:', gridSize * gridSize * gridSize);
  
  return {
    voxelData,
    gridSize,
    metadata: {
      difficulty: jsonData.difficulty || 5,
      maxMoves: jsonData.maxMoves || 50
    }
  };
}

export function convertGridSize(voxelData, fromGridSize, toGridSize) {
  console.log(`Converting grid from ${fromGridSize}³ to ${toGridSize}³`);
  
  const newVoxelData = new Array(toGridSize * toGridSize * toGridSize).fill(false);
  
  if (fromGridSize <= toGridSize) {
    const offset = Math.floor((toGridSize - fromGridSize) / 2);
    console.log('Centering with offset:', offset);
    
    for (let x = 0; x < fromGridSize; x++) {
      for (let y = 0; y < fromGridSize; y++) {
        for (let z = 0; z < fromGridSize; z++) {
          const oldIndex = x + y * fromGridSize + z * fromGridSize * fromGridSize;
          const newX = x + offset;
          const newY = y + offset;
          const newZ = z + offset;
          const newIndex = newX + newY * toGridSize + newZ * toGridSize * toGridSize;
          
          newVoxelData[newIndex] = voxelData[oldIndex];
        }
      }
    }
  } else {
    const offset = Math.floor((fromGridSize - toGridSize) / 2);
    console.log('Cropping with offset:', offset);
    
    for (let x = 0; x < toGridSize; x++) {
      for (let y = 0; y < toGridSize; y++) {
        for (let z = 0; z < toGridSize; z++) {
          const oldX = x + offset;
          const oldY = y + offset;
          const oldZ = z + offset;
          
          if (oldX < fromGridSize && oldY < fromGridSize && oldZ < fromGridSize) {
            const oldIndex = oldX + oldY * fromGridSize + oldZ * fromGridSize * fromGridSize;
            const newIndex = x + y * toGridSize + z * toGridSize * toGridSize;
            
            newVoxelData[newIndex] = voxelData[oldIndex];
          }
        }
      }
    }
  }
  
  return newVoxelData;
}

export function importFromJSONWithGridConversion(jsonData, targetGridSize) {
  const importedData = importFromJSON(jsonData);
  
  if (importedData.gridSize === targetGridSize) {
    console.log('Grid sizes match, no conversion needed');
    return {
      ...importedData,
      wasConverted: false
    };
  }
  
  console.log(`Converting from ${importedData.gridSize}³ to ${targetGridSize}³`);
  
  const convertedVoxelData = convertGridSize(
    importedData.voxelData,
    importedData.gridSize,
    targetGridSize
  );
  
  console.log('Conversion completed. Voxel count:', convertedVoxelData.filter(v => v).length);
  
  return {
    voxelData: convertedVoxelData,
    gridSize: targetGridSize,
    metadata: importedData.metadata,
    originalGridSize: importedData.gridSize,
    wasConverted: true
  };
}

export function validateJSONFormat(jsonData) {
  const errors = [];
  
  console.log('Validating JSON data:', jsonData);
  
  if (typeof jsonData !== 'object' || jsonData === null) {
    errors.push('JSON must be an object');
    return { isValid: false, errors };
  }
  
  if (!jsonData.voxelDataString || typeof jsonData.voxelDataString !== 'string') {
    errors.push('Missing or invalid voxelDataString field');
  } else {
    console.log('voxelDataString length:', jsonData.voxelDataString.length);
    
    if (!/^[01]+$/.test(jsonData.voxelDataString)) {
      errors.push('voxelDataString must contain only 0 and 1');
    } else {
      const length = jsonData.voxelDataString.length;
      const cubeRoot = Math.round(Math.cbrt(length));
      console.log('Length:', length, 'Cube root:', cubeRoot, 'Perfect cube check:', cubeRoot * cubeRoot * cubeRoot === length);
      
      if (cubeRoot * cubeRoot * cubeRoot !== length) {
        errors.push(`voxelDataString length (${length}) is not a perfect cube`);
      }
    }
  }
  
  if (!Number.isInteger(jsonData.difficulty) || jsonData.difficulty < 1 || jsonData.difficulty > 10) {
    errors.push('difficulty must be an integer from 1 to 10');
  }
  
  if (!Number.isInteger(jsonData.maxMoves) || jsonData.maxMoves < 1 || jsonData.maxMoves > 999) {
    errors.push('maxMoves must be an integer from 1 to 999');
  }
  
  console.log('Validation errors:', errors);
  
  return {
    isValid: errors.length === 0,
    errors
  };
} 