// Socket.IO configuration for different environments
export const SOCKET_CONFIG = {
  // Local development
  development: {
    url: 'http://localhost:3001', // Separate port for Socket.IO server
    options: {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    }
  },
  // Production - using Railway (free tier)
  production: {
    url: process.env.NEXT_PUBLIC_SOCKET_URL || 'https://predictmebro-socket.up.railway.app',
    options: {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    }
  }
}

export const getSocketConfig = () => {
  const env = process.env.NODE_ENV || 'development'
  return SOCKET_CONFIG[env as keyof typeof SOCKET_CONFIG] || SOCKET_CONFIG.development
} 