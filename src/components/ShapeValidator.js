export function findConnectedComponents(voxelData, gridSize) {
  if (!voxelData || gridSize <= 0) return [];
  
  const voxelPositions = [];
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      for (let z = 0; z < gridSize; z++) {
        const index = x + y * gridSize + z * gridSize * gridSize;
        if (voxelData[index]) {
          voxelPositions.push({ x, y, z });
        }
      }
    }
  }
  
  if (voxelPositions.length === 0) return [];
  
  const visited = new Set();
  const components = [];
  
  const directions = [
    { x: 1, y: 0, z: 0 },
    { x: -1, y: 0, z: 0 },
    { x: 0, y: 1, z: 0 },
    { x: 0, y: -1, z: 0 },
    { x: 0, y: 0, z: 1 },
    { x: 0, y: 0, z: -1 }
  ];
  
  for (const voxelPos of voxelPositions) {
    const voxelKey = `${voxelPos.x},${voxelPos.y},${voxelPos.z}`;
    
    if (!visited.has(voxelKey)) {
      const component = [];
      const queue = [voxelPos];
      visited.add(voxelKey);
      
      while (queue.length > 0) {
        const current = queue.shift();
        component.push(current);
        
        for (const dir of directions) {
          const neighbor = {
            x: current.x + dir.x,
            y: current.y + dir.y,
            z: current.z + dir.z
          };
          
          if (neighbor.x >= 0 && neighbor.x < gridSize &&
              neighbor.y >= 0 && neighbor.y < gridSize &&
              neighbor.z >= 0 && neighbor.z < gridSize) {
            
            const neighborIndex = neighbor.x + neighbor.y * gridSize + neighbor.z * gridSize * gridSize;
            const neighborKey = `${neighbor.x},${neighbor.y},${neighbor.z}`;
            
            if (voxelData[neighborIndex] && !visited.has(neighborKey)) {
              visited.add(neighborKey);
              queue.push(neighbor);
            }
          }
        }
      }
      
      components.push(component);
    }
  }
  
  return components;
}

export function getConnectivityDebugInfo(voxelData, gridSize) {
  const components = findConnectedComponents(voxelData, gridSize);
  const floatingVoxels = [];
  
  if (components.length > 1) {
    for (let i = 1; i < components.length; i++) {
      floatingVoxels.push(...components[i]);
    }
  }
  
  return {
    componentCount: components.length,
    components: components,
    floatingVoxels: floatingVoxels,
    totalVoxels: voxelData.filter(v => v).length
  };
}

function isValidPosition(x, y, z, gridSize) {
  return x >= 0 && x < gridSize && y >= 0 && y < gridSize && z >= 0 && z < gridSize;
}

function getNeighbors(x, y, z, connectivityType) {
  const neighbors = [];
  
  const faceDirections = [
    [1, 0, 0], [-1, 0, 0],
    [0, 1, 0], [0, -1, 0],
    [0, 0, 1], [0, 0, -1]
  ];
  
  const edgeDirections = [
    [1, 1, 0], [1, -1, 0], [-1, 1, 0], [-1, -1, 0],
    [1, 0, 1], [1, 0, -1], [-1, 0, 1], [-1, 0, -1],
    [0, 1, 1], [0, 1, -1], [0, -1, 1], [0, -1, -1]
  ];
  
  const cornerDirections = [
    [1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1],
    [-1, 1, 1], [-1, 1, -1], [-1, -1, 1], [-1, -1, -1]
  ];
  
  neighbors.push(...faceDirections.map(([dx, dy, dz]) => [x + dx, y + dy, z + dz]));
  
  if (connectivityType === 'edge' || connectivityType === 'corner') {
    neighbors.push(...edgeDirections.map(([dx, dy, dz]) => [x + dx, y + dy, z + dz]));
  }
  
  if (connectivityType === 'corner') {
    neighbors.push(...cornerDirections.map(([dx, dy, dz]) => [x + dx, y + dy, z + dz]));
  }
  
  return neighbors;
}

export function isShapeConnected(voxelData, gridSize, connectivityType = 'face') {
  if (!voxelData || gridSize <= 0) return false;
  
  const voxelPositions = [];
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      for (let z = 0; z < gridSize; z++) {
        const index = x + y * gridSize + z * gridSize * gridSize;
        if (voxelData[index]) {
          voxelPositions.push({ x, y, z });
        }
      }
    }
  }
  
  if (voxelPositions.length === 0) return false;
  if (voxelPositions.length === 1) return true;
  
  const visited = new Set();
  const queue = [voxelPositions[0]];
  visited.add(`${voxelPositions[0].x},${voxelPositions[0].y},${voxelPositions[0].z}`);
  
  while (queue.length > 0) {
    const current = queue.shift();
    const neighbors = getNeighbors(current.x, current.y, current.z, connectivityType);
    
    for (const [nx, ny, nz] of neighbors) {
      if (isValidPosition(nx, ny, nz, gridSize)) {
        const neighborIndex = nx + ny * gridSize + nz * gridSize * gridSize;
        const neighborKey = `${nx},${ny},${nz}`;
        
        if (voxelData[neighborIndex] && !visited.has(neighborKey)) {
          visited.add(neighborKey);
          queue.push({ x: nx, y: ny, z: nz });
        }
      }
    }
  }
  
  return visited.size === voxelPositions.length;
}

export function isShapeUniform(voxelData, gridSize, connectivityType = 'face') {
  return isShapeConnected(voxelData, gridSize, connectivityType);
}

export function validateShape(voxelData, gridSize, connectivityType = 'face') {
  const voxelCount = voxelData.filter(voxel => voxel).length;
  const debugInfo = getConnectivityDebugInfo(voxelData, gridSize);
  
  const validation = {
    hasVoxels: voxelCount > 0,
    isConnected: false,
    isUniform: false,
    voxelCount: voxelCount,
    isValid: false,
    errors: [],
    debugInfo: debugInfo,
    connectivityType: connectivityType
  };
  
  if (!validation.hasVoxels) {
    validation.errors.push('Shape must have at least one voxel');
    return validation;
  }
  
  validation.isConnected = isShapeConnected(voxelData, gridSize, connectivityType);
  validation.isUniform = validation.isConnected;
  
  if (!validation.isConnected) {
    if (debugInfo.componentCount > 1) {
      const connectivityDesc = connectivityType === 'face' ? 'by faces' : 
                             connectivityType === 'edge' ? 'by faces and edges' : 
                             'by faces, edges and corners';
      validation.errors.push(`All voxels must be connected ${connectivityDesc} (found ${debugInfo.componentCount} separate parts)`);
      validation.errors.push(`Floating voxels: ${debugInfo.floatingVoxels.length} voxels in ${debugInfo.componentCount - 1} groups`);
    } else {
      validation.errors.push('All voxels must be connected (no floating parts)');
    }
  }
  
  validation.isValid = validation.hasVoxels && validation.isConnected && validation.isUniform;
  
  return validation;
} 