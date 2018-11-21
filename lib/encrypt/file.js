// Packages
import { createReadStream, createWriteStream } from "fs"
import { join } from "path"

// Helpers
import { createCipher, createDecipher } from "./cipher"

export async function encryptFile({ cwd, key, iv, path }) {
  const cipher = createCipher({ iv, key })
  const input = createReadStream(join(cwd, path))
  const output = createWriteStream(join(cwd, `${path}.enc`))

  const promise = new Promise((resolve, reject) => {
    output.on("error", e => reject(e))
    output.on("finish", () => resolve())
  })

  input.pipe(cipher).pipe(output)

  return promise
}

export async function decryptFile({ cwd, key, iv, path }) {
  const decipher = createDecipher({ iv, key })
  const input = createReadStream(join(cwd, path))
  const output = createWriteStream(join(cwd, `${path}.enc`))

  const promise = new Promise((resolve, reject) => {
    output.on("error", e => reject(e))
    output.on("finish", () => resolve())
  })

  input.pipe(decipher).pipe(output)

  return promise
}
