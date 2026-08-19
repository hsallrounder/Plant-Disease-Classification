import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronRight, CheckCircle2, AlertOctagon } from 'lucide-react';
import { fetchDiseasesCatalog } from '../services/api';

export default function DiseasesLibrary() {
  const [catalog, setCatalog] = useState({});
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchDiseasesCatalog()
      .then((data) => {
        if (data.success && data.catalog) {
          setCatalog(data.catalog);
        }
      })
      .catch((err) => console.log('Could not load disease catalog:', err.message));
  }, []);

  const keys = Object.keys(catalog);
  if (keys.length === 0) return null;

  return (
    <section className="library-section">
      <div className="card-title-bar">
        <h3 className="card-heading" style={{ cursor: 'pointer' }} onClick={() => setIsOpen(!isOpen)}>
          <BookOpen className="treatment-icon" size={20} />
          Crop Disease Knowledge Base ({keys.length} Classes)
          <span style={{ fontSize: '0.8rem', color: 'var(--primary-light)', marginLeft: '8px' }}>
            {isOpen ? '▲ Hide' : '▼ Expand'}
          </span>
        </h3>
      </div>

      {isOpen && (
        <div className="library-grid">
          {keys.map((key) => {
            const item = catalog[key];
            return (
              <div key={key} className="library-card">
                <div className="library-crop">{item.crop}</div>
                <h4 className="library-condition" style={{ color: item.isHealthy ? '#34d399' : '#fb7185' }}>
                  {item.condition}
                </h4>
                <p className="library-desc">{item.description}</p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
