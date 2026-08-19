import React from 'react';
import { Sprout, Server, Activity, ShieldCheck } from 'lucide-react';

export default function Header({ serverStatus, mlStatus }) {
  const isAllOnline = serverStatus === 'online' && mlStatus === 'online';
  const isWaking = mlStatus === 'cold_sleeping_or_offline';

  return (
    <header className="app-header">
      <div className="brand-group">
        <div className="brand-icon-wrapper">
          <Sprout size={26} />
        </div>
        <div>
          <h1 className="brand-title">
            SmartCrop AI
            <span className="brand-badge">TensorFlow 2.x</span>
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Plant Disease Classifier & Agronomy Treatment Advisor
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <div className="header-status-pill">
          <div className={`status-dot ${isAllOnline ? 'online' : isWaking ? 'waking' : 'offline'}`} />
          <span>
            {isAllOnline ? 'Services Ready' : isWaking ? 'Render API Waking' : 'Connecting...'}
          </span>
        </div>
      </div>
    </header>
  );
}
