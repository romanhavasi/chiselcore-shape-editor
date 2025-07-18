import React from 'react';

function Toolbar({ onFillCube, onClearGrid, voxelCount, gridSize, shapeMetadata, onMetadataChange, voxelMode, onModeToggle, onSaveShape, onLoadShape }) {
  const getVoxelDensity = () => {
    const totalVoxels = gridSize * gridSize * gridSize;
    return totalVoxels > 0 ? ((voxelCount / totalVoxels) * 100).toFixed(1) : 0;
  };

  const handleDifficultyChange = (e) => {
    onMetadataChange({
      ...shapeMetadata,
      difficulty: parseInt(e.target.value)
    });
  };

  const handleMaxMovesChange = (e) => {
    onMetadataChange({
      ...shapeMetadata,
      maxMoves: parseInt(e.target.value)
    });
  };

  return (
    <div className="toolbar" style={{ 
      height: '32px',
      padding: '4px 8px',
      borderBottom: '1px solid #c0c0c0',
      background: '#c0c0c0',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '11px'
    }}>
      <button onClick={onFillCube} title="Fill entire cube">Fill Cube</button>
      <button onClick={onClearGrid} title="Clear all voxels">Clear</button>
      
      <div style={{ 
        width: '1px', 
        height: '20px', 
        background: '#808080', 
        margin: '0 4px' 
      }}></div>
      
      <button onClick={onLoadShape} title="Load shape from file">Load</button>
      <button className="default" onClick={onSaveShape} title="Save shape to file">Save</button>
      
      <div style={{ 
        width: '1px', 
        height: '20px', 
        background: '#808080', 
        margin: '0 4px' 
      }}></div>
      
      <button 
        onClick={onModeToggle} 
        title={`Switch to ${voxelMode === 'add' ? 'remove' : 'add'} mode`}
        style={{
          backgroundColor: voxelMode === 'add' ? '#90EE90' : '#FFB6C1',
          color: '#000000',
          fontWeight: 'bold'
        }}
      >
        {voxelMode === 'add' ? 'Add Mode' : 'Remove Mode'}
      </button>
      
      <div style={{ 
        width: '1px', 
        height: '20px', 
        background: '#808080', 
        margin: '0 4px' 
      }}></div>
      
      <span>Voxels: {voxelCount}/{gridSize * gridSize * gridSize}</span>
      <span>Density: {getVoxelDensity()}%</span>
      
      <div style={{ 
        width: '1px', 
        height: '20px', 
        background: '#808080', 
        margin: '0 4px' 
      }}></div>
      
      <div className="field-row">
        <label>Difficulty:</label>
        <input
          type="number"
          min="1"
          max="10"
          value={shapeMetadata.difficulty}
          onChange={handleDifficultyChange}
          style={{ width: '40px' }}
        />
      </div>
      
      <div className="field-row">
        <label>Max Moves:</label>
        <input
          type="number"
          min="1"
          max="999"
          value={shapeMetadata.maxMoves}
          onChange={handleMaxMovesChange}
          style={{ width: '50px' }}
        />
      </div>
      
      <span style={{ 
        marginLeft: 'auto',
        color: voxelCount > 0 ? '#008000' : '#800000'
      }}>
        {voxelCount > 0 ? '✅ Valid' : '⚠️ Needs voxels'}
      </span>
    </div>
  );
}

export default Toolbar; 