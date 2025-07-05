import { createClient } from '@supabase/supabase-js'

// Use proper environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dakggcfdthlsxkyobohc.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database table names for realtime events
export const TABLES = {
  EVENTS: 'events',
  VOTES: 'votes'
}

// Event types
export const EVENT_TYPES = {
  VOTE: 'vote',
  TOAST: 'toast'
}

// Insert a new event into the database to trigger realtime notifications
export const insertEvent = async (type: string, data: any) => {
  const { error } = await supabase
    .from(TABLES.EVENTS)
    .insert([{
      type,
      data: JSON.stringify(data),
      created_at: new Date().toISOString()
    }])

  if (error) {
    console.error('Error inserting event:', error)
    throw error
  }
}

// Insert a vote event
export const insertVoteEvent = async (data: {
  poolId: string
  vote: 'yes' | 'no'
  walletAddress: string
  blockchain: 'flow' | 'ronin'
}) => {
  return await insertEvent(EVENT_TYPES.VOTE, data)
}

// Insert a toast event
export const insertToastEvent = async (data: {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}) => {
  return await insertEvent(EVENT_TYPES.TOAST, data)
}

// Subscribe to realtime events
export const subscribeToEvents = (
  eventType: string,
  callback: (payload: any) => void
) => {
  const channel = supabase
    .channel(`realtime:${eventType}`)
    .on(
      'postgres_changes',
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: TABLES.EVENTS,
        filter: `type=eq.${eventType}`
      },
      (payload) => {
        try {
          const data = JSON.parse(payload.new.data)
          callback({ ...payload.new, data })
        } catch (error) {
          console.error('Error parsing event data:', error)
        }
      }
    )
    .subscribe()

  return channel
}

// Subscribe to vote events
export const subscribeToVotes = (callback: (payload: any) => void) => {
  return subscribeToEvents(EVENT_TYPES.VOTE, callback)
}

// Subscribe to toast events  
export const subscribeToToasts = (callback: (payload: any) => void) => {
  return subscribeToEvents(EVENT_TYPES.TOAST, callback)
} 