// AES 암호화/복호화 유틸 함수
// 제보 내용을 암호화해서 IPFS에 올리고, 조회 시 복호화할 때 사용

import CryptoJS from 'crypto-js'

const SECRET = process.env.NEXT_PUBLIC_CRYPTO_SECRET as string

// 암호화
export function encryptData(data: object): string {
  const json = JSON.stringify(data)
  return CryptoJS.AES.encrypt(json, SECRET).toString()
}

// 복호화
export function decryptData(cipherText: string): object {
  const bytes = CryptoJS.AES.decrypt(cipherText, SECRET)
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
}
