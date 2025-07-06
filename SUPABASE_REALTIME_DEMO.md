# Supabase Realtime Demo

## Overview
A minimal React + Vite + TypeScript page that demonstrates Supabase Realtime with Sonner toast notifications. Perfect for testing real-time messaging across multiple browser windows.

## Features

### ✅ **Real-time Messaging**
- Uses your existing Supabase configuration
- Connects to `public_chat` channel
- Broadcasts messages across all connected clients

### ✅ **Sonner Toast Integration**
- Shows toast notifications for incoming messages
- Success/error toasts for connection status
- Includes sender info and timestamps

### ✅ **Interactive UI**
- Connection status indicator (green/red dot)
- Two buttons: "Send Hello Message" and "Send Random Message"
- Message counter
- Step-by-step testing instructions

### ✅ **Error Handling**
- Connection status monitoring
- Graceful error handling with toast notifications
- Console logging for debugging

## How to Test

### 1. **Navigate to Demo**
- Go to `/supabase-demo` route
- Or click "Realtime Demo" in the header navigation

### 2. **Test Real-time Messaging**
1. Open the demo page in **two different browser windows**
2. Wait for "Connected" status (green dot)
3. Click "Send Hello Message" in one window
4. Watch toast notifications appear in **both windows**

### 3. **Expected Behavior**
- **Connection Toast**: "🔗 Connected to Supabase Realtime!"
- **Message Toast**: "📨 User-123: Hello from browser! 👋"
- **Console Logs**: Detailed connection and message logs
- **Message Counter**: Increments with each received message

## Technical Details

### Configuration
```typescript
const SUPABASE_URL = 'https://dakggcfdthlsxkyobohc.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### Channel Setup
```typescript
// Create fresh instances for each component (key fix for cross-window messaging)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
const channel = supabase.channel('public_chat', {
  config: {
    presence: { key: `user_${Math.random().toString(36).substring(7)}` }
  }
})

channel.on('broadcast', { event: 'message' }, (payload) => {
  toast(`📨 ${payload.payload.sender}: ${payload.payload.text}`)
})
channel.subscribe() // No callback - this was the key fix!
```

### Message Format
```typescript
{
  text: "Hello from browser! 👋",
  sender: "User-123",
  timestamp: "2024-01-15T10:30:00.000Z"
}
```

## Troubleshooting

### Fixed: "Connecting..." Issue ✅
**Problem**: Channel stayed on "Connecting..." forever
**Cause**: Using `.subscribe(callback)` which is not supported
**Solution**: Use `.subscribe()` without callback and simple timeout for connection detection

### Fixed: Cross-Window Messaging Issue ✅
**Problem**: Messages sent successfully but not received in other browser windows
**Cause**: Shared channel instance across component instances caused conflicts
**Solution**: Create fresh Supabase client and channel for each component instance with unique presence keys

### Connection Issues
- **Check Network**: Ensure internet connection
- **Supabase Status**: Verify Supabase service is running
- **Console Errors**: Look for WebSocket connection errors

### Messages Not Appearing
- **Different Windows**: Ensure testing in separate browser windows/tabs
- **Channel Name**: Verify both instances use same channel (`public_chat`)
- **Subscription Status**: Check connection status indicator

### Toast Not Showing
- **Sonner Setup**: Ensure Toaster component is in root layout
- **Import Issues**: Check `toast` import from 'sonner'
- **Browser Console**: Look for JavaScript errors

## Development Notes

### Dependencies Used
- `@supabase/supabase-js` - Supabase client
- `sonner` - Toast notifications (shadcn/ui)
- `@tanstack/react-router` - Routing
- React hooks: `useState`, `useEffect`

### Key Features
- **Automatic Cleanup**: Unsubscribes on component unmount
- **Connection Monitoring**: Real-time status updates
- **Random Messages**: Fun testing with variety
- **Responsive Design**: Works on mobile and desktop

## Next Steps

This demo can be extended with:
- User authentication
- Private channels
- Message history
- File sharing
- Typing indicators
- User presence

Perfect foundation for building real-time chat or collaboration features! 