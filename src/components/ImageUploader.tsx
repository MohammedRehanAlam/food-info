import React, { useCallback, useState } from 'react';
import { UploadCloud, X } from 'lucide-react';
import './ImageUploader.css';

interface ImageUploaderProps {
  onImageSelected: (base64: string) => void;
  isLoading: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      onImageSelected(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [onImageSelected]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const clearImage = () => {
    setPreview(null);
    onImageSelected('');
  };

  return (
    <div className="uploader-container">
      {!preview ? (
        <label 
          className={`upload-area modern-panel ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleChange} 
            className="hidden-input"
            disabled={isLoading}
          />
          <div className="upload-content">
            <div className="icon-pulse-glow">
              <UploadCloud size={28} className="upload-icon-inner" />
            </div>
            <h3>Tap to upload or drag image</h3>
            <div className="format-badges">
              <span className="format-badge">JPG</span>
              <span className="format-badge">PNG</span>
              <span className="format-badge">WEBP</span>
            </div>
          </div>
        </label>
      ) : (
        <div className="preview-area modern-panel animate-fade-in">
          <img src={preview} alt="Food preview" className="image-preview" />
          {!isLoading && (
            <button className="clear-btn" onClick={clearImage}>
              <X size={20} />
            </button>
          )}
          {isLoading && (
            <div className="loading-overlay">
              <div className="spinner"></div>
              <p className="analyzing-text">Analyzing food...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
