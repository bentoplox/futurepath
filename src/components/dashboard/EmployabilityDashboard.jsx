import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../../supabaseClient'; 

const EmployabilityDashboard = () => {
  const [dbData, setDbData] = useState([]);
  const [marketData, setMarketData] = useState({ top_employers: [], top_roles: [] });
  const [selectedProgram, setSelectedProgram] = useState("OVERALL FAKULTI (FSKTM)");
  const [selectedYear, setSelectedYear] = useState(2025); 
  const [loading, setLoading] = useState(true);

  // 1. FETCH DATA BASED ON SELECTED YEAR & MARKET INSIGHTS
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: geData, error: geError } = await supabase
          .from('faculty_ge_data')
          .select('*')
          .eq('year', selectedYear);

        if (geError) throw geError;
        setDbData(geData || []);

        // ⚡ FETCH ALUMNI MARKET INSIGHTS
        const mRes = await fetch('http://127.0.0.1:5000/api/market/insights');
        const mData = await mRes.json();
        if (mData.success) setMarketData(mData);

      } catch (err) {
        console.error("Error fetching dashboard data:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear]); 

  if (loading) return <div style={{ textAlign: 'center', padding: '100px', fontFamily: 'Aeonik, sans-serif', color: '#4c2882' }}><h3>Loading Career Intelligence...</h3></div>;
  
  const currentData = dbData.find(d => d.program === selectedProgram) || dbData[0] || {};

  // Data for the Donut Chart (GE Status)
  const chartData = [
    { name: 'Employed', value: currentData.employed_pct || 0, color: '#4c2882' }, 
    { name: 'Seeking Employment', value: currentData.unemployed_pct || 0, color: '#ef4444' }, 
    { name: 'Further Studies', value: currentData.further_study_pct || 0, color: '#10b981' }, 
    { name: 'Awaiting Placement', value: currentData.waiting_placement_pct || 0, color: '#f59e0b' }, 
    { name: 'Upskilling', value: currentData.upskilling_pct || 0, color: '#3b82f6' } 
  ].filter(item => item.value > 0);

  return (
    <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh', paddingBottom: '50px', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif", margin: '-30px' }}>
      
      {/* 1. HERO BANNER */}
      <div style={{ 
        backgroundColor: '#4c2882',
        backgroundImage: 'linear-gradient(135deg, #4c2882 0%, #6b4c9a 100%)',
        color: 'white',
        padding: '60px 40px',
        borderBottomLeftRadius: '20px',
        borderBottomRightRadius: '20px',
        marginBottom: '40px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '300px', height: '300px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
        
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <span style={{ backgroundColor: '#fcd34d', color: '#78350f', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px', display: 'inline-block', marginBottom: '20px' }}>
            CAREER INTELLIGENCE — FSKTM UM
          </span>
          <h1 style={{ fontSize: '48px', margin: '0 0 10px 0', fontWeight: '700' }}>
            Market<br/><span style={{ color: '#fcd34d' }}>Intelligence</span>
          </h1>
          <p style={{ opacity: 0.9, maxWidth: '600px', fontSize: '15px', lineHeight: '1.6', marginBottom: '30px' }}>
            Real-time hiring trends and employability statistics powered by the Universiti Malaya Alumni Network and SKPG Data.
          </p>
          
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '30px', padding: '5px 15px' }}>
              <span style={{ fontSize: '14px', marginRight: '10px' }}>📅 Data Year:</span>
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                style={{ backgroundColor: 'transparent', color: 'white', border: 'none', outline: 'none', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {[2025, 2024, 2023].map(y => <option key={y} value={y} style={{ color: 'black' }}>{y}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '30px', padding: '5px 15px' }}>
              <span style={{ fontSize: '14px', marginRight: '10px' }}>🎓 Program:</span>
              <select 
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                style={{ backgroundColor: 'transparent', color: 'white', border: 'none', outline: 'none', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', maxWidth: '300px' }}
              >
                {dbData.map(p => <option key={p.id} value={p.program} style={{ color: 'black' }}>{p.program}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* === SECTION 1: LIVE ALUMNI HIRING TRENDS === */}
        <h2 style={{ fontSize: '22px', color: '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center', fontWeight: '800' }}>
          <span style={{ marginRight: '12px', fontSize: '28px' }}>🚀</span> Live Hiring Trends (Alumni Feed)
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '30px', marginBottom: '60px' }}>
            {/* Pie Chart: Top Employers */}
            <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '35px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #f3f4f6' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#64748b', marginBottom: '30px', textTransform: 'uppercase', letterSpacing: '1px' }}>Top 5 Hiring Tech Employers</h3>
                {marketData.top_employers.length > 0 ? (
                    <div style={{ height: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <ResponsiveContainer width="100%" height="80%">
                            <PieChart>
                                <Pie data={marketData.top_employers} innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value">
                                    {marketData.top_employers.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#4c2882', '#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd'][index % 5]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', width: '100%', marginTop: '20px' }}>
                            {marketData.top_employers.map((e, i) => (
                                <div key={i} style={{ fontSize: '12px', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: ['#4c2882', '#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd'][i % 5] }}></div>
                                    <strong style={{ color: '#4c2882' }}>{e.value}</strong> {e.name}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>Waiting for alumni to disclose employer data...</div>}
            </div>

            {/* Leaderboard: Top Job Roles */}
            <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '35px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #f3f4f6' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#64748b', marginBottom: '30px', textTransform: 'uppercase', letterSpacing: '1px' }}>Most Hired Job Roles</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {marketData.top_roles.length > 0 ? marketData.top_roles.map((role, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9', transition: 'transform 0.2s' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <span style={{ background: '#4c2882', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>{i+1}</span>
                                <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '15px' }}>{role.name}</span>
                            </div>
                            <span style={{ color: '#4c2882', fontWeight: '800', fontSize: '14px' }}>{role.count} Graduates</span>
                        </div>
                    )) : <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>Waiting for alumni contributions...</div>}
                </div>
            </div>
        </div>

        {/* === SECTION 2: OFFICIAL SKPG STATISTICS === */}
        <h2 style={{ fontSize: '22px', color: '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center', fontWeight: '800' }}>
            <span style={{ marginRight: '12px', fontSize: '28px' }}>🏆</span> Official SKPG Benchmarks
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px', marginBottom: '40px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '35px', textAlign: 'center', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', borderTop: '6px solid #4c2882' }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>GE Score</div>
            <p style={{ margin: 0, fontSize: '48px', fontWeight: '900', color: '#4c2882' }}>{currentData.ge_pct || 0}%</p>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '10px' }}>Positive Graduate Outcome</p>
          </div>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '35px', textAlign: 'center', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', borderTop: '6px solid #fcd34d' }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>Unemployment</div>
            <p style={{ margin: 0, fontSize: '48px', fontWeight: '900', color: '#ef4444' }}>{currentData.unemployed_pct || 0}%</p>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '10px' }}>Graduates Seeking Jobs</p>
          </div>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '35px', textAlign: 'center', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', borderTop: '6px solid #10b981' }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>Upskilling Rate</div>
            <p style={{ margin: 0, fontSize: '48px', fontWeight: '900', color: '#10b981' }}>{currentData.upskilling_pct || 0}%</p>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '10px' }}>In Certification Programs</p>
          </div>
        </div>

        {/* Breakdown Box */}
        <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
            <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '10px' }}>Employment Status Breakdown</h3>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '30px' }}>Percentage distribution of {selectedYear} graduates across all outcome categories.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {chartData.map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: item.color }}></div>
                                <span style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>{item.name}</span>
                            </div>
                            <span style={{ fontWeight: '800', color: '#1e293b' }}>{item.value}%</span>
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={chartData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={4} dataKey="value" stroke="none">
                            {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <RechartsTooltip />
                    </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'relative', top: '-170px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: '#4c2882' }}>{currentData.employed_pct}%</div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Employed</div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EmployabilityDashboard;
