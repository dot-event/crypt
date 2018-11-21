// Packages
import dotFs from "@dot-event/fs"
import dotLog from "@dot-event/log"

// Helpers
import { genIv } from "./encrypt/cipher"
import { dryMode } from "./encrypt/dry"
import {
  decryptFile,
  eachFile,
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
      async options => {
        const { action = "encrypt" } = options

        if (actions[action]) {
          await actions[action](options)
        }
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
    const { events } = options

    await eachFile({
      ...options,
      callback: async ({ ivKey, ivs, key, path }) => {
        const iv = Buffer.from(ivs[ivKey], "hex")

        await decryptFile({ iv, key, path })
        await move({ events, path })

        delete ivs[ivKey]
      },
    })
  },
  encrypt: async options => {
    const { events } = options

    await eachFile({
      ...options,
      callback: async ({ ivKey, ivs, key, path }) => {
        const iv = (ivs[ivKey] = ivs[ivKey] || genIv())

        await encryptFile({ iv, key, path })
        await move({ events, path })
      },
    })
  },
}
