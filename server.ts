// import express from 'express';
// import next from 'next';
// import http from 'http';
// import { Server } from 'socket.io';
// import cors from 'cors';

// const port = parseInt(process.env.PORT || '3000', 10);
// const dev = process.env.NODE_ENV !== 'production';
// const nextApp = next({ dev });
// const handle = nextApp.getRequestHandler();

// const sessionSockets: Record<string, Set<string>> = {};

// nextApp.prepare().then(() => {
//   const expressApp = express();
//   const server = http.createServer(expressApp);
//   const io = new Server(server, {
//     cors: { origin: '*' },
//   });

//   expressApp.use(cors());
//   expressApp.use(express.json());

//   expressApp.use('/webhook', express.raw({ type: '*/*', limit: '10mb' }));

//   expressApp.all('/webhook/:sessionId', (req, res) => {
//     const { sessionId } = req.params;

//     let parsedBody: unknown = req.body;
//     let rawBody: string | null = null;
    
//     if (Buffer.isBuffer(req.body)) {
//       rawBody = req.body.toString();
//       try {
//         if (rawBody.trim().startsWith('{') || rawBody.trim().startsWith('[')) {
//           parsedBody = JSON.parse(rawBody);
//         } else {
//           parsedBody = rawBody;
//         }
//       } catch (e) {
//         parsedBody = rawBody;
//       }
//     }
    
//     const event = {
//       method: req.method,
//       url: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
//       headers: req.headers,
//       query: req.query,
//       params: req.params,
//       ip: req.ip || req.connection.remoteAddress || 'unknown',
//       userAgent: req.get('User-Agent'),
//       contentLength: req.get('Content-Length'),
//       origin: req.get('Origin'),
//       referer: req.get('Referer'),
//       body: parsedBody,
//       rawBody: rawBody,
//       time: new Date().toISOString(),
//     };
    
//     console.log(`📡 Webhook [${event.method}] received for session ${sessionId}: ${event.url}`);
    
//     io.to(sessionId).emit('webhook-event', event);

//     res.status(200).json({ 
//       received: true, 
//       sessionId,
//       method: req.method,
//       timestamp: event.time 
//     });
//   });

//   io.on('connection', (socket) => {
//     console.log('🔌 Socket connected:', socket.id);

//     socket.on('join-session', (sessionId: string) => {
//       socket.join(sessionId);
//       if (!sessionSockets[sessionId]) {
//         sessionSockets[sessionId] = new Set();
//       }
//       sessionSockets[sessionId].add(socket.id);
//       console.log(`📺 Socket ${socket.id} joined session ${sessionId}`);
//     });

//     socket.on('disconnect', () => {
//       console.log('🔌 Socket disconnected:', socket.id);
//       // Clean up socket from all sessions
//       for (const sessionId in sessionSockets) {
//         sessionSockets[sessionId].delete(socket.id);
//         if (sessionSockets[sessionId].size === 0) {
//           delete sessionSockets[sessionId];
//           console.log(`🗑️ Cleaned up empty session: ${sessionId}`);
//         }
//       }
//     });
//   });

//   // Handle all other requests with Next.js
//   expressApp.all('*', (req, res) => {
//     return handle(req, res);
//   });

//   server.listen(port, () => {
//     console.log(`🚀 Server + Next.js ready at http://localhost:${port}`);
//     console.log(`📡 Webhook endpoint: http://localhost:${port}/webhook/{sessionId}`);
//   });
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
  
  // Initialize Socket.IO with proper CORS settings
  const io = new Server(server, {
    cors: { 
      origin: '*',
      methods: ['GET', 'POST']
    },
    // Ensure Socket.IO works with path prefix
    path: '/socket.io/',
    transports: ['websocket', 'polling']
  });

  // Enable CORS for all routes
  expressApp.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
    allowedHeaders: ['*']
  }));

  expressApp.use(express.json());

  // Raw body parsing for webhooks
  expressApp.use('/webhook', express.raw({ type: '*/*', limit: '10mb' }));

  // Webhook endpoint - BEFORE the catch-all Next.js handler
  expressApp.all('/webhook/:sessionId', (req, res) => {
    const { sessionId } = req.params;

    let parsedBody: unknown = req.body;
    let rawBody: string | null = null;
    
    if (Buffer.isBuffer(req.body)) {
      rawBody = req.body.toString();
      try {
        if (rawBody.trim().startsWith('{') || rawBody.trim().startsWith('[')) {
          parsedBody = JSON.parse(rawBody);
        } else {
          parsedBody = rawBody;
        }
      } catch (e) {
        parsedBody = rawBody;
      }
    }
    
    const event = {
      method: req.method,
      url: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
      headers: req.headers,
      query: req.query,
      params: req.params,
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent'),
      contentLength: req.get('Content-Length'),
      origin: req.get('Origin'),
      referer: req.get('Referer'),
      body: parsedBody,
      rawBody: rawBody,
      time: new Date().toISOString(),
    };
    
    console.log(`📡 Webhook [${event.method}] received for session ${sessionId}: ${event.url}`);
    
    // Emit to all sockets in the session
    io.to(sessionId).emit('webhook-event', event);

    res.status(200).json({ 
      received: true, 
      sessionId,
      method: req.method,
      timestamp: event.time 
    });
  });

  // Socket.IO connection handling
  io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id);

    socket.on('join-session', (sessionId: string) => {
      socket.join(sessionId);
      if (!sessionSockets[sessionId]) {
        sessionSockets[sessionId] = new Set();
      }
      sessionSockets[sessionId].add(socket.id);
      console.log(`📺 Socket ${socket.id} joined session ${sessionId}`);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected:', socket.id);
      // Clean up socket from all sessions
      for (const sessionId in sessionSockets) {
        sessionSockets[sessionId].delete(socket.id);
        if (sessionSockets[sessionId].size === 0) {
          delete sessionSockets[sessionId];
          console.log(`🗑️ Cleaned up empty session: ${sessionId}`);
        }
      }
    });
  });

  // Health check endpoint
  expressApp.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Handle all other requests with Next.js (this should be LAST)
  expressApp.all('*', (req, res) => {
    // Skip Socket.IO requests - let Socket.IO handle them
    if (req.url.startsWith('/socket.io/')) {
      return;
    }
    return handle(req, res);
  });

  server.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server + Next.js ready at http://localhost:${port}`);
    console.log(`📡 Webhook endpoint: http://localhost:${port}/webhook/{sessionId}`);
    console.log(`🔌 Socket.IO ready at /socket.io`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });
});
