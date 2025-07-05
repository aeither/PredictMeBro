import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { Server } from 'socket.io'
import type { 
  ToastEventData,
  VoteEventData,
  ServerToClientEvents, 
  ClientToServerEvents, 
  InterServerEvents, 
  SocketData 
} from './src/types/socket'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      if (!req.url) return
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Initialize Socket.IO with proper TypeScript types
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  })

  let connectedUsers = 0

  io.on('connection', (socket) => {
    connectedUsers++
    console.log(`Client connected: ${socket.id} (${connectedUsers} users online)`)
    
    // Send current user count to all clients
    io.emit('user-count', connectedUsers)

    // Handle toast events with proper typing
    socket.on('toast-event', (data: ToastEventData) => {
      console.log('Broadcasting toast event:', data)
      // Broadcast to all other connected clients
      socket.broadcast.emit('toast-notification', data)
    })

    // Handle vote events with proper typing
    socket.on('vote-event', (data: VoteEventData) => {
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

  server.listen(port, (err?: any) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log('> Socket.IO server is running')
  })
}) 