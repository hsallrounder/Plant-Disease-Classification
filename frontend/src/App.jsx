import React, { useState, useEffect } from 'react';
import { Sparkles, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import Header from './components/Header';
import ImageUpload from './components/ImageUpload';
import DiagnosisResult from './components/DiagnosisResult';
import DiseasesLibrary from './components/DiseasesLibrary';
import { predictPlantImage, checkApiHealth } from './services/api';

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  
  const [serverStatus, setServerStatus] = useState('checking');
  const [mlStatus, setMlStatus] = useState('checking');

  // Check health on startup
  useEffect(() => {
    const fetchHealth = async () => {
      const data = await checkApiHealth();
      setServerStatus(data.status || 'offline');
      setMlStatus(data.mlServiceStatus || 'unreachable');
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleImageSelected = (file) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setDiagnosisResult(null);
    setErrorMessage(null);
  };

  const handleClear = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setDiagnosisResult(null);
    setErrorMessage(null);
  };

  const handleDiagnose = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await predictPlantImage(selectedFile);
      if (res.success && res.prediction) {
        setDiagnosisResult(res.prediction);
      } else {
        setErrorMessage(res.error || 'Failed to analyze the leaf image.');
      }
    } catch (err) {
      console.error('Prediction error:', err);
      const msg = err.response?.data?.error || err.message || 'An unexpected error occurred.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Header serverStatus={serverStatus} mlStatus={mlStatus} />

      {/* Render Cold-Start Banner Notification */}
      {mlStatus === 'cold_sleeping_or_offline' && (
        <div className="cold-start-banner">
          <Clock size={18} style={{ flexShrink: 0 }} />
          <div>
            <strong>Render Free Tier Cold-Start Notice:</strong> If this is your first scan in 15 minutes, the Render Python Web Service may take 30–45 seconds to spin up. Please submit your leaf and allow it to initialize!
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="cold-start-banner" style={{ background: 'rgba(244, 63, 94, 0.1)', borderColor: 'rgba(244, 63, 94, 0.3)', color: '#fca5a5' }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <div>{errorMessage}</div>
        </div>
      )}

      <main className="main-grid">
        {/* Left Column: Upload */}
        <div>
          <ImageUpload
            onImageSelected={handleImageSelected}
            previewUrl={previewUrl}
            onClear={handleClear}
            isLoading={isLoading}
          />

          {previewUrl && (
            <button
              className="btn-primary"
              onClick={handleDiagnose}
              disabled={isLoading}
            >
              <Sparkles size={18} />
              {isLoading ? 'Running AI Inference...' : 'Analyze Leaf Disease'}
            </button>
          )}
        </div>

        {/* Right Column: Diagnosis Report */}
        <div>
          <DiagnosisResult result={diagnosisResult} isLoading={isLoading} />
        </div>
      </main>

      {/* Diseases Catalog Knowledge Base */}
      <DiseasesLibrary />
    </div>
  );
}
