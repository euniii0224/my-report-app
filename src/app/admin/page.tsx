'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import StatusBadge from '@/components/StatusBadge'
import {
  CommentData,
  STATUS_MAP,
  useAllComments,
  useAllReports,
  useHideComment,
  useUnhideComment,
  useUpdateStatus,
} from '../../../hooks/useReport'
import { useAuth } from '../../../hooks/useAuth'
import { decryptData } from '../../../utils/crypto'

interface ReportDetail {
  title?: string
  target?: string
  content?: string
  category?: string
}

// 댓글 관리 컴포넌트
function AdminCommentSection({ reportId }: { reportId: bigint }) {
  const { comments, isLoading, refetch } = useAllComments(reportId)
  const {
    hideComment,
    isPending: isHidePending,
    isSuccess: isHideSuccess,
  } = useHideComment()
  const {
    unhideComment,
    isPending: isUnhidePending,
    isSuccess: isUnhideSuccess,
  } = useUnhideComment()

  useEffect(() => {
    if (isHideSuccess || isUnhideSuccess) setTimeout(() => refetch(), 2000)
  }, [isHideSuccess, isUnhideSuccess])

  if (isLoading)
    return (
      <div style={{ fontSize: '13px', color: '#94A3B8' }}>
        댓글 불러오는 중...
      </div>
    )
  if (comments.length === 0)
    return (
      <div style={{ fontSize: '13px', color: '#94A3B8' }}>댓글이 없습니다</div>
    )

  return (
    <div style={{ marginTop: '16px' }}>
      <div
        style={{
          fontSize: '13px',
          fontWeight: 600,
          color: '#475569',
          marginBottom: '12px',
        }}
      >
        💬 댓글 관리 ({comments.length}개)
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {comments.map((comment: CommentData, i: number) => (
          <div
            key={i}
            style={{
              background: comment.hidden ? '#FEF2F2' : '#F8FAFC',
              borderRadius: '8px',
              padding: '10px 12px',
              border: `1px solid ${comment.hidden ? '#FCA5A5' : '#E2E8F0'}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              opacity: comment.hidden ? 0.7 : 1,
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '4px',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    color: '#7C3AED',
                    fontFamily: 'monospace',
                  }}
                >
                  {comment.author.slice(0, 6)}...{comment.author.slice(-4)}
                </span>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                  {new Date(
                    Number(comment.timestamp) * 1000,
                  ).toLocaleDateString('ko-KR')}
                </span>
                {comment.hidden && (
                  <span
                    style={{
                      fontSize: '10px',
                      background: '#FEF2F2',
                      color: '#DC2626',
                      border: '1px solid #FCA5A5',
                      borderRadius: '4px',
                      padding: '1px 6px',
                    }}
                  >
                    숨김처리됨
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: '13px',
                  color: comment.hidden ? '#94A3B8' : '#334155',
                  textDecoration: comment.hidden ? 'line-through' : 'none',
                }}
              >
                {comment.content}
              </div>
            </div>
            <div style={{ marginLeft: '8px', flexShrink: 0 }}>
              {comment.hidden ? (
                <button
                  onClick={() => unhideComment(reportId, i)}
                  disabled={isUnhidePending}
                  style={{
                    padding: '4px 10px',
                    background: '#ECFDF5',
                    color: '#059669',
                    border: '1px solid #6EE7B7',
                    borderRadius: '6px',
                    fontSize: '11px',
                    cursor: isUnhidePending ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  복구
                </button>
              ) : (
                <button
                  onClick={() => hideComment(reportId, i)}
                  disabled={isHidePending}
                  style={{
                    padding: '4px 10px',
                    background: '#FEF2F2',
                    color: '#DC2626',
                    border: '1px solid #FCA5A5',
                    borderRadius: '6px',
                    fontSize: '11px',
                    cursor: isHidePending ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  숨김
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {isHideSuccess && (
        <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '8px' }}>
          ✅ 댓글이 숨겨졌습니다!
        </p>
      )}
      {isUnhideSuccess && (
        <p style={{ fontSize: '12px', color: '#059669', marginTop: '8px' }}>
          ✅ 댓글이 복구되었습니다!
        </p>
      )}
    </div>
  )
}

export default function AdminPage() {
  const [mounted, setMounted] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [detailMap, setDetailMap] = useState<
    Record<string, ReportDetail | null>
  >({})
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const { isConnected, isAdmin, connect } = useAuth()
  const { reports, isLoading, error, refetch } = useAllReports()
  const { updateStatus, isPending, isConfirming, isSuccess } = useUpdateStatus()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (!isConnected) {
    return (
      <div
        style={{
          padding: '80px 32px',
          textAlign: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{ fontSize: '16px', color: '#334155', marginBottom: '16px' }}
        >
          관리자 페이지에 접근하려면 지갑을 연결하세요
        </div>
        <button
          onClick={connect}
          style={{
            padding: '10px 24px',
            background: '#7C3AED',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          MetaMask 연결
        </button>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div
        style={{
          padding: '80px 32px',
          textAlign: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ color: '#DC2626', fontSize: '16px' }}>
          ⛔ 관리자 권한이 없습니다
        </div>
      </div>
    )
  }

  const handleStatusChange = (id: bigint, newStatus: string) => {
    const statusNum = Object.entries(STATUS_MAP).find(
      ([, v]) => v === newStatus,
    )?.[0]
    if (statusNum !== undefined) {
      updateStatus(id, Number(statusNum))
      setTimeout(() => refetch(), 2000)
    }
  }

  const handleRowClick = async (id: string, ipfsHash: string) => {
    if (expandedId === id) {
      setExpandedId(null)
      return
    }
    setExpandedId(id)
    if (detailMap[id] !== undefined) return
    setLoadingId(id)
    try {
      const res = await axios.get(`/api/ipfs?hash=${ipfsHash}`)
      const encrypted = res.data?.encrypted
      if (encrypted) {
        const decrypted = decryptData(encrypted) as ReportDetail
        setDetailMap((prev) => ({ ...prev, [id]: decrypted }))
      } else {
        setDetailMap((prev) => ({ ...prev, [id]: null }))
      }
    } catch (e) {
      console.error('IPFS 조회 실패:', e)
      setDetailMap((prev) => ({ ...prev, [id]: null }))
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div
      style={{
        padding: '32px',
        maxWidth: '1000px',
        margin: '0 auto',
        fontFamily: 'sans-serif',
      }}
    >
      {isPending && (
        <div
          style={{
            padding: '10px 16px',
            background: '#FFF7ED',
            border: '1px solid #FCA55B',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '13px',
            color: '#7C4700',
          }}
        >
          ⏳ MetaMask 승인 대기 중...
        </div>
      )}
      {isConfirming && (
        <div
          style={{
            padding: '10px 16px',
            background: '#EDE9FE',
            border: '1px solid #A78BFA',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '13px',
            color: '#4C1D95',
          }}
        >
          🔄 블록체인에 기록 중...
        </div>
      )}
      {isSuccess && (
        <div
          style={{
            padding: '10px 16px',
            background: '#ECFDF5',
            border: '1px solid #6EE7B7',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '13px',
            color: '#064E3B',
          }}
        >
          ✅ 상태 변경 완료!
        </div>
      )}

      {/* 통계 카드 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {[
          { label: '전체 제보', value: reports.length, color: '#7C3AED' },
          {
            label: '처리 중',
            value: reports.filter((r) => r.status < 2).length,
            color: '#EA7C1A',
          },
          {
            label: '처리 완료',
            value: reports.filter((r) => r.status === 2).length,
            color: '#059669',
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            style={{
              background: '#fff',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '20px',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                color: '#94A3B8',
                marginBottom: '6px',
              }}
            >
              {label}
            </div>
            <div style={{ fontSize: '28px', fontWeight: 700, color }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* 제보 목록 */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #F1F5F9',
            fontSize: '14px',
            fontWeight: 600,
            color: '#1E293B',
          }}
        >
          제보 목록{' '}
          <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 400 }}>
            (행 클릭 시 상세 내용 확인)
          </span>
        </div>

        {isLoading ? (
          <div
            style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}
          >
            불러오는 중...
          </div>
        ) : error ? (
          <div style={{ padding: '20px', color: '#DC2626', fontSize: '13px' }}>
            <div style={{ fontWeight: 600, marginBottom: '8px' }}>
              ❌ 데이터를 불러오지 못했습니다
            </div>
            <div
              style={{
                background: '#FEF2F2',
                padding: '12px',
                borderRadius: '6px',
                fontFamily: 'monospace',
                fontSize: '12px',
              }}
            >
              {(error as any).message || JSON.stringify(error)}
            </div>
          </div>
        ) : reports.length === 0 ? (
          <div
            style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}
          >
            접수된 제보가 없습니다
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13px',
              }}
            >
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  {['ID', '카테고리', '신고자', '접수일자', '상태', '처리'].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          padding: '10px 14px',
                          textAlign: 'left',
                          fontWeight: 500,
                          color: '#64748B',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {reports.map((report, i) => {
                  const id = report.id.toString()
                  const isExpanded = expandedId === id
                  const detail = detailMap[id]
                  const isLoadingDetail = loadingId === id

                  return (
                    <React.Fragment key={id}>
                      <tr
                        onClick={() => handleRowClick(id, report.ipfsHash)}
                        style={{
                          borderBottom: isExpanded
                            ? 'none'
                            : '1px solid #F1F5F9',
                          background: isExpanded
                            ? '#F5F3FF'
                            : i % 2 === 0
                            ? '#fff'
                            : '#FAFAFA',
                          cursor: 'pointer',
                        }}
                      >
                        <td
                          style={{
                            padding: '12px 14px',
                            fontFamily: 'monospace',
                            color: '#7C3AED',
                            fontWeight: 600,
                          }}
                        >
                          #{id} {isExpanded ? '▲' : '▼'}
                        </td>
                        <td style={{ padding: '12px 14px', color: '#334155' }}>
                          {report.category}
                        </td>
                        <td
                          style={{
                            padding: '12px 14px',
                            fontFamily: 'monospace',
                            color: '#94A3B8',
                            fontSize: '11px',
                          }}
                        >
                          {report.reporter.slice(0, 6)}...
                          {report.reporter.slice(-4)}
                        </td>
                        <td
                          style={{
                            padding: '12px 14px',
                            color: '#94A3B8',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {new Date(
                            Number(report.timestamp) * 1000,
                          ).toLocaleDateString('ko-KR')}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <StatusBadge status={STATUS_MAP[report.status]} />
                        </td>
                        <td
                          style={{ padding: '12px 14px' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {report.status < 2 ? (
                            <select
                              defaultValue={STATUS_MAP[report.status]}
                              onChange={(e) =>
                                handleStatusChange(report.id, e.target.value)
                              }
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                border: '1px solid #E2E8F0',
                                fontSize: '12px',
                                cursor: 'pointer',
                                background: '#fff',
                                color: '#334155',
                              }}
                            >
                              <option value="접수">접수</option>
                              <option value="검토중">검토중</option>
                              <option value="처리완료">처리완료</option>
                              <option value="비공개">비공개</option>
                            </select>
                          ) : (
                            <span
                              style={{ color: '#059669', fontSize: '12px' }}
                            >
                              ✓ 완료
                            </span>
                          )}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td
                            colSpan={6}
                            style={{
                              padding: '0 14px 16px 14px',
                              background: '#F5F3FF',
                            }}
                          >
                            {isLoadingDetail ? (
                              <div
                                style={{
                                  padding: '16px',
                                  color: '#7C3AED',
                                  fontSize: '13px',
                                }}
                              >
                                🔄 IPFS에서 내용 불러오는 중...
                              </div>
                            ) : detail === null ? (
                              <div
                                style={{
                                  padding: '16px',
                                  color: '#DC2626',
                                  fontSize: '13px',
                                }}
                              >
                                ❌ 내용을 불러올 수 없습니다
                              </div>
                            ) : detail ? (
                              <div
                                style={{
                                  padding: '16px',
                                  background: '#fff',
                                  borderRadius: '8px',
                                  border: '1px solid #E2E8F0',
                                  display: 'grid',
                                  gap: '12px',
                                }}
                              >
                                {detail.title && (
                                  <div>
                                    <div
                                      style={{
                                        fontSize: '11px',
                                        color: '#94A3B8',
                                        marginBottom: '4px',
                                      }}
                                    >
                                      제목
                                    </div>
                                    <div
                                      style={{
                                        fontSize: '14px',
                                        color: '#1E293B',
                                        fontWeight: 600,
                                      }}
                                    >
                                      {detail.title}
                                    </div>
                                  </div>
                                )}
                                {detail.target && (
                                  <div>
                                    <div
                                      style={{
                                        fontSize: '11px',
                                        color: '#94A3B8',
                                        marginBottom: '4px',
                                      }}
                                    >
                                      대상
                                    </div>
                                    <div
                                      style={{
                                        fontSize: '14px',
                                        color: '#1E293B',
                                      }}
                                    >
                                      {detail.target}
                                    </div>
                                  </div>
                                )}
                                {detail.content && (
                                  <div>
                                    <div
                                      style={{
                                        fontSize: '11px',
                                        color: '#94A3B8',
                                        marginBottom: '4px',
                                      }}
                                    >
                                      제보 내용
                                    </div>
                                    <div
                                      style={{
                                        fontSize: '14px',
                                        color: '#334155',
                                        lineHeight: '1.6',
                                        whiteSpace: 'pre-wrap',
                                      }}
                                    >
                                      {detail.content}
                                    </div>
                                  </div>
                                )}
                                {/* 댓글 관리 섹션 */}
                                <AdminCommentSection reportId={report.id} />
                              </div>
                            ) : null}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
