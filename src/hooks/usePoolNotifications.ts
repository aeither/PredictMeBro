import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { subscribeToPoolCreated } from '@/config/supabase'
import { useAccount } from 'wagmi'

interface PoolCreationEvent {
  poolId: string
  question: string
  blockchain: 'flow' | 'ronin'
  totalAmount: number
  creatorAddress: string
}

export const usePoolNotifications = () => {
  const { address } = useAccount()
  const channelRef = useRef<any>(null)

  useEffect(() => {
    console.log('🔗 Setting up pool creation notifications...')

    // Subscribe to pool creation events
    const channel = subscribeToPoolCreated((payload: any) => {
      console.log('📡 Pool creation event received:', payload)
      
      try {
        const eventData: PoolCreationEvent = payload.data
        
        // Don't show notification for pools created by the current user
        if (address && eventData.creatorAddress.toLowerCase() === address.toLowerCase()) {
          console.log('🚫 Skipping notification for own pool creation')
          return
        }

        // Determine blockchain emoji and name
        const blockchainInfo = {
          flow: { emoji: '⚡', name: 'Flow' },
          ronin: { emoji: '🛡️', name: 'Ronin' }
        }
        
        const { emoji, name } = blockchainInfo[eventData.blockchain] || { emoji: '🔗', name: eventData.blockchain }
        
        // Show toast notification
        toast(`🎯 New ${name} Pool Created!`, {
          description: `"${eventData.question}" - ${eventData.totalAmount} ETH total`,
          duration: 5000,
          action: {
            label: 'View',
            onClick: () => {
              // Navigate to the appropriate blockchain page
              window.location.href = `/${eventData.blockchain}`
            },
          },
          icon: emoji,
        })

        console.log(`✅ Showed notification for new ${name} pool: "${eventData.question}"`)
      } catch (error) {
        console.error('❌ Error processing pool creation event:', error)
      }
    })

    channelRef.current = channel

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up pool notifications subscription...')
      if (channelRef.current) {
        channelRef.current.unsubscribe()
      }
    }
  }, [address])

  return { 
    isListening: !!channelRef.current 
  }
}

// Hook specifically for broadcasting pool creation events
export const useBroadcastPoolCreation = () => {
  const broadcastPoolCreation = async (poolData: {
    question: string
    blockchain: 'flow' | 'ronin'
    totalAmount: number
    creatorAddress: string
    poolId?: string
  }) => {
    try {
      const { insertEvent, EVENT_TYPES } = await import('@/config/supabase')
      
      await insertEvent(EVENT_TYPES.POOL_CREATED, {
        poolId: poolData.poolId || `${poolData.blockchain}-${Date.now()}`,
        question: poolData.question,
        blockchain: poolData.blockchain,
        totalAmount: poolData.totalAmount,
        creatorAddress: poolData.creatorAddress
      })

      console.log('✅ Pool creation event broadcasted successfully')
    } catch (error) {
      console.warn('⚠️ Failed to broadcast pool creation event:', error)
      // Don't throw error - this is a non-critical feature
    }
  }

  return { broadcastPoolCreation }
} 