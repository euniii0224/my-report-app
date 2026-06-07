'use client'

import { useState, useEffect } from 'react'

import StatusBadge from '@/components/StatusBadge'
import { useStatus } from '../../../hooks/useStatus'

const STATUS_STEPS = ['접수', '검토중', '처리완료']
const STATUS_MAP: Record<number, string> = {
  0: '접수',
  1: '검토중',
  2: '처리완료',
  3: '비공개',
}

type SearchState = 'idle' | 'loading' | 'found' | 'notfound'

export default function TrackPage() {
  const [code, setCode] = useState('')
  const [searchState, setSearchState] = useState<SearchState>('idle')
  const [trackingCode, setTrackingCode] = useState<`0x${string}` | undefined>(
    undefined,
  )

  const { id, category, status, isLoading, isError } = useStatus(trackingCode)

  useEffect(() => {
    if (!isLoading && trackingCode) {
      if (isError || id === undefined || id === BigInt(0)) {
        setSearchState('notfound')
      } else {
        setSearchState('found')
      }
    }
  }, [isLoading, trackingCode, isError, id])

  const handleSearch = () => {
    if (!code.trim()) return
    setSearchState('loading')
    const formatted = code.startsWith('0x') ? code : `0x${code}`
    setTrackingCode(formatted as `0x${string}`)
  }

  const statusText = status !== undefined ? STATUS_MAP[status] : ''
  const currentStepIndex = STATUS_STEPS.indexOf(statusText)

  return (
    <div style={{ padding: '32px', maxWidth: '600px', margin: '0 auto' }}>
      {/* 코드 입력 */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          overflow: 'hidden',
          marginBottom: '24px',
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
          조회 코드 입력
        </div>
        <div style={{ padding: '20px' }}>
          <p
            style={{
              fontSize: '13px',
              color: '#64748B',
              marginBottom: '12px',
              marginTop: 0,
            }}
          >
            제보 완료 시 발급된 고유 조회 코드를 입력하세요.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="예: 0x1a2b3c..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              style={{
                flex: 1,
                padding: '10px 12px',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '13px',
                fontFamily: 'monospace',
                color: '#1E293B',
                outline: 'none',
              }}
            />
            <button
              onClick={handleSearch}
              disabled={searchState === 'loading' || !code.trim()}
              style={{
                padding: '10px 20px',
                background:
                  !code.trim() || searchState === 'loading'
                    ? '#A78BFA'
                    : '#7C3AED',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor:
                  !code.trim() || searchState === 'loading'
                    ? 'not-allowed'
                    : 'pointer',
                fontFamily: 'sans-serif',
                whiteSpace: 'nowrap',
              }}
            >
              {isLoading ? '조회 중...' : '조회하기'}
            </button>
          </div>
        </div>
      </div>

      {/* 결과 없음 */}
      {searchState === 'notfound' && (
        <div
          style={{
            background: '#FFF3E0',
            border: '1px solid #FCA55B',
            borderRadius: '10px',
            padding: '20px',
            textAlign: 'center',
          }}
        >
          <p style={{ color: '#7C4700', fontSize: '14px', margin: 0 }}>
            해당 코드로 등록된 제보를 찾을 수 없습니다.
          </p>
          <p style={{ color: '#94A3B8', fontSize: '12px', margin: '6px 0 0' }}>
            코드를 다시 확인해주세요.
          </p>
        </div>
      )}

      {/* 조회 결과 */}
      {searchState === 'found' && id !== undefined && (
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
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span
              style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B' }}
            >
              제보 정보
            </span>
            <StatusBadge status={statusText as any} />
          </div>

          <div
            style={{
              padding: '20px',
              borderBottom: '1px solid #F1F5F9',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              fontSize: '14px',
            }}
          >
            {[
              { label: '제보 ID', value: `#${id.toString()}`, mono: true },
              { label: '카테고리', value: category ?? '' },
              { label: '상태', value: statusText },
            ].map(({ label, value, mono }) => (
              <div key={label}>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#94A3B8',
                    marginBottom: '4px',
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    color: mono ? '#7C3AED' : '#1E293B',
                    fontFamily: mono ? 'monospace' : 'sans-serif',
                    fontWeight: mono ? 600 : 400,
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* 진행 단계 */}
          <div style={{ padding: '20px' }}>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#475569',
                marginBottom: '16px',
              }}
            >
              처리 단계
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {STATUS_STEPS.map((step, i) => {
                const isDone = i <= currentStepIndex
                const isCurrent = i === currentStepIndex
                return (
                  <div
                    key={step}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      flex: i < STATUS_STEPS.length - 1 ? 1 : 'unset',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: isDone ? '#7C3AED' : '#E2E8F0',
                          border: isCurrent ? '2px solid #7C3AED' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          color: isDone ? '#fff' : '#94A3B8',
                          fontWeight: 600,
                          boxSizing: 'border-box',
                        }}
                      >
                        {i < currentStepIndex ? '✓' : i + 1}
                      </div>
                      <span
                        style={{
                          fontSize: '11px',
                          color: isDone ? '#7C3AED' : '#94A3B8',
                          fontWeight: isCurrent ? 600 : 400,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {step}
                      </span>
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div
                        style={{
                          flex: 1,
                          height: '2px',
                          background:
                            i < currentStepIndex ? '#7C3AED' : '#E2E8F0',
                          margin: '0 4px 18px',
                        }}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
