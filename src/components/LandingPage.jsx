// ============================================================================
// FILE: src/components/LandingPage.jsx
// PURPOSE: Professional Landing Page with Navbar, Centered Cards & FOMO Copy
// ============================================================================

import React from 'react';
import futurePathLogo from '../assets/futurepath_logo_traced.svg';

const LandingPage = ({ onLoginClick, onRegisterClick }) => {
  // Brand Colors
  const umBlue = '#1e3a8a';
  const fpPurple = '#4c2882';
  const umGold = '#fbbf24';

  return (
    <div style={{ backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif" }}>
      
      {/* --- HERO SECTION --- */}
      <div style={{ 
          background: `linear-gradient(135deg, ${umBlue} 0%, ${fpPurple} 100%)`, 
          padding: '30px 40px 100px 40px',
          textAlign: 'center',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
      }}>
        {/* Decorative Background Elements */}
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(251,191,36,0.1) 0%, transparent 70%)', borderRadius: '50%' }}></div>

        {/* ⚡ RESTORED NAVBAR WITH LOGO (Filter Removed) ⚡ */}
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10, marginBottom: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img 
              src={futurePathLogo} 
              alt="FuturePath Logo" 
              style={{ width: '32px', height: 'auto' }} 
            />
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', letterSpacing: '0.5px' }}>
              <span style={{ color: 'white' }}>Future</span>
              <span style={{ color: umGold }}>Path</span>
            </h1>
          </div>
        </nav>

        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          
          {/* Beautiful White Container for the Local SVG Logo (Hero Center) */}
          <div style={{ 
              width: '80px', height: '80px', backgroundColor: 'white', borderRadius: '20px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              margin: '0 auto 30px auto', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <img src={futurePathLogo} alt="FuturePath Logo" style={{ height: '45px', width: 'auto' }} />
          </div>
          
          <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px', lineHeight: '1.2', letterSpacing: '-0.5px' }}>
            Bridge the Gap Between <span style={{ color: umGold }}>Academia</span> and <span style={{ color: umGold }}>Industry</span>
          </h1>
          
          <p style={{ fontSize: '18px', color: '#e0e7ff', marginBottom: '40px', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto 40px auto' }}>
            FuturePath is an AI-powered career navigator designed to equip university students with industry-verified skills and connect them directly with alumni mentors.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
            <button 
              onClick={() => onRegisterClick('student')} 
              style={{ backgroundColor: umGold, color: '#111827', padding: '16px 32px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', border: 'none', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', transition: 'transform 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Get Started for Free
            </button>
            <button 
              onClick={onLoginClick} 
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', padding: '16px 32px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            >
              Log In
            </button>
          </div>
        </div>
      </div>

      {/* --- FOMO-DRIVEN SYSTEM CAPABILITIES --- */}
      <div style={{ maxWidth: '1200px', margin: '-40px auto 60px auto', padding: '0 20px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          
          <div style={{ backgroundColor: 'white', padding: '40px 30px', borderRadius: '20px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', backgroundColor: '#eff6ff', color: umBlue, width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', margin: '0 auto 20px auto' }}>🧭</div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '15px' }}>Stop Guessing Your Career Path</h3>
            <p style={{ color: '#475569', lineHeight: '1.6', fontSize: '15px', margin: 0 }}>
              While others blindly apply to jobs with generic resumes, our AI maps out the exact, verified skills top tech companies are actively hiring for right now. Don't get left behind—earn the Capstone certifications that guarantee you stand out.
            </p>
          </div>

          <div style={{ backgroundColor: 'white', padding: '40px 30px', borderRadius: '20px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', backgroundColor: '#f3e8ff', color: fpPurple, width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', margin: '0 auto 20px auto' }}>💎</div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '15px' }}>Never Negotiate Blind Again</h3>
            <p style={{ color: '#475569', lineHeight: '1.6', fontSize: '15px', margin: 0 }}>
              Stop relying on rumors. Access live, confidential data on exact starting salaries, top hiring employers, and department-specific benchmarks for your exact major. Know your worth and secure the best offers while others settle for less.
            </p>
          </div>

          <div style={{ backgroundColor: 'white', padding: '40px 30px', borderRadius: '20px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', backgroundColor: '#fef3c7', color: umGold, width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', margin: '0 auto 20px auto' }}>🗝️</div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '15px' }}>Unlock the Hidden Job Market</h3>
            <p style={{ color: '#475569', lineHeight: '1.6', fontSize: '15px', margin: 0 }}>
              Access exclusive, unlisted internships and roles posted directly by successful alumni before they hit public boards. For alumni: this is your chance to build a powerful legacy and recruit top-tier talent before your competitors do.
            </p>
          </div>

        </div>
      </div>

      {/* --- CALL TO ACTION (Side-by-Side) --- */}
      <div style={{ maxWidth: '800px', margin: '0 auto 80px auto', padding: '0 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', marginBottom: '40px' }}>Choose Your Path</h2>
        
        {/* ⚡ Used Flexbox to force them side-by-side ⚡ */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          
          <div 
            onClick={() => onRegisterClick('student')}
            style={{ flex: '1', minWidth: '280px', maxWidth: '380px', backgroundColor: 'white', padding: '30px', borderRadius: '16px', border: '2px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = umBlue}
            onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
          >
            <div style={{ fontSize: '40px', marginBottom: '15px' }}>🎓</div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px 0' }}>I am a Student</h3>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Gain the unfair advantage to secure your career.</p>
          </div>

          <div 
            onClick={() => onRegisterClick('alumni')}
            style={{ flex: '1', minWidth: '280px', maxWidth: '380px', backgroundColor: 'white', padding: '30px', borderRadius: '16px', border: '2px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = fpPurple}
            onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
          >
            <div style={{ fontSize: '40px', marginBottom: '15px' }}>💼</div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px 0' }}>I am an Alumni</h3>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Recruit top talent and mentor the next generation.</p>
          </div>

        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer style={{ textAlign: 'center', padding: '40px', borderTop: '1px solid #e2e8f0', backgroundColor: 'white', color: '#94a3b8', marginTop: 'auto' }}>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>© {new Date().getFullYear()} FuturePath. Faculty of Computer Science & Information Technology, UM.</p>
      </footer>
    </div>
  );
};

export default LandingPage; 