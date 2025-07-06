import { useEffect, useRef, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { toast } from 'sonner'

// Supabase configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://dakggcfdthlsxkyobohc.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRha2dnY2ZkdGhsc3hreW9ib2hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NDAxNTksImV4cCI6MjA2NzMxNjE1OX0.4jh5L-l-XcnspBYfdnuFgtEjkhGt-Jh6dwipsVDI95c'

interface ToastMessage {
  title: string
  description?: string
  type: 'success' | 'error' | 'info' | 'default'
  timestamp: string
  sender: string
  blockchain?: 'flow' | 'ronin'
  icon?: string
}

export const useRealtimeToasts = (blockchain: 'flow' | 'ronin' = 'flow') => {
  const [isConnected, setIsConnected] = useState(false)
  const [receivedCount, setReceivedCount] = useState(0)
  const channelRef = useRef<any>(null)
  const supabaseRef = useRef<any>(null)

  useEffect(() => {
    console.log(`🔗 Setting up realtime toast channel for ${blockchain}...`)
    
    // Create fresh supabase client and channel
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    supabaseRef.current = supabase
    
    const channel = supabase.channel(`${blockchain}_toasts`, {
      config: {
        presence: { key: `user_${Math.random().toString(36).substring(7)}` }
      }
    })
    
    channelRef.current = channel

    // Set up toast message handler
    channel.on('broadcast', { event: 'toast' }, (payload) => {
      console.log('📨 Received toast broadcast:', payload)
      const toastData: ToastMessage = payload.payload
      
      // Show toast notification with device indicator
      const title = `📱 ${toastData.title}`
      const description = `${toastData.description || ''} (from another device)`
      
      switch (toastData.type) {
        case 'success':
          toast.success(title, {
            description,
            duration: 4000,
            icon: toastData.icon || '✅',
          })
          break
        case 'error':
          toast.error(title, {
            description,
            duration: 4000,
            icon: toastData.icon || '❌',
          })
          break
        case 'info':
          toast.info(title, {
            description,
            duration: 4000,
            icon: toastData.icon || 'ℹ️',
          })
          break
        default:
          toast(title, {
            description,
            duration: 4000,
            icon: toastData.icon || '📱',
          })
      }
      
      setReceivedCount(prev => prev + 1)
    })

    // Subscribe to the channel
    channel.subscribe()
    
    // Wait a moment then mark as connected
    const timer = setTimeout(() => {
      console.log(`✅ ${blockchain} toast channel connected`)
      setIsConnected(true)
    }, 1500)

    // Cleanup on unmount
    return () => {
      console.log(`🧹 Cleaning up ${blockchain} toast channel...`)
      clearTimeout(timer)
      if (channelRef.current) {
        channelRef.current.unsubscribe()
      }
    }
  }, [blockchain])

  // Function to broadcast a toast to other devices
  const broadcastToast = async (toastData: Omit<ToastMessage, 'timestamp' | 'sender'>) => {
    if (!isConnected || !channelRef.current) {
      console.warn('Toast channel not connected, cannot broadcast')
      return
    }

    const message: ToastMessage = {
      ...toastData,
      timestamp: new Date().toISOString(),
      sender: `User-${Math.floor(Math.random() * 1000)}`,
      blockchain,
    }

    try {
      await channelRef.current.send({
        type: 'broadcast',
        event: 'toast',
        payload: message
      })
      
      console.log('📤 Toast broadcasted:', message)
    } catch (error) {
      console.error('❌ Failed to broadcast toast:', error)
    }
  }

  // Convenience functions for different toast types
  const broadcastSuccess = (title: string, description?: string, icon?: string) => {
    broadcastToast({ title, description, type: 'success', icon })
  }

  const broadcastError = (title: string, description?: string, icon?: string) => {
    broadcastToast({ title, description, type: 'error', icon })
  }

  const broadcastInfo = (title: string, description?: string, icon?: string) => {
    broadcastToast({ title, description, type: 'info', icon })
  }

  const broadcastDefault = (title: string, description?: string, icon?: string) => {
    broadcastToast({ title, description, type: 'default', icon })
  }

  return {
    isConnected,
    receivedCount,
    broadcastToast,
    broadcastSuccess,
    broadcastError,
    broadcastInfo,
    broadcastDefault,
  }
} 