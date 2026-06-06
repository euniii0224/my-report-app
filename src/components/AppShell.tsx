'use client'

// 공통 레이아웃 컴포넌트
// 상단 헤더 + 왼쪽 사이드바 + 콘텐츠 구조

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '../../hooks/useAuth'

const MENUS = [
  { href: '/', label: '🏠 홈', adminOnly: false },
  { href: '/report', label: '📝 제보하기', adminOnly: false },
  { href: '/track', label: '🔍 처리현황', adminOnly: false },
  { href: '/public', label: '📋 공개 목록', adminOnly: false },
  { href: '/admin', label: '⚙️ 관리자', adminOnly: true },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { address, isConnected, isAdmin, connect, disconnect } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  const filtered = MENUS.filter((m) => !m.adminOnly || (mounted && isAdmin))

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F8FAFC',
        fontFamily: 'sans-serif',
      }}
    >
      {/* 상단 헤더 */}
      <div
        style={{
          background: '#fff',
          borderBottom: '1px solid #E2E8F0',
          padding: '14px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#1E293B' }}>
            블록체인 익명 신고 시스템
          </div>
          <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
            신원 보호와 투명성을 보장하는 공익 제보 플랫폼
          </div>
        </div>

        {mounted && isConnected ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                padding: '7px 14px',
                background: '#EDE9FE',
                color: '#4C1D95',
                borderRadius: '8px',
                fontSize: '12px',
                fontFamily: 'monospace',
              }}
            >
              {address?.slice(0, 6)}...{address?.slice(-4)}
              {isAdmin && ' (관리자)'}
            </div>

            <button
              onClick={() => disconnect()}
              style={{
                padding: '7px 14px',
                background: '#fff',
                color: '#64748B',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              연결 해제
            </button>
          </div>
        ) : (
          <button
            onClick={() => connect()}
            style={{
              padding: '9px 18px',
              background: '#7C3AED',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            MetaMask 연결
          </button>
        )}
      </div>

      {/* 헤더 아래 레이아웃 */}
      <div style={{ display: 'flex' }}>
        {/* 사이드바 */}
        <div
          style={{
            width: '200px',
            minHeight: 'calc(100vh - 65px)',
            background: '#fff',
            borderRight: '1px solid #E2E8F0',
            padding: '20px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            flexShrink: 0,
          }}
        >
          {filtered.map((menu) => {
            const isActive = pathname === menu.href

            return (
              <Link
                key={menu.href}
                href={menu.href}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 400,
                  textDecoration: 'none',
                  background: isActive ? '#EDE9FE' : 'transparent',
                  color: isActive ? '#4C1D95' : '#64748B',
                  border: isActive
                    ? '1px solid #A78BFA'
                    : '1px solid transparent',
                }}
              >
                {menu.label}
              </Link>
            )
          })}
        </div>

        {/* 콘텐츠 */}
        <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
      </div>
    </div>
  )
}
