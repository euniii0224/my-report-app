'use client'

import { WagmiProvider, createConfig, http } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { metaMask } from 'wagmi/connectors'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const config = createConfig({
  chains: [sepolia],
  connectors: [
    metaMask({
      dappMetadata: {
        name: '블록체인 익명 신고 시스템',
        url: 'https://my-report-app-beta.vercel.app',
      },
    }),
  ],
  transports: { [sepolia.id]: http() },
})

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
