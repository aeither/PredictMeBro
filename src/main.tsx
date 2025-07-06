import { PrivyProvider } from '@privy-io/react-auth'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'sonner'
import { WagmiProvider } from 'wagmi'
import { getDefaultConfig, TantoProvider } from '@sky-mavis/tanto-widget'
import { ronin, saigon } from 'viem/chains'
import { defineChain } from 'viem'

import { config } from './config/wagmi'
import * as TanStackQueryProvider from './integrations/tanstack-query/root-provider.tsx'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

import reportWebVitals from './reportWebVitals.ts'
import './styles.css'

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    ...TanStackQueryProvider.getContext(),
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <WagmiProvider config={config}>
        <TantoProvider 
          theme="dark"
          config={{
            initialChainId: 2020, // Ronin Mainnet
          }}
        >
          <PrivyProvider
            appId={import.meta.env.VITE_PRIVY_APP_ID || 'your-privy-app-id'}
            config={{
              appearance: {
                theme: 'dark',
                accentColor: '#8b5cf6',
                logo: '/logo.png',
              },
              embeddedWallets: {
                createOnLogin: 'users-without-wallets',
              },
            }}
          >
            <TanStackQueryProvider.Provider>
              <RouterProvider router={router} />
              <Toaster richColors position="top-right" />
            </TanStackQueryProvider.Provider>
          </PrivyProvider>
        </TantoProvider>
      </WagmiProvider>
    </StrictMode>,
  )
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
