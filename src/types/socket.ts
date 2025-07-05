export interface ToastEventData {
  type: 'simple' | 'success' | 'error' | 'action'
  message: string
  description?: string
  timestamp: string
}

export interface ServerToClientEvents {
  'toast-notification': (data: ToastEventData) => void
  'user-count': (count: number) => void
}

export interface ClientToServerEvents {
  'toast-event': (data: ToastEventData) => void
}

export interface InterServerEvents {
  ping: () => void
}

export interface SocketData {
  userId: string
  username: string
} 