import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../../supabaseClient'; 

const EmployabilityDashboard = () => {
  const [dbData, setDbData] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState("OVERALL FAKULTI (FSKTM)");
  const [selectedYear, setSelectedYear] = useState(2025); 
  const [loading, setLoading] = useState(true);

  // 1. FETCH DATA BASED ON SELECTED YEAR
  useEffect(() => {
    const fetchGeData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('faculty_ge_data')
          .select('*')
          .eq('year', selectedYear);

        if (error) throw error;
        setDbData(data || []);
      } catch (err) {
        console.error("Error fetching data:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGeData();
  }, [selectedYear]); 

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', fontFamily: 'sans-serif' }}>Loading Dashboard Data...</div>;
  if (dbData.length === 0) return <div style={{ textAlign: 'center', padding: '40px', fontFamily: 'sans-serif' }}>No data found for {selectedYear}.</div>;

  const currentData = dbData.find(d => d.program === selectedProgram) || dbData[0];

  // Data for the Donut Chart
  const chartData = [
    { name: 'Employed', value: currentData.employed_pct, color: '#4c2882' }, // UiTM Purple
    { name: 'Not Yet Employed', value: currentData.unemployed_pct, color: '#ef4444' }, // Red
    { name: 'Further Studies', value: currentData.further_study_pct, color: '#10b981' }, // Green
    { name: 'Awaiting Placement', value: currentData.waiting_placement_pct, color: '#f59e0b' }, // Yellow
    { name: 'Upskilling', value: currentData.upskilling_pct, color: '#3b82f6' } // Blue
  ].filter(item => item.value > 0); // Only show segments that have data

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontFamily: 'sans-serif' }}>
          <p style={{ fontWeight: 'bold', margin: '0 0 5px 0', color: '#1f2937' }}>{payload[0].name}</p>
          <p style={{ margin: 0, color: '#4b5563' }}>Percentage: <strong>{payload[0].value}%</strong></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh', paddingBottom: '50px', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif" }}>
      
      {/* 1. HERO BANNER (UiTM Style) */}
      <div style={{ 
        backgroundColor: '#4c2882', // Deep purple
        backgroundImage: 'linear-gradient(135deg, #4c2882 0%, #6b4c9a 100%)',
        color: 'white',
        padding: '60px 40px',
        borderBottomLeftRadius: '20px',
        borderBottomRightRadius: '20px',
        marginBottom: '40px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Circle Background */}
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '300px', height: '300px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
        
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <span style={{ backgroundColor: '#fcd34d', color: '#78350f', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px', display: 'inline-block', marginBottom: '20px' }}>
            GRADUATE EMPLOYABILITY — FSKTM UM
          </span>
          <h1 style={{ fontSize: '48px', margin: '0 0 10px 0', fontWeight: '700', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif" }}>
            Graduate<br/><span style={{ color: '#fcd34d' }}>Employability</span>
          </h1>
          <p style={{ opacity: 0.9, maxWidth: '600px', fontSize: '15px', lineHeight: '1.6', marginBottom: '30px' }}>
            Graduate employability statistics for the Faculty of Computer Science and Information Technology, Universiti Malaya. Source: SKPG Data.
          </p>
          
          {/* FILTER CONTROLS INSIDE BANNER */}
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '30px', padding: '5px 15px' }}>
              <span style={{ fontSize: '14px', marginRight: '10px' }}>📅 Year:</span>
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                style={{ backgroundColor: 'transparent', color: 'white', border: 'none', outline: 'none', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                <option value={2025} style={{ color: 'black' }}>2025</option>
                <option value={2024} style={{ color: 'black' }}>2024</option>
                <option value={2023} style={{ color: 'black' }}>2023</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '30px', padding: '5px 15px' }}>
              <span style={{ fontSize: '14px', marginRight: '10px' }}>🎓 Programme:</span>
              <select 
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                style={{ backgroundColor: 'transparent', color: 'white', border: 'none', outline: 'none', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', maxWidth: '300px', textOverflow: 'ellipsis' }}
              >
                {dbData.map((prog) => (
                  <option key={prog.id} value={prog.program} style={{ color: 'black' }}>{prog.program}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* SECTION TITLE */}
        <h2 style={{ fontSize: '20px', color: '#333', marginBottom: '20px', display: 'flex', alignItems: 'center', fontWeight: 'bold', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif" }}>
          <span style={{ marginRight: '10px', fontSize: '24px' }}>🏆</span> Key Employability Scores
        </h2>

        {/* 2. METRIC CARDS (With Colored Top Borders) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          
          {/* Card 1: GE Score */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', borderTop: '5px solid #4c2882' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>🎯</div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>GE SCORE</h3>
            <p style={{ margin: '0 0 5px 0', fontSize: '42px', fontWeight: 'bold', color: '#4c2882', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif" }}>{currentData.ge_pct}%</p>
            <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>Graduate Employability Score</p>
          </div>

          {/* Card 2: Response Rate */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', borderTop: '5px solid #fcd34d' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>📊</div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>RESPONSE RATE</h3>
            <p style={{ margin: '0 0 5px 0', fontSize: '42px', fontWeight: 'bold', color: '#b45309', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif" }}>{currentData.response_rate}%</p>
            <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>Based on {currentData.respondents} out of {currentData.graduates} graduates</p>
          </div>

          {/* Card 3: Unemployment */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', borderTop: '5px solid #ef4444' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>💼</div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>UNEMPLOYMENT RATE</h3>
            <p style={{ margin: '0 0 5px 0', fontSize: '42px', fontWeight: 'bold', color: '#16a34a', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif" }}>{currentData.unemployed_pct}%</p>
            <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>{currentData.unemployed_no} graduates currently seeking employment</p>
          </div>

        </div>

        {/* SECTION TITLE 2 */}
        <h2 style={{ fontSize: '20px', color: '#333', marginBottom: '20px', display: 'flex', alignItems: 'center', fontWeight: 'bold', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif" }}>
          <span style={{ marginRight: '10px', fontSize: '24px' }}>📊</span> Employment Status
        </h2>

        {/* 3. CHARTS SECTION */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', alignItems: 'start' }}>
          
          {/* Donut Chart Box */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '14px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>GRADUATE EMPLOYABILITY STATUS</h3>
            
            <div style={{ height: '250px', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Center Text in Donut */}
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4c2882', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif" }}>{currentData.employed_pct}%</div>
                <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase' }}>Employed</div>
              </div>
            </div>
          </div>

          {/* Legend / Breakdown List Box */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', height: '100%' }}>
            <h3 style={{ fontSize: '14px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>STATUS BREAKDOWN</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {chartData.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color, marginRight: '12px' }}></div>
                    <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 4. GLOSSARY / NOTES SECTION */}
        <h2 style={{ fontSize: '20px', color: '#333', marginTop: '50px', marginBottom: '20px', display: 'flex', alignItems: 'center', fontWeight: 'bold', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif" }}>
          <span style={{ marginRight: '10px', fontSize: '24px' }}>📝</span> Understanding the Metrics
        </h2>

        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
            
            <div>
              <h4 style={{ margin: '0 0 5px 0', color: '#374151', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>GE Score (Graduate Employability)</h4>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>The percentage of graduates who are successfully employed, furthering their studies, upskilling, or awaiting placement. It represents the overall positive outcome rate.</p>
            </div>

            <div>
              <h4 style={{ margin: '0 0 5px 0', color: '#374151', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Response Rate</h4>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>The percentage of the total graduating cohort who completed the SKPG (Kajian Pengesanan Graduan) survey.</p>
            </div>

            <div>
              <h4 style={{ margin: '0 0 5px 0', color: '#374151', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Unemployment Rate</h4>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>The percentage of respondents who are currently without a job and are actively seeking employment.</p>
            </div>

            <div>
              <h4 style={{ margin: '0 0 5px 0', color: '#374151', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Employed</h4>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>Graduates who are currently working full-time, part-time, or are self-employed/freelancing.</p>
            </div>

            <div>
              <h4 style={{ margin: '0 0 5px 0', color: '#374151', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Further Studies</h4>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>Graduates who have enrolled in postgraduate studies (Master's, PhD) or other formal academic programs.</p>
            </div>

            <div>
              <h4 style={{ margin: '0 0 5px 0', color: '#374151', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Awaiting Placement</h4>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>Graduates who have successfully secured a job offer but have not yet reached their official start date.</p>
            </div>

            <div>
              <h4 style={{ margin: '0 0 5px 0', color: '#374151', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Upskilling</h4>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>Graduates participating in short courses, professional certification programs, or bootcamps to enhance their skills.</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployabilityDashboard;