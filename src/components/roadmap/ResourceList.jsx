// ============================================================================
// FILE: src/components/roadmap/ResourceList.jsx
// PURPOSE: Display learning resources for a skill
// DESCRIPTION: Shows free and paid resources with links to external platforms
// ============================================================================

import React from 'react';
import { styles } from '../../styles/styles';

const ResourceList = ({ resources }) => {
  // Handle case where no resources are available
  if (!resources || resources.length === 0) {
    return (
      <div style={styles.resourceList}>
        <h4 style={{ marginBottom: '15px', color: '#374151' }}>
          📖 Learning Resources
        </h4>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          No resources available yet. Check back soon or search online for materials!
        </p>
      </div>
    );
  }

  return (
    <div style={styles.resourceList}>
      <h4 style={{ marginBottom: '15px', color: '#374151' }}>
        📖 Learning Resources ({resources.length})
      </h4>
      
      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '15px' }}>
        We've curated these resources to help you master this skill:
      </p>

      {/* Map through all resources and display them */}
      {resources.map((resource) => (
        <div key={resource.resource_id} style={styles.resourceItem}>
          <div style={{ flex: 1 }}>
            {/* Resource title */}
            <strong style={{ color: '#111827', display: 'block', marginBottom: '5px' }}>
              {resource.title}
            </strong>
            
            {/* Resource metadata: provider and cost type */}
            <div style={styles.resourceMeta}>
              <span>📚 {resource.provider}</span>
              <span style={{
                ...styles.costBadge,
                backgroundColor: resource.cost_type === 'free' ? '#10b981' : '#f59e0b'
              }}>
                {resource.cost_type === 'free' ? '🆓 Free' : '💰 Paid'}
              </span>
            </div>
          </div>

          {/* Link to open resource */}
          <a 
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.resourceLink}
            onClick={(e) => {
              // Optional: Track resource clicks in analytics
              console.log(`User clicked resource: ${resource.title}`);
            }}
          >
            Open →
          </a>
        </div>
      ))}

      {/* Additional help text */}
      <div style={{
        marginTop: '15px',
        padding: '12px',
        backgroundColor: '#f0fdf4',
        borderRadius: '6px',
        fontSize: '13px',
        color: '#166534'
      }}>
        <strong>💡 Pro Tip:</strong> Start with free resources first. 
        If you need more in-depth content, consider the paid options.
      </div>
    </div>
  );
};

export default ResourceList;