import { createCipheriv, createDecipheriv, randomBytes } from "crypto"

// Comment out ENCRYPTION_KEY requirement for now since using custom backend
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
const ALGORITHM = "aes-256-gcm"

// Fallback approach - if no encryption key, return plaintext (for development)
let key: Buffer | null = null
if (ENCRYPTION_KEY) {
  try {
    key = Buffer.from(ENCRYPTION_KEY, "base64")
    if (key.length !== 32) {
      console.warn("ENCRYPTION_KEY must be 32 bytes long, using fallback")
      key = null
    }
  } catch (e) {
    console.warn("Invalid ENCRYPTION_KEY format, using fallback")
    key = null
  }
}

export function encryptKey(plaintext: string): {
  encrypted: string
  iv: string
} {
  // If no proper key, return plaintext (for development/testing)
  if (!key) {
    return {
      encrypted: plaintext,
      iv: "no-encryption"
    }
  }

  const iv = randomBytes(16)
  const cipher = createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(plaintext, "utf8", "hex")
  encrypted += cipher.final("hex")

  const authTag = cipher.getAuthTag()
  const encryptedWithTag = encrypted + ":" + authTag.toString("hex")

  return {
    encrypted: encryptedWithTag,
    iv: iv.toString("hex"),
  }
}

export function decryptKey(encryptedData: string, ivHex: string): string {
  // If no proper key or no-encryption marker, return as-is
  if (!key || ivHex === "no-encryption") {
    return encryptedData
  }

  const [encrypted, authTagHex] = encryptedData.split(":")
  const iv = Buffer.from(ivHex, "hex")
  const authTag = Buffer.from(authTagHex, "hex")

  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(encrypted, "hex", "utf8")
  decrypted += decipher.final("utf8")

  return decrypted
}

export function maskKey(key: string): string {
  if (key.length <= 8) {
    return "*".repeat(key.length)
  }
  return key.slice(0, 4) + "*".repeat(key.length - 8) + key.slice(-4)
}
