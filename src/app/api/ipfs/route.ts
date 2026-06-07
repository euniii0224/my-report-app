import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function GET(request: NextRequest) {
  const hash = request.nextUrl.searchParams.get('hash')

  if (!hash) {
    return NextResponse.json({ error: 'hash required' }, { status: 400 })
  }

  console.log('gateway:', process.env.NEXT_PUBLIC_PINATA_GATEWAY)
  console.log('hash:', hash)

  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${hash}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
        },
      },
    )
    return NextResponse.json(res.data)
  } catch (error: any) {
    console.error('IPFS 에러:', error.response?.status, error.response?.data)
    return NextResponse.json({ error: 'IPFS fetch failed' }, { status: 500 })
  }
}
