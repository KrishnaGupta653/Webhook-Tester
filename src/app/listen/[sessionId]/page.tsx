'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useParams } from 'next/navigation';

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

export default function SessionListener() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [events, setEvents] = useState<WebhookEvent[]>([]);

  useEffect(() => {
    if (!sessionId) return;

    const socketIo: Socket = io('http://localhost:3000');

    socketIo.emit('join-session', sessionId);

    socketIo.on('webhook-event', (event: WebhookEvent) => {
      setEvents(prev => [event, ...prev]);
    });

    return () => {
      socketIo.disconnect();
    };
  }, [sessionId]);

  if (!sessionId) return <p>Loading session...</p>;

  return (
    <main style={{ fontFamily: 'Arial, sans-serif', padding: 20 }}>
      <h1>Listening for Session: {sessionId}</h1>
      <p style={{ color: '#fff', fontSize: '14px' }}>
        Webhook URL: http://localhost:3000/webhook/{sessionId}
      </p>
      {events.length === 0 && <p>No webhook events received yet.</p>}

      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {events.map((event, idx) => (
          <li 
            key={idx}
            style={{
              border: '1px solid #ccc',
              marginBottom: 12,
              borderRadius: 8,
              padding: 12,
              backgroundColor: '#0000',
            }}
          >
            <div>
              <strong>{event.method}</strong> <code>{event.url}</code> 
              <span style={{ color: '#666', marginLeft: 10 }}>
                @ {new Date(event.time).toLocaleString()}
              </span>
            </div>
            <details style={{ marginTop: 8 }}>
              <summary style={{ cursor: 'pointer' }}>Details</summary>
              <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                {JSON.stringify(event, null, 2)}
              </pre>
            </details>
          </li>
        ))}
      </ul>
    </main>
  );
}