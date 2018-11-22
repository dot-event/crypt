// Packages
import { join } from "path"

// Helpers
import { makeKey } from "./cipher"

export async function getKey(options) {
  const { cwd, events, keyPath, password, props } = options
  const path = join(cwd, keyPath)

  if (password) {
    const json = makeKey(password)

    await events.fs([...props, "encrypt", "key"], {
      action: "storeWriteJson",
      json,
      path,
    })

    return json
  } else {
    await events.fs([...props, "encrypt", "key"], {
      action: "storeReadJson",
      path: path,
    })
  }
}
