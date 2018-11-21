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

  events.setDefaultOptions({
    cwd: process.cwd(),
    ns: [],
  })

  events.onAny({
    encrypt: [
      dryMode,
      { getIvs, getKey, glob },
      async options => {
        const {
          action = "encrypt",
          cwd,
          ns,
          store,
        } = options

        const { encrypt } = store.get(ns)
        const { key, ivs } = encrypt

        if (!key.length) {
          return
        }

        for (const path of encrypt.glob) {
          const ivKey = path.slice(cwd.length + 1)

          await actions[action]({
            ...options,
            ...encrypt,
            ivKey,
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
    const { ivKey, ivs } = options
    const iv = Buffer.from(ivs[ivKey], "hex")

    await decryptFile({ ...options, iv })
    await move(options)

    delete ivs[ivKey]
  },

  encrypt: async options => {
    const { ivKey, ivs } = options
    const iv = (ivs[ivKey] = ivs[ivKey] || genIv())

    await encryptFile({ ...options, iv })
    await move(options)
  },
}
