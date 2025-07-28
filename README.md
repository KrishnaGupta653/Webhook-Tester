# 🔐 Webhook Listener App

A secure, self-hosted tool to inspect and debug webhook events in real-time — built to eliminate dependency on 3rd-party services like RequestBin or Webhook.site when testing sensitive data.

## 📌 Why This Project Exists

> Tools like RequestBin/Webhook.site are great — but **not safe for testing sensitive data** such as payment webhooks (Stripe, Razorpay, etc.).

We needed a **self-hosted, developer-friendly webhook debugger** with complete **data control**, so we built this private clone — secured for internal testing, with real-time logs and detailed payload visibility.

## ✨ Features

- 🔒 **Self-hosted** - Complete data privacy and control
- ⚡ **Real-time updates** - See webhook events instantly via Socket.io
- 🎯 **Session-based** - Multiple isolated webhook sessions
- 📊 **Detailed logging** - Headers, body, IP, user-agent, and more
- 🎨 **Clean UI** - Method-colored events with expandable details
- 📋 **Copy webhook URLs** - One-click URL copying
- 🚀 **Production ready** - Docker support and Railway deployment

## 🧠 Architecture Flow

```plaintext
┌───────────────┐
│ External Tool │  ← e.g., Stripe, GitHub, Postman
└──────┬────────┘
       │ POST /webhook/:sessionId
       ▼
┌────────────────────────────┐
│ Express Server (server.ts) │
│ - Parses request payload   │
│ - Handles raw/JSON bodies  │
│ - Emits event to socket.io │
└────────────┬───────────────┘
             │
             ▼
┌────────────────────────────┐
│  Socket.IO Server          │
│  - Broadcasts to session   │
│  - Manages session rooms   │
└────────────┬───────────────┘
             │
             ▼
┌────────────────────────────┐
│ Next.js Frontend           │
│ - Session page             │
│ - Real-time event display  │
│ - JSON prettification      │
└────────────────────────────┘
```




https://github.com/user-attachments/assets/6f35d0b9-e9dd-44ce-a87d-2e6b628e2468







## ⚙️ Tech Stack

- **Next.js 14** – React SSR framework with App Router
- **Express.js** – Backend routing for webhooks
- **Socket.io** – Real-time WebSocket communication
- **TypeScript** – Type-safe development
- **TailwindCSS** – Utility-first CSS styling
- **Lucide React** – Beautiful icons
- **TSX** – TypeScript execution for server

## 🔍 Sample Webhook Event

```json
{
  "method": "POST",
  "url": "http://localhost:3000/webhook/abc123",
  "headers": {
    "content-type": "application/json",
    "user-agent": "Stripe/1.0",
    "stripe-signature": "t=1234567890,v1=..."
  },
  "query": {},
  "params": { "sessionId": "abc123" },
  "ip": "127.0.0.1",
  "userAgent": "Stripe/1.0",
  "contentLength": "1234",
  "origin": "https://api.stripe.com",
  "body": {
    "id": "evt_1234567890",
    "object": "event",
    "type": "payment_intent.succeeded",
    "data": {
      "object": {
        "id": "pi_1234567890",
        "amount": 2000,
        "currency": "usd",
        "status": "succeeded"
      }
    }
  },
  "rawBody": "{\"id\":\"evt_1234567890\"...}",
  "time": "2024-07-29T12:34:56.789Z"
}
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### 🛠 Development Mode

```bash
# Clone the repository
git clone -b main https://github.com/KrishnaGupta653/Webhook-Tester.git
cd webhook-listener

# Install dependencies
npm install

# Start the development server (runs both Next.js and Express)
npm run dev
```

📍 **Open your browser:**
- Main app: [http://localhost:3000](http://localhost:3000)
- Generate a session and get your webhook URL
- Test with: `curl -X POST http://localhost:3000/webhook/YOUR_SESSION_ID -d '{"test": "data"}' -H "Content-Type: application/json"`

### 🏗 Production Build

```bash
# Build the Next.js app
npm run build

# Start the production server
npm run start
```

### 🐳 Docker Deployment

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Start the server
CMD ["npx", "tsx", "server.ts"]
```

**Build and Run:**
```bash
docker build -t webhook-listener .
docker run -p 3000:3000 webhook-listener
```

### 🚂 Railway Deployment

1. Connect your GitHub repository to Railway
2. Set environment variables:
   ```
   NEXT_PUBLIC_SOCKET_URL=https://your-app.up.railway.app
   ```
3. Deploy automatically on push to main

## 📁 Project Structure

```
webhook-listener-app/
├── src/
│   ├── app/
│   │   ├── globals.css          # Global styles with Tailwind
│   │   ├── layout.tsx           # Root layout component
│   │   ├── page.tsx             # Home page (session generator)
│   │   └── listen/
│   │       └── [sessionId]/
│   │           └── page.tsx     # Session listener page
├── public/                      # Static assets
├── server.ts                    # Express + Socket.io server
├── package.json                 # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── next.config.js              # Next.js configuration
├── postcss.config.mjs          # PostCSS configuration
├── .env                        # Environment variables
└── .gitignore                  # Git ignore rules
```

## 🎯 Usage

1. **Generate Session**: Visit the home page to create a new webhook session
2. **Copy Webhook URL**: Click the generated session to open the listener page
3. **Send Webhooks**: Use the copied URL as your webhook endpoint
4. **Monitor Events**: Watch real-time webhook events with full request details
5. **Debug Issues**: Expand event details to see headers, body, and metadata

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```bash
# For production deployment (Railway, Vercel, etc.)
NEXT_PUBLIC_SOCKET_URL=https://your-domain.com

# Optional: Custom port (default: 3000)
PORT=3000

# Optional: Node environment
NODE_ENV=production
```

### Scripts

```json
{
  "dev": "tsx server.ts",           // Development server
  "build": "next build",            // Build production app
  "start": "next start",            // Start production server
  "server": "tsx server.ts",        // Run custom server
  "server:dev": "tsx watch server.ts" // Watch mode for server
}
```

## 📊 Features in Detail

### Real-time Event Display
- Color-coded HTTP methods (GET=green, POST=yellow, etc.)
- Timestamp formatting
- Expandable JSON prettification
- Copy webhook URL functionality

### Session Management
- UUID-based session isolation
- Auto-cleanup of disconnected sessions
- Support for multiple concurrent sessions

### Request Processing
- Raw body preservation
- JSON auto-parsing
- Header extraction (User-Agent, Origin, Referer)
- IP address tracking
- Content-Length monitoring

## 🔐 Security Considerations

- **Self-hosted**: All data stays on your infrastructure
- **No persistence**: Events are only stored in memory
- **Session isolation**: Each webhook session is completely separate
- **CORS enabled**: Configurable for your security needs

## 🧪 Testing Webhooks

### Using curl
```bash
# Simple POST
curl -X POST http://localhost:3000/webhook/your-session-id \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello World"}'

# With custom headers
curl -X POST http://localhost:3000/webhook/your-session-id \
  -H "Content-Type: application/json" \
  -H "X-Custom-Header: test-value" \
  -d '{"order_id": "12345", "status": "completed"}'
```

### Using Postman
1. Set method to POST
2. URL: `http://localhost:3000/webhook/your-session-id`
3. Add headers and JSON body as needed
4. Send request and watch the listener page


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

