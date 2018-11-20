// Packages
import { createReadStream, createWriteStream } from "fs"
import { join } from "path"

// Helpers
import { createCipher, createDecipher } from "./cipher"
import { getKey } from "./key"
import { getIvs, writeIvs } from "./ivs"
import { propsFn } from "./props"

export async function eachFile(options) {
  const { callback, events, store } = options

  const props = propsFn(options)
  const { operations, projectPath } = store.get(props())
  const key = await getKey(options)

  if (!key.length) {
    return
  }

  const ivs = await getIvs(options)

  for (const glob of operations.encrypt.globs) {
    const paths = await events.glob(
      props("encrypt", "glob"),
      {
        pattern: join(projectPath, glob),
      }
    )

    for (const path of paths) {
      const ivKey = path.slice(projectPath.length + 1)
      await callback({ ivKey, ivs, key, path })
    }
  }

  await writeIvs({ ...options, ivs })
}

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
