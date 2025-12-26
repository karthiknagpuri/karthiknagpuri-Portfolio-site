import React, { useState, useEffect, useRef, useCallback } from 'react';
import indiaSvgUrl from '../assets/india.svg?url';

// India States Data
const indiaStatesData = {
  'IN-AN': { name: 'Andaman and Nicobar Islands', capital: 'Port Blair', population: '0.4M', founders: 2, highlight: false },
  'IN-AP': { name: 'Andhra Pradesh', capital: 'Amaravati', population: '53M', founders: 28, highlight: true },
  'IN-AR': { name: 'Arunachal Pradesh', capital: 'Itanagar', population: '1.5M', founders: 3, highlight: false },
  'IN-AS': { name: 'Assam', capital: 'Dispur', population: '35M', founders: 8, highlight: false },
  'IN-BR': { name: 'Bihar', capital: 'Patna', population: '124M', founders: 16, highlight: true },
  'IN-CH': { name: 'Chandigarh', capital: 'Chandigarh', population: '1.2M', founders: 5, highlight: false },
  'IN-CT': { name: 'Chhattisgarh', capital: 'Raipur', population: '29M', founders: 9, highlight: true },
  'IN-DD': { name: 'Daman and Diu', capital: 'Daman', population: '0.6M', founders: 1, highlight: false },
  'IN-DL': { name: 'Delhi', capital: 'New Delhi', population: '32M', founders: 52, highlight: true },
  'IN-DN': { name: 'Dadra and Nagar Haveli', capital: 'Silvassa', population: '0.6M', founders: 1, highlight: false },
  'IN-GA': { name: 'Goa', capital: 'Panaji', population: '1.5M', founders: 7, highlight: false },
  'IN-GJ': { name: 'Gujarat', capital: 'Gandhinagar', population: '71M', founders: 35, highlight: true },
  'IN-HP': { name: 'Himachal Pradesh', capital: 'Shimla', population: '7.5M', founders: 6, highlight: false },
  'IN-HR': { name: 'Haryana', capital: 'Chandigarh', population: '29M', founders: 18, highlight: true },
  'IN-JH': { name: 'Jharkhand', capital: 'Ranchi', population: '39M', founders: 11, highlight: true },
  'IN-JK': { name: 'Jammu and Kashmir', capital: 'Srinagar', population: '14M', founders: 4, highlight: false },
  'IN-KA': { name: 'Karnataka', capital: 'Bengaluru', population: '68M', founders: 68, highlight: true },
  'IN-KL': { name: 'Kerala', capital: 'Thiruvananthapuram', population: '35M', founders: 22, highlight: true },
  'IN-LD': { name: 'Lakshadweep', capital: 'Kavaratti', population: '0.07M', founders: 0, highlight: false },
  'IN-MH': { name: 'Maharashtra', capital: 'Mumbai', population: '126M', founders: 85, highlight: true },
  'IN-ML': { name: 'Meghalaya', capital: 'Shillong', population: '3.8M', founders: 4, highlight: false },
  'IN-MN': { name: 'Manipur', capital: 'Imphal', population: '3M', founders: 2, highlight: false },
  'IN-MP': { name: 'Madhya Pradesh', capital: 'Bhopal', population: '85M', founders: 24, highlight: true },
  'IN-MZ': { name: 'Mizoram', capital: 'Aizawl', population: '1.2M', founders: 2, highlight: false },
  'IN-NL': { name: 'Nagaland', capital: 'Kohima', population: '2.2M', founders: 2, highlight: false },
  'IN-OR': { name: 'Odisha', capital: 'Bhubaneswar', population: '46M', founders: 14, highlight: true },
  'IN-PB': { name: 'Punjab', capital: 'Chandigarh', population: '31M', founders: 15, highlight: true },
  'IN-PY': { name: 'Puducherry', capital: 'Puducherry', population: '1.6M', founders: 3, highlight: false },
  'IN-RJ': { name: 'Rajasthan', capital: 'Jaipur', population: '81M', founders: 22, highlight: true },
  'IN-SK': { name: 'Sikkim', capital: 'Gangtok', population: '0.7M', founders: 2, highlight: false },
  'IN-TG': { name: 'Telangana', capital: 'Hyderabad', population: '39M', founders: 42, highlight: true },
  'IN-TN': { name: 'Tamil Nadu', capital: 'Chennai', population: '77M', founders: 38, highlight: true },
  'IN-TR': { name: 'Tripura', capital: 'Agartala', population: '4M', founders: 3, highlight: false },
  'IN-UP': { name: 'Uttar Pradesh', capital: 'Lucknow', population: '241M', founders: 45, highlight: true },
  'IN-UT': { name: 'Uttarakhand', capital: 'Dehradun', population: '11M', founders: 8, highlight: false },
  'IN-WB': { name: 'West Bengal', capital: 'Kolkata', population: '100M', founders: 31, highlight: true },
};

// Interactive India Map Component
// eslint-disable-next-line no-unused-vars
export const InteractiveIndiaMap = ({ activeState, setActiveState, theme }) => {
  const [hoveredState, setHoveredState] = useState(null);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, content: null });
  const [selectedState, setSelectedState] = useState(null);
  const [svgContent, setSvgContent] = useState('');
  const mapRef = useRef(null);

  // Load SVG content
  useEffect(() => {
    fetch(indiaSvgUrl)
      .then(response => response.text())
      .then(text => {
        setSvgContent(text);
      })
      .catch(err => console.error('Error loading India SVG:', err));
  }, []);

  // Handle mouse events using event delegation on container
  const handleContainerMouseMove = useCallback((e) => {
    const path = e.target.closest('path[id^="IN-"]');
    if (path && path.id && indiaStatesData[path.id]) {
      setHoveredState(path.id);
      setTooltip({
        show: true,
        x: e.clientX + 15,
        y: e.clientY + 15,
        content: indiaStatesData[path.id],
      });
    }
  }, []);

  const handleContainerMouseLeave = useCallback(() => {
    setHoveredState(null);
    setTooltip({ show: false, x: 0, y: 0, content: null });
  }, []);

  const handleContainerClick = useCallback((e) => {
    const path = e.target.closest('path[id^="IN-"]');
    if (path && path.id && indiaStatesData[path.id]) {
      setSelectedState(prev => prev === path.id ? null : path.id);
      if (setActiveState) setActiveState(path.id);
    }
  }, [setActiveState]);

  // Colors based on user requirements
  const colors = {
    default: '#F5E6D3', // beige
    highlighted: '#ff6b35', // orange for highlighted states
    hover: '#6d3b2d', // dark brown on hover
    stroke: '#ffffff', // white borders
    selected: '#ff6b35', // orange for selected
  };

  return (
    <div
      ref={mapRef}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '100%',
        aspectRatio: '611 / 696',
        minHeight: '400px',
        maxHeight: '80vh',
      }}
    >
      <style>{`
        .india-map-path {
          fill: ${colors.default};
          stroke: ${colors.stroke};
          stroke-width: 0.5;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          pointer-events: all !important;
        }
        /* Highlighted states */
        ${Object.entries(indiaStatesData)
          .filter(([, data]) => data.highlight)
          .map(([id]) => `#${id}.india-map-path { fill: ${colors.highlighted}; }`)
          .join('\n        ')}

        .india-map-path:hover {
          fill: ${colors.hover} !important;
          stroke-width: 1.5;
          filter: brightness(1.2);
        }
        /* Hovered state from JS */
        ${hoveredState ? `#${hoveredState}.india-map-path { fill: ${colors.hover} !important; stroke-width: 1.5; filter: brightness(1.2); }` : ''}
        /* Selected state */
        ${selectedState ? `#${selectedState}.india-map-path { fill: ${colors.selected} !important; stroke: ${colors.hover}; stroke-width: 2; }` : ''}

        /* Telangana (home) special styling */
        #IN-TG.india-map-path {
          fill: #4ECDC4 !important;
        }
        #IN-TG.india-map-path:hover {
          fill: #3BA99C !important;
        }
        ${hoveredState === 'IN-TG' ? `#IN-TG.india-map-path { fill: #3BA99C !important; }` : ''}

        .india-map-container {
          width: 100%;
          height: 100%;
        }

        .india-map-container svg {
          width: 100%;
          height: 100%;
          display: block;
        }

        .india-map-container svg path {
          pointer-events: all !important;
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .india-map-container svg {
            max-height: 60vh;
          }
        }
      `}</style>

      {/* Inject the actual SVG with interactivity */}
      <div
        className="india-map-container"
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseMove={handleContainerMouseMove}
        onMouseLeave={handleContainerMouseLeave}
        onClick={handleContainerClick}
        dangerouslySetInnerHTML={{
          __html: svgContent
            .replace(/<\?xml[^?]*\?>/g, '')
            .replace(/xmlns[^=]*="[^"]*"/g, '')
            .replace(/<svg/, `<svg viewBox="0 0 612 696" preserveAspectRatio="xMidYMid meet" style="pointer-events: all;"`)
            .replace(/width="[^"]*"/g, '')
            .replace(/height="[^"]*"/g, '')
            .replace(/<path/g, `<path class="india-map-path" style="pointer-events: all; cursor: pointer;"`)
            .replace(/fill="[^"]*"/g, '')
            .replace(/stroke="[^"]*"/g, '')
        }}
      />

      {/* Tooltip */}
      {tooltip.show && tooltip.content && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            background: 'rgba(0, 0, 0, 0.95)',
            color: '#fff',
            padding: '16px 20px',
            borderRadius: '12px',
            fontSize: '13px',
            pointerEvents: 'none',
            zIndex: 9999,
            minWidth: '180px',
            maxWidth: '250px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{
            fontWeight: '700',
            marginBottom: '8px',
            fontSize: '16px',
            color: '#ff6b35',
            fontFamily: "'Instrument Serif', serif",
            fontStyle: 'italic',
          }}>
            {tooltip.content.name}
          </div>
          <div style={{
            display: 'grid',
            gap: '6px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '10px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa' }}>
              <span>Capital</span>
              <span style={{ color: '#fff' }}>{tooltip.content.capital}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa' }}>
              <span>Population</span>
              <span style={{ color: '#fff' }}>{tooltip.content.population}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa' }}>
              <span>Founders</span>
              <span style={{ color: '#4ECDC4', fontWeight: '600' }}>{tooltip.content.founders}</span>
            </div>
          </div>
        </div>
      )}

      {/* Info Panel for Selected State */}
      {selectedState && indiaStatesData[selectedState] && (
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            background: 'rgba(0, 0, 0, 0.95)',
            color: '#fff',
            padding: '20px',
            borderRadius: '12px',
            maxWidth: '280px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.1)',
            zIndex: 50,
          }}
        >
          <button
            onClick={() => setSelectedState(null)}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'none',
              border: 'none',
              color: '#666',
              cursor: 'pointer',
              fontSize: '18px',
            }}
          >
            x
          </button>
          <h4 style={{
            margin: '0 0 12px 0',
            fontSize: '18px',
            color: '#ff6b35',
            fontFamily: "'Instrument Serif', serif",
            fontStyle: 'italic',
          }}>
            {indiaStatesData[selectedState].name}
          </h4>
          <div style={{
            display: 'grid',
            gap: '8px',
            fontSize: '13px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#888' }}>Capital</span>
              <span>{indiaStatesData[selectedState].capital}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#888' }}>Population</span>
              <span>{indiaStatesData[selectedState].population}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#888' }}>Founders</span>
              <span style={{ color: '#4ECDC4', fontWeight: '600' }}>
                {indiaStatesData[selectedState].founders}
              </span>
            </div>
          </div>
          <div style={{
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            fontSize: '11px',
            color: '#666',
            fontFamily: "'Space Mono', monospace",
          }}>
            {indiaStatesData[selectedState].highlight
              ? 'ACTIVE STARTUP ECOSYSTEM'
              : 'EMERGING ECOSYSTEM'}
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveIndiaMap;
