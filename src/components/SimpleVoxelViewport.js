import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function calculateAdjacentPosition(intersection, gridSize) {
  const { point, face } = intersection;
  const { position } = intersection.object.userData;
  
  if (!face) return null;
  
  const normal = face.normal.clone();
  
  const adjacentPos = {
    x: Math.round(position[0] + normal.x),
    y: Math.round(position[1] + normal.y), 
    z: Math.round(position[2] + normal.z)
  };
  
  if (adjacentPos.x >= 0 && adjacentPos.x < gridSize &&
      adjacentPos.y >= 0 && adjacentPos.y < gridSize &&
      adjacentPos.z >= 0 && adjacentPos.z < gridSize) {
    return adjacentPos;
  }
  
  return null;
}

function CameraSetup() {
  const { camera } = useThree();
  
  useEffect(() => {
    const gridCenter = new THREE.Vector3(3, 3, 3);
    camera.lookAt(gridCenter);
  }, [camera]);
  
  return null;
}

function VoxelInteractionSystem({ gridSize, voxelData, onVoxelAction, onHoverChange, voxelMode }) {
  const { camera, gl, scene } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });

  const performRaycast = useCallback((clientX, clientY) => {
    const canvas = gl.domElement;
    const rect = canvas.getBoundingClientRect();
    
    const mouse = {
      x: ((clientX - rect.left) / rect.width) * 2 - 1,
      y: -((clientY - rect.top) / rect.height) * 2 + 1
    };

    raycaster.current.setFromCamera(mouse, camera);
    
    const voxelMeshes = [];
    scene.traverse((child) => {
      if (child.isMesh && child.userData.isVoxel) {
        voxelMeshes.push(child);
      }
    });

    const intersections = raycaster.current.intersectObjects(voxelMeshes);
    
    if (intersections.length > 0) {
      const intersection = intersections[0];
      const position = intersection.object.userData.position;
      
      return {
        intersection,
        voxelPosition: position,
        adjacentPosition: calculateAdjacentPosition(intersection, gridSize)
      };
    }
    
    return null;
  }, [camera, gl, scene, gridSize]);

  const handlePointerMove = useCallback((event) => {
    if (isRotating) {
      const deltaX = event.clientX - lastMouse.x;
      const deltaY = event.clientY - lastMouse.y;
      
      const gridCenter = new THREE.Vector3(3, 3, 3);
      const spherical = new THREE.Spherical();
      spherical.setFromVector3(camera.position.clone().sub(gridCenter));
      
      spherical.theta -= deltaX * 0.005;
      spherical.phi += deltaY * 0.005;
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
      
      const newPosition = new THREE.Vector3();
      newPosition.setFromSpherical(spherical);
      newPosition.add(gridCenter);
      
      camera.position.copy(newPosition);
      camera.lookAt(gridCenter);
      
      setLastMouse({ x: event.clientX, y: event.clientY });
    } else {
      const raycastResult = performRaycast(event.clientX, event.clientY);
      if (raycastResult) {
        const { voxelPosition, adjacentPosition } = raycastResult;
        
        let position;
        if (voxelMode === 'remove' && voxelPosition) {
          position = { x: voxelPosition[0], y: voxelPosition[1], z: voxelPosition[2] };
        } else {
          position = adjacentPosition;
        }
        
        if (position && onHoverChange) {
          onHoverChange(position, voxelMode);
        }
      } else if (onHoverChange) {
        onHoverChange(null, voxelMode);
      }
    }
  }, [camera, isRotating, lastMouse, performRaycast, onHoverChange, voxelMode]);

  const handlePointerDown = useCallback((event) => {
    setIsDragging(true);
    setLastMouse({ x: event.clientX, y: event.clientY });
    
    if (event.button === 2) {
      setIsRotating(true);
      event.preventDefault();
    }
  }, []);

  const handlePointerUp = useCallback((event) => {
    if (!isRotating) {
      const currentMouse = { x: event.clientX, y: event.clientY };
      const dragDistance = Math.sqrt(
        Math.pow(currentMouse.x - lastMouse.x, 2) + 
        Math.pow(currentMouse.y - lastMouse.y, 2)
      );
      
      if (dragDistance < 15) {
        const raycastResult = performRaycast(event.clientX, event.clientY);
        if (raycastResult && onVoxelAction) {
          const { voxelPosition, adjacentPosition } = raycastResult;
          
          if (voxelMode === 'remove' && voxelPosition) {
            console.log('Removing voxel at:', voxelPosition);
            onVoxelAction(voxelPosition[0], voxelPosition[1], voxelPosition[2]);
          } else if (voxelMode === 'add' && adjacentPosition) {
            console.log('Adding voxel at:', adjacentPosition);
            onVoxelAction(adjacentPosition.x, adjacentPosition.y, adjacentPosition.z);
          }
        } else {
          console.log('No raycast result or action handler');
        }
      } else {
        console.log('Drag distance too large:', dragDistance);
      }
    }
    
    setIsDragging(false);
    setIsRotating(false);
  }, [isRotating, lastMouse, performRaycast, onVoxelAction, voxelMode]);

  const handleWheel = useCallback((event) => {
    const zoomSpeed = 0.5;
    const direction = event.deltaY > 0 ? 1 : -1;
    
    const gridCenter = new THREE.Vector3(3, 3, 3);
    const spherical = new THREE.Spherical();
    spherical.setFromVector3(camera.position.clone().sub(gridCenter));
    
    spherical.radius += direction * zoomSpeed;
    spherical.radius = Math.max(5, Math.min(30, spherical.radius));
    
    const newPosition = new THREE.Vector3();
    newPosition.setFromSpherical(spherical);
    newPosition.add(gridCenter);
    
    camera.position.copy(newPosition);
    camera.lookAt(gridCenter);
    
    event.preventDefault();
  }, [camera]);

  useFrame(() => {
    const canvas = gl.domElement;
    
    canvas.onpointermove = handlePointerMove;
    canvas.onpointerdown = handlePointerDown;
    canvas.onpointerup = handlePointerUp;
    canvas.onwheel = handleWheel;
    canvas.oncontextmenu = (e) => e.preventDefault();
    
    return () => {
      canvas.onpointermove = null;
      canvas.onpointerdown = null;
      canvas.onpointerup = null;
      canvas.onwheel = null;
      canvas.oncontextmenu = null;
    };
  });

  return null;
}

function VoxelMesh({ position, isVisible }) {
  const meshRef = useRef();
  
  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshPhongMaterial({ 
    color: 0x4a90e2,
    transparent: false
  });
  
  return (
    <mesh
      ref={meshRef}
      position={[position[0], position[1], position[2]]}
      geometry={boxGeometry}
      material={material}
      userData={{ 
        isVoxel: true, 
        position: position 
      }}
      visible={isVisible}
    />
  );
}

function HoverIndicator({ position, mode }) {
  if (!position) return null;
  
  if (mode === 'remove') {
    return (
      <mesh position={[position.x, position.y, position.z]}>
        <boxGeometry args={[1.02, 1.02, 1.02]} />
        <meshBasicMaterial 
          color={0xff4444}
          wireframe={true}
          transparent={true} 
          opacity={0.9}
        />
      </mesh>
    );
  } else {
    return (
      <mesh position={[position.x, position.y, position.z]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial 
          color={0x44ff44}
          transparent={true} 
          opacity={0.3}
        />
      </mesh>
    );
  }
}

function SimpleVoxelViewport({ gridSize, voxelData, onVoxelAction, voxelMode }) {
  const [hoverState, setHoverState] = useState({ position: null, mode: null });

  const handleHoverChange = useCallback((position, mode) => {
    setHoverState({ position, mode });
  }, []);

  const getVoxelIndex = useCallback((x, y, z) => {
    return x + y * gridSize + z * gridSize * gridSize;
  }, [gridSize]);

  const voxelMeshes = [];
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      for (let z = 0; z < gridSize; z++) {
        const index = getVoxelIndex(x, y, z);
        const isVisible = voxelData[index];
        
        if (isVisible) {
          voxelMeshes.push(
            <VoxelMesh
              key={`voxel-${x}-${y}-${z}`}
              position={[x, y, z]}
              isVisible={isVisible}
            />
          );
        }
      }
    }
  }

  const gridLines = [];
  const gridMaterial = new THREE.LineBasicMaterial({ color: 0x666666, opacity: 0.3, transparent: true });
  
  for (let i = 0; i <= gridSize; i++) {
    const points1 = [
      new THREE.Vector3(i, -0.5, -0.5),
      new THREE.Vector3(i, -0.5, gridSize - 0.5),
      new THREE.Vector3(i, gridSize - 0.5, gridSize - 0.5),
      new THREE.Vector3(i, gridSize - 0.5, -0.5),
      new THREE.Vector3(i, -0.5, -0.5)
    ];
    
    const points2 = [
      new THREE.Vector3(-0.5, i, -0.5),
      new THREE.Vector3(gridSize - 0.5, i, -0.5),
      new THREE.Vector3(gridSize - 0.5, i, gridSize - 0.5),
      new THREE.Vector3(-0.5, i, gridSize - 0.5),
      new THREE.Vector3(-0.5, i, -0.5)
    ];
    
    const points3 = [
      new THREE.Vector3(-0.5, -0.5, i),
      new THREE.Vector3(gridSize - 0.5, -0.5, i),
      new THREE.Vector3(gridSize - 0.5, gridSize - 0.5, i),
      new THREE.Vector3(-0.5, gridSize - 0.5, i),
      new THREE.Vector3(-0.5, -0.5, i)
    ];
    
    [points1, points2, points3].forEach((points, idx) => {
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      gridLines.push(
        <line key={`grid-line-${i}-${idx}`} geometry={geometry} material={gridMaterial} />
      );
    });
  }

  return (
    <Canvas
      camera={{ 
        position: [12, 12, 12], 
        fov: 50 
      }}
      style={{ 
        width: '100%', 
        height: '100%',
        display: 'block'
      }}
      resize={{ scroll: false }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 10]} intensity={0.8} />
      
      <CameraSetup />
      
      <VoxelInteractionSystem
        gridSize={gridSize}
        voxelData={voxelData}
        onVoxelAction={onVoxelAction}
        onHoverChange={handleHoverChange}
        voxelMode={voxelMode}
      />
      
      {voxelMeshes}
      {gridLines}
      
      <HoverIndicator 
        position={hoverState.position} 
        mode={hoverState.mode}
      />
    </Canvas>
  );
}

export default SimpleVoxelViewport; 