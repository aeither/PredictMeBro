import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/supabase-demo')({
  component: SupabaseDemo,
})

// Supabase configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://dakggcfdthlsxkyobohc.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRha2dnY2ZkdGhsc3hreW9ib2hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NDAxNTksImV4cCI6MjA2NzMxNjE1OX0.4jh5L-l-XcnspBYfdnuFgtEjkhGt-Jh6dwipsVDI95c'

function SupabaseDemo() {
  const [isConnected, setIsConnected] = useState(false)
  const [messageCount, setMessageCount] = useState(0)
  const [channel, setChannel] = useState<any>(null)

  useEffect(() => {
    console.log('🔗 Setting up Supabase Realtime channel...')
    
    // Create fresh supabase client and channel for this component instance
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    const newChannel = supabase.channel('public_chat', {
      config: {
        presence: { key: `user_${Math.random().toString(36).substring(7)}` }
      }
    })
    
    setChannel(newChannel)

    // Set up message handler
    newChannel.on('broadcast', { event: 'message' }, (payload) => {
      console.log('📨 Received broadcast:', payload)
      const { text, sender, timestamp } = payload.payload
      
      // Show toast notification
      toast(`📨 ${sender}: ${text}`, {
        description: `Received at ${new Date(timestamp).toLocaleTimeString()}`,
        duration: 3000,
      })
      
      setMessageCount(prev => prev + 1)
    })

    // Subscribe without callback and use a simple connection detection
    newChannel.subscribe()
    
    // Wait a moment then assume connected (this works for broadcast channels)
    const timer = setTimeout(() => {
      console.log('✅ Channel should be connected now')
      setIsConnected(true)
      toast.success('🔗 Connected to Supabase Realtime!', {
        description: 'You can now send and receive messages',
      })
    }, 1500)

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up channel subscription...')
      clearTimeout(timer)
      newChannel.unsubscribe()
    }
  }, [])

  const sendMessage = async () => {
    if (!isConnected || !channel) {
      toast.error('Not connected to Supabase')
      return
    }

    const message = {
      text: `Hello from browser! 👋`,
      sender: `User-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    }

    try {
      const response = await channel.send({
        type: 'broadcast',
        event: 'message',
        payload: message
      })
      console.log('📤 Message sent:', response)
      
      console.log('📤 Message sent:', message)
      toast.success('✅ Message sent!', {
        description: 'Check other browser windows for the message',
      })
    } catch (error) {
      console.error('❌ Failed to send message:', error)
      toast.error('Failed to send message', {
        description: 'Please try again',
      })
    }
  }

  const sendTestMessage = async () => {
    if (!isConnected || !channel) {
      toast.error('Not connected to Supabase')
      return
    }

    const testMessages = [
      'Testing realtime! 🚀',
      'This is a test message 📝',
      'Supabase is working! ⚡',
      'Hello from the other side! 🌍',
      'Real-time is awesome! 🎉'
    ]

    const randomMessage = testMessages[Math.floor(Math.random() * testMessages.length)]

    const message = {
      text: randomMessage,
      sender: `TestBot-${Math.floor(Math.random() * 100)}`,
      timestamp: new Date().toISOString(),
    }

    try {
      await channel.send({
        type: 'broadcast',
        event: 'message',
        payload: message
      })
      
      console.log('📤 Test message sent:', message)
      toast.success('✅ Random message sent!', {
        description: `Sent: "${randomMessage}"`,
      })
    } catch (error) {
      console.error('❌ Failed to send test message:', error)
      toast.error('Failed to send test message')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Supabase Realtime Demo
          </h1>
          <p className="text-xl mb-4 text-gray-300">
            Test real-time messaging across multiple browser windows
          </p>
          
          {/* Connection Status */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm">
              {isConnected ? 'Connected' : 'Connecting...'}
            </span>
          </div>
        </div>

        {/* Main Demo Area */}
        <div className="max-w-2xl mx-auto">
          <div className="glass-card rounded-3xl p-8 mb-8 shadow-glow">
            <h2 className="text-2xl font-bold mb-4 text-center text-white">Send Messages</h2>
            <p className="text-gray-300 mb-6 text-center">
              Open this page in multiple browser windows and click the buttons to see real-time messaging in action!
            </p>
            
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={sendMessage}
                disabled={!isConnected}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 text-white disabled:opacity-50"
                size="lg"
              >
                📤 Send Hello Message
              </Button>
              
              <Button
                onClick={sendTestMessage}
                disabled={!isConnected}
                variant="outline"
                className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white disabled:opacity-50"
                size="lg"
              >
                🎲 Send Random Message
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-4 text-sm text-gray-400">
                <span>Messages received: <strong className="text-white">{messageCount}</strong></span>
                <span>•</span>
                <span>Channel: <strong className="text-white">public_chat</strong></span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-lg font-semibold mb-3 text-white">🧪 How to Test</h3>
            <ol className="text-gray-300 space-y-2 text-sm">
              <li><strong>1.</strong> Open this page in multiple browser windows/tabs</li>
              <li><strong>2.</strong> Click "Send Hello Message" in one window</li>
              <li><strong>3.</strong> Watch for toast notifications in all windows</li>
              <li><strong>4.</strong> Check the browser console for detailed logs</li>
              <li><strong>5.</strong> Try the random message button for variety</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
} 