import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../../supabaseClient'; 

const EmployabilityDashboard = () => {
  const [dbData, setDbData] = useState([]);
  const [marketData, setMarketData] = useState({});
  const [selectedSKPGProgram, setSelectedSKPGProgram] = useState("OVERALL FACULTY (FSKTM)");
  const [selectedAlumniProgram, setSelectedAlumniProgram] = useState("OVERALL FACULTY (FSKTM)");
  const [selectedYear, setSelectedYear] = useState(2025); 
  const [loading, setLoading] = useState(true);

  const bachelorPrograms = [
    { value: "OVERALL FACULTY (FSKTM)", label: "Overall Faculty (All Bachelors)" },
    { value: "BACHELOR OF COMPUTER SCIENCE (DATA SCIENCE)", label: "Data Science" },
    { value: "BACHELOR OF COMPUTER SCIENCE (SOFTWARE ENGINEERING)", label: "Software Engineering" },
    { value: "BACHELOR OF COMPUTER SCIENCE (INFORMATION SYSTEMS)", label: "Information Systems" },
    { value: "BACHELOR OF COMPUTER SCIENCE (MULTIMEDIA COMPUTING)", label: "Multimedia Computing" },
    { value: "BACHELOR OF COMPUTER SCIENCE (ARTIFICIAL INTELLIGENCE)", label: "Artificial Intelligence" },
    { value: "BACHELOR OF COMPUTER SCIENCE (COMPUTER SYSTEM AND NETWORK)", label: "Computer System & Network" }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // ⚡ Rerouted to Flask for secure official stats fetching
        const res = await fetch(`http://127.0.0.1:5000/api/market/stats?year=${selectedYear}`);
        const data = await res.json();
        
        if (data.success) {
          setDbData(data.stats || []);
        }

        const mRes = await fetch('http://127.0.0.1:5000/api/market/insights');
        const mData = await mRes.json();
        if (mData.success) setMarketData(mData.insights);

      } catch (err) {
        console.error("Error fetching dashboard data:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedYear]); 

  if (loading) return <div style={{ textAlign: 'center', padding: '100px', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif", color: '#4c2882' }}><h3>Loading Career Intelligence...</h3></div>;
  
  const currentSKPGData = dbData.find(d => d.program === selectedSKPGProgram) || dbData[0] || {};
  const currentMarket = (marketData && marketData[selectedAlumniProgram?.toUpperCase()]) || { top_employers: [], top_roles: [], top_internships: [] };

  const safeTopEmployers = Array.isArray(currentMarket.top_employers) ? currentMarket.top_employers : [];
  const safeTopRoles = Array.isArray(currentMarket.top_roles) ? currentMarket.top_roles : [];
  const safeTopInternships = Array.isArray(currentMarket.top_internships) ? currentMarket.top_internships : [];

  const chartData = [
    { name: 'Employed', value: currentSKPGData.employed_pct || 0, color: '#4c2882' }, 
    { name: 'Seeking Employment', value: currentSKPGData.unemployed_pct || 0, color: '#ef4444' }, 
    { name: 'Further Studies', value: currentSKPGData.further_study_pct || 0, color: '#10b981' }, 
    { name: 'Awaiting Placement', value: currentSKPGData.waiting_placement_pct || 0, color: '#f59e0b' }, 
    { name: 'Upskilling', value: currentSKPGData.upskilling_pct || 0, color: '#3b82f6' } 
  ].filter(item => item.value > 0);

  return (
    <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh', padding: '40px 20px 80px 20px', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        
        {/* DASHBOARD HEADER */}
        <div style={{ marginBottom: '40px', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>Employability Analytics</h1>
          <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>Compare real-world alumni career trends with official government higher education statistics.</p>
        </div>

        {/* ================= SECTION 1: LIVE ALUMNI TELEMETRY ================= */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '20px', color: '#0f172a', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '10px' }}></span> Real Alumni Career Trends
            </h2>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>Live marketplace insights contributed anonymously by recent FSKTM graduates.</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 12px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#64748b', marginRight: '8px' }}>Select Major:</span>
            <select 
              value={selectedAlumniProgram}
              onChange={(e) => setSelectedAlumniProgram(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: '13px', fontWeight: '700', color: '#0f172a', cursor: 'pointer', backgroundColor: 'transparent', fontFamily: 'inherit' }}
            >
              {bachelorPrograms.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
        </div>

        {/* TELEMETRY CHARTS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '56px' }}>
            {/* Top Employers */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#475569', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Top Companies Hiring Fresh Grads</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {safeTopEmployers?.length > 0 ? safeTopEmployers.map((emp, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #4c2882' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontWeight: '800', color: '#4c2882', fontSize: '15px' }}>#{i+1}</span>
                                <span style={{ fontWeight: '700', color: '#334155', fontSize: '14px' }}>{emp.name}</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: '800', color: '#10b981', fontSize: '13px' }}>Avg RM {emp.avg_salary}</div>
                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{emp.count} Hires</div>
                            </div>
                        </div>
                    )) : <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '14px' }}>No alumni profiles submitted for this major yet.</div>}
                </div>
            </div>

            {/* Top Internships */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#475569', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Top Companies for Final Year Internships</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {safeTopInternships.length > 0 ? safeTopInternships.map((intern, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#fffbeb', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontWeight: '800', color: '#b45309', fontSize: '15px' }}>#{i+1}</span>
                                <span style={{ fontWeight: '700', color: '#78350f', fontSize: '14px' }}>{intern.name}</span>
                            </div>
                            <span style={{ background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>{intern.count} Placements</span>
                        </div>
                    )) : <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '14px' }}>No internship data submitted for this major yet.</div>}
                </div>
            </div>

            {/* Most Hired Roles */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#475569', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Most Common First Job Roles</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {safeTopRoles.length > 0 ? safeTopRoles.map((role, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ background: '#4c2882', color: 'white', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifycontent: 'center', fontSize: '11px', fontWeight: 'bold', justifyContent: 'center' }}>{i+1}</span>
                                <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '14px' }}>{role.name}</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: '800', color: '#10b981', fontSize: '13px' }}>Avg RM {role.avg_salary}</div>
                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{role.count} Grads</div>
                            </div>
                        </div>
                    )) : <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '14px' }}>No role benchmarks found for this major yet.</div>}
                </div>
            </div>
        </div>

        {/* ================= SECTION 2: OFFICIAL MOHE / SKPG STATS ================= */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '20px', color: '#0f172a', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '10px' }}></span> Ministry Graduate Statistics (SKPG)
            </h2>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>Official historical records published by the Ministry of Higher Education Malaysia.</p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#64748b', marginRight: '6px' }}>Year:</span>
              <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} style={{ border: 'none', outline: 'none', fontSize: '13px', fontWeight: '700', color: '#0f172a', cursor: 'pointer', backgroundColor: 'transparent', fontFamily: 'inherit' }}>
                {[2025, 2024, 2023].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#64748b', marginRight: '6px' }}>Academic Track:</span>
              <select value={selectedSKPGProgram} onChange={(e) => setSelectedSKPGProgram(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: '13px', fontWeight: '700', color: '#0f172a', cursor: 'pointer', backgroundColor: 'transparent', maxWidth: '320px', fontFamily: 'inherit' }}>
                {dbData.map(p => <option key={p.id} value={p.program}>{p.program}</option>)}
              </select>
            </div>
          </div>
        </div>
        
        {/* METRICS ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', borderTop: '4px solid #4c2882', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Employment Score</div>
            <p style={{ margin: 0, fontSize: '36px', fontWeight: '900', color: '#4c2882' }}>{currentSKPGData.ge_pct || 0}%</p>
            <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '6px' }}>Overall Positive Graduate Outcome</p>
          </div>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', borderTop: '4px solid #ef4444', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Unemployment Rate</div>
            <p style={{ margin: 0, fontSize: '36px', fontWeight: '900', color: '#ef4444' }}>{currentSKPGData.unemployed_pct || 0}%</p>
            <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '6px' }}>Graduates Actively Looking for Work</p>
          </div>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', borderTop: '4px solid #10b981', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Upskilling Rate</div>
            <p style={{ margin: 0, fontSize: '36px', fontWeight: '900', color: '#10b981' }}>{currentSKPGData.upskilling_pct || 0}%</p>
            <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '6px' }}>Enrolled in Further Professional Training</p>
          </div>
        </div>

        {/* BREAKDOWN BOX CONTAINER */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '36px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.01)' }}>
            <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>Detailed Status Distribution</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>Percentage spread across all official tracking categories.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {chartData.map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }}></div>
                                <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>{item.name}</span>
                            </div>
                            <span style={{ fontWeight: '800', color: '#1e293b', fontSize: '13px' }}>{item.value}%</span>
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ height: '240px', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={chartData} cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={4} dataKey="value" stroke="none">
                            {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <RechartsTooltip />
                    </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: '#4c2882' }}>{currentSKPGData.employed_pct || 0}%</div>
                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Employed</div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default EmployabilityDashboard;