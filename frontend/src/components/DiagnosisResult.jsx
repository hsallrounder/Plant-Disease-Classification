import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Leaf, 
  FlaskConical, 
  ShieldAlert, 
  HelpCircle, 
  BarChart2, 
  Bug, 
  Sparkles 
} from 'lucide-react';

export default function DiagnosisResult({ result, isLoading }) {
  const [activeTab, setActiveTab] = useState('organic');

  if (isLoading) {
    return (
      <div className="glass-card empty-state">
        <div className="empty-icon" style={{ animation: 'pulse-dot 1.5s infinite' }}>
          <Sparkles size={32} color="var(--primary-light)" />
        </div>
        <h3 className="empty-title">Analyzing Plant Leaf...</h3>
        <p className="empty-desc">
          TensorFlow CNN is running inference across 8 crop disease classes. Please wait a moment.
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="glass-card empty-state">
        <div className="empty-icon">
          <Leaf size={32} />
        </div>
        <h3 className="empty-title">No Leaf Scanned Yet</h3>
        <p className="empty-desc">
          Upload or drag an image of a cherry, peach, pepper, or strawberry leaf on the left to receive an AI diagnosis.
        </p>
      </div>
    );
  }

  const {
    crop,
    condition,
    isHealthy,
    confidence,
    severity,
    pathogen,
    description,
    symptoms = [],
    treatments = {},
    allProbabilities = []
  } = result;

  return (
    <div className="glass-card diagnosis-container">
      {/* Hero Diagnosis Header */}
      <div className={`diagnosis-hero ${isHealthy ? 'healthy' : 'disease'}`}>
        <div>
          <div className="crop-tag">{crop} • {pathogen !== 'None' ? pathogen : 'No Pathogen'}</div>
          <h2 className="condition-title">{condition}</h2>
          <div className="severity-pill">
            {isHealthy ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
            {isHealthy ? 'Plant is in optimal health' : `Severity: ${severity}`}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Confidence
          </div>
          <div className="confidence-number">{confidence}%</div>
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="confidence-bar-bg">
        <div 
          className="confidence-bar-fill" 
          style={{ width: `${Math.min(confidence, 100)}%` }} 
        />
      </div>

      {/* Disease Description */}
      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
        {description}
      </p>

      {/* Tabs Navigation */}
      <div className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === 'organic' ? 'active' : ''}`}
          onClick={() => setActiveTab('organic')}
        >
          <Leaf size={15} /> Organic
        </button>
        <button
          className={`tab-btn ${activeTab === 'chemical' ? 'active' : ''}`}
          onClick={() => setActiveTab('chemical')}
        >
          <FlaskConical size={15} /> Chemical
        </button>
        <button
          className={`tab-btn ${activeTab === 'symptoms' ? 'active' : ''}`}
          onClick={() => setActiveTab('symptoms')}
        >
          <Bug size={15} /> Symptoms
        </button>
        <button
          className={`tab-btn ${activeTab === 'prevention' ? 'active' : ''}`}
          onClick={() => setActiveTab('prevention')}
        >
          <ShieldAlert size={15} /> Prevention
        </button>
        <button
          className={`tab-btn ${activeTab === 'probabilities' ? 'active' : ''}`}
          onClick={() => setActiveTab('probabilities')}
        >
          <BarChart2 size={15} /> Scores
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ minHeight: '180px' }}>
        {activeTab === 'organic' && (
          <ul className="treatment-list">
            {(treatments.organic || []).map((t, idx) => (
              <li key={idx} className="treatment-item">
                <Leaf size={16} className="treatment-icon" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        )}

        {activeTab === 'chemical' && (
          <ul className="treatment-list">
            {(treatments.chemical || []).map((t, idx) => (
              <li key={idx} className="treatment-item">
                <FlaskConical size={16} className="treatment-icon" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        )}

        {activeTab === 'symptoms' && (
          <ul className="treatment-list">
            {symptoms.map((s, idx) => (
              <li key={idx} className="treatment-item">
                <AlertTriangle size={16} className="treatment-icon" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        )}

        {activeTab === 'prevention' && (
          <ul className="treatment-list">
            {(treatments.prevention || []).map((p, idx) => (
              <li key={idx} className="treatment-item">
                <ShieldAlert size={16} className="treatment-icon" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        )}

        {activeTab === 'probabilities' && (
          <div className="prob-list">
            {allProbabilities.map((item, idx) => (
              <div key={idx} className="prob-row">
                <div className="prob-header">
                  <span>{item.class.replace(/___/g, ' - ').replace(/_/g, ' ')}</span>
                  <span style={{ fontWeight: 700 }}>{item.probability}%</span>
                </div>
                <div className="prob-bar-container">
                  <div 
                    className="prob-bar" 
                    style={{ 
                      width: `${item.probability}%`,
                      backgroundColor: idx === 0 ? 'var(--primary)' : 'rgba(255, 255, 255, 0.2)'
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
