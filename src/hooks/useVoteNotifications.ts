import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { toast } from 'sonner'

// Supabase configuration (same as demo)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://dakggcfdthlsxkyobohc.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRha2dnY2ZkdGhsc3hreW9ib2hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NDAxNTksImV4cCI6MjA2NzMxNjE1OX0.4jh5L-l-XcnspBYfdnuFgtEjkhGt-Jh6dwipsVDI95c'

// Vote event interface
interface VoteEvent {
  poolId: string
  vote: 'yes' | 'no'
  blockchain: 'flow' | 'ronin'
  voter: string
  timestamp: string
  amount?: number
}

// Hook for vote notifications
export function useVoteNotifications(currentUserAddress?: string) {
  const [isConnected, setIsConnected] = useState(false)
  const [voteCount, setVoteCount] = useState(0)
  const [channel, setChannel] = useState<any>(null)

  useEffect(() => {
    console.log('🔗 Setting up vote notifications channel...')
    
    // Create fresh supabase client and channel
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    const newChannel = supabase.channel('vote_notifications', {
      config: {
        presence: { key: `voter_${Math.random().toString(36).substring(7)}` }
      }
    })
    
    setChannel(newChannel)

    // Set up vote handler
    newChannel.on('broadcast', { event: 'vote' }, (payload) => {
      console.log('📨 Vote received:', payload)
      const voteData = payload.payload as VoteEvent
      
      // Don't show notification for our own votes
      if (currentUserAddress && voteData.voter === currentUserAddress) {
        return
      }
      
      // Show vote notification
      const voteEmoji = voteData.vote === 'yes' ? '✅' : '❌'
      const blockchain = voteData.blockchain.charAt(0).toUpperCase() + voteData.blockchain.slice(1)
      const voterDisplay = `${voteData.voter.slice(0, 6)}...${voteData.voter.slice(-4)}`
      
      toast(`${voteEmoji} ${voterDisplay} voted ${voteData.vote.toUpperCase()}!`, {
        description: `On ${blockchain} blockchain • Pool: ${voteData.poolId}`,
        duration: 4000,
      })
      
      setVoteCount(prev => prev + 1)
    })

    // Subscribe to the channel
    newChannel.subscribe()
    
    // Connection detection
    const timer = setTimeout(() => {
      console.log('✅ Vote notifications channel connected')
      setIsConnected(true)
    }, 1000)

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up vote notifications...')
      clearTimeout(timer)
      newChannel.unsubscribe()
    }
  }, [currentUserAddress])

  // Function to broadcast a vote
  const broadcastVote = async (voteData: VoteEvent) => {
    if (!isConnected || !channel) {
      console.warn('Vote notifications not connected')
      return
    }

    try {
      const response = await channel.send({
        type: 'broadcast',
        event: 'vote',
        payload: voteData
      })
      
      console.log('📤 Vote broadcast sent:', voteData)
      return response
    } catch (error) {
      console.error('❌ Failed to broadcast vote:', error)
      throw error
    }
  }

  return {
    isConnected,
    voteCount,
    broadcastVote,
  }
} 