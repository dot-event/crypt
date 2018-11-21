// Packages
import dotFs from "@dot-event/fs"
import dotLog from "@dot-event/log"

// Helpers
import { genIv } from "./encrypt/cipher"
import { dryMode } from "./encrypt/dry"
import { glob } from "./encrypt/glob"
import { getKey } from "./encrypt/key"
import { getIvs, writeIvs } from "./encrypt/ivs"
import { propsFn } from "./encrypt/props"
import {
  decryptFile,
  encryptFile,
  move,
} from "./encrypt/file"

// Composer
export default function(options) {
  const { events, store } = options

  if (events.ops.has("encrypt")) {
    return options
  }

  dotFs({ events, store })
  dotLog({ events, store })

  events.onAny({
    encrypt: [
      dryMode,
      { getIvs, getKey, glob },
      async options => {
        const { action = "encrypt", store } = options
        const props = propsFn(options)

        const { projectPath } = store.get(props())

        const { glob, key, ivs } = store.get(
          props("encrypt")
        )

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
            projectPath,
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
    const { events, key, ivKey, ivs, path } = options

    const iv = Buffer.from(ivs[ivKey], "hex")

    await decryptFile({ iv, key, path })
    await move({ events, path })

    delete ivs[ivKey]
  },
  encrypt: async options => {
    const { events, key, ivKey, ivs, path } = options

    const iv = (ivs[ivKey] = ivs[ivKey] || genIv())

    await encryptFile({ iv, key, path })
    await move({ events, path })
  },
}
