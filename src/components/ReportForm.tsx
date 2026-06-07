'use client'

// 제보 작성 폼 컴포넌트
// 카테고리, 신고 대상, 제보 내용 입력
// 유효성 검사 후 onSubmit 호출

import { useState } from 'react'

export interface ReportFormData {
  category: string
  target: string
  content: string
}

interface ReportFormProps {
  onSubmit: (data: ReportFormData) => void
  isSubmitting?: boolean
}

const CATEGORIES = ['학업/수업', '학교생활', '고백/연애', '자유/기타'] as const

export default function ReportForm({
  onSubmit,
  isSubmitting = false,
}: ReportFormProps) {
  const [form, setForm] = useState<ReportFormData>({
    category: '',
    target: '',
    content: '',
  })
  const [errors, setErrors] = useState<Partial<ReportFormData>>({})

  const validate = () => {
    const e: Partial<ReportFormData> = {}
    if (!form.category) e.category = '카테고리를 선택해주세요'
    if (!form.target.trim()) e.target = '제목을 입력해주세요'
    if (!form.content.trim()) e.content = '제보 내용을 입력해주세요'
    else if (form.content.trim().length < 10)
      e.content = '최소 10자 이상 입력해주세요'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const inputBase: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px 12px',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1E293B',
    background: '#fff',
    outline: 'none',
    fontFamily: 'sans-serif',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 카테고리 */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 500,
            color: '#475569',
            marginBottom: '6px',
          }}
        >
          카테고리 <span style={{ color: '#EF4444' }}>*</span>
        </label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setForm((p) => ({ ...p, category: cat }))
                setErrors((p) => ({ ...p, category: undefined }))
              }}
              style={{
                padding: '7px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                cursor: 'pointer',
                border: `1px solid ${
                  form.category === cat ? '#7C3AED' : '#E2E8F0'
                }`,
                background: form.category === cat ? '#7C3AED' : '#fff',
                color: form.category === cat ? '#fff' : '#64748B',
                fontWeight: form.category === cat ? 600 : 400,
              }}
            >
              {cat}
            </button>
          ))}
        </div>
        {errors.category && (
          <p style={{ fontSize: '12px', color: '#EF4444', margin: '4px 0 0' }}>
            {errors.category}
          </p>
        )}
      </div>

      {/* 신고 대상 */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 500,
            color: '#475569',
            marginBottom: '6px',
          }}
        >
          제목 <span style={{ color: '#EF4444' }}>*</span>
        </label>
        <input
          type="text"
          value={form.target}
          onChange={(e) => {
            setForm((p) => ({ ...p, target: e.target.value }))
            setErrors((p) => ({ ...p, target: undefined }))
          }}
          style={{
            ...inputBase,
            border: `1px solid ${errors.target ? '#EF4444' : '#E2E8F0'}`,
          }}
        />
        {errors.target && (
          <p style={{ fontSize: '12px', color: '#EF4444', margin: '4px 0 0' }}>
            {errors.target}
          </p>
        )}
      </div>

      {/* 제보 내용 */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 500,
            color: '#475569',
            marginBottom: '6px',
          }}
        >
          제보 내용 <span style={{ color: '#EF4444' }}>*</span>
        </label>
        <textarea
          placeholder="구체적인 제보 내용을 입력해주세요. 내용은 암호화되어 안전하게 저장됩니다."
          value={form.content}
          rows={5}
          onChange={(e) => {
            setForm((p) => ({ ...p, content: e.target.value }))
            setErrors((p) => ({ ...p, content: undefined }))
          }}
          style={{
            ...inputBase,
            border: `1px solid ${errors.content ? '#EF4444' : '#E2E8F0'}`,
            resize: 'vertical',
            minHeight: '120px',
          }}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '4px',
          }}
        >
          {errors.content ? (
            <p style={{ fontSize: '12px', color: '#EF4444', margin: 0 }}>
              {errors.content}
            </p>
          ) : (
            <span />
          )}
          <span style={{ fontSize: '12px', color: '#94A3B8' }}>
            {form.content.length}자
          </span>
        </div>
      </div>

      {/* 보안 안내 */}
      <div
        style={{
          background: '#EDE9FE',
          border: '1px solid #A78BFA',
          borderRadius: '8px',
          padding: '12px 14px',
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-start',
        }}
      >
        <span style={{ fontSize: '15px', flexShrink: 0 }}>🔒</span>
        <p
          style={{
            fontSize: '12px',
            color: '#4C1D95',
            lineHeight: '1.6',
            margin: 0,
          }}
        >
          제보 내용은 <strong>AES 암호화</strong> 후 IPFS에 분산 저장되며,
          해시값만 블록체인에 기록됩니다. 신원 정보는 시스템에 저장되지
          않습니다.
        </p>
      </div>

      {/* 제출 버튼 */}
      <button
        onClick={() => validate() && onSubmit(form)}
        disabled={isSubmitting}
        style={{
          width: '100%',
          padding: '12px',
          border: 'none',
          borderRadius: '8px',
          fontSize: '15px',
          fontWeight: 600,
          fontFamily: 'sans-serif',
          background: isSubmitting ? '#A78BFA' : '#7C3AED',
          color: '#fff',
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
        }}
      >
        {isSubmitting ? '제보 등록 중...' : '제보 등록하기'}
      </button>
    </div>
  )
}
