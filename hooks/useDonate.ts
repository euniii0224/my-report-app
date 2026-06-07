// 관리자 후원 훅
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from 'wagmi'
import { parseEther, formatEther } from 'viem'
import ReportABI from '../abi/Report.json'

const CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`

export function useDonate() {
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

  const donate = (amount: string) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: ReportABI.abi,
      functionName: 'donate',
      value: parseEther(amount),
    })
  }

  return { donate, isPending, isConfirming, isSuccess, isError, error }
}

export function useTotalDonated() {
  const { data, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ReportABI.abi,
    functionName: 'totalDonated',
  })

  const total = data ? formatEther(data as bigint) : '0'
  return { total, isLoading }
}
