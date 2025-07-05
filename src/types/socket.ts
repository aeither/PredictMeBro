export interface ToastEventData {
  type: 'simple' | 'success' | 'error' | 'action'
  message: string
  description?: string
  timestamp: string
}

export interface VoteEventData {
  poolId: string
  vote: "yes" | "no"
  voterAddress?: string
  question: string
  blockchain: string
  timestamp: string
}

export interface ServerToClientEvents {
  'toast-notification': (data: ToastEventData) => void
  'vote-notification': (data: VoteEventData) => void
  'user-count': (count: number) => void
}

export interface ClientToServerEvents {
  'toast-event': (data: ToastEventData) => void
  'vote-event': (data: VoteEventData) => void
}

export interface InterServerEvents {
  ping: () => void
}

export interface SocketData {
  userId: string
  username: string
} 