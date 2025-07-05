const { createServer } = require('http')
const { Server } = require('socket.io')

const port = parseInt(process.env.PORT || '3001', 10)

// Create HTTP server
const server = createServer((req, res) => {
  // Health check endpoint
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    }))
    return
  }

  // Default response
  res.writeHead(404, { 'Content-Type': 'text/plain' })
  res.end('Socket.IO Server - Not Found')
})

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? (origin, callback) => {
          // Allow any vercel.app domain or your custom domains
          if (!origin || origin.includes('vercel.app') || origin.includes('predictmebro.com')) {
            callback(null, true)
          } else {
            callback(new Error('Not allowed by CORS'))
          }
        }
      : ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
})

let connectedUsers = 0

io.on('connection', (socket) => {
  connectedUsers++
  console.log(`Client connected: ${socket.id} (${connectedUsers} users online)`)
  
  // Send current user count to all clients
  io.emit('user-count', connectedUsers)

  // Handle toast events
  socket.on('toast-event', (data) => {
    console.log('Broadcasting toast event:', data)
    // Broadcast to all other connected clients
    socket.broadcast.emit('toast-notification', data)
  })

  // Handle vote events
  socket.on('vote-event', (data) => {
    console.log('Broadcasting vote event:', data)
    // Broadcast to all other connected clients
    socket.broadcast.emit('vote-notification', data)
  })

  socket.on('disconnect', () => {
    connectedUsers--
    console.log(`Client disconnected: ${socket.id} (${connectedUsers} users online)`)
    // Send updated user count to all clients
    io.emit('user-count', connectedUsers)
  })
})

server.listen(port, '0.0.0.0', () => {
  console.log(`> Socket.IO server running on port ${port}`)
  console.log(`> Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`> CORS origins: ${process.env.NODE_ENV === 'production' ? 'Production domains' : 'Localhost'}`)
  console.log(`> Health check available at: http://0.0.0.0:${port}/health`)
})

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
}) 