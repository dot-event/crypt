// Packages
import { argvRelay } from "@dot-event/argv"
import dotFs from "@dot-event/fs"
import dotGit from "@dot-event/git"
import dotLog from "@dot-event/log"
import { join } from "path"

// Helpers
import { genIv } from "./crypt/cipher"
import { glob } from "./crypt/glob"
import { getKey } from "./crypt/key"
import { getIvs, writeIvs } from "./crypt/ivs"
import { decryptFile, encryptFile } from "./crypt/file"

// Composer
export default function(options) {
  const { events } = options

  if (events.ops.has("crypt")) {
    return options
  }

  dotFs({ events })
  dotGit({ events })
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
            g: ["git"],
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

  await actions[action]({
    ...options,
    ...encrypt,
  })

  await writeIvs({ ...options, ivs })
}

export const actions = {
  decrypt: async options => {
    const { ivs } = options

    for (const path of Object.keys(ivs)) {
      const iv = Buffer.from(ivs[path], "hex")
      await decryptFile({ ...options, iv, path })
    }
  },

  encrypt: async options => {
    const { cwd, events, git, glob, ivs, props } = options

    for (const path of glob) {
      const iv = ivs[path]
        ? Buffer.from(ivs[path], "hex")
        : genIv()

      ivs[path] = iv

      await encryptFile({ ...options, iv, path })

      if (git) {
        await events.gitAdd(props, {
          path: join(cwd, ".crypt", path),
        })
      }
    }
  },
}
