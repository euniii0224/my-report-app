// MetaMask 지갑 연결/해제 및 연결 상태를 관리하는 커스텀 훅
// address(지갑 주소), isConnected(연결 여부), connect(연결), disconnect(해제) 반환
// isAdmin: 관리자 지갑 주소 여부 판별

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { metaMask } from 'wagmi/connectors'

const ADMIN_ADDRESS = '0xfF80c7d4044Db6BAABe41C98dCe27123aD8eDB75' // 여기에 Sepolia 배포한 지갑 주소

export function useAuth() {
  const { address, isConnected } = useAccount()
  const { connect, error } = useConnect()
  const { disconnect } = useDisconnect()

  const isAdmin = address?.toLowerCase() === ADMIN_ADDRESS.toLowerCase()

  console.log('현재 주소:', address)
  console.log('관리자 주소:', ADMIN_ADDRESS)
  console.log('isAdmin:', isAdmin)
  console.log('connect 에러:', error)

  return {
    address,
    isConnected,
    isAdmin,
    connect: () => connect({ connector: metaMask() }),
    disconnect,
  }
}
