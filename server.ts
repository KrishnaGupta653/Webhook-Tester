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
//     // cors: { origin: '*' },
//     cors: {
//     origin: process.env.FRONTEND_ORIGIN || '*', // Optional: use env var
//     methods: ['GET', 'POST'],
//   },
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
  
  // Initialize Socket.io with proper CORS configuration
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_ORIGIN || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    allowEIO3: true, // Allow Engine.IO v3 clients
    transports: ['websocket', 'polling'],
  });

  // CORS middleware for Express
  expressApp.use(cors({
    origin: process.env.FRONTEND_ORIGIN || '*',
    credentials: true,
  }));

  // Body parsing middleware
  expressApp.use(express.json({ limit: '10mb' }));
  expressApp.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Raw body parsing for webhook endpoints
  expressApp.use('/webhook', express.raw({ type: '*/*', limit: '10mb' }));

  // Health check endpoint
  expressApp.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      socketConnections: Object.keys(sessionSockets).length 
    });
  });

  // Webhook endpoint handler
  expressApp.all('/webhook/:sessionId', (req, res) => {
    const { sessionId } = req.params;

    let parsedBody: unknown = req.body;
    let rawBody: string | null = null;
    
    // Handle different body types
    if (Buffer.isBuffer(req.body)) {
      rawBody = req.body.toString();
      try {
        if (rawBody.trim().startsWith('{') || rawBody.trim().startsWith('[')) {
          parsedBody = JSON.parse(rawBody);
        } else {
          parsedBody = rawBody;
        }
      } catch (e) {
        console.warn('Failed to parse JSON body:', e);
        parsedBody = rawBody;
      }
    } else if (typeof req.body === 'string') {
      rawBody = req.body;
      try {
        parsedBody = JSON.parse(req.body);
      } catch (e) {
        parsedBody = req.body;
      }
    }
    
    const event = {
      method: req.method,
      url: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
      headers: req.headers,
      query: req.query,
      params: req.params,
      ip: req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent'),
      contentLength: req.get('Content-Length'),
      origin: req.get('Origin'),
      referer: req.get('Referer'),
      body: parsedBody,
      rawBody: rawBody,
      time: new Date().toISOString(),
    };
    
    console.log(`📡 Webhook [${event.method}] received for session ${sessionId}:`, {
      url: event.url,
      userAgent: event.userAgent,
      contentLength: event.contentLength,
      bodyType: typeof parsedBody,
    });
    
    // Emit to all sockets in the session
    const emittedTo = io.to(sessionId).emit('webhook-event', event);
    console.log(`📺 Event emitted to session ${sessionId}, active sockets: ${sessionSockets[sessionId]?.size || 0}`);

    // Send response
    res.status(200).json({ 
      received: true, 
      sessionId,
      method: req.method,
      timestamp: event.time,
      socketsNotified: sessionSockets[sessionId]?.size || 0,
    });
  });

  // Socket.io connection handling
  io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id);

    socket.on('join-session', (sessionId: string) => {
      console.log(`📺 Socket ${socket.id} attempting to join session ${sessionId}`);
      
      // Leave any existing rooms first
      socket.rooms.forEach(room => {
        if (room !== socket.id) {
          socket.leave(room);
        }
      });

      // Join the new session
      socket.join(sessionId);
      
      // Track the socket in our session map
      if (!sessionSockets[sessionId]) {
        sessionSockets[sessionId] = new Set();
      }
      sessionSockets[sessionId].add(socket.id);
      
      console.log(`✅ Socket ${socket.id} joined session ${sessionId}, total in session: ${sessionSockets[sessionId].size}`);
      
      // Send confirmation back to client
      socket.emit('session-joined', { sessionId, socketId: socket.id });
    });

    socket.on('ping', () => {
      socket.emit('pong');
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', socket.id, 'Reason:', reason);
      
      // Clean up socket from all sessions
      for (const sessionId in sessionSockets) {
        if (sessionSockets[sessionId].has(socket.id)) {
          sessionSockets[sessionId].delete(socket.id);
          console.log(`🗑️ Removed socket ${socket.id} from session ${sessionId}`);
          
          if (sessionSockets[sessionId].size === 0) {
            delete sessionSockets[sessionId];
            console.log(`🗑️ Cleaned up empty session: ${sessionId}`);
          }
        }
      }
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Handle all other requests with Next.js
  expressApp.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server + Next.js ready at http://localhost:${port}`);
    console.log(`📡 Webhook endpoint: http://localhost:${port}/webhook/{sessionId}`);
    console.log(`🔌 Socket.io server ready`);
    console.log(`🌍 Environment: ${dev ? 'development' : 'production'}`);
    
    if (process.env.FRONTEND_ORIGIN) {
      console.log(`🔗 CORS origin: ${process.env.FRONTEND_ORIGIN}`);
    }
  });
});
