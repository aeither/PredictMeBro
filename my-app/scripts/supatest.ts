import { createClient } from '@supabase/supabase-js'

// Use your environment variables or hardcode for testing
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://dakggcfdthlsxkyobohc.supabase.co'
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRha2dnY2ZkdGhsc3hreW9ib2hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NDAxNTksImV4cCI6MjA2NzMxNjE1OX0.4jh5L-l-XcnspBYfdnuFgtEjkhGt-Jh6dwipsVDI95c'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Create or join a channel
const channel = supabase.channel('public_chat')

// Listen for broadcast messages
channel.on(
  'broadcast',
  { event: 'message' },
  (payload) => {
    console.log('Received broadcast:', payload)
  }
).subscribe((status) => {
  if (status === 'SUBSCRIBED') {
    console.log('Subscribed to broadcast channel!')

    // Example: Send a broadcast message after subscribing
    channel.send({
      type: 'broadcast',
      event: 'message',
      payload: { text: 'Hello from TypeScript!', sender: 'user123' }
    })
  }
})

// Optional: Function to send a message
export const sendMessage = async (text: string, sender: string) => {
  await channel.send({
    type: 'broadcast',
    event: 'message',
    payload: { text, sender }
  })
}
