// ============================================================================
// FILE: src/components/LandingPage.jsx
// PURPOSE: Landing Page with Premium UM Blue & FuturePath Purple Blended UI
// ============================================================================

import React from 'react';
import { styles } from '../styles/styles';

const LandingPage = ({ onLoginClick, onRegisterClick }) => {
  
  // Brand Colors
  const umBlue = '#1e3a8a';
  const fpPurple = '#4c2882';
  const umGold = '#fbbf24';

  return (
    <div style={{...styles.appContainer, backgroundColor: '#f9f9f9', display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", sans-serif'}}>
      
      {/* --- HERO WRAPPER (Seamless Gradient) --- */}
      <div style={{ 
          background: `linear-gradient(135deg, ${umBlue} 0%, ${fpPurple} 100%)`, 
          borderBottomLeftRadius: '30px', 
          borderBottomRightRadius: '30px',
          paddingBottom: '80px',
          position: 'relative',
          overflow: 'hidden'
      }}>
          
        {/* Decorative Background Elements */}
        <div style={{ position: 'absolute', top: '-100px', right: '-50px', width: '400px', height: '400px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '200px', height: '200px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>

        {/* --- NAVBAR (Glassmorphism over Gradient) --- */}
        <nav style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 40px',
          position: 'relative',
          zIndex: 10
        }}>
          {/* Custom SVG Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill={umGold} stroke={umGold} strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', letterSpacing: '0.5px' }}>
              <span style={{ color: 'white' }}>Future</span>
              <span style={{ color: umGold }}>Path</span>
            </h1>
          </div>
          <div>
            <button 
              onClick={onLoginClick}
              style={{
                  backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', 
                  padding: '10px 24px', borderRadius: '30px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s', backdropFilter: 'blur(10px)'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
            >
              Log In
            </button>
          </div>
        </nav>

        {/* --- HERO SECTION --- */}
        <header style={{ textAlign: 'center', padding: '60px 20px', position: 'relative', zIndex: 10 }}>
          <span style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: umGold, border: `1px solid rgba(251, 191, 36, 0.3)`, padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px', display: 'inline-block', marginBottom: '25px', backdropFilter: 'blur(5px)' }}>
            UNIVERSITI MALAYA • FSKTM
          </span>
          <h1 style={{ fontSize: '48px', marginBottom: '20px', color: 'white', fontWeight: '800', fontFamily: 'Georgia, serif' }}>
            Shape Your <span style={{color: umGold}}>Future Career</span>
          </h1>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', maxWidth: '700px', margin: '0 auto 50px', lineHeight: '1.6' }}>
            FuturePath creates personalized learning roadmaps to bridge the gap between your university degree and your dream job in the tech industry.
          </p>
          
          {/* --- DUAL SIGN UP BUTTONS --- */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
              
              {/* Student Card */}
              <div style={{
                  backgroundColor: 'white', padding: '35px', borderRadius: '16px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
                  width: '320px', textAlign: 'center', borderTop: `6px solid ${fpPurple}`
              }}>
                  <div style={{fontSize: '40px', marginBottom: '15px'}}>🎓</div>
                  <h3 style={{marginBottom: '10px', color: '#111827', fontSize:'22px', fontFamily: 'Georgia, serif'}}>I am a Student</h3>
                  <p style={{color: '#6B7280', fontSize: '15px', marginBottom: '25px', lineHeight: '1.5'}}>
                      Get personalized roadmaps, track skills, and find resources to ace your career.
                  </p>
                  <button 
                      onClick={() => onRegisterClick('student')} 
                      style={{...styles.primaryButton, backgroundColor: fpPurple, width: '100%', fontSize: '16px', padding: '12px'}}
                  >
                      Sign Up as Student
                  </button>
              </div>

              {/* Alumni Card */}
              <div style={{
                  backgroundColor: 'white', padding: '35px', borderRadius: '16px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
                  width: '320px', textAlign: 'center', borderTop: `6px solid ${umBlue}`
              }}>
                  <div style={{fontSize: '40px', marginBottom: '15px'}}>💼</div>
                  <h3 style={{marginBottom: '10px', color: '#111827', fontSize:'22px', fontFamily: 'Georgia, serif'}}>I am an Alumni</h3>
                  <p style={{color: '#6B7280', fontSize: '15px', marginBottom: '25px', lineHeight: '1.5'}}>
                      Share jobs, mentor juniors, and give back to the FSKTM community.
                  </p>
                  <button 
                      onClick={() => onRegisterClick('alumni')} 
                      style={{...styles.primaryButton, backgroundColor: umBlue, width: '100%', fontSize: '16px', padding: '12px'}}
                  >
                      Sign Up as Alumni
                  </button>
              </div>
          </div>
        </header>
      </div>

      {/* --- FEATURES GRID (HORIZONTAL LAYOUT) --- */}
      <section style={{ padding: '80px 40px', maxWidth: '1400px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '32px', marginBottom: '60px', color: '#111827', fontWeight: '800', fontFamily: 'Georgia, serif' }}>
          System Capabilities
        </h2>

        <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '30px',
            alignItems: 'stretch' 
        }}>
          
          {/* FEATURE 1: ROADMAP (FuturePath Purple Theme) */}
          <div style={{...styles.card, borderTop: `5px solid ${fpPurple}`, padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'}}>
            <div style={{ fontSize: '32px', marginBottom: '20px', backgroundColor:'#f3e8ff', width:'60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius:'12px' }}>🗺️</div>
            <h3 style={{ color: '#111827', fontSize: '20px', marginBottom: '15px', fontWeight: '700', fontFamily: 'Georgia, serif' }}>
                Personalized Learning Roadmap
            </h3>
            <ul style={{ color: '#4B5563', paddingLeft: '20px', lineHeight: '1.6', fontSize:'15px', margin: 0 }}>
              <li style={{marginBottom: '8px'}}>Automated skill sequencing tailored to your dream career.</li>
              <li style={{marginBottom: '8px'}}>Access to curated free and affordable learning resources.</li>
              <li style={{marginBottom: '8px'}}>Visual progress tracking with milestone achievements.</li>
              <li>Skill verification via interactive quizzes.</li>
            </ul>
          </div>

          {/* FEATURE 2: EMPLOYABILITY (UM Blue Theme) */}
          <div style={{...styles.card, borderTop: `5px solid ${umBlue}`, padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'}}>
            <div style={{ fontSize: '32px', marginBottom: '20px', backgroundColor:'#eff6ff', width:'60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius:'12px' }}>📊</div>
            <h3 style={{ color: '#111827', fontSize: '20px', marginBottom: '15px', fontWeight: '700', fontFamily: 'Georgia, serif' }}>
                Graduate Employability Intelligence
            </h3>
            <ul style={{ color: '#4B5563', paddingLeft: '20px', lineHeight: '1.6', fontSize:'15px', margin: 0 }}>
              <li style={{marginBottom: '8px'}}>Track graduate employment trends and outcomes.</li>
              <li style={{marginBottom: '8px'}}>Analyze top hiring employers and recruitment distribution.</li>
              <li style={{marginBottom: '8px'}}>Gain insights into in-demand job roles and industry alignment.</li>
              <li>Data-driven decision making for career planning.</li>
            </ul>
          </div>

          {/* FEATURE 3: ALUMNI HUB (UM Gold Theme) */}
          <div style={{...styles.card, borderTop: `5px solid ${umGold}`, padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'}}>
            <div style={{ fontSize: '32px', marginBottom: '20px', backgroundColor:'#fef3c7', width:'60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius:'12px' }}>🤝</div>
            <h3 style={{ color: '#111827', fontSize: '20px', marginBottom: '15px', fontWeight: '700', fontFamily: 'Georgia, serif' }}>
                Alumni & Mentorship Network
            </h3>
            <ul style={{ color: '#4B5563', paddingLeft: '20px', lineHeight: '1.6', fontSize:'15px', margin: 0 }}>
              <li style={{marginBottom: '8px'}}>Access verified job and internship opportunities from alumni.</li>
              <li style={{marginBottom: '8px'}}>Engage in structured mentorship and knowledge sharing.</li>
              <li style={{marginBottom: '8px'}}>Direct networking with successful industry professionals.</li>
              <li>Community-driven support for career advancement.</li>
            </ul>
          </div>

        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer style={{ textAlign: 'center', padding: '40px', borderTop: '1px solid #E5E7EB', backgroundColor: 'white', color: '#9CA3AF', marginTop: 'auto' }}>
        <p style={{ margin: 0 }}>&copy; 2026 FuturePath. Final Year Project for FSKTM UM. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;