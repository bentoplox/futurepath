// ============================================================================
// FILE: src/styles/styles.js
// PURPOSE: Centralized styles for all components (CSS-in-JS)
// DESCRIPTION: Styles object that can be imported and used in any component
// ============================================================================

export const styles = {
  // ===== LAYOUT STYLES =====
  appContainer: {
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif",
    display: 'flex',            // <--- NEW: Helps center content vertically if needed
    flexDirection: 'column',    // <--- NEW: Stacks header and body
  },

  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontSize: '24px',
    color: '#6366f1',
    fontWeight: '600'
  },

  header: {
    backgroundColor: '#6366f1',
    color: 'white',
    padding: '20px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },

  // ===== AUTHENTICATION STYLES (UPDATED) =====
  authContainer: {
    maxWidth: '450px',          // <--- INCREASED slightly for better spacing
    width: '100%',              // <--- NEW: Ensures it fits on mobile
    margin: '60px auto',        // <--- ADJUSTED margin
    padding: '40px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', // <--- SOFTER shadow
    boxSizing: 'border-box',    // <--- CRITICAL FIX: Prevents padding from breaking width
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',                // <--- INCREASED gap for cleaner look
    marginTop: '20px',
    textAlign: 'left',          // <--- NEW: Forces labels to align left
  },

  // NEW: Wrapper for Label + Input pairs to stack them correctly
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%',
  },

  input: {
    width: '100%',              // <--- NEW: Forces full width
    padding: '12px 15px',       // <--- ADJUSTED padding
    border: '1px solid #d1d5db',
    borderRadius: '8px',        // <--- ROUNDER corners
    fontSize: '16px',
    transition: 'border-color 0.2s',
    outline: 'none',
    boxSizing: 'border-box',    // <--- CRITICAL FIX
    backgroundColor: '#fff',
  },

  label: {                      // <--- NEW: Specific style for labels
    display: 'block',
    color: '#374151', 
    fontSize: '14px', 
    fontWeight: '600',
  },

  // ===== BUTTON STYLES (UPDATED) =====
  button: {
    padding: '12px 24px',
    backgroundColor: '#6366f1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    width: '100%',              // <--- NEW: Full width buttons for forms
    boxSizing: 'border-box',    // <--- NEW
  },

  primaryButton: {
    padding: '10px 20px',
    backgroundColor: '#6366f1',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s'
  },

  secondaryButton: {
    padding: '10px 20px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s'
  },

  successButton: {
    padding: '10px 20px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s'
  },

  backButton: {
    padding: '8px 16px',
    backgroundColor: 'white',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    marginBottom: '20px',
    transition: 'all 0.2s'
  },

  logoutButton: {
    padding: '8px 16px',
    backgroundColor: 'white',
    color: '#6366f1',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600'
  },

  generateButton: {
    width: '100%',
    maxWidth: '400px',
    margin: '0 auto',
    display: 'block',
    fontSize: '18px',
    padding: '16px'
  },

  // ===== TEXT STYLES =====
  link: {
    color: '#6366f1',
    cursor: 'pointer',
    textDecoration: 'underline'
  },

  userInfo: {
    marginRight: '20px',
    fontSize: '16px'
  },

  subtitle: {
    fontSize: '18px',
    color: '#6b7280',
    marginBottom: '30px',
    textAlign: 'center'
  },

  // ===== CAREER INPUT STYLES =====
  careerInputContainer: {
    maxWidth: '1000px',
    margin: '40px auto',
    padding: '40px'
  },

  careerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },

  careerCard: {
    padding: '30px',
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '2px solid #e5e7eb',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },

  careerCardSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#eef2ff',
    boxShadow: '0 4px 6px rgba(99, 102, 241, 0.2)',
    transform: 'translateY(-2px)'
  },

  // ===== ROADMAP STYLES =====
  roadmapContainer: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '40px'
  },

  roadmapHeader: {
    marginBottom: '30px'
  },

  progressSection: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    marginBottom: '30px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },

  progressBarContainer: {
    width: '100%',
    height: '20px',
    backgroundColor: '#e5e7eb',
    borderRadius: '10px',
    overflow: 'hidden',
    marginTop: '15px'
  },

  progressBarFill: {
    height: '100%',
    backgroundColor: '#10b981',
    transition: 'width 0.5s ease',
    borderRadius: '10px'
  },

  progressText: {
    marginTop: '10px',
    color: '#6b7280',
    fontSize: '14px'
  },

  // ===== SKILL CARD STYLES =====
  skillsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },

  skillCard: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    transition: 'box-shadow 0.2s'
  },

  skillHeader: {
    marginBottom: '15px'
  },

  skillName: {
    margin: '0 0 10px 0',
    fontSize: '20px',
    color: '#111827'
  },

  badge: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#e5e7eb',
    borderRadius: '12px',
    fontSize: '14px',
    marginRight: '8px',
    color: 'white',
    fontWeight: '500'
  },

  skillActions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginTop: '15px'
  },

  // ===== RESOURCE STYLES =====
  resourceList: {
    marginTop: '20px',
    padding: '20px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  },

  resourceItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    backgroundColor: 'white',
    borderRadius: '6px',
    marginTop: '10px',
    border: '1px solid #e5e7eb'
  },

  resourceMeta: {
    display: 'flex',
    gap: '10px',
    marginTop: '5px',
    fontSize: '14px',
    color: '#6b7280'
  },

  costBadge: {
    padding: '2px 8px',
    borderRadius: '4px',
    color: 'white',
    fontSize: '12px',
    fontWeight: '600'
  },

  resourceLink: {
    color: '#6366f1',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '14px'
  },

  // ===== QUIZ MODAL STYLES =====
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },

  modalContent: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
  },

  scoreDisplay: {
    textAlign: 'center',
    padding: '40px'
  },

  quizProgress: {
    color: '#6b7280',
    marginBottom: '20px',
    fontSize: '14px'
  },

  questionContainer: {
    marginBottom: '30px'
  },

  optionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '20px'
  },

  optionItem: {
    padding: '15px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: 'white'
  },

  optionSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#eef2ff'
  },

  quizNavigation: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '20px'
  },


  dashboardContainer: {
    maxWidth: '1200px',       // Limits width so it doesn't stretch on big screens
    margin: '0 auto',         // Centers the content
    padding: '30px',
    width: '100%',
    boxSizing: 'border-box'
  },

  dashboardGrid: {
    display: 'flex',
    gap: '30px',              // Space between Feed and Sidebar
    flexWrap: 'wrap',         // Allows stacking on mobile
    alignItems: 'flex-start'  // Ensures sidebar doesn't stretch to match feed height
  },

  // Left Column (The Feed)
  feedSection: {
    flex: '2',                // Takes up 2/3 of space
    minWidth: '300px'         // Prevents squishing too small
  },

  // Right Column (The Sidebar/Form)
  sidebarSection: {
    flex: '1',                // Takes up 1/3 of space
    minWidth: '300px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'               // Space between Form widget and Guidelines widget
  },

  // The White Box for Sidebar Widgets
  sidebarWidget: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' // Nice shadow
  },

  widgetTitle: {
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '20px',
    color: '#111827',
    borderBottom: '1px solid #f3f4f6',
    paddingBottom: '10px'
  },

  // Styling for the Job Posts in the Feed
  postCard: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '12px',
    marginBottom: '20px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },

  postHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px'
  },

  postTitle: {
    margin: '10px 0 5px 0',
    fontSize: '20px',
    fontWeight: '700',
    color: '#1f2937'
  },

  postCompany: {
    fontSize: '14px',
    color: '#4b5563',
    fontWeight: '500'
  },

  // Badge Styles (Job, Internship, Mentorship)
  postTypeBadge: {
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: 'white'
  },
  
  badgeJob: { backgroundColor: '#3b82f6' },       // Blue
  badgeIntern: { backgroundColor: '#8b5cf6' },    // Purple
  badgeMentor: { backgroundColor: '#10b981' },    // Green

  guidelinesBox: {
    backgroundColor: '#ecfdf5', // Light green background
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #a7f3d0'
  },

  guidelinesList: {
    paddingLeft: '20px',
    fontSize: '14px',
    color: '#065f46',
    lineHeight: '1.6'
  },

  // ===== TAB NAVIGATION =====
  tabContainer: {
    display: 'flex',
    gap: '20px',
    marginBottom: '30px',
    borderBottom: '2px solid #e5e7eb',
    paddingBottom: '0px'
  },

  tabButton: {
    padding: '12px 20px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#6b7280',
    cursor: 'pointer',
    borderBottom: '3px solid transparent',
    marginBottom: '-2px', // Overlaps the bottom border
    transition: 'all 0.2s',
    backgroundColor: 'transparent',
    border: 'none', // Reset default button border
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none'
  },

  activeTab: {
    color: '#059669', // Green for Alumni theme
    borderBottom: '3px solid #059669'
  },

  // ===== ADMIN STYLES =====
  adminHeader: {
    backgroundColor: '#dc2626', // Red theme for Admin
    color: 'white',
    padding: '20px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },

  actionButtonsContainer: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px',
    borderTop: '1px solid #f3f4f6',
    paddingTop: '15px'
  },

  approveButton: {
    padding: '8px 16px',
    backgroundColor: '#10b981', // Green
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    flex: 1
  },

  rejectButton: {
    padding: '8px 16px',
    backgroundColor: '#ef4444', // Red
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    flex: 1
  },

  statusBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },

  // ===== ANALYTICS DASHBOARD =====
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },

  statCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    textAlign: 'center'
  },

  statNumber: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#111827',
    marginBottom: '5px'
  },

  statLabel: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '600',
    textTransform: 'uppercase'
  },

  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', // Two columns on large screens
    gap: '30px',
    marginBottom: '30px'
  },

  chartContainer: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    minHeight: '350px'
  },

  chartTitle: {
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '20px',
    color: '#374151',
    borderBottom: '1px solid #f3f4f6',
    paddingBottom: '10px'
  },

  // Heatmap Cells
  heatmapGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', // Skill Name + 4 Cohort Years
    gap: '2px',
    marginTop: '20px'
  },

  heatmapHeader: {
    padding: '10px',
    backgroundColor: '#f9fafb',
    fontWeight: '700',
    fontSize: '14px',
    textAlign: 'center'
  },

  heatmapCell: {
    padding: '12px',
    textAlign: 'center',
    fontSize: '14px',
    color: 'white',
    fontWeight: '600',
    borderRadius: '4px'
  }
};