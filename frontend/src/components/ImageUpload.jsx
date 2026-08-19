import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, X, Sparkles, AlertCircle } from 'lucide-react';

export default function ImageUpload({ onImageSelected, previewUrl, onClear, isLoading }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndPassFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndPassFile(e.target.files[0]);
    }
  };

  const validateAndPassFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG, PNG, WEBP).');
      return;
    }
    onImageSelected(file);
  };

  return (
    <div className="glass-card">
      <div className="card-title-bar">
        <h2 className="card-heading">
          <UploadCloud className="treatment-icon" size={22} />
          Leaf Scanner
        </h2>
        {previewUrl && (
          <button onClick={onClear} className="btn-icon-glass" title="Clear image">
            <X size={16} />
          </button>
        )}
      </div>

      {!previewUrl ? (
        <div
          className={`dropzone ${isDragActive ? 'active' : ''}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleChange}
          />
          <div className="dropzone-icon">
            <ImageIcon size={28} />
          </div>
          <p className="dropzone-prompt">Drag & drop your plant leaf image here</p>
          <p className="dropzone-subtext">or click to browse from device (JPEG, PNG, WEBP up to 10MB)</p>
        </div>
      ) : (
        <div className="preview-wrapper">
          <img src={previewUrl} alt="Leaf Preview" className="preview-img" />
          <div className="preview-overlay">
            <button onClick={onClear} className="btn-icon-glass" title="Remove image">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="sample-crops-bar">
        <div className="sample-label">Supported Crops (8 Classes)</div>
        <div className="sample-buttons">
          <span className="sample-btn">🍒 Cherry (Healthy / Mildew)</span>
          <span className="sample-btn">🍑 Peach (Healthy / Bacterial Spot)</span>
          <span className="sample-btn">🫑 Bell Pepper (Healthy / Spot)</span>
          <span className="sample-btn">🍓 Strawberry (Healthy / Scorch)</span>
        </div>
      </div>
    </div>
  );
}
