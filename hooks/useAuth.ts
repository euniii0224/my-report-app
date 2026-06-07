// MetaMask 지갑 연결/해제 및 연결 상태를 관리하는 커스텀 훅
// address(지갑 주소), isConnected(연결 여부), connect(연결), disconnect(해제) 반환
// isAdmin: 컨트랙트에서 관리자 여부 확인

import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi'
import { metaMask } from 'wagmi/connectors'
import ReportABI from '../abi/Report.json'

const CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`

export function useAuth() {
  const { address, isConnected } = useAccount()
  const { connect, error } = useConnect()
  const { disconnect } = useDisconnect()

  // 컨트랙트에서 관리자 여부 확인
  const { data: isAdminData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ReportABI.abi,
    functionName: 'isAdmin',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const isAdmin = !!isAdminData

  console.log('현재 주소:', address)
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

// 관리자 목록 조회 훅 (owner만)
export function useAdminList() {
  const { address } = useAccount()

  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ReportABI.abi,
    functionName: 'getAdminList',
    account: address,
    query: { enabled: !!address },
  })

  const adminList = (data as string[] | undefined) ?? []
  return { adminList, isLoading, refetch }
}

// 관리자 추가 훅 (owner만)
export function useAddAdmin() {
  const {
    writeContract,
    data: txHash,
    isPending,
    isError,
    error,
  } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  const addAdmin = (adminAddress: string) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: ReportABI.abi,
      functionName: 'addAdmin',
      args: [adminAddress as `0x${string}`],
    })
  }

  return { addAdmin, isPending, isConfirming, isSuccess, isError, error }
}

// 관리자 삭제 훅 (owner만)
export function useRemoveAdmin() {
  const {
    writeContract,
    data: txHash,
    isPending,
    isError,
    error,
  } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  const removeAdmin = (adminAddress: string) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: ReportABI.abi,
      functionName: 'removeAdmin',
      args: [adminAddress as `0x${string}`],
    })
  }

  return { removeAdmin, isPending, isConfirming, isSuccess, isError, error }
}
