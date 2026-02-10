// ============================================================================
// FILE: src/components/dashboard/EmployabilityDashboard.jsx
// PURPOSE: Graduate Employability & Market Intelligence Dashboard
// ============================================================================

import React, { useState } from 'react';
import { styles } from '../../styles/styles';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

const EmployabilityDashboard = ({ onBack }) => {
  const [yearFilter, setYearFilter] = useState('2024');
  const [programFilter, setProgramFilter] = useState('All Programs');

  // --- MOCK DATA (Simulating SKPG / Tracer Study Data) ---
  const employmentStatusData = [
    { name: 'Employed (Field)', value: 72 },
    { name: 'Employed (Non-Field)', value: 12 },
    { name: 'Further Study', value: 8 },
    { name: 'Seeking Employment', value: 8 },
  ];

  const topEmployersData = [
    { name: 'Shopee', count: 42, color: '#ee4d2d' },
    { name: 'Grab', count: 35, color: '#00b14f' },
    { name: 'Maybank', count: 28, color: '#ffcf00' },
    { name: 'Petronas', count: 24, color: '#00a19c' },
    { name: 'Intel', count: 20, color: '#0071c5' },
    { name: 'Tiktok', count: 18, color: '#000000' },
  ];

  const salaryTrendData = [
    { year: '2020', salary: 2800 },
    { year: '2021', salary: 3000 },
    { year: '2022', salary: 3200 },
    { year: '2023', salary: 3500 },
    { year: '2024', salary: 3800 },
  ];

  const topRoles = [
    { role: "Software Engineer", percentage: "35%" },
    { role: "Data Analyst", percentage: "20%" },
    { role: "System Analyst", percentage: "15%" },
    { role: "UI/UX Designer", percentage: "10%" },
    { role: "Network Engineer", percentage: "10%" },
  ];

  const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444']; // Green, Yellow, Blue, Red

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* HEADER WITH BACK BUTTON */}
      <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button onClick={onBack} style={styles.secondaryButton}>← Back to Home</button>
        <div>
          <h1 style={{ fontSize: '28px', color: '#111827', margin: 0 }}>Graduate Employability Intelligence</h1>
          <p style={{ color: '#6b7280', margin: 0 }}>Real-time insights into FCSIT graduate outcomes.</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div style={{ 
          background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', 
          marginBottom: '30px', display: 'flex', gap: '20px', alignItems: 'center' 
      }}>
        <span style={{fontWeight: '600', color: '#374151'}}>Filter Statistics:</span>
        <select 
            value={yearFilter} 
            onChange={(e) => setYearFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}
        >
            <option value="2025">2025 (Projected)</option>
            <option value="2024">2024 (Actual)</option>
            <option value="2023">2023 (Historical)</option>
        </select>
        <select 
            value={programFilter} 
            onChange={(e) => setProgramFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}
        >
            <option>All Programs</option>
            <option>Software Engineering</option>
            <option>Artificial Intelligence</option>
            <option>Information Systems</option>
            <option>Data Science</option>
        </select>
      </div>

      {/* KEY METRICS ROW */}
      <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={{...styles.statNumber, color: '#10b981'}}>92%</div>
            <div style={styles.statLabel}>Employment Rate</div>
          </div>
          <div style={styles.statCard}>
            <div style={{...styles.statNumber, color: '#3b82f6'}}>RM 3,800</div>
            <div style={styles.statLabel}>Avg Starting Salary</div>
          </div>
          <div style={styles.statCard}>
            <div style={{...styles.statNumber, color: '#8b5cf6'}}>3 Months</div>
            <div style={styles.statLabel}>Avg Time to Hire</div>
          </div>
      </div>

      {/* CHARTS GRID */}
      <div style={styles.chartsGrid}>
        
        {/* CHART 1: Employment Status */}
        <div style={styles.chartContainer}>
            <h3 style={styles.chartTitle}>Graduate Status ({yearFilter})</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie 
                        data={employmentStatusData} 
                        cx="50%" cy="50%" 
                        outerRadius={100} 
                        fill="#8884d8" 
                        dataKey="value" 
                        label={({name, percent}) => `${(percent * 100).toFixed(0)}%`}
                    >
                        {employmentStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>

        {/* CHART 2: Top Employers */}
        <div style={styles.chartContainer}>
            <h3 style={styles.chartTitle}>Top Hiring Partners</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topEmployersData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={80} style={{fontWeight: 'bold'}} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="count" fill="#4F46E5" radius={[0, 4, 4, 0]} barSize={20} name="Graduates Hired">
                         {topEmployersData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || '#4F46E5'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>

        {/* CHART 3: Salary Trend */}
        <div style={styles.chartContainer}>
             <h3 style={styles.chartTitle}>Starting Salary Trend (MYR)</h3>
             <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={salaryTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="salary" stroke="#10b981" fill="#ecfdf5" />
                </AreaChart>
             </ResponsiveContainer>
        </div>

        {/* TABLE: Top Job Roles */}
        <div style={styles.chartContainer}>
            <h3 style={styles.chartTitle}>Most In-Demand Job Roles</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
                {topRoles.map((item, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ 
                                width: '30px', height: '30px', borderRadius: '50%', background: '#F3F4F6', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#6B7280' 
                            }}>
                                {index + 1}
                            </div>
                            <span style={{ fontWeight: '600', color: '#374151' }}>{item.role}</span>
                        </div>
                        <span style={{ 
                            background: '#EFF6FF', color: '#3B82F6', padding: '4px 10px', 
                            borderRadius: '20px', fontSize: '12px', fontWeight: '700' 
                        }}>
                            {item.percentage}
                        </span>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default EmployabilityDashboard;