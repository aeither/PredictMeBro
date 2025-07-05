import { createClient } from '@supabase/supabase-js'

// Use proper environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dakggcfdthlsxkyobohc.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database table names for realtime events
export const TABLES = {
  EVENTS: 'events',
  VOTES: 'votes',
  POOLS: 'pools'
}

// Event types
export const EVENT_TYPES = {
  VOTE: 'vote',
  TOAST: 'toast',
  POOL_CREATED: 'pool_created'
}

// Insert a new event into the database to trigger realtime notifications
export const insertEvent = async (type: string, data: any) => {
  console.log('🔄 Attempting to insert event:', { type, data })
  
  // Check if we have the required environment variables
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    const missingVars = []
    if (!url) missingVars.push('VITE_SUPABASE_URL')
    if (!key) missingVars.push('VITE_SUPABASE_ANON_KEY')
    
    const error = new Error(`Missing environment variables: ${missingVars.join(', ')}. Please create .env file with your Supabase credentials.`)
    console.error('❌ Environment error:', error.message)
    throw error
  }

  const { data: insertedData, error } = await supabase
    .from(TABLES.EVENTS)
    .insert([{
      type,
      data: JSON.stringify(data),
      created_at: new Date().toISOString()
    }])
    .select()

  if (error) {
    console.error('❌ Database error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    })
    
    // Provide helpful error messages based on common issues
    if (error.code === '42P01') {
      throw new Error('Table "events" does not exist. Please run the SQL setup commands in your Supabase dashboard.')
    } else if (error.code === '42501') {
      throw new Error('Permission denied. Please check your Row Level Security policies in Supabase.')
    } else if (error.message.includes('Invalid API key')) {
      throw new Error('Invalid Supabase API key. Please check your VITE_SUPABASE_ANON_KEY in .env')
    } else {
      throw new Error(`Database error: ${error.message}`)
    }
  }

  console.log('✅ Event inserted successfully:', insertedData)
  return insertedData
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
  // Use proper channel naming: realtime:public:tablename:eventtype
  const channelName = `realtime:public:${TABLES.EVENTS}:${eventType}`
  
  console.log(`🔄 Subscribing to realtime channel: ${channelName}`)
  
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: TABLES.EVENTS,
        filter: `type=eq.${eventType}`
      },
      (payload) => {
        console.log(`📡 Realtime event received on ${channelName}:`, payload)
        try {
          const data = JSON.parse(payload.new.data)
          callback({ ...payload.new, data })
        } catch (error) {
          console.error('Error parsing event data:', error, payload.new.data)
        }
      }
    )
    .subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log(`✅ Successfully subscribed to ${channelName}`)
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`❌ Error subscribing to ${channelName}:`, err)
      } else if (status === 'TIMED_OUT') {
        console.warn(`⏱️ Subscription to ${channelName} timed out`)
      } else if (status === 'CLOSED') {
        console.log(`🔒 Subscription to ${channelName} closed`)
      }
    })

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

// Pool management functions

// Define pool interface
export interface Pool {
  id?: string
  question: string
  description?: string
  total_amount: number
  participation_amount: number
  yes_votes: number
  no_votes: number
  ends_at: string
  blockchain: 'flow' | 'ronin'
  creator_address: string
  created_at?: string
  updated_at?: string
}

// Create a new prediction pool
export const createPool = async (poolData: Omit<Pool, 'id' | 'created_at' | 'updated_at'>) => {
  console.log('🔄 Creating new pool:', poolData)

  const { data, error } = await supabase
    .from(TABLES.POOLS)
    .insert([{
      ...poolData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single()

  if (error) {
    console.error('❌ Error creating pool:', error)
    if (error.code === '42P01') {
      throw new Error('Table "pools" does not exist. Please run the SQL setup commands in your Supabase dashboard.')
    }
    throw new Error(`Failed to create pool: ${error.message}`)
  }

  console.log('✅ Pool created successfully:', data)

  // Broadcast pool creation event
  try {
    await insertEvent(EVENT_TYPES.POOL_CREATED, {
      poolId: data.id,
      question: poolData.question,
      blockchain: poolData.blockchain,
      totalAmount: poolData.total_amount,
      creatorAddress: poolData.creator_address
    })
  } catch (eventError) {
    console.warn('⚠️ Failed to broadcast pool creation event:', eventError)
  }

  return data
}

// Get all pools
export const getPools = async () => {
  const { data, error } = await supabase
    .from(TABLES.POOLS)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Error fetching pools:', error)
    throw new Error(`Failed to fetch pools: ${error.message}`)
  }

  return data
}

// Get a specific pool by ID
export const getPoolById = async (poolId: string) => {
  const { data, error } = await supabase
    .from(TABLES.POOLS)
    .select('*')
    .eq('id', poolId)
    .single()

  if (error) {
    console.error('❌ Error fetching pool:', error)
    throw new Error(`Failed to fetch pool: ${error.message}`)
  }

  return data
}

// Update pool votes
export const updatePoolVotes = async (poolId: string, yesVotes: number, noVotes: number) => {
  const { data, error } = await supabase
    .from(TABLES.POOLS)
    .update({
      yes_votes: yesVotes,
      no_votes: noVotes,
      updated_at: new Date().toISOString()
    })
    .eq('id', poolId)
    .select()
    .single()

  if (error) {
    console.error('❌ Error updating pool votes:', error)
    throw new Error(`Failed to update pool votes: ${error.message}`)
  }

  return data
}

// Subscribe to pool creation events
export const subscribeToPoolCreated = (callback: (payload: any) => void) => {
  return subscribeToEvents(EVENT_TYPES.POOL_CREATED, callback)
}

// Subscribe to pool changes
export const subscribeToPoolChanges = (callback: (payload: any) => void) => {
  const channel = supabase
    .channel('pools_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: TABLES.POOLS },
      callback
    )
    .subscribe()

  return channel
} 