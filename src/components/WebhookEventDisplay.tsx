import React, { useState } from 'react';
import { WebhookEvent } from '../types/WebhookEvent';

interface Props {
  event: WebhookEvent;
}

const WebhookEventDisplay: React.FC<Props> = ({ event }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['body']));

  const safeStringify = (data: unknown) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return 'Invalid JSON';
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return '#28a745';
      case 'POST': return '#007bff';
      case 'PUT': return '#ffc107';
      case 'DELETE': return '#dc3545';
      case 'PATCH': return '#6f42c1';
      default: return '#6c757d';
    }
  };

  const hasContent = (data: unknown) => {
    if (data == null) return false;
    if (typeof data === 'object') {
      return Object.keys(data as object).length > 0;
    }
    return true;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.methodUrl}>
          <span style={{
            ...styles.method,
            backgroundColor: getMethodColor(event.method)
          }}>
            {event.method}
          </span>
          <code style={styles.url}>{event.url}</code>
        </div>
        <div style={styles.timestamp}>
          {new Date(event.time).toLocaleString()}
        </div>
      </div>

      <div style={styles.sections}>
        {/* Headers */}
        <div style={styles.section}>
          <button 
            onClick={() => toggleSection('headers')}
            style={styles.sectionHeader}
          >
            <span style={styles.arrow}>
              {expandedSections.has('headers') ? '▼' : '▶'}
            </span>
            Headers
            {hasContent(event.headers) && (
              <span style={styles.badge}>
                {Object.keys(event.headers).length}
              </span>
            )}
          </button>
          {expandedSections.has('headers') && (
            <pre style={styles.content}>{safeStringify(event.headers)}</pre>
          )}
        </div>

        {/* Query Parameters */}
        {hasContent(event.query) && (
          <div style={styles.section}>
            <button 
              onClick={() => toggleSection('query')}
              style={styles.sectionHeader}
            >
              <span style={styles.arrow}>
                {expandedSections.has('query') ? '▼' : '▶'}
              </span>
              Query Parameters
              <span style={styles.badge}>
                {Object.keys(event.query).length}
              </span>
            </button>
            {expandedSections.has('query') && (
              <pre style={styles.content}>{safeStringify(event.query)}</pre>
            )}
          </div>
        )}

        {/* Path Parameters */}
        {hasContent(event.params) && (
          <div style={styles.section}>
            <button 
              onClick={() => toggleSection('params')}
              style={styles.sectionHeader}
            >
              <span style={styles.arrow}>
                {expandedSections.has('params') ? '▼' : '▶'}
              </span>
              Path Parameters
              <span style={styles.badge}>
                {Object.keys(event.params).length}
              </span>
            </button>
            {expandedSections.has('params') && (
              <pre style={styles.content}>{safeStringify(event.params)}</pre>
            )}
          </div>
        )}

        {/* Body */}
        <div style={styles.section}>
          <button 
            onClick={() => toggleSection('body')}
            style={styles.sectionHeader}
          >
            <span style={styles.arrow}>
              {expandedSections.has('body') ? '▼' : '▶'}
            </span>
            Body
            {hasContent(event.body) && <span style={styles.badge}>●</span>}
          </button>
          {expandedSections.has('body') && (
            <pre style={styles.content}>
              {hasContent(event.body) ? safeStringify(event.body) : 'Empty'}
            </pre>
          )}
        </div>

        {/* Raw Body */}
        {event.rawBody !== undefined && event.rawBody !== null && (
          <div style={styles.section}>
            <button 
              onClick={() => toggleSection('rawBody')}
              style={styles.sectionHeader}
            >
              <span style={styles.arrow}>
                {expandedSections.has('rawBody') ? '▼' : '▶'}
              </span>
              Raw Body
            </button>
            {expandedSections.has('rawBody') && (
              <pre style={styles.content}>{safeStringify(event.rawBody)}</pre>
            )}
          </div>
        )}
      </div>

      <div style={styles.metadata}>
        <span>IP: {event.ip || 'N/A'}</span>
        <span>User-Agent: {event.userAgent || 'N/A'}</span>
        {event.contentLength && <span>Content-Length: {event.contentLength}</span>}
      </div>
    </div>
  );
};

const styles = {
  container: {
    border: '1px solid #dee2e6',
    marginBottom: '20px',
    borderRadius: '8px',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  header: {
    padding: '15px 20px',
    borderBottom: '1px solid #dee2e6',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: '10px',
  },
  methodUrl: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  method: {
    padding: '4px 8px',
    borderRadius: '4px',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold' as const,
    minWidth: '50px',
    textAlign: 'center' as const,
  },
  url: {
    fontSize: '14px',
    backgroundColor: '#f8f9fa',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  timestamp: {
    fontSize: '12px',
    color: '#6c757d',
  },
  sections: {
    padding: '0',
  },
  section: {
    borderBottom: '1px solid #f8f9fa',
  },
  sectionHeader: {
    width: '100%',
    padding: '12px 20px',
    backgroundColor: 'transparent',
    border: 'none',
    textAlign: 'left' as const,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500' as const,
    transition: 'background-color 0.2s',
  },
  arrow: {
    fontSize: '12px',
    color: '#6c757d',
    width: '12px',
  },
  badge: {
    backgroundColor: '#007bff',
    color: 'white',
    fontSize: '11px',
    padding: '2px 6px',
    borderRadius: '10px',
    marginLeft: 'auto',
  },
  content: {
    margin: '0',
    padding: '15px 20px',
    backgroundColor: '#f8f9fa',
    fontSize: '12px',
    lineHeight: '1.4',
    overflow: 'auto',
    maxHeight: '300px',
  },
  metadata: {
    padding: '10px 20px',
    fontSize: '11px',
    color: '#6c757d',
    backgroundColor: '#f8f9fa',
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap' as const,
  },
};

export default WebhookEventDisplay;