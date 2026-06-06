'use client'

// 제보 처리 상태를 색상 뱃지로 표시하는 컴포넌트
// 접수(주황), 검토중(보라), 처리완료(초록), 반려(빨강)

type Status = '접수' | '검토중' | '처리완료' | '반려'

const STATUS_STYLE: Record<
  Status,
  { background: string; color: string; border: string }
> = {
  접수: { background: '#FFF3E0', color: '#7C4700', border: '#FCA55B' },
  검토중: { background: '#EDE9FE', color: '#4C1D95', border: '#A78BFA' },
  처리완료: { background: '#ECFDF5', color: '#064E3B', border: '#6EE7B7' },
  반려: { background: '#FEF2F2', color: '#7F1D1D', border: '#FCA5A5' },
}

export default function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLE[status as Status] ?? STATUS_STYLE['접수']

  return (
    <span
      style={{
        padding: '3px 10px',
        borderRadius: '999px',
        fontSize: '12px',
        fontWeight: 600,
        background: style.background,
        color: style.color,
        border: `1px solid ${style.border}`,
      }}
    >
      • {status}
    </span>
  )
}
