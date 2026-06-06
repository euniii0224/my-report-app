'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '../../hooks/useAuth'

export default function Sidebar() {
  const pathname = usePathname()
  const { isAdmin } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const menus = [
    { href: '/', label: '🏠 홈', always: true },
    { href: '/report', label: '📝 제보하기', always: true },
    { href: '/track', label: '🔍 처리현황', always: true },
    { href: '/public', label: '📋 공개 목록', always: true },
    { href: '/admin', label: '⚙️ 관리자', always: false },
  ]

  const filtered = menus.filter((m) => m.always || (mounted && isAdmin))

  return (
    <div
      style={{
        width: '180px',
        minHeight: '100vh',
        background: '#fff',
        borderRight: '1px solid #E2E8F0',
        padding: '24px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        position: 'fixed',
        top: 0,
        left: 0,
      }}
    >
      <div
        style={{
          fontSize: '13px',
          fontWeight: 700,
          color: '#7C3AED',
          marginBottom: '12px',
          padding: '0 8px',
        }}
      >
        익명 신고 시스템
      </div>

      {filtered.map((menu) => {
        const isActive = pathname === menu.href

        return (
          <Link
            key={menu.href}
            href={menu.href}
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: isActive ? 600 : 400,
              textDecoration: 'none',
              background: isActive ? '#EDE9FE' : 'transparent',
              color: isActive ? '#4C1D95' : '#64748B',
              border: isActive ? '1px solid #A78BFA' : '1px solid transparent',
              transition: 'all 0.15s',
            }}
          >
            {menu.label}
          </Link>
        )
      })}
    </div>
  )
}
