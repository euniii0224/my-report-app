'use client'

import { WagmiProvider, createConfig, http } from 'wagmi'
import { sepolia } from 'wagmi/chains' // sepolia → hardhat 으로 변경
import { metaMask } from 'wagmi/connectors'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const config = createConfig({
  chains: [sepolia], // sepolia → hardhat 으로 변경
  connectors: [metaMask()],
  transports: { [sepolia.id]: http() }, // 로컬 주소 명시
})

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
