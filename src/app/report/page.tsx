'use client'

import { useState, useEffect } from 'react'

import ReportForm, { ReportFormData } from '@/components/ReportForm'
import { useReport } from '../../../hooks/useReport'
import { uploadToIPFS } from '../../../utils/ipfs'

type PageState = 'form' | 'submitting' | 'success'

export default function ReportPage() {
  const [pageState, setPageState] = useState<PageState>('form')
  const { submitReport, isSuccess, trackingCode, isError, error } = useReport()

  useEffect(() => {
    if (isSuccess && trackingCode) {
      setPageState('success')
    }
  }, [isSuccess, trackingCode])

  const handleSubmit = async (data: ReportFormData) => {
    setPageState('submitting')
    try {
      const ipfsHash = await uploadToIPFS(data)
      submitReport(ipfsHash, data.category)
    } catch (err) {
      console.error('제보 등록 실패:', err)
      setPageState('form')
    }
  }

  return (
    <div style={{ padding: '32px', maxWidth: '600px', margin: '0 auto' }}>
      {isError && (
        <div
          style={{
            background: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '16px',
          }}
        >
          <p style={{ color: '#7F1D1D', fontSize: '13px', margin: 0 }}>
            ❌ 제보 등록 실패: {error?.message}
          </p>
        </div>
      )}

      {pageState === 'success' ? (
        <div
          style={{
            background: '#fff',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '40px 32px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#ECFDF5',
              border: '1px solid #6EE7B7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '24px',
            }}
          >
            ✅
          </div>
          <div
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#1E293B',
              marginBottom: '8px',
            }}
          >
            제보가 접수되었습니다
          </div>
          <div
            style={{
              fontSize: '14px',
              color: '#64748B',
              marginBottom: '28px',
              lineHeight: '1.6',
            }}
          >
            제보 내용이 암호화되어 블록체인에 안전하게 기록되었습니다.
            <br />
            아래 조회 코드로 처리 현황을 확인하세요.
          </div>

          <div
            style={{
              background: '#EDE9FE',
              border: '1px solid #A78BFA',
              borderRadius: '10px',
              padding: '20px',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                color: '#7C3AED',
                marginBottom: '8px',
                fontWeight: 500,
              }}
            >
              내 제보 조회 코드
            </div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: '#4C1D95',
                letterSpacing: '0.05em',
                fontFamily: 'monospace',
                wordBreak: 'break-all',
              }}
            >
              {trackingCode}
            </div>
            <div
              style={{ fontSize: '11px', color: '#7C3AED', marginTop: '8px' }}
            >
              이 코드를 안전한 곳에 보관하세요. 다시 확인할 수 없습니다.
            </div>
          </div>

          <div
            style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}
          >
            <button
              onClick={() => setPageState('form')}
              style={{
                padding: '10px 20px',
                background: '#fff',
                color: '#7C3AED',
                border: '1px solid #7C3AED',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                fontFamily: 'sans-serif',
              }}
            >
              새 제보 작성
            </button>
            <a
              href="/track"
              style={{
                padding: '10px 20px',
                background: '#7C3AED',
                color: '#fff',
                borderRadius: '8px',
                fontSize: '14px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              처리 현황 확인 →
            </a>
          </div>
        </div>
      ) : (
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
            제보 내용 작성
          </div>
          <div style={{ padding: '24px 20px' }}>
            <ReportForm
              onSubmit={handleSubmit}
              isSubmitting={pageState === 'submitting'}
            />
          </div>
        </div>
      )}
    </div>
  )
}
