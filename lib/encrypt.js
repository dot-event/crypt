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

  events
    .withOptions({
      cwd: process.cwd(),
    })
    .onAny({
      decrypt: [
        dryMode,
        { getIvs, getKey, glob },
        eachPath.bind({ action: "decrypt" }),
      ],

      encrypt: [
        dryMode,
        { getIvs, getKey, glob },
        eachPath.bind({ action: "encrypt" }),
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

async function eachPath(options) {
  const { props, store } = options
  const { action } = this

  const { encrypt } = store.get(props)
  const { key, ivs } = encrypt

  if (!key.length) {
    return
  }

  for (const path of encrypt.glob) {
    await actions[action]({
      ...options,
      ...encrypt,
      path,
    })
  }

  await writeIvs({ ...options, ivs })
}

export const actions = {
  decrypt: async options => {
    const { ivs, path } = options
    const iv = Buffer.from(ivs[path], "hex")

    await decryptFile({ ...options, iv })
    await move(options)

    delete ivs[path]
  },

  encrypt: async options => {
    const { ivs, path } = options
    const iv = (ivs[path] = ivs[path] || genIv())

    await encryptFile({ ...options, iv })
    await move(options)
  },
}
