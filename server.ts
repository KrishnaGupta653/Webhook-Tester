// import express, { Request, Response } from 'express';
// import http from 'http';
// import { Server } from 'socket.io';
// import cors from 'cors';

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: { origin: '*' },
// });

// app.use(cors());
// app.use(express.json());

// const sessionSockets: Record<string, Set<string>> = {};

// io.on('connection', (socket) => {
//   console.log('Socket connected:', socket.id);

//   socket.on('join-session', (sessionId: string) => {
//     socket.join(sessionId);
//     if (!sessionSockets[sessionId]) sessionSockets[sessionId] = new Set();
//     sessionSockets[sessionId].add(socket.id);
//     console.log(`Socket ${socket.id} joined session ${sessionId}`);
//   });

//   socket.on('disconnect', () => {
//     for (const sessionId in sessionSockets) {
//       sessionSockets[sessionId].delete(socket.id);
//       if (sessionSockets[sessionId].size === 0) {
//         delete sessionSockets[sessionId];
//       }
//     }
//   });
// });

// app.get('/', (req, res) => {
//   res.send('🚀 Webhook backend is running!');
// });

// app.get('/webhook/:sessionId', (req, res) => {
//   const { sessionId } = req.params;
//   res.status(200).json({ message: `GET webhook for session ${sessionId}` });
// });

// app.post('/webhook/:sessionId', (req: Request, res: Response) => {
//   const { sessionId } = req.params;
//   const event = {
//     method: req.method,
//     url: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
//     headers: req.headers,
//     query: req.query,
//     params: req.params,
//     ip: req.ip,
//     userAgent: req.get('User-Agent'),
//     contentLength: req.get('Content-Length'),
//     origin: req.get('Origin'),
//     referer: req.get('Referer'),
//     body: req.body,
//     rawBody: (req as any).rawBody || null, 
//     time: new Date().toISOString(),
//   };
  
//   console.log(`Webhook received for session ${sessionId}:`, event.method, event.url);
//   io.to(sessionId).emit('webhook-event', event);
//   res.status(200).json({ status: 'received' });
// });

// const PORT = 4000;
// server.listen(PORT, () => {
//   console.log(`🚀 Backend listening on http://localhost:${PORT}`);
// });

import express from 'express';
import next from 'next';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const sessionSockets: Record<string, Set<string>> = {};

nextApp.prepare().then(() => {
  const expressApp = express();
  const server = http.createServer(expressApp);
  const io = new Server(server, {
    cors: { origin: '*' },
    // path: '/socket.io',
  });

  expressApp.use(cors());
  expressApp.use(express.json());

  // Webhook endpoint
  expressApp.post('/webhook/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const event = {
      method: req.method,
      url: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
      headers: req.headers,
      query: req.query,
      params: req.params,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      contentLength: req.get('Content-Length'),
      origin: req.get('Origin'),
      referer: req.get('Referer'),
      body: req.body,
      rawBody: req.body,
      time: new Date().toISOString(),
    };
    io.to(sessionId).emit('webhook-event', event);
    res.status(200).json({ received: true });
  });

  // WebSocket logic
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('join-session', (sessionId: string) => {
      socket.join(sessionId);
      if (!sessionSockets[sessionId]) sessionSockets[sessionId] = new Set();
      sessionSockets[sessionId].add(socket.id);
    });

    socket.on('disconnect', () => {
      for (const sessionId in sessionSockets) {
        sessionSockets[sessionId].delete(socket.id);
        if (sessionSockets[sessionId].size === 0) {
          delete sessionSockets[sessionId];
        }
      }
    });
  });
  expressApp.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, () => {
    console.log(`Server + Next.js ready at http://localhost:${port}`);
  });
});
