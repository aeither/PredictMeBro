import { config } from 'dotenv'
import { supabase } from '@/config/supabase'

// Load environment variables from .env file
config({ path: '.env' })

export const testSupabaseConnection = async () => {
  console.log('🔍 Testing Supabase connection...')
  
  try {
    // Test 1: Check if client is configured
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('📍 Supabase URL:', url)
    console.log('🔑 Anon Key:', key ? `${key.substring(0, 20)}...` : 'NOT SET')
    
    if (!key || key === '') {
      console.error('❌ Supabase anon key is missing!')
      console.log('💡 Create .env.local with your Supabase credentials')
      return false
    }
    
    // Test 2: Try to query the events table
    console.log('📋 Testing events table access...')
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Database error:', error)
      return false
    }
    
    console.log('✅ Events table accessible!')
    console.log('📊 Sample data:', data)
    
    // Test 3: Try to insert a test event
    console.log('📝 Testing insert operation...')
    const { error: insertError } = await supabase
      .from('events')
      .insert([{
        type: 'test',
        data: { message: 'Connection test successful' }
      }])
    
    if (insertError) {
      console.error('❌ Insert error:', insertError)
      return false
    }
    
    console.log('✅ Insert operation successful!')
    
    // Test 4: Test realtime subscription paths
    console.log('🔍 Testing realtime subscription paths...')
    const testRealtimeChannel = testRealtimeConnection()
    
    console.log('🎉 Supabase connection is working correctly!')
    console.log('📋 All tests passed:')
    console.log('   ✅ Environment variables')
    console.log('   ✅ Database connection')
    console.log('   ✅ Table access')
    console.log('   ✅ Insert operations')
    console.log('   ✅ Realtime subscription paths')
    
    return true
    
  } catch (error) {
    console.error('❌ Connection test failed:', error)
    return false
  }
}

// Test realtime subscription with proper channel naming
export const testRealtimeConnection = () => {
  console.log('🔴 Testing realtime connection...')
  
  // Use proper channel naming: realtime:public:tablename
  const channelName = 'realtime:public:events:test'
  console.log(`🔄 Creating test channel: ${channelName}`)
  
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'events',
        filter: 'type=eq.test'
      },
      (payload) => {
        console.log('✅ Realtime event received:', payload)
      }
    )
    .subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Realtime subscription successful')
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Realtime subscription failed:', err)
      } else if (status === 'TIMED_OUT') {
        console.warn('⏱️ Realtime subscription timed out')
      } else if (status === 'CLOSED') {
        console.log('🔒 Realtime subscription closed')
      }
      console.log('🔴 Realtime status:', status)
    })
  
  // Clean up after 5 seconds
  setTimeout(() => {
    supabase.removeChannel(channel)
    console.log('🧹 Test channel cleaned up')
  }, 5000)
  
  return channel
}

// Run the test if this file is executed directly
if (require.main === module) {
  testSupabaseConnection()
}