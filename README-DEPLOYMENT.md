# 🚀 Deployment Guide: Socket.IO + Vercel

## 📋 Overview

This app requires **TWO separate deployments**:
1. **Next.js App** → Deploy to **Vercel** (frontend)
2. **Socket.IO Server** → Deploy to **Railway/Heroku** (backend)

## 🎯 Why This Setup?

**Problem**: Vercel doesn't support Socket.IO persistent connections
**Solution**: Separate Socket.IO server + environment-aware client

## 🔧 Local Development

```bash
# Install dependencies
pnpm install

# Run both Next.js app AND Socket.IO server
pnpm dev
```

This runs:
- Next.js app on `http://localhost:3000`
- Socket.IO server on `http://localhost:3001`

## 🌐 Production Deployment

### 1. Deploy Socket.IO Server (Railway - Free)

1. **Create Railway Account**: https://railway.app
2. **Create New Project** → "Deploy from GitHub"
3. **Select Repository** → Connect your GitHub repo
4. **Configure Build**:
   - Build Command: `pnpm install && pnpm build`
   - Start Command: `pnpm socket:start`
   - Port: `3001`

5. **Environment Variables**:
   ```env
   NODE_ENV=production
   PORT=3001
   ```

6. **Deploy** → Railway will provide a URL like:
   `https://predictmebro-socket.up.railway.app`

### 2. Deploy Next.js App (Vercel)

1. **Create Vercel Account**: https://vercel.com
2. **Import Project** → Connect your GitHub repo
3. **Environment Variables**:
   ```env
   NEXT_PUBLIC_SOCKET_URL=https://predictmebro-socket.up.railway.app
   NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
   PRIVY_APP_SECRET=your_privy_secret
   ```

4. **Deploy** → Vercel will provide a URL like:
   `https://predictmebro.vercel.app`

### 3. Update Socket.IO Server CORS

Update `server-socket.ts` with your production domains:

```typescript
origin: process.env.NODE_ENV === 'production' 
  ? ["https://predictmebro.vercel.app", "https://predictmebro.com"]
  : ["http://localhost:3000", "http://localhost:3001"],
```

## 🔄 How It Works

### Development
```
Browser → localhost:3000 (Next.js) → localhost:3001 (Socket.IO)
```

### Production
```
Browser → predictmebro.vercel.app (Next.js) → predictmebro-socket.railway.app (Socket.IO)
```

## 📱 Testing

1. **Local**: Open multiple tabs of `localhost:3000`
2. **Production**: Open multiple tabs of your Vercel URL
3. **Vote on predictions** → See real-time notifications across tabs

## 🛠️ Alternative Deployment Options

### Socket.IO Server Alternatives:
- **Heroku** (free tier available)
- **Render** (free tier available)
- **DigitalOcean** (paid)
- **AWS/GCP** (paid)

### Managed Alternatives:
- **Ably** (WebSocket as a Service)
- **Pusher** (WebSocket as a Service)
- **Socket.IO Cloud** (Official managed service)

## 🚨 Common Issues & Solutions

### Issue: "Socket.IO Disconnected" in Production
**Solution**: Check CORS settings in `server-socket.ts`

### Issue: "Cannot connect to Socket.IO server"
**Solution**: Verify `NEXT_PUBLIC_SOCKET_URL` environment variable

### Issue: "Real-time notifications not working"
**Solution**: Check browser console for Socket.IO connection errors

## 📊 Monitoring

### Railway Dashboard
- View Socket.IO server logs
- Monitor connection metrics
- Check server health

### Vercel Dashboard  
- View Next.js app logs
- Monitor frontend performance
- Check deployment status

## 🔐 Security Considerations

1. **CORS**: Restrict to your production domains only
2. **Environment Variables**: Never commit secrets to code
3. **Rate Limiting**: Add rate limiting to Socket.IO endpoints
4. **Authentication**: Consider adding Socket.IO authentication

## 💡 Tips

1. **Start Small**: Deploy to free tiers first
2. **Monitor Usage**: Watch for connection limits
3. **Scale Gradually**: Upgrade plans as needed
4. **Use CDN**: Consider CDN for static assets

## 📞 Support

- **Railway**: https://railway.app/help
- **Vercel**: https://vercel.com/support
- **Socket.IO**: https://socket.io/docs/

---

**✅ Your app is now production-ready with real-time features!** 