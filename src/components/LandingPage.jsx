// ============================================================================
// FILE: src/components/LandingPage.jsx
// PURPOSE: Landing Page with 3-Column Horizontal Features
// ============================================================================

import React from 'react';
import { styles } from '../styles/styles';

const LandingPage = ({ onLoginClick, onRegisterClick }) => {
  return (
    <div style={{...styles.appContainer, backgroundColor: 'white', display: 'flex', flexDirection: 'column'}}>
      
      {/* --- NAVBAR --- */}
      <nav style={{
        ...styles.header,
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        color: '#111827',
        boxShadow: 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>🚀</span>
          <h1 style={{ margin: 0, fontSize: '20px', color: '#4F46E5', fontWeight: '800' }}>FuturePath</h1>
        </div>
        <div>
          <button 
            onClick={onLoginClick}
            style={{...styles.button, backgroundColor: 'transparent', color: '#4B5563', border: '1px solid #E5E7EB'}}
          >
            Log In
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header style={{
        textAlign: 'center',
        padding: '80px 20px',
        backgroundColor: '#F9FAFB',
        borderBottom: '1px solid #E5E7EB'
      }}>
        <h1 style={{ 
          fontSize: '42px', 
          marginBottom: '20px',
          color: '#111827',
          fontWeight: '800'
        }}>
          Shape Your <span style={{color: '#4F46E5'}}>Future Career</span>
        </h1>
        <p style={{ fontSize: '18px', color: '#6B7280', maxWidth: '700px', margin: '0 auto 50px', lineHeight: '1.6' }}>
          FuturePath creates personalized learning roadmaps to bridge the gap between your degree and your dream job.
        </p>
        
        {/* --- DUAL SIGN UP BUTTONS --- */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
            
            {/* Student Card */}
            <div style={{
                backgroundColor: 'white', padding: '30px', borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #E5E7EB',
                width: '320px', textAlign: 'center'
            }}>
                <div style={{fontSize: '40px', marginBottom: '15px'}}>🎓</div>
                <h3 style={{marginBottom: '10px', color: '#111827', fontSize:'20px'}}>I am a Student</h3>
                <p style={{color: '#6B7280', fontSize: '14px', marginBottom: '25px'}}>
                    Get personalized roadmaps, track skills, and find resources to ace your career.
                </p>
                <button 
                    onClick={() => onRegisterClick('student')} 
                    style={{...styles.primaryButton, width: '100%'}}
                >
                    Sign Up as Student
                </button>
            </div>

            {/* Alumni Card */}
            <div style={{
                backgroundColor: 'white', padding: '30px', borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #E5E7EB',
                width: '320px', textAlign: 'center'
            }}>
                <div style={{fontSize: '40px', marginBottom: '15px'}}>💼</div>
                <h3 style={{marginBottom: '10px', color: '#111827', fontSize:'20px'}}>I am an Alumni</h3>
                <p style={{color: '#6B7280', fontSize: '14px', marginBottom: '25px'}}>
                    Share jobs, mentor juniors, and give back to the faculty community.
                </p>
                <button 
                    onClick={() => onRegisterClick('alumni')} 
                    style={{...styles.primaryButton, backgroundColor: '#059669', width: '100%'}}
                >
                    Sign Up as Alumni
                </button>
            </div>
        </div>
      </header>

      {/* --- FEATURES GRID (HORIZONTAL LAYOUT) --- */}
      <section style={{ padding: '80px 40px', maxWidth: '1400px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '30px', marginBottom: '60px', color: '#111827', fontWeight: '800' }}>
          System Capabilities
        </h2>

        {/* GRID UPDATE: 
            gridTemplateColumns: '1fr 1fr 1fr' forces exactly 3 equal columns.
            This ensures they sit horizontally side-by-side.
        */}
        <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '30px',
            alignItems: 'stretch' 
        }}>
          
          {/* FEATURE 1: ROADMAP */}
          <div style={{...styles.card, borderTop: '4px solid #4F46E5', padding: '30px'}}>
            <div style={{ fontSize: '36px', marginBottom: '20px', backgroundColor:'#EEF2FF', width:'fit-content', padding:'10px', borderRadius:'10px' }}>🗺️</div>
            <h3 style={{ color: '#111827', fontSize: '20px', marginBottom: '15px', fontWeight: '700' }}>
                Personalized Learning Roadmap
            </h3>
            <ul style={{ color: '#4B5563', paddingLeft: '20px', lineHeight: '1.6', fontSize:'15px' }}>
              <li style={{marginBottom: '8px'}}>Automated skill sequencing tailored to your dream career.</li>
              <li style={{marginBottom: '8px'}}>Access to curated free and affordable learning resources.</li>
              <li style={{marginBottom: '8px'}}>Visual progress tracking with milestone achievements.</li>
              <li>Skill verification via interactive quizzes.</li>
            </ul>
          </div>

          {/* FEATURE 2: EMPLOYABILITY */}
          <div style={{...styles.card, borderTop: '4px solid #2563EB', padding: '30px'}}>
            <div style={{ fontSize: '36px', marginBottom: '20px', backgroundColor:'#DBEAFE', width:'fit-content', padding:'10px', borderRadius:'10px' }}>📊</div>
            <h3 style={{ color: '#111827', fontSize: '20px', marginBottom: '15px', fontWeight: '700' }}>
                Graduate Employability Intelligence
            </h3>
            <ul style={{ color: '#4B5563', paddingLeft: '20px', lineHeight: '1.6', fontSize:'15px' }}>
              <li style={{marginBottom: '8px'}}>Track graduate employment trends and outcomes.</li>
              <li style={{marginBottom: '8px'}}>Analyze top hiring employers and recruitment distribution.</li>
              <li style={{marginBottom: '8px'}}>Gain insights into in-demand job roles and industry alignment.</li>
              <li>Data-driven decision making for career planning.</li>
            </ul>
          </div>

          {/* FEATURE 3: ALUMNI HUB */}
          <div style={{...styles.card, borderTop: '4px solid #059669', padding: '30px'}}>
            <div style={{ fontSize: '36px', marginBottom: '20px', backgroundColor:'#D1FAE5', width:'fit-content', padding:'10px', borderRadius:'10px' }}>🤝</div>
            <h3 style={{ color: '#111827', fontSize: '20px', marginBottom: '15px', fontWeight: '700' }}>
                Alumni & Mentorship Network
            </h3>
            <ul style={{ color: '#4B5563', paddingLeft: '20px', lineHeight: '1.6', fontSize:'15px' }}>
              <li style={{marginBottom: '8px'}}>Access verified job and internship opportunities from alumni.</li>
              <li style={{marginBottom: '8px'}}>Engage in structured mentorship and knowledge sharing.</li>
              <li style={{marginBottom: '8px'}}>Direct networking with successful industry professionals.</li>
              <li>Community-driven support for career advancement.</li>
            </ul>
          </div>

        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer style={{ textAlign: 'center', padding: '40px', borderTop: '1px solid #E5E7EB', color: '#9CA3AF', marginTop: 'auto' }}>
        <p>&copy; 2026 FuturePath. Final Year Project. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;