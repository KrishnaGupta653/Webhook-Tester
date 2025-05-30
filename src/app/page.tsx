'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [sessionId, setSessionId] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const id = crypto.randomUUID();
    setSessionId(id);
  }, []);

  const generateNewSession = () => {
    const newSessionId = crypto.randomUUID();
    setSessionId(newSessionId);
  };

  const openSession = () => {
    if (sessionId) {
      window.open(`/listen/${sessionId}`, '_blank');
    }
  };

  return (
    <main style={styles.container}>
      <h1 style={styles.title}>Webhook Listener</h1>
      {sessionId ? (
        <>
          <button onClick={openSession} style={styles.link}>
            Open Session: {sessionId}
          </button>
          <button onClick={generateNewSession} style={styles.button}>
            Generate New Session
          </button>
        </>
      ) : (
        <p>Generating session...</p>
      )}
    </main>
  );
}

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'Arial, sans-serif',
    padding: 20,
    textAlign: 'center' as const,
  },
  title: {
    fontSize: '32px',
    marginBottom: '20px',
  },
  link: {
    marginTop: '20px',
    padding: '10px 20px',
    fontSize: '18px',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  button: {
    marginTop: '20px',
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    borderRadius: '5px',
  },
};