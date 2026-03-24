import crypto from 'crypto'

// Base32 alphabet
const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

function base32Decode(s: string): Buffer {
  s = s.replace(/=+$/, '').toUpperCase()
  let bits = 0
  let value = 0
  const output: number[] = []
  for (const char of s) {
    const idx = BASE32_CHARS.indexOf(char)
    if (idx === -1) continue
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }
  return Buffer.from(output)
}

function base32Encode(buf: Buffer): string {
  let bits = 0
  let value = 0
  let output = ''
  for (const byte of buf) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      output += BASE32_CHARS[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) output += BASE32_CHARS[(value << (5 - bits)) & 31]
  return output
}

export function generateSecret(): string {
  return base32Encode(crypto.randomBytes(20))
}

export function generateToken(secret: string, time = Date.now()): string {
  const counter = Math.floor(time / 1000 / 30)
  const key = base32Decode(secret)
  const counterBuf = Buffer.alloc(8)
  counterBuf.writeBigInt64BE(BigInt(counter))
  const hmac = crypto.createHmac('sha1', key).update(counterBuf).digest()
  const offset = hmac[hmac.length - 1] & 0x0f
  const code = ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)
  return (code % 1_000_000).toString().padStart(6, '0')
}

export function verifyToken(token: string, secret: string): boolean {
  const now = Date.now()
  // Allow ±1 window (90 second tolerance)
  for (const delta of [-1, 0, 1]) {
    if (generateToken(secret, now + delta * 30000) === token) return true
  }
  return false
}

export function toTotpUri(secret: string, label: string, issuer: string): string {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(label)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`
}
