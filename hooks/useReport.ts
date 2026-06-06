// 제보 등록 트랜잭션을 호출하는 훅
// 3번 팀원(IPFS)이 넘겨준 ipfsHash와 카테고리를 받아서 컨트랙트의 submitReport() 호출
// 트랜잭션 성공 시 조회코드(trackingCode) 반환
// useAllReports: 관리자용 전체 제보 목록 조회
// usePublicReports: 공개 제보 목록 조회
// useUpdateStatus: 관리자용 상태 변경

import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  useAccount,
} from 'wagmi'
import { decodeEventLog } from 'viem'
import ReportABI from '../abi/Report.json'

const CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`

// 상태값 매핑
export const STATUS_MAP: Record<number, string> = {
  0: '접수',
  1: '검토중',
  2: '처리완료',
  3: '반려',
}

// 제보 데이터 타입
export interface ReportData {
  id: bigint
  reporter: string
  ipfsHash: string
  category: string
  status: number
  timestamp: bigint
  trackingCode: string
}

// ─────────────────────────────────────────
// 제보 등록 훅
// ─────────────────────────────────────────
export function useReport() {
  const {
    writeContract,
    data: txHash,
    isPending,
    isError,
    error,
  } = useWriteContract()

  const {
    isLoading: isConfirming,
    isSuccess,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  let trackingCode: `0x${string}` | null = null

  if (receipt) {
    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: ReportABI.abi,
          data: log.data,
          topics: log.topics,
        })
        if (decoded.eventName === 'ReportSubmitted') {
          trackingCode = (decoded.args as any).trackingCode
          break
        }
      } catch {
        // 다른 이벤트 로그는 무시
      }
    }
  }

  const submitReport = (ipfsHash: string, category: string) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: ReportABI.abi,
      functionName: 'submitReport',
      args: [ipfsHash, category],
    })
  }

  return {
    submitReport,
    txHash,
    trackingCode,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
  }
}

// ─────────────────────────────────────────
// 관리자용 전체 제보 목록 조회 훅
// ─────────────────────────────────────────
export function useAllReports() {
  const { address } = useAccount()

  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ReportABI.abi,
    functionName: 'getAllReports',
    account: address,
  })

  const reports = (data as ReportData[] | undefined) ?? []

  return { reports, isLoading, error, refetch }
}

// ─────────────────────────────────────────
// 공개 제보 목록 조회 훅
// ─────────────────────────────────────────
export function usePublicReports() {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ReportABI.abi,
    functionName: 'getPublicReports',
  })

  const reports = (data as ReportData[] | undefined) ?? []

  return { reports, isLoading, error }
}

// ─────────────────────────────────────────
// 관리자용 상태 변경 훅
// ─────────────────────────────────────────
export function useUpdateStatus() {
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

  const updateStatus = (id: bigint, newStatus: number) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: ReportABI.abi,
      functionName: 'updateStatus',
      args: [id, newStatus],
    })
  }

  return { updateStatus, isPending, isConfirming, isSuccess, isError, error }
}
