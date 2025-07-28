// 'use client';

// import { useEffect, useState } from 'react';
// import { io, Socket } from 'socket.io-client';
// import { useParams } from 'next/navigation';
// import { Copy } from 'lucide-react';

// interface WebhookEvent {
//   method: string;
//   url: string;
//   headers: Record<string, string | string[] | undefined>;
//   query: Record<string, string | string[] | undefined>;
//   params: Record<string, string | string[] | undefined>;
//   ip: string;
//   userAgent?: string;
//   contentLength?: string | null;
//   origin?: string | null;
//   referer?: string | null;
//   body: unknown;
//   rawBody?: string | null;
//   time: string;
// }
// const getMethodColor = (method: string) => {
//   switch (method.toUpperCase()) {
//     case 'GET': return '#28a745';
//     case 'POST': return '#ffc107';
//     case 'PUT': return '#007bff';
//     case 'PATCH': return '#6f42c1';
//     case 'DELETE': return '#dc3545';
//     case 'OPTIONS': return '#e068ad';
//     case 'HEAD': return '#89da9f';
//     default: return '#333';
//   }
// };

// export default function SessionListener() {
//   const params = useParams();
//   const sessionId = params.sessionId as string;
//   const [events, setEvents] = useState<WebhookEvent[]>([]);
//   const [copyStatus, setCopyStatus] = useState<string>('');

//   useEffect(() => {
//     if (!sessionId) return;

//     const socketIo: Socket = io();
//     socketIo.emit('join-session', sessionId);

//     socketIo.on('webhook-event', (event: WebhookEvent) => {
//       setEvents(prev => [event, ...prev]);
//     });

//     return () => {
//       socketIo.disconnect();
//     };
//   }, [sessionId]);

//   const webhookUrl = `${location.origin}/webhook/${sessionId}`;

//   const copyToClipboard = async () => {
//     try {
//       await navigator.clipboard.writeText(webhookUrl);
//       setCopyStatus('Copied!');
//       setTimeout(() => setCopyStatus(''), 2000);
//     } catch (err) {
//       setCopyStatus('Failed to copy');
//     }
//   };

//   if (!sessionId) return <p>Loading session...</p>;

//   return (
//     <main style={{ fontFamily: 'Arial, sans-serif', padding: 20, lineHeight: 1.6 }}>
//   <h1 style={{ marginBottom: 16 }}>Listening for Session: {sessionId}</h1>

//   <p
//     style={{
//       color: '#f2f205',
//       fontSize: '16px',
//       display: 'flex',
//       alignItems: 'center',
//       marginBottom: 20,
//     }}
//   >
//     <span style={{ color: 'white', marginRight: 8 }}>Webhook URL : </span> {webhookUrl}
//     <button
//       onClick={copyToClipboard}
//       style={{
//         background: 'none',
//         border: 'none',
//         cursor: 'pointer',
//         marginLeft: 8,
//         padding: 0,
//       }}
//       title="Copy URL"
//     >
//       <Copy size={18} color={copyStatus === 'Copied!' ? '#28a745' : '#f2f205'} />
//     </button>
//     <span style={{ marginLeft: 6, fontSize: '14px', color: 'green' }}>{copyStatus}</span>
//   </p>

//   {events.length === 0 && (
//     <p style={{ marginBottom: 20 }}>No webhook events received yet.</p>
//   )}

//   <ul style={{ listStyleType: 'none', padding: 0 }}>
//     {events.map((event, idx) => (
//       <li
//         key={idx}
//         style={{
//           border: '1px solid #ccc',
//           marginBottom: 20,
//           borderRadius: 8,
//           padding: 16,
//           backgroundColor: '#0000',
//         }}
//       >
//         <div style={{ marginBottom: 8 }}>
//           <span
//             style={{
//               color: getMethodColor(event.method),
//               fontSize: '18px',
//               fontWeight: 'bold',
//               minWidth: '60px',
//               textAlign: 'center',
//             }}
//           >
//             {event.method}
//           </span>
//           <span
//             style={{
//               paddingLeft: '10px',
//               color: '#fff',
//               fontSize: '16px',
//               minWidth: '60px',
//               textAlign: 'center',
//             }}
//           >
//             <code>{event.url}</code>
//           </span>

//           <span
//             style={{
//               color: '#666',
//               marginLeft: 10,
//               fontSize: '14px',
//             }}
//           >
//             @ {new Date(event.time).toLocaleString()}
//           </span>
//         </div>

//         <details style={{ marginTop: 8 }}>
//           <summary style={{ cursor: 'pointer' }}>Details</summary>
//           <pre style={{ fontSize: '14px', overflow: 'auto', marginTop: 6 }}>
//             {JSON.stringify(event, null, 2)}
//           </pre>
//         </details>
//       </li>
//     ))}
//   </ul>
// </main>

//   );
// }

'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useParams } from 'next/navigation';
import { Copy } from 'lucide-react';

interface WebhookEvent {
  method: string;
  url: string;
  headers: Record<string, string | string[] | undefined>;
  query: Record<string, string | string[] | undefined>;
  params: Record<string, string | string[] | undefined>;
  ip: string;
  userAgent?: string;
  contentLength?: string | null;
  origin?: string | null;
  referer?: string | null;
  body: unknown;
  rawBody?: string | null;
  time: string;
}

const getMethodColor = (method: string) => {
  switch (method.toUpperCase()) {
    case 'GET': return '#28a745';
    case 'POST': return '#ffc107';
    case 'PUT': return '#007bff';
    case 'PATCH': return '#6f42c1';
    case 'DELETE': return '#dc3545';
    case 'OPTIONS': return '#e068ad';
    case 'HEAD': return '#89da9f';
    default: return '#333';
  }
};

export default function SessionListener() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [copyStatus, setCopyStatus] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<string>('Connecting...');

  useEffect(() => {
    if (!sessionId) return;

    // Initialize Socket.IO with more explicit configuration
    const socketIo: Socket = io({
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    socketIo.on('connect', () => {
      console.log('Socket connected:', socketIo.id);
      setConnectionStatus('Connected');
      socketIo.emit('join-session', sessionId);
    });

    socketIo.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setConnectionStatus('Disconnected');
    });

    socketIo.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnectionStatus('Connection Error');
    });

    socketIo.on('webhook-event', (event: WebhookEvent) => {
      console.log('Received webhook event:', event);
      setEvents(prev => [event, ...prev]);
    });

    return () => {
      socketIo.disconnect();
    };
  }, [sessionId]);

  const webhookUrl = typeof window !== 'undefined' ? `${window.location.origin}/webhook/${sessionId}` : '';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus(''), 2000);
    } catch (err) {
      setCopyStatus('Failed to copy');
      setTimeout(() => setCopyStatus(''), 2000);
    }
  };

  if (!sessionId) return <p>Loading session...</p>;

  return (
    <main style={{ fontFamily: 'Arial, sans-serif', padding: 20, lineHeight: 1.6 }}>
      <h1 style={{ marginBottom: 16 }}>Listening for Session: {sessionId}</h1>

      <div style={{ marginBottom: 20 }}>
        <p style={{ color: connectionStatus === 'Connected' ? '#28a745' : '#dc3545', fontSize: '14px' }}>
          Status: {connectionStatus}
        </p>
      </div>

      <p
        style={{
          color: '#f2f205',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: '8px'
        }}
      >
        <span style={{ color: 'white' }}>Webhook URL:</span> 
        <code style={{ backgroundColor: '#333', padding: '4px 8px', borderRadius: '4px', fontSize: '14px' }}>
          {webhookUrl}
        </code>
        <button
          onClick={copyToClipboard}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center'
          }}
          title="Copy URL"
        >
          <Copy size={18} color={copyStatus === 'Copied!' ? '#28a745' : '#f2f205'} />
        </button>
        {copyStatus && (
          <span style={{ fontSize: '14px', color: copyStatus === 'Copied!' ? '#28a745' : '#dc3545' }}>
            {copyStatus}
          </span>
        )}
      </p>

      {events.length === 0 && (
        <p style={{ marginBottom: 20, color: '#666' }}>
          No webhook events received yet. Send a request to the URL above to test.
        </p>
      )}

      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {events.map((event, idx) => (
          <li
            key={idx}
            style={{
              border: '1px solid #ccc',
              marginBottom: 20,
              borderRadius: 8,
              padding: 16,
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <span
                style={{
                  color: getMethodColor(event.method),
                  fontSize: '18px',
                  fontWeight: 'bold',
                  minWidth: '60px',
                  textAlign: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}
              >
                {event.method}
              </span>
              <code style={{ 
                color: '#fff', 
                fontSize: '14px',
                backgroundColor: '#333',
                padding: '4px 8px',
                borderRadius: '4px',
                wordBreak: 'break-all'
              }}>
                {event.url}
              </code>
              <span
                style={{
                  color: '#666',
                  fontSize: '12px',
                }}
              >
                {new Date(event.time).toLocaleString()}
              </span>
            </div>

            <details style={{ marginTop: 8 }}>
              <summary style={{ cursor: 'pointer', padding: '4px 0' }}>View Details</summary>
              <pre style={{ 
                fontSize: '12px', 
                overflow: 'auto', 
                marginTop: 6,
                backgroundColor: '#1a1a1a',
                padding: '12px',
                borderRadius: '4px',
                border: '1px solid #333'
              }}>
                {JSON.stringify(event, null, 2)}
              </pre>
            </details>
          </li>
        ))}
      </ul>
    </main>
  );
}
