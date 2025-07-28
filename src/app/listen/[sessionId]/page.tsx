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

//     // const socketIo: Socket = io();
//     const socketIo: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin);
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
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [socketConnected, setSocketConnected] = useState<boolean>(false);

  useEffect(() => {
    if (!sessionId) return;

    // Set webhook URL on client side only
    if (typeof window !== 'undefined') {
      setWebhookUrl(`${window.location.origin}/webhook/${sessionId}`);
    }

    // Initialize socket connection
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    const socketIo: Socket = io(socketUrl, {
      transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
    });

    socketIo.on('connect', () => {
      console.log('Socket connected:', socketIo.id);
      setSocketConnected(true);
      socketIo.emit('join-session', sessionId);
    });

    socketIo.on('disconnect', () => {
      console.log('Socket disconnected');
      setSocketConnected(false);
    });

    socketIo.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setSocketConnected(false);
    });

    socketIo.on('webhook-event', (event: WebhookEvent) => {
      console.log('Received webhook event:', event);
      setEvents(prev => [event, ...prev]);
    });

    return () => {
      socketIo.disconnect();
    };
  }, [sessionId]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus(''), 2000);
    } catch (err) {
      setCopyStatus('Failed to copy');
      console.error('Copy failed:', err);
    }
  };

  if (!sessionId) return <p>Loading session...</p>;

  return (
    <main style={{ fontFamily: 'Arial, sans-serif', padding: 20, lineHeight: 1.6 }}>
      <h1 style={{ marginBottom: 16 }}>Listening for Session: {sessionId}</h1>

      {/* Connection Status */}
      <div style={{ marginBottom: 16 }}>
        <span style={{ 
          color: socketConnected ? '#28a745' : '#dc3545',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          {socketConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </span>
      </div>

      {webhookUrl && (
        <p
          style={{
            color: '#f2f205',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            marginBottom: 20,
            flexWrap: 'wrap' as const,
          }}
        >
          <span style={{ color: 'white', marginRight: 8 }}>Webhook URL: </span> 
          <code style={{ backgroundColor: '#333', padding: '2px 6px', borderRadius: 4 }}>
            {webhookUrl}
          </code>
          <button
            onClick={copyToClipboard}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              marginLeft: 8,
              padding: 0,
            }}
            title="Copy URL"
          >
            <Copy size={18} color={copyStatus === 'Copied!' ? '#28a745' : '#f2f205'} />
          </button>
          <span style={{ marginLeft: 6, fontSize: '14px', color: 'green' }}>{copyStatus}</span>
        </p>
      )}

      {events.length === 0 && (
        <div style={{ marginBottom: 20 }}>
          <p>No webhook events received yet.</p>
          <p style={{ fontSize: '14px', color: '#666' }}>
            Test your webhook by sending a POST request to the URL above.
          </p>
        </div>
      )}

      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {events.map((event, idx) => (
          <li
            key={idx}
            style={{
              border: '1px solid #444',
              marginBottom: 20,
              borderRadius: 8,
              padding: 16,
              backgroundColor: '#1a1a1a',
            }}
          >
            <div style={{ marginBottom: 8 }}>
              <span
                style={{
                  color: getMethodColor(event.method),
                  fontSize: '18px',
                  fontWeight: 'bold',
                  minWidth: '60px',
                  textAlign: 'center' as const,
                  display: 'inline-block',
                }}
              >
                {event.method}
              </span>
              <span
                style={{
                  paddingLeft: '10px',
                  color: '#fff',
                  fontSize: '16px',
                }}
              >
                <code style={{ backgroundColor: '#333', padding: '2px 6px', borderRadius: 4 }}>
                  {event.url}
                </code>
              </span>

              <span
                style={{
                  color: '#888',
                  marginLeft: 10,
                  fontSize: '14px',
                }}
              >
                @ {new Date(event.time).toLocaleString()}
              </span>
            </div>

            {/* Quick preview of important data */}
            <div style={{ marginBottom: 8, fontSize: '14px', color: '#ccc' }}>
              {event.userAgent && (
                <div>
                  <strong>User-Agent:</strong> {event.userAgent}
                </div>
              )}
              {event.origin && (
                <div>
                  <strong>Origin:</strong> {event.origin}
                </div>
              )}
              {event.contentLength && (
                <div>
                  <strong>Content-Length:</strong> {event.contentLength} bytes
                </div>
              )}
            </div>

            <details style={{ marginTop: 8 }}>
              <summary style={{ cursor: 'pointer', color: '#f2f205' }}>View Full Details</summary>
              <pre style={{ 
                fontSize: '12px', 
                overflow: 'auto', 
                marginTop: 10,
                backgroundColor: '#0a0a0a',
                padding: 10,
                borderRadius: 4,
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
