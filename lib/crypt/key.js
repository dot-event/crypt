// Packages
import { join } from "path"

// Helpers
import { makeKey } from "./cipher"

export async function getKey(options) {
  const { cwd, events, keyPath, password, props } = options
  const path = join(cwd, keyPath)

  if (password) {
    const json = makeKey(password)

    await events.fsWriteJson([...props, "encrypt", "key"], {
      ensure: true,
      json,
      path,
      save: true,
    })

    return json
  } else {
    await events.fsReadJson([...props, "encrypt", "key"], {
      path: path,
      save: true,
    })
  }
}
