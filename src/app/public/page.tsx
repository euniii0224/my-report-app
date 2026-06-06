'use client'

import { useState, useEffect } from 'react'

import StatusBadge from '@/components/StatusBadge'
import { STATUS_MAP, usePublicReports } from '../../../hooks/useReport'

const CATEGORIES = ['전체', '부패', '갑질', '횡령', '기타'] as const
type Category = (typeof CATEGORIES)[number]

export default function PublicPage() {
  const [mounted, setMounted] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category>('전체')
  const { reports, isLoading, error } = usePublicReports()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const filtered =
    selectedCategory === '전체'
      ? reports
      : reports.filter((r) => r.category === selectedCategory)

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
            공개된 제보가 없습니다
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
                  {['ID', '카테고리', '접수일자', '상태'].map((h) => (
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
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((report, i) => (
                  <tr
                    key={report.id.toString()}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      background: i % 2 === 0 ? '#fff' : '#FAFAFA',
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
                      #{report.id.toString()}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#334155' }}>
                      {report.category}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
