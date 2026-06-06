'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'

export default function Home() {
  const { isConnected, isAdmin } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div style={{ padding: '32px', maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <a
          href="/report"
          style={{
            background: '#fff',
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            padding: '22px 26px',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            opacity: isConnected ? 1 : 0.5,
            pointerEvents: isConnected ? 'auto' : ('none' as const),
            boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#1E293B',
                marginBottom: '6px',
              }}
            >
              📝 제보하기
            </div>
            <div style={{ fontSize: '14px', color: '#64748B' }}>
              익명으로 안전하게 제보를 등록하세요
            </div>
          </div>
          <span style={{ color: '#7C3AED', fontSize: '24px', fontWeight: 700 }}>
            →
          </span>
        </a>

        <a
          href="/track"
          style={{
            background: '#fff',
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            padding: '22px 26px',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#1E293B',
                marginBottom: '6px',
              }}
            >
              🔍 처리현황 조회
            </div>
            <div style={{ fontSize: '14px', color: '#64748B' }}>
              조회 코드로 내 제보 처리 현황을 확인하세요
            </div>
          </div>
          <span style={{ color: '#7C3AED', fontSize: '24px', fontWeight: 700 }}>
            →
          </span>
        </a>

        <a
          href="/public"
          style={{
            background: '#fff',
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            padding: '22px 26px',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#1E293B',
                marginBottom: '6px',
              }}
            >
              📋 공개 제보 목록
            </div>
            <div style={{ fontSize: '14px', color: '#64748B' }}>
              접수된 제보를 누구나 확인할 수 있습니다
            </div>
          </div>
          <span style={{ color: '#7C3AED', fontSize: '24px', fontWeight: 700 }}>
            →
          </span>
        </a>

        {isAdmin && (
          <a
            href="/admin"
            style={{
              background: '#EDE9FE',
              border: '1px solid #A78BFA',
              borderRadius: '14px',
              padding: '22px 26px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#4C1D95',
                  marginBottom: '6px',
                }}
              >
                ⚙️ 관리자 페이지
              </div>
              <div style={{ fontSize: '14px', color: '#7C3AED' }}>
                제보 목록 조회 및 처리 상태 변경
              </div>
            </div>
            <span
              style={{ color: '#7C3AED', fontSize: '24px', fontWeight: 700 }}
            >
              →
            </span>
          </a>
        )}
      </div>
    </div>
  )
}
