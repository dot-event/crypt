import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "crypto"

export const algo = "aes-256-ctr"

export function createCipher({ key, iv }) {
  return createCipheriv(algo, cipherKey(key), iv)
}

export function createDecipher({ key, iv }) {
  return createDecipheriv(algo, cipherKey(key), iv)
}

export function cipherKey(key) {
  return Buffer.from(key, "hex")
}

export function genIv() {
  return randomBytes(16)
}

export function extractIv(str) {
  const iv = Buffer.from(str.slice(0, 32), "hex")
  str = str.slice(32)

  return { iv, str }
}

export function makeKey(pass) {
  const sha = createHash("sha256")
  sha.update(pass)

  return sha.digest("hex")
}
