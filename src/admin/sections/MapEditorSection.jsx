import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

// Default India states data (same as InteractiveMap)
const defaultStatesData = {
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
  'IN-TG': { name: 'Telangana', capital: 'Hyderabad', population: '39M', founders: 42, highlight: true, isHome: true },
  'IN-TN': { name: 'Tamil Nadu', capital: 'Chennai', population: '77M', founders: 38, highlight: true },
  'IN-TR': { name: 'Tripura', capital: 'Agartala', population: '4M', founders: 3, highlight: false },
  'IN-UP': { name: 'Uttar Pradesh', capital: 'Lucknow', population: '241M', founders: 45, highlight: true },
  'IN-UT': { name: 'Uttarakhand', capital: 'Dehradun', population: '11M', founders: 8, highlight: false },
  'IN-WB': { name: 'West Bengal', capital: 'Kolkata', population: '100M', founders: 31, highlight: true },
};

const MapEditorSection = () => {
  const [states, setStates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [editingState, setEditingState] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const theme = {
    bg: '#0a0a0a',
    surface: '#141414',
    border: 'rgba(255,255,255,0.1)',
    text: '#ffffff',
    textMuted: '#888888',
    accent: '#C4785A',
    teal: '#4ECDC4',
    danger: '#FF6B6B',
  };

  useEffect(() => {
    fetchMapData();
  }, []);

  const fetchMapData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('map_data')
        .select('*')
        .order('state_name', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setStates(data);
      } else {
        // Use default data if no data in database
        const defaultStates = Object.entries(defaultStatesData).map(([code, info]) => ({
          state_code: code,
          state_name: info.name,
          capital: info.capital,
          population: info.population,
          founders_count: info.founders,
          is_highlighted: info.highlight,
          is_home: info.isHome || false,
        }));
        setStates(defaultStates);
      }
    } catch (error) {
      console.log('Map data table may not exist yet, using defaults:', error);
      const defaultStates = Object.entries(defaultStatesData).map(([code, info]) => ({
        state_code: code,
        state_name: info.name,
        capital: info.capital,
        population: info.population,
        founders_count: info.founders,
        is_highlighted: info.highlight,
        is_home: info.isHome || false,
      }));
      setStates(defaultStates);
    } finally {
      setIsLoading(false);
    }
  };

  const updateState = (stateCode, field, value) => {
    setStates(states.map(s =>
      s.state_code === stateCode ? { ...s, [field]: value } : s
    ));
    setHasChanges(true);
  };

  const setHomeState = (stateCode) => {
    setStates(states.map(s => ({
      ...s,
      is_home: s.state_code === stateCode,
    })));
    setHasChanges(true);
  };

  const saveChanges = async () => {
    try {
      // Delete existing data and insert fresh
      await supabase.from('map_data').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      const { error } = await supabase.from('map_data').insert(
        states.map(s => ({
          state_code: s.state_code,
          state_name: s.state_name,
          capital: s.capital,
          population: s.population,
          founders_count: s.founders_count,
          is_highlighted: s.is_highlighted,
          is_home: s.is_home,
          custom_notes: s.custom_notes || null,
        }))
      );

      if (error) throw error;
      setHasChanges(false);
      alert('Map data saved successfully!');
    } catch (error) {
      console.error('Error saving map data:', error);
      alert('Error saving map data. Make sure the map_data table exists in Supabase.');
    }
  };

  const filteredStates = states.filter(s =>
    s.state_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.state_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalFounders = states.reduce((sum, s) => sum + (s.founders_count || 0), 0);
  const highlightedCount = states.filter(s => s.is_highlighted).length;
  const homeState = states.find(s => s.is_home);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
        color: theme.textMuted,
        fontFamily: "'Space Mono', monospace",
      }}>
        Loading map data...
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h1 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: '24px',
            fontStyle: 'italic',
            color: theme.text,
            margin: '0 0 4px 0',
          }}>
            Map Editor
          </h1>
          <p style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '12px',
            color: theme.textMuted,
            margin: 0,
          }}>
            Edit founder counts and ecosystem highlights for each state
          </p>
        </div>
        <button
          onClick={saveChanges}
          disabled={!hasChanges}
          style={{
            background: hasChanges ? theme.accent : theme.surface,
            color: hasChanges ? theme.bg : theme.textMuted,
            border: `1px solid ${hasChanges ? theme.accent : theme.border}`,
            borderRadius: '6px',
            padding: '10px 20px',
            fontFamily: "'Space Mono', monospace",
            fontSize: '12px',
            cursor: hasChanges ? 'pointer' : 'not-allowed',
            letterSpacing: '1px',
          }}
        >
          {hasChanges ? 'SAVE CHANGES' : 'NO CHANGES'}
        </button>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px',
        marginBottom: '24px',
      }}>
        <div style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: '8px',
          padding: '16px',
        }}>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '10px',
            color: theme.textMuted,
            letterSpacing: '1px',
            marginBottom: '4px',
          }}>
            TOTAL FOUNDERS
          </div>
          <div style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: '24px',
            color: theme.accent,
            fontStyle: 'italic',
          }}>
            {totalFounders}
          </div>
        </div>
        <div style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: '8px',
          padding: '16px',
        }}>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '10px',
            color: theme.textMuted,
            letterSpacing: '1px',
            marginBottom: '4px',
          }}>
            ACTIVE ECOSYSTEMS
          </div>
          <div style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: '24px',
            color: theme.teal,
            fontStyle: 'italic',
          }}>
            {highlightedCount}
          </div>
        </div>
        <div style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: '8px',
          padding: '16px',
        }}>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '10px',
            color: theme.textMuted,
            letterSpacing: '1px',
            marginBottom: '4px',
          }}>
            HOME STATE
          </div>
          <div style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: '18px',
            color: theme.text,
            fontStyle: 'italic',
          }}>
            {homeState?.state_name || 'Not set'}
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search states..."
          style={{
            width: '100%',
            maxWidth: '300px',
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: '6px',
            padding: '10px 14px',
            color: theme.text,
            fontFamily: "'Space Mono', monospace",
            fontSize: '13px',
          }}
        />
      </div>

      {/* States Table */}
      <div style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${theme.border}` }}>
              <th style={{
                padding: '14px 16px',
                textAlign: 'left',
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                color: theme.textMuted,
                letterSpacing: '1px',
                fontWeight: '500',
              }}>
                STATE
              </th>
              <th style={{
                padding: '14px 16px',
                textAlign: 'center',
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                color: theme.textMuted,
                letterSpacing: '1px',
                fontWeight: '500',
              }}>
                FOUNDERS
              </th>
              <th style={{
                padding: '14px 16px',
                textAlign: 'center',
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                color: theme.textMuted,
                letterSpacing: '1px',
                fontWeight: '500',
              }}>
                HIGHLIGHTED
              </th>
              <th style={{
                padding: '14px 16px',
                textAlign: 'center',
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                color: theme.textMuted,
                letterSpacing: '1px',
                fontWeight: '500',
              }}>
                HOME
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredStates.map((state, index) => (
              <tr
                key={state.state_code}
                style={{
                  borderBottom: index < filteredStates.length - 1 ? `1px solid ${theme.border}` : 'none',
                  background: state.is_home ? 'rgba(78, 205, 196, 0.1)' : 'transparent',
                }}
              >
                <td style={{
                  padding: '12px 16px',
                }}>
                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '13px',
                    color: theme.text,
                  }}>
                    {state.state_name}
                  </div>
                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '10px',
                    color: theme.textMuted,
                  }}>
                    {state.capital} • {state.population}
                  </div>
                </td>
                <td style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                }}>
                  <input
                    type="number"
                    min="0"
                    value={state.founders_count || 0}
                    onChange={(e) => updateState(state.state_code, 'founders_count', parseInt(e.target.value) || 0)}
                    style={{
                      width: '60px',
                      background: theme.bg,
                      border: `1px solid ${theme.border}`,
                      borderRadius: '4px',
                      padding: '6px 8px',
                      color: theme.text,
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '13px',
                      textAlign: 'center',
                    }}
                  />
                </td>
                <td style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                }}>
                  <input
                    type="checkbox"
                    checked={state.is_highlighted || false}
                    onChange={(e) => updateState(state.state_code, 'is_highlighted', e.target.checked)}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                    }}
                  />
                </td>
                <td style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                }}>
                  <input
                    type="radio"
                    name="homeState"
                    checked={state.is_home || false}
                    onChange={() => setHomeState(state.state_code)}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MapEditorSection;
