// Packages
import { createReadStream, createWriteStream } from "fs"
import { join } from "path"

// Helpers
import { createCipher, createDecipher } from "./cipher"

export async function encryptFile(options) {
  const { cwd, events, key, iv, path } = options

  const readPath = join(cwd, path)
  const writePath = join(cwd, `.crypt/${path}`)

  const cipher = createCipher({ iv, key })
  const input = createReadStream(readPath)

  await events.fsEnsureFile({ path: writePath })
  const output = createWriteStream(writePath)

  const promise = new Promise((resolve, reject) => {
    output.on("error", e => reject(e))
    output.on("finish", () => resolve())
  })

  input.pipe(cipher).pipe(output)

  return promise
}

export async function decryptFile(options) {
  const { cwd, events, key, iv, path, props } = options

  const readPath = join(cwd, `.crypt/${path}`)
  const writePath = join(cwd, path)

  const exists = await events.fsPathExists({
    path: readPath,
  })

  if (exists) {
    const decipher = createDecipher({ iv, key })
    const input = createReadStream(readPath)

    await events.fsEnsureFile({ path: writePath })
    const output = createWriteStream(writePath)

    const promise = new Promise((resolve, reject) => {
      output.on("error", e => reject(e))
      output.on("finish", () => resolve())
    })

    input.pipe(decipher).pipe(output)

    return promise
  } else {
    await events.status(props, {
      fail: true,
      msg: ["not decrypted:", path],
      op: "crypt",
    })
  }
}
