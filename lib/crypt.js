// Packages
import { argvRelay } from "@dot-event/argv"
import dotFs from "@dot-event/fs"
import dotLog from "@dot-event/log"

// Helpers
import { genIv } from "./crypt/cipher"
import { glob } from "./crypt/glob"
import { getKey } from "./crypt/key"
import { getIvs, writeIvs } from "./crypt/ivs"
import { decryptFile, encryptFile } from "./crypt/file"
import { move } from "./crypt/fs"

// Composer
export default function(options) {
  const { events } = options

  if (events.ops.has("crypt")) {
    return options
  }

  dotFs({ events })
  dotLog({ events })

  events
    .withOptions({
      cwd: process.cwd(),
    })
    .onAny({
      crypt: argvRelay,

      cryptDecrypt: [
        { getIvs, getKey, glob },
        eachPath.bind({ action: "decrypt" }),
      ],

      cryptEncrypt: [
        { getIvs, getKey, glob },
        eachPath.bind({ action: "encrypt" }),
      ],

      cryptSetupOnce: () =>
        events.argv({
          alias: {
            d: ["dry"],
            de: ["decrypt"],
            en: ["encrypt"],
            p: ["password"],
          },
        }),
    })

  return options
}

async function eachPath(options) {
  const { events, props } = options
  const { action } = this

  const { encrypt } = events.get(props)
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
