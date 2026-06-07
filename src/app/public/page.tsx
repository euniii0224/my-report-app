'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

import StatusBadge from '@/components/StatusBadge'
import { useAuth } from '../../../hooks/useAuth'
import {
  STATUS_MAP,
  useAddComment,
  useComments,
  usePublicReports,
} from '../../../hooks/useReport'
import { decryptData } from '../../../utils/crypto'

const CATEGORIES = [
  '전체',
  '학업/수업',
  '학교생활',
  '고백/연애',
  '자유/기타',
] as const
type Category = (typeof CATEGORIES)[number]

interface ReportDetail {
  title?: string
  target?: string
  content?: string
  category?: string
}

// 댓글 컴포넌트
function CommentSection({ reportId }: { reportId: bigint }) {
  const { comments, isLoading, refetch } = useComments(reportId)
  const { addComment, isPending, isConfirming, isSuccess } = useAddComment()
  const { isConnected } = useAuth()
  const [commentText, setCommentText] = useState('')

  useEffect(() => {
    if (isSuccess) {
      setCommentText('')
      setTimeout(() => refetch(), 2000)
    }
  }, [isSuccess])

  const handleSubmit = () => {
    if (!commentText.trim()) return
    addComment(reportId, commentText)
  }

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
        💬 댓글 {comments.length}개
      </div>

      {/* 댓글 목록 */}
      {isLoading ? (
        <div style={{ fontSize: '13px', color: '#94A3B8' }}>불러오는 중...</div>
      ) : comments.length === 0 ? (
        <div
          style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '12px' }}
        >
          첫 댓글을 남겨보세요!
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginBottom: '12px',
          }}
        >
          {comments.map((comment, i) => (
            <div
              key={i}
              style={{
                background: '#F8FAFC',
                borderRadius: '8px',
                padding: '10px 12px',
                border: '1px solid #E2E8F0',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '4px',
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
              </div>
              <div
                style={{
                  fontSize: '13px',
                  color: '#334155',
                  lineHeight: '1.5',
                }}
              >
                {comment.content}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 댓글 입력 */}
      {isConnected ? (
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="댓글을 입력하세요..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              fontSize: '13px',
              outline: 'none',
              color: '#1E293B',
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={isPending || isConfirming || !commentText.trim()}
            style={{
              padding: '8px 16px',
              background: isPending || isConfirming ? '#A78BFA' : '#7C3AED',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: isPending || isConfirming ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {isPending ? '승인 대기...' : isConfirming ? '기록 중...' : '등록'}
          </button>
        </div>
      ) : (
        <div style={{ fontSize: '12px', color: '#94A3B8' }}>
          댓글을 달려면 MetaMask 연결이 필요합니다.
        </div>
      )}

      {isSuccess && (
        <p style={{ fontSize: '12px', color: '#059669', marginTop: '8px' }}>
          ✅ 댓글이 등록되었습니다!
        </p>
      )}
    </div>
  )
}

export default function PublicPage() {
  const [mounted, setMounted] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category>('전체')
  const [detailMap, setDetailMap] = useState<
    Record<string, ReportDetail | null>
  >({})
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const { reports, isLoading, error } = usePublicReports()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const filtered =
    selectedCategory === '전체'
      ? reports
      : reports.filter((r) => r.category === selectedCategory)

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
      {/* 카테고리 필터 */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              border: '1px solid',
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: selectedCategory === cat ? 600 : 400,
              background: selectedCategory === cat ? '#7C3AED' : '#fff',
              color: selectedCategory === cat ? '#fff' : '#64748B',
              borderColor: selectedCategory === cat ? '#7C3AED' : '#E2E8F0',
            }}
          >
            {cat}
          </button>
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
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>총 {filtered.length}건</span>
          <span style={{ fontSize: '11px', color: '#94A3B8' }}>
            블록체인에 영구 기록된 제보
          </span>
        </div>

        {isLoading ? (
          <div
            style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}
          >
            불러오는 중...
          </div>
        ) : error ? (
          <div
            style={{ textAlign: 'center', padding: '40px', color: '#DC2626' }}
          >
            데이터를 불러오지 못했습니다
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}
          >
            공개된 게시물이 없습니다
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filtered.map((report, i) => {
              const id = report.id.toString()
              const isExpanded = expandedId === id
              const detail = detailMap[id]
              const isLoadingDetail = loadingId === id

              return (
                <div
                  key={id}
                  style={{
                    borderBottom: '1px solid #F1F5F9',
                    background: isExpanded
                      ? '#F5F3FF'
                      : i % 2 === 0
                      ? '#fff'
                      : '#FAFAFA',
                  }}
                >
                  {/* 목록 행 */}
                  <div
                    onClick={() => handleRowClick(id, report.ipfsHash)}
                    style={{
                      padding: '16px 20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: '#EDE9FE',
                          color: '#4C1D95',
                          fontSize: '11px',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {report.category}
                      </span>
                      <span
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#1E293B',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {detail?.title ??
                          (isLoadingDetail
                            ? '불러오는 중...'
                            : '클릭하여 내용 보기')}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                        {new Date(
                          Number(report.timestamp) * 1000,
                        ).toLocaleDateString('ko-KR')}
                      </span>
                      <StatusBadge status={STATUS_MAP[report.status]} />
                      <span style={{ color: '#7C3AED', fontSize: '14px' }}>
                        {isExpanded ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>

                  {/* 펼쳐진 내용 */}
                  {isExpanded && (
                    <div style={{ padding: '0 20px 20px' }}>
                      {isLoadingDetail ? (
                        <div
                          style={{
                            padding: '16px',
                            color: '#7C3AED',
                            fontSize: '13px',
                          }}
                        >
                          🔄 내용 불러오는 중...
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
                            background: '#fff',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            marginBottom: '16px',
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
                                  fontSize: '15px',
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
                                제목
                              </div>
                              <div
                                style={{ fontSize: '14px', color: '#1E293B' }}
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
                                내용
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
                        </div>
                      ) : null}

                      {/* 댓글 섹션 */}
                      <CommentSection reportId={report.id} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
