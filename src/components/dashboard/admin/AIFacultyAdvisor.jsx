import React, { useState } from 'react';

const AIFacultyAdvisor = ({ recommendations, setRecommendations }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('http://127.0.0.1:5000/api/admin/ai-workshop-recommendations');
      const data = await res.json();
      if (data.success) {
        setRecommendations(data.recommendations);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const umBlue = '#1e3a8a';
  const umLightBlue = '#2563eb';

  const downloadReport = () => {
    if (!recommendations || recommendations.length === 0) return;
    
    const reportWindow = window.open('', '_blank');
    const today = new Date().toLocaleDateString();

    const reportHtml = `
      <html>
        <head>
          <title>FuturePath AI Advisor Report</title>
          <style>
            body { font-family: 'Aeonik', 'Segoe UI', sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            .header { border-bottom: 3px solid #1e3a8a; padding-bottom: 20px; marginBottom: 40px; display: flex; justify-content: space-between; align-items: flex-end; }
            .logo { font-size: 24px; fontWeight: 900; color: #1e3a8a; }
            .meta { text-align: right; font-size: 14px; color: #64748b; }
            h1 { margin: 0; font-size: 28px; }
            .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin-bottom: 25px; page-break-inside: avoid; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-bottom: 10px; }
            .high { background: #fee2e2; color: #991b1b; }
            .medium { background: #ffedd5; color: #9a3412; }
            .title { font-size: 20px; font-weight: 800; color: #1e3a8a; margin: 0 0 10px 0; }
            .track { font-weight: 700; color: #64748b; font-size: 14px; margin-bottom: 15px; }
            .justification { font-style: italic; color: #475569; margin-bottom: 20px; }
            .agenda-box { background: white; padding: 15px; border-radius: 8px; border: 1px solid #edf2f7; }
            .agenda-title { font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 10px; }
            ul { margin: 0; padding-left: 20px; }
            li { margin-bottom: 5px; font-size: 14px; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">FUTUREPATH</div>
              <h1>AI Curriculum Intervention Report</h1>
            </div>
            <div class="meta">
              Generated on: ${today}<br>
              Target Institution: FSKTM Universiti Malaya
            </div>
          </div>

          <p style="margin: 30px 0;">This report summarizes AI-driven interventions based on live cohort telemetry and qualitative student feedback. The following 9 workshops and hackathons are recommended for immediate scheduling.</p>

          ${recommendations.map((rec, idx) => `
            <div class="card">
              <div class="badge ${rec.urgency_level.toLowerCase()}">${rec.urgency_level} Urgency</div>
              <div class="title">${idx + 1}. ${rec.title}</div>
              <div class="track">📍 Target Track: ${rec.target_track}</div>
              <div class="justification">"${rec.justification}"</div>
              <div class="agenda-box">
                <div class="agenda-title">Proposed Learning Agenda</div>
                <ul>
                  ${rec.agenda.map(item => `<li>${item}</li>`).join('')}
                </ul>
              </div>
            </div>
          `).join('')}

          <div class="footer">
            &copy; 2026 FuturePath Intelligent Career Systems. All rights reserved.
          </div>
          
          <div class="no-print" style="position: fixed; top: 20px; right: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #1e3a8a; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">🖨️ Print / Save as PDF</button>
          </div>
        </body>
      </html>
    `;

    reportWindow.document.write(reportHtml);
    reportWindow.document.close();
  };

  if (loading) {
    return (
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '16px', 
        padding: '30px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        marginBottom: '30px',
        border: '1px solid #e5e7eb',
        fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif"
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f3f4f6', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
          <div style={{ height: '24px', width: '300px', backgroundColor: '#f3f4f6', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: '200px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #f3f4f6', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
          ))}
        </div>
        <p style={{ textAlign: 'center', marginTop: '20px', color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>
          ✨ AI Engine is analyzing cohort telemetry data...
        </p>
        <style>
          {`
            @keyframes pulse {
              0% { opacity: 1; }
              50% { opacity: 0.5; }
              100% { opacity: 1; }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '16px', 
      padding: '30px', 
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      marginBottom: '30px',
      border: '1px solid #e5e7eb',
      fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background element */}
      <div style={{ 
        position: 'absolute', 
        top: '-20px', 
        right: '-20px', 
        width: '100px', 
        height: '100px', 
        background: `radial-gradient(circle, ${umLightBlue}15 0%, transparent 70%)`,
        borderRadius: '50%'
      }}></div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: recommendations.length > 0 ? '25px' : '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: recommendations.length > 0 ? '28px' : '32px' }}>✨</span>
          <div>
            <h3 style={{ margin: 0, fontSize: recommendations.length > 0 ? '20px' : '22px', fontWeight: '800', color: '#111827' }}>
              AI Faculty Curriculum Advisor
            </h3>
            {recommendations.length > 0 && (
                <span style={{ color: umLightBlue, fontSize: '14px', fontWeight: '600' }}>Live Intervention Insights</span>
            )}
          </div>
        </div>
        {recommendations.length > 0 && (
            <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                    onClick={downloadReport}
                    style={{ 
                        background: '#f8fafc', 
                        border: '1px solid #e2e8f0', 
                        padding: '8px 16px', 
                        borderRadius: '10px', 
                        fontSize: '13px', 
                        fontWeight: '700', 
                        color: '#475569',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    📥 Download Report
                </button>
                <button 
                    onClick={fetchRecommendations}
                    style={{ 
                        background: '#f8fafc', 
                        border: '1px solid #e2e8f0', 
                        padding: '8px 16px', 
                        borderRadius: '10px', 
                        fontSize: '13px', 
                        fontWeight: '700', 
                        color: umBlue,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    🔄 Refresh Analysis
                </button>
            </div>
        )}
      </div>

      {error && (
        <div style={{ padding: '15px', backgroundColor: '#fef2f2', color: '#991b1b', borderRadius: '10px', marginTop: '20px', fontSize: '14px', border: '1px solid #fee2e2' }}>
          ⚠️ AI Advisor Error: {error}
        </div>
      )}

      {recommendations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.6', maxWidth: '500px', margin: '0 auto 25px auto' }}>
            Analyze current cohort performance data and qualitative feedback to receive AI-powered university workshop recommendations.
          </p>
          <button 
            onClick={fetchRecommendations}
            style={{ 
                backgroundColor: umBlue,
                color: 'white',
                border: 'none',
                padding: '14px 32px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: `0 4px 14px 0 ${umBlue}40`,
                transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            🔍 Analyze Cohort & Generate Insights
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', marginTop: '10px' }}>
          {recommendations.map((rec, index) => (
            <div 
              key={index} 
              style={{ 
                padding: '24px', 
                borderRadius: '14px', 
                border: '1px solid #f1f5f9', 
                background: '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'default'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.05)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ 
                  backgroundColor: rec.urgency_level === 'High' ? '#fef2f2' : '#fff7ed',
                  color: rec.urgency_level === 'High' ? '#991b1b' : '#9a3412',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  border: `1px solid ${rec.urgency_level === 'High' ? '#991b1b' : '#9a3412'}30`
                }}>
                  {rec.urgency_level} Urgency
                </span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>
                  📍 {rec.target_track}
                </span>
              </div>

              <h4 style={{ margin: '5px 0 0 0', fontSize: '17px', fontWeight: '800', color: umBlue, lineHeight: '1.3' }}>
                {rec.title}
              </h4>

              <p style={{ margin: 0, fontSize: '13px', color: '#4b5563', lineHeight: '1.5', fontStyle: 'italic' }}>
                "{rec.justification}"
              </p>

              <div style={{ marginTop: '10px', background: 'white', padding: '15px', borderRadius: '10px', border: '1px solid #edf2f7' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Proposed Agenda</div>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {rec.agenda.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIFacultyAdvisor;
