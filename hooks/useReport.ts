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

export const STATUS_MAP: Record<number, string> = {
  0: '접수',
  1: '검토중',
  2: '처리완료',
  3: '반려',
}

export interface ReportData {
  id: bigint
  reporter: string
  ipfsHash: string
  category: string
  status: number
  timestamp: bigint
  trackingCode: string
}

export interface CommentData {
  id: bigint
  reportId: bigint
  author: string
  content: string
  timestamp: bigint
  hidden: boolean
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

// ─────────────────────────────────────────
// 댓글 조회 훅 (hidden 제외)
// ─────────────────────────────────────────
export function useComments(reportId: bigint | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ReportABI.abi,
    functionName: 'getComments',
    args: reportId ? [reportId] : undefined,
    query: { enabled: !!reportId },
  })

  const comments = (data as CommentData[] | undefined) ?? []
  return { comments, isLoading, error, refetch }
}

// ─────────────────────────────────────────
// 관리자용 전체 댓글 조회 훅 (hidden 포함)
// ─────────────────────────────────────────
export function useAllComments(reportId: bigint | undefined) {
  const { address } = useAccount()

  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ReportABI.abi,
    functionName: 'getAllComments',
    args: reportId ? [reportId] : undefined,
    account: address,
    query: { enabled: !!reportId },
  })

  const comments = (data as CommentData[] | undefined) ?? []
  return { comments, isLoading, error, refetch }
}

// ─────────────────────────────────────────
// 댓글 등록 훅
// ─────────────────────────────────────────
export function useAddComment() {
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

  const addComment = (reportId: bigint, content: string) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: ReportABI.abi,
      functionName: 'addComment',
      args: [reportId, content],
    })
  }

  return { addComment, isPending, isConfirming, isSuccess, isError, error }
}

// ─────────────────────────────────────────
// 댓글 숨김 처리 훅 (관리자만)
// ─────────────────────────────────────────
export function useHideComment() {
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

  const hideComment = (reportId: bigint, commentIndex: number) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: ReportABI.abi,
      functionName: 'hideComment',
      args: [reportId, BigInt(commentIndex)],
    })
  }

  return { hideComment, isPending, isConfirming, isSuccess, isError, error }
}

// ─────────────────────────────────────────
// 댓글 숨김 해제 훅 (관리자만)
// ─────────────────────────────────────────
export function useUnhideComment() {
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

  const unhideComment = (reportId: bigint, commentIndex: number) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: ReportABI.abi,
      functionName: 'unhideComment',
      args: [reportId, BigInt(commentIndex)],
    })
  }

  return { unhideComment, isPending, isConfirming, isSuccess, isError, error }
}
