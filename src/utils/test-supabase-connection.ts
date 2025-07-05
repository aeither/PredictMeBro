import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables from .env file
config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Testing Supabase connection...')
console.log('📍 Supabase URL:', supabaseUrl)
console.log('🔑 Anon Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NOT SET')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const testConnection = async () => {
  try {
    console.log('📋 Testing database connection...')
    
    // First, let's try to get the current user/session to test basic auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.log('ℹ️  Auth check (expected for anon key):', authError.message)
    } else {
      console.log('👤 Current user:', user)
    }
    
    // Try to query a system table to test basic database access
    console.log('📊 Testing basic database access...')
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(5)
    
    if (error) {
      console.error('❌ Database error:', error)
      
      // Try an alternative approach - test with a simple RPC or direct query
      console.log('🔄 Trying alternative connection test...')
      const { data: rpcData, error: rpcError } = await supabase.rpc('version')
      
      if (rpcError) {
        console.error('❌ RPC test failed:', rpcError)
        return false
      } else {
        console.log('✅ RPC test successful:', rpcData)
      }
    } else {
      console.log('✅ Database accessible!')
      console.log('📋 Available tables:', data?.map(t => t.table_name) || 'none')
    }
    
    console.log('🎉 Supabase connection is working correctly!')
    return true
    
  } catch (error) {
    console.error('❌ Connection test failed:', error)
    return false
  }
}

testConnection()