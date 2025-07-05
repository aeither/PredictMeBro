const { config } = require('dotenv')
const { spawn } = require('child_process')

// Load environment variables
config({ path: '.env' })

// Run the test
const child = spawn('npx', ['tsx', 'src/utils/test-supabase.ts'], {
  stdio: 'inherit',
  env: { ...process.env }
})

child.on('close', (code) => {
  console.log(`Test finished with code ${code}`)
})