// Packages
import dotFs from "@dot-event/fs"
import dotLog from "@dot-event/log"

// Helpers
import { genIv } from "./encrypt/cipher"
import { dryMode } from "./encrypt/dry"
import { glob } from "./encrypt/glob"
import { getKey } from "./encrypt/key"
import { getIvs, writeIvs } from "./encrypt/ivs"
import { decryptFile, encryptFile } from "./encrypt/file"
import { move } from "./encrypt/fs"

// Composer
export default function(options) {
  const { events, store } = options

  if (events.ops.has("encrypt")) {
    return options
  }

  dotFs({ events, store })
  dotLog({ events, store })

  events.setDefaultOptions({ ns: [] })

  events.onAny({
    encrypt: [
      dryMode,
      { getIvs, getKey, glob },
      async options => {
        const { action = "encrypt", ns, store } = options
        const { encrypt, projectPath } = store.get(ns)
        const { glob, key, ivs } = encrypt

        if (!key.length) {
          return
        }

        for (const path of glob) {
          const ivKey = path.slice(projectPath.length + 1)

          await actions[action]({
            ...options,
            ivKey,
            ivs,
            key,
            path,
          })
        }

        await writeIvs({ ...options, ivs })
      },
    ],

    encryptSetup: () =>
      events.argv("argv", {
        alias: {
          a: ["action"],
          d: ["dry"],
          p: ["password"],
        },
      }),
  })

  return options
}

export const actions = {
  decrypt: async options => {
    const { ivKey, ivs, key, path } = options
    const iv = Buffer.from(ivs[ivKey], "hex")

    await decryptFile({ iv, key, path })
    await move(options)

    delete ivs[ivKey]
  },

  encrypt: async options => {
    const { ivKey, ivs, key, path } = options
    const iv = (ivs[ivKey] = ivs[ivKey] || genIv())

    await encryptFile({ iv, key, path })
    await move(options)
  },
}
