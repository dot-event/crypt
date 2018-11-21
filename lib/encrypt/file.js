// Packages
import { createReadStream, createWriteStream } from "fs"

// Helpers
import { createCipher, createDecipher } from "./cipher"

export async function encryptFile({ key, iv, path }) {
  const cipher = createCipher({ iv, key })
  const input = createReadStream(path)
  const output = createWriteStream(`${path}.enc`)

  const promise = new Promise((resolve, reject) => {
    output.on("error", e => reject(e))
    output.on("finish", () => resolve())
  })

  input.pipe(cipher).pipe(output)

  return promise
}

export async function decryptFile({ key, iv, path }) {
  const decipher = createDecipher({ iv, key })
  const input = createReadStream(path)
  const output = createWriteStream(`${path}.enc`)

  const promise = new Promise((resolve, reject) => {
    output.on("error", e => reject(e))
    output.on("finish", () => resolve())
  })

  input.pipe(decipher).pipe(output)

  return promise
}

export async function move({ events, path }) {
  return await events.fs({
    action: "move",
    dest: path,
    overwrite: true,
    src: `${path}.enc`,
  })
}
