# 🚀 Supabase Database Realtime Setup Guide

## 1. Create Environment Variables

Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://dakggcfdthlsxkyobohc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

**Get your anon key:**
1. Go to your Supabase project: https://dakggcfdthlsxkyobohc.supabase.co
2. Navigate to **Settings** → **API**
3. Copy the **anon/public key**
4. Replace `your_actual_anon_key_here` with the actual key

## 2. Create Required Database Tables

Execute these SQL commands in your Supabase SQL Editor:

### Create Events Table
```sql
-- Create events table for realtime notifications
CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for the events table
ALTER PUBLICATION supabase_realtime ADD TABLE events;
```

### Create Votes Table (Optional - for future use)
```sql
-- Create votes table for vote tracking
CREATE TABLE votes (
  id BIGSERIAL PRIMARY KEY,
  pool_id TEXT NOT NULL,
  vote TEXT NOT NULL CHECK (vote IN ('yes', 'no')),
  wallet_address TEXT NOT NULL,
  blockchain TEXT NOT NULL CHECK (blockchain IN ('flow', 'ronin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for the votes table
ALTER PUBLICATION supabase_realtime ADD TABLE votes;
```

## 3. Set Up Row Level Security (RLS)

Enable RLS and create policies for public access:

```sql
-- Enable RLS on events table
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read events
CREATE POLICY "Allow public read access on events" ON events
  FOR SELECT USING (true);

-- Create policy to allow everyone to insert events
CREATE POLICY "Allow public insert access on events" ON events
  FOR INSERT WITH CHECK (true);

-- Enable RLS on votes table
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read votes
CREATE POLICY "Allow public read access on votes" ON votes
  FOR SELECT USING (true);

-- Create policy to allow everyone to insert votes
CREATE POLICY "Allow public insert access on votes" ON votes
  FOR INSERT WITH CHECK (true);
```

## 4. Test the Setup

1. **Start your Next.js app:**
   ```bash
   pnpm dev
   ```

2. **Open multiple browser tabs** to http://localhost:3000

3. **Test realtime functionality:**
   - Go to the home page and click toast demo buttons
   - Go to prediction pages and vote
   - You should see real-time notifications across all tabs!

## 5. How It Works

### Database Realtime Flow:
1. **User Action** → Button click (vote/toast)
2. **Database Insert** → Event inserted into `events` table
3. **Realtime Trigger** → Supabase detects INSERT via postgres_changes
4. **Broadcast** → All connected clients receive the event
5. **UI Update** → Toast notification shows on all devices

### Event Types:
- **`vote`** - When users vote on prediction pools
- **`toast`** - When users trigger toast demo messages

### Table Structure:
```sql
events:
├── id (bigint, auto-increment)
├── type (text) - 'vote' or 'toast'
├── data (jsonb) - Event payload
└── created_at (timestamp)
```

## 6. Troubleshooting

### ❌ "Invalid API key" Error
- Double-check your `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
- Make sure the key is copied correctly from Supabase dashboard

### ❌ "Permission denied" Error  
- Verify RLS policies are created correctly
- Check that `supabase_realtime` publication includes your tables

### ❌ "No realtime events received"
- Confirm tables are added to realtime publication
- Check browser console for connection errors
- Verify environment variables are loaded correctly

### ✅ Success Indicators:
- Green dot shows "Connected via Database" in components
- Toast notifications appear across multiple browser tabs
- Console shows "Supabase Realtime connected successfully"

## 7. Production Deployment

When deploying to Vercel:
1. Add environment variables to Vercel project settings
2. Use the same `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. No separate server needed - everything runs on Supabase infrastructure!

## 8. Advantages Over Socket.IO

✅ **No separate server** - Fully managed by Supabase  
✅ **Auto-scaling** - Handles traffic spikes automatically  
✅ **Built-in security** - RLS policies protect your data  
✅ **Database persistence** - Events are stored for auditing  
✅ **Easy deployment** - Just deploy your Next.js app to Vercel  

---

**🎉 You're all set!** Your prediction market now has real-time notifications powered by Supabase database realtime. 