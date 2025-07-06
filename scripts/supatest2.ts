import { createClient } from '@supabase/supabase-js'

// Use the same credentials as your main script
const SUPABASE_URL = 'https://dakggcfdthlsxkyobohc.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRha2dnY2ZkdGhsc3hreW9ib2hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NDAxNTksImV4cCI6MjA2NzMxNjE1OX0.4jh5L-l-XcnspBYfdnuFgtEjkhGt-Jh6dwipsVDI95c'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
const channel = supabase.channel('public_chat')

// Subscribe to the channel (optional, for logging)
channel.on(
  'broadcast',
  { event: 'message' },
  (payload) => {
    console.log('Received broadcast:', payload)
  }
).subscribe((status) => {
  if (status === 'SUBSCRIBED') {
    // Send a broadcast message
    channel.send({
      type: 'broadcast',
      event: 'message',
      payload: { text: 'Hello from the second script!', sender: 'user456' }
    })
    console.log('Broadcast message sent!')
  }
})
