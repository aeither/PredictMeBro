# PredictMeBro

<div align="center">
  <img src="public/logo.png" alt="PredictMeBro Logo" width="200" height="200">
</div>

A decentralized sentiment prediction market platform where users can vote "Yes" or "No" on various predictions and market outcomes. Built with Vite + React, TanStack Router for routing, and Wagmi for Ethereum wallet integration.

## The Problem We Solve

🔍 **Lack of Accessible Prediction Markets**
- Traditional prediction markets are complex and intimidating for everyday users
- High barriers to entry with complicated interfaces and processes
- Limited real-time engagement and community interaction

📊 **Unreliable Sentiment Data**
- Current sentiment analysis tools lack human intuition and context
- Centralized platforms can manipulate or bias prediction outcomes
- No transparent way to track collective market sentiment over time

💰 **Missed Opportunities for Crowd Intelligence**
- Individual predictions are often less accurate than collective wisdom
- No easy way to monetize prediction skills and market knowledge
- Limited platforms that combine social sentiment with financial incentives

## Our Solution

✅ **Simple Yes/No Voting Interface**
- Intuitive binary choice system that anyone can understand and use
- Real-time voting results with live updates across all connected devices
- Seamless wallet integration for secure, blockchain-based participation

🌐 **Decentralized & Transparent**
- Blockchain-based voting ensures transparency and immutability
- Real-time synchronization across multiple devices and users
- Community-driven predictions with verifiable on-chain results

⚡ **Gamified Prediction Experience**
- Earn rewards for accurate predictions and active participation
- Social features with live user counts and community engagement
- Beautiful, responsive interface with instant feedback and notifications

## How It's Made

### 🏗️ **Technical Architecture**

PredictMeBro is built using a modern, scalable tech stack designed for performance, developer experience, and user accessibility:

#### **Frontend Stack**
- **⚡ Vite + React 19**: Lightning-fast development with the latest React features
- **🎯 TypeScript**: Full type safety throughout the application for robust development
- **🎨 Tailwind CSS**: Utility-first CSS framework for rapid, responsive UI development
- **🧭 TanStack Router**: File-based routing with full TypeScript support and type-safe navigation
- **📱 Responsive Design**: Mobile-first approach with glass-morphism UI effects

#### **Blockchain Integration**
- **🔗 Wagmi v2**: React hooks for Ethereum wallet connection and smart contract interaction
- **⚙️ Viem**: Low-level Ethereum utilities for type-safe blockchain operations
- **🌊 Flow Blockchain**: Primary blockchain for low-cost, fast transactions
- **🛡️ Ronin Blockchain**: Secondary blockchain support for broader ecosystem reach
- **👛 Privy Authentication**: Seamless wallet connection with multiple provider support

#### **Real-time Infrastructure**
- **📡 Supabase Realtime**: PostgreSQL-based real-time data synchronization
- **🔄 Live Notifications**: Cross-device toast notifications for pool creation and voting
- **📊 Live Updates**: Real-time vote counts and pool status updates
- **🎯 Event Broadcasting**: Custom event system for user actions and notifications

#### **Smart Contract Architecture**
```solidity
// Multi-network deployment strategy
Flow Testnet: 0x903F029e949b090216799AC53fdE6AaE343151b1
Ronin Testnet: 0x2b86c3b937a37Bc14c6556a59CF388180081BB95
```

### 🎯 **Key Design Decisions**

#### **1. Simplified UX Approach**
- **Binary Voting**: Reduced cognitive load with simple Yes/No choices
- **Visual Feedback**: Immediate visual confirmation for all user actions
- **Progressive Enhancement**: Works without wallet connection, enhanced with it

#### **2. Multi-Chain Strategy**
- **Flow**: Primary chain for fast, low-cost transactions and better UX
- **Ronin**: Gaming-focused blockchain for broader ecosystem integration
- **Dynamic Contract Loading**: Automatic contract selection based on route

#### **3. Real-time First Architecture**
```typescript
// Realtime notification system
usePoolNotifications() // Listen for pool creation events
useBroadcastPoolCreation() // Broadcast pool creation to other users
useVoteNotifications() // Live vote updates across devices
```

#### **4. State Management Strategy**
- **TanStack Query**: Server state management with caching and synchronization
- **Wagmi State**: Blockchain state management with automatic updates
- **Local State**: React hooks for component-level state management
- **Supabase**: Real-time data synchronization across users

### 🛠️ **Development Approach**

#### **Type-Safe Development**
```typescript
// Complete type safety from contracts to UI
interface Pool {
  id: string
  question: string
  totalAmount: number
  yesVotes: number
  noVotes: number
  endsAt: string
  claimableAmount?: number
  isResolved?: boolean
}
```

#### **Component Architecture**
- **Atomic Design**: Reusable UI components with consistent styling
- **Custom Hooks**: Business logic separation with reusable hooks
- **Provider Pattern**: Context providers for global state management

#### **Real-time Event System**
```typescript
// Event-driven architecture for live updates
export const EVENT_TYPES = {
  VOTE: 'vote',
  POOL_CREATED: 'pool_created',
  POOL_RESOLVED: 'pool_resolved',
  REWARD_CLAIMED: 'reward_claimed'
}
```

### 🎨 **UI/UX Philosophy**

#### **Glass-morphism Design**
- **Backdrop Blur Effects**: Modern, elegant visual hierarchy
- **Gradient Overlays**: Beautiful color transitions and depth
- **Card-based Layout**: Consistent, scannable information architecture

#### **Accessibility First**
- **Keyboard Navigation**: Full keyboard accessibility support
- **Screen Reader Support**: Semantic HTML and ARIA labels
- **Color Contrast**: WCAG compliant color schemes
- **Responsive Design**: Mobile-first approach with touch-friendly interactions

#### **Performance Optimization**
- **Code Splitting**: Dynamic imports for optimal bundle sizes
- **Image Optimization**: Optimized assets with proper loading strategies
- **Caching Strategy**: Aggressive caching for static assets and API responses

### 🔐 **Security & Best Practices**

#### **Smart Contract Security**
- **Multi-signature Wallets**: Admin functions require multiple signatures
- **Reentrancy Guards**: Protection against reentrancy attacks
- **Access Control**: Role-based permissions for contract functions

#### **Frontend Security**
- **Input Validation**: Client and server-side validation
- **XSS Protection**: Sanitized user inputs and CSP headers
- **Wallet Security**: Non-custodial approach with user-controlled private keys

### 📈 **Scalability Strategy**

#### **Database Design**
- **Supabase PostgreSQL**: Scalable relational database with real-time capabilities
- **Row Level Security**: User-based data access control
- **Connection Pooling**: Efficient database connection management

#### **Caching Layer**
- **TanStack Query**: Intelligent client-side caching
- **CDN Distribution**: Global content delivery for static assets
- **Edge Functions**: Serverless functions for real-time processing

## Features

- 🍞 **Sonner Toast**: Beautiful toast notifications with multiple variants
- 🔗 **TanStack Router**: File-based routing with full TypeScript support
- 🏦 **Wagmi Integration**: Connect to Ethereum wallets and interact with blockchain
- ⚡ **Vite + React**: Lightning-fast development with React 19
- 🎨 **Tailwind CSS**: Utility-first CSS framework
- 📝 **TypeScript**: Full type safety throughout the application

## Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Run the development server:
```bash
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Toast Notifications with Socket.IO

The app features real-time toast notifications that sync across all connected devices and browser tabs.

**Basic Usage:**
```tsx
import { toast } from "sonner"

// Simple toast
toast("Hello World")

// Success toast
toast.success("Success message", {
  description: "This is a success toast"
})

// Error toast
toast.error("Error message", {
  description: "This is an error toast"
})

// Toast with action
toast("Event created", {
  description: "Sunday, December 03, 2023 at 9:00 AM",
  action: {
    label: "Undo",
    onClick: () => console.log("Undo"),
  },
})
```

**Real-time Synchronization:**
- When you trigger a toast on one device, it appears on all other connected devices
- Toast notifications include a "📱 From another device" indicator for remote toasts
- Connection status is displayed with a live indicator
- Active user count is shown in real-time

### Wagmi Integration

Use Wagmi hooks to interact with Ethereum wallets:

```tsx
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { injected } from "wagmi/connectors"

function WalletComponent() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  return (
    <div>
      {isConnected ? (
        <div>
          <p>Address: {address}</p>
          <button onClick={() => disconnect()}>Disconnect</button>
        </div>
      ) : (
        <button onClick={() => connect({ connector: injected() })}>
          Connect Wallet
        </button>
      )}
    </div>
  )
}
```

## Configuration

### Wagmi Configuration

The Wagmi configuration is located in `src/config/wagmi.ts`:

```tsx
import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'

export const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})
```

### Providers Setup

The app is wrapped with necessary providers in `src/app/providers.tsx`:

- **WagmiProvider**: Provides Wagmi context
- **QueryClientProvider**: Provides TanStack Query context for async state management

## Dependencies

- `sonner`: Toast notifications
- `@supabase/supabase-js`: Real-time database and authentication
- `@tanstack/react-router`: File-based routing for React
- `wagmi`: React hooks for Ethereum
- `viem`: TypeScript interface for Ethereum
- `@tanstack/react-query`: Async state management
- `tailwindcss`: Utility-first CSS framework

## Development

To test the integration:

1. **Prediction Markets**: 
   - Create and vote on prediction pools
   - Watch real-time vote updates across multiple tabs
   - Test different wallet connections and integrations

2. **Wagmi Demo**: Connect your wallet (requires MetaMask or similar) to test Ethereum integration

## Real-time Features

The app uses Supabase for real-time data synchronization:

- **Real-time Updates**: Pool votes and predictions update in real-time
- **Type Safety**: Complete type safety with TypeScript throughout
- **Scalable Architecture**: Built on Supabase's real-time infrastructure
- **Efficient Updates**: Only changed data is transmitted for optimal performance

## Learn More

- [Sonner Documentation](https://sonner.emilkowal.ski/)
- [Wagmi Documentation](https://wagmi.sh/)
- [Vite Documentation](https://vitejs.dev/)
- [TanStack Router Documentation](https://tanstack.com/router)
- [Viem Documentation](https://viem.sh/)
