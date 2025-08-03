import React, { useState, useEffect } from 'react';
import './ModelSelector.css';
import aiService from '../../services/aiService';

const ModelSelector = ({ onModelChange }) => {
  const [selectedModel, setSelectedModel] = useState('');
  const [availableModels, setAvailableModels] = useState([]);

  useEffect(() => {
    if (aiService.isConfigured()) {
      const models = aiService.getAvailableModels();
      setAvailableModels(models);
      const current = aiService.getCurrentModel();
      setSelectedModel(current?.id || '');
    }
  }, []);

  const handleChange = (e) => {
    const modelId = e.target.value;
    if (modelId && aiService.setModel(modelId)) {
      setSelectedModel(modelId);
      if (onModelChange) {
        onModelChange(modelId);
      }
    }
  };

  if (!aiService.isConfigured() || availableModels.length === 0) {
    return null;
  }

  return (
    <div className="model-selector">
      <select 
        className="model-dropdown" 
        value={selectedModel} 
        onChange={handleChange}
      >
        <option value="">Select AI Model</option>
        <optgroup label="Gemini 2.0 Series">
          {availableModels
            .filter(model => model.id.includes('2.0'))
            .map(model => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))
          }
        </optgroup>
        <optgroup label="Gemini 2.5 Series">
          {availableModels
            .filter(model => model.id.includes('2.5'))
            .map(model => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))
          }
        </optgroup>
        <optgroup label="Gemini 1.5 Series">
          {availableModels
            .filter(model => model.id.includes('1.5'))
            .map(model => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))
          }
        </optgroup>
      </select>
    </div>
  );
};

export default ModelSelector;
