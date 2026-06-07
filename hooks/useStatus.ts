// 제보 상태 조회 훅
// 조회코드(trackingCode)로 블록체인에서 제보 현황을 읽어오는 훅
// useContractRead 사용 (데이터 읽기만 하므로 가스비 없음)

import { useReadContract } from 'wagmi'
import ReportABI from '../abi/Report.json'

const CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`
export function useStatus(trackingCode: `0x${string}` | undefined) {
  const { data, isLoading, isError, error } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ReportABI.abi,
    functionName: 'getReportByCode',
    args: trackingCode ? [trackingCode] : undefined,
    query: {
      enabled: !!trackingCode, // trackingCode 있을 때만 조회
    },
  })

  // 컨트랙트 반환값: [id, category, status, timestamp]
  const reportData = data as [bigint, string, number, bigint] | undefined

  return {
    id: reportData?.[0],
    category: reportData?.[1],
    status: reportData?.[2], // 0:접수 1:검토중 2:처리완료 3:비공개
    timestamp: reportData?.[3],
    isLoading,
    isError,
    error,
  }
}
