import axios from 'axios'
import { encryptData } from './crypto'

export async function uploadToIPFS(data: object): Promise<string> {
  // 1. 데이터 암호화
  const encrypted = encryptData(data)

  // 2. 암호화된 데이터 IPFS 업로드
  const res = await axios.post(
    'https://api.pinata.cloud/pinning/pinJSONToIPFS',
    { pinataContent: { encrypted } },
    {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
        'Content-Type': 'application/json',
      },
    },
  )

  // 3. 해시값 반환 (컨트랙트에 넘길 값)
  return res.data.IpfsHash
}
